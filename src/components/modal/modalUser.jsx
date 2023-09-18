import { Component, createRef } from 'react'
import {
  Activity,
  AttendeeApi,
  eventTicketsApi,
  OrganizationApi,
  UsersApi,
} from '@helpers/request'
import { injectIntl } from 'react-intl'
import QRCode from 'qrcode.react'
import { Navigate, redirect } from 'react-router-dom'
import FormComponent from '../events/registrationForm/form'
import { Alert, Button, Modal } from 'antd'
import withContext from '@context/withContext'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { GetTokenUserFirebase } from '@helpers/HelperAuth'
import { StateMessage } from '@context/MessageService'
import FormEnrollAttendeeToEvent from '../forms/FormEnrollAttendeeToEvent'
import { handleRequestError } from '@helpers/utils'
import printBagdeUser from '../badge/utils/printBagdeUser'
import RegisterUserAndEventUser from '@components/authentication/RegisterUserAndEventUser'

const { confirm } = Modal

const stylePaddingDesktop = {
  paddingLeft: '30px',
  paddingRight: '30px',
  textAlign: 'center',
}
const stylePaddingMobile = {
  paddingLeft: '10px',
  paddingRight: '10px',
  textAlign: 'center',
}

class UserModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      statesList: [],
      rolesList: [],
      message: {},
      user: null,
      state: '',
      rol: '',
      prevState: '',
      userId: 'mocionsoft',
      emailError: false,
      confirmCheck: true,
      valid: true,
      checked_in: false,
      tickets: [],
      loadingregister: false,
      existGenialialityUser: true,
      makeUserRegister: false,
    }
    this.ifrmPrint = createRef()
  }

  async componentDidMount() {
    const self = this
    const { rolesList } = this.props
    self.setState({ rolesList, rol: rolesList.length > 0 ? rolesList[0]._id : '' })
    const tickets = await eventTicketsApi.getAll(
      this.props.cEvent?.value?._id || '5ea23acbd74d5c4b360ddde2',
    )
    if (tickets.length > 0) this.setState({ tickets })
    let user = {}
    if (this.props.edit) {
      const { value } = this.props
      if (value?.properties) {
        Object.keys(value.properties).map((obj) => {
          return (user[obj] = value.properties[obj])
        })
        const checked_in = !!value.checkedin_at
        user = { ...user, _id: value._id }
        this.setState({
          user,
          ticket_id: value.ticket_id,
          edit: true,
          rol: value.rol_id,
          confirmCheck: checked_in,
          userId: value._id,
          prevState: value.state_id,
          valid: false,
        })
      } else if (value) {
        Object.keys(value).map((obj) => {
          return (user[obj] = value[obj])
        })
        const checked_in = !!value.checkedin_at
        this.setState({
          user,
          ticket_id: value.ticket_id,
          edit: true,
          rol: value.rol,
          confirmCheck: checked_in,
          userId: value._id,
          prevState: value.state_id,
          valid: false,
        })
      }
    } else {
      this.props.extraFields.map((obj) => {
        user[obj.name] = obj.type === 'boolean' ? false : obj.type === 'number' ? 0 : ''
        return user
      })
      this.setState({ found: 1, user, edit: false, ticket_id: this.props.ticket })
    }
  }

  componentWillUnmount() {
    this.setState({ user: {}, edit: false })
  }
  options = [
    {
      type: 'danger',
      text: 'Eliminar/Borrar',
      icon: <DeleteOutlined />,
      action: () => this.deleteUser(this.state.user),
    },
  ]

  deleteUser = async (user) => {
    const activityId = this.props.activityId
    const messages = {}
    const self = this

    confirm({
      title: `¿Está seguro de eliminar la información?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Una vez eliminado, no lo podrá recuperar',
      okText: 'Borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        StateMessage.show(
          'loading',
          'loading',
          ' Por favor espere mientras se borra la información...',
        )
        self.setState({ loadingregister: true })

        const onHandlerRemove = async () => {
          try {
            const token = await GetTokenUserFirebase()
            // !self.props.byActivity &&
            //   (await Actions.delete(
            //     `/api/events/${self.props.cEvent.value?._id}/eventusers`,
            //     `${user._id}?token=${token}`
            //   ));
            // messages = { class: 'msg_warning', content: 'USER DELETED' };
            const selectedEventUserId = user._id

            if (activityId)
              await UsersApi.deleteAttendeeInActivity(activityId, selectedEventUserId)
            if (!activityId)
              await AttendeeApi.delete(self.props.cEvent.value?._id, selectedEventUserId)

            StateMessage.destroy('loading')
            StateMessage.show(null, 'success', 'Se eliminó la información correctamente!')

            setTimeout(() => {
              messages.class = messages.content = ''
              self.setState({ loadingregister: false })
              self.closeModal()
            }, 500)
          } catch (e) {
            self.setState({ loadingregister: false })
            StateMessage.destroy('loading')
            StateMessage.show(null, 'error', 'Error eliminando el usuario')
          }
        }
        onHandlerRemove()
      },
    })
  }

  closeModal = () => {
    const message = { class: '', content: '' }
    this.setState(
      { user: {}, valid: true, modal: false, uncheck: false, message },
      this.props.handleModal(),
    )
  }

  saveUser = async (values) => {
    const activityId = this.props.activityId
    const eventId = this.props.cEvent?.value?._id || this.props.cEvent?.value?.idEvent
    this.setState({ loadingregister: true })
    let resp
    let respActivity = true
    if (values) {
      const snap = {
        checked_in: values.checked_in,
        checkedin_at: values.checkedin_at,
        rol_id: values.rol_id,
        properties: values,
      }

      if (this.props.organizationId && !this.props.edit) {
        resp = await OrganizationApi.saveUser(this.props.organizationId, snap)
      } else {
        if (!this.props.edit) {
          try {
            if (activityId) {
              respActivity = await UsersApi.createUserInEventAndAssignToActivity(
                snap.properties,
                activityId,
              )
            } else {
              resp = await UsersApi.createOne(snap, eventId)
            }
          } catch (error) {
            if (handleRequestError(error).message === 'users limit exceeded') {
              StateMessage.show(
                null,
                'error',
                'Ha exedido el límite de usuarios en el plan',
              )
            } else {
              StateMessage.show(null, 'error', 'Usuario ya registrado en el curso')
            }

            respActivity = false
          }
        } else {
          resp = await UsersApi.editEventUser(
            snap,
            this.props.cEvent?.value?._id || this.props.cEvent?.value?.idEvent,
            this.props.value._id,
          )
        }
      }

      /**FIXME: No se esta guardando la informacion al actualizar un usuario desde el panel de checkIn por actividad*/
      if (this.props.byActivity && (resp?.data?._id || resp?._id) && !this.props.edit) {
        respActivity = await Activity.Register(
          this.props.cEvent?.value?._id,
          resp?.data?.user?._id || resp?.user?._id,
          this.props.activityId,
        )
      }

      if (this.props.byActivity && this.props.edit) {
        resp = await AttendeeApi.update(
          this.props.cEvent?.value?._id,
          snap,
          this.props.value._id,
        )
        if (resp) {
          // resp = { ...resp, data: { _id: resp._id } };
          resp = await UsersApi.editEventUser(snap, eventId, this.props.value._id)
        }
      }

      if (this.props.updateView) {
        await this.props.updateView()
      }
    }

    if (resp || respActivity) {
      StateMessage.show(
        null,
        'success',
        this.props?.edit
          ? 'Usuario editado correctamente'
          : 'Usuario agregado correctamente',
      )
      this.props.handleModal()
    } else {
      StateMessage.show(null, 'error', 'Error al guardar el usuario')
    }

    this.setState({ loadingregister: false })
  }

  validateGenialityUser = async (values) => {
    console.log('1. values', values)
    console.log('1. values.email', values.email)

    const genialityUserRequest = await UsersApi.findByEmail(values.email)
    console.log('genialityUserRequest', genialityUserRequest)
    const [genialityUser] = genialityUserRequest
    console.log('genialityUser', genialityUser)

    if (!genialityUser) {
      console.log('1. El usuario no existe, se debe crear el usuario en geniality')
      this.setState({ existGenialialityUser: false })
    } else {
      this.setState({ existGenialialityUser: true })
      this.saveUser(values)
    }
  }

  printUser = () => {
    const resp = this.props.badgeEvent
    if (resp._id) {
      const badges = resp.BadgeFields
      if (this.props.value && !this.props.value.checked_in && this.props.edit)
        this.props.checkIn(this.state.userId)
      printBagdeUser(this.ifrmPrint, badges, this.state.user)
    } else this.setState({ noBadge: true })
  }

  render() {
    const { user, checked_in, ticket_id, rol, rolesList, userId, tickets } = this.state
    const { modal, badgeEvent, componentKey, edit } = this.props
    const qrSize = badgeEvent?.BadgeFields?.find((bagde) => bagde.qr)
    if (this.state.redirect) {
      return <Navigate to={this.state.url_redirect} />
    }
    return (
      <Modal closable footer={false} onCancel={() => this.props.handleModal()} visible>
        <div
          // className="asistente-list"
          style={{
            paddingLeft: '0px',
            paddingRight: '0px',
            paddingTop: '0px',
            paddingBottom: '0px',
            marginTop: '30px',
          }}
        >
          {componentKey === 'event-checkin' ||
            (componentKey == 'activity-checkin' && (
              <FormEnrollAttendeeToEvent
                fields={this.props.extraFields}
                conditionalFields={this.props.cEvent?.value?.fields_conditions}
                attendee={this.props.value}
                options={this.options}
                saveAttendee={this.saveUser}
                printUser={this.printUser}
                loaderWhenSavingUpdatingOrDelete={this.state.loadingregister}
                visibleInCms
                eventType={this.props.cEvent?.value?.type_event}
                badgeEvent={this.props.badgeEvent}
                activityId={this.props.activityId}
              />
            ))}
          {!this.state.edit ? (
            <RegisterUserAndEventUser
              screens={[]}
              stylePaddingMobile={stylePaddingMobile}
              stylePaddingDesktop={stylePaddingDesktop}
              requireAutomaticLogin={false}
            />
          ) : (
            <FormComponent
              conditionalsOther={this.props.cEvent?.value?.fields_conditions || []}
              initialOtherValue={this.props.value || {}}
              eventUserOther={user || {}}
              fields={this.props.extraFields}
              organization
              options={this.options}
              callback={this.validateGenialityUser}
              loadingregister={this.state.loadingregister}
              usedInCms
              editUser={this.props.edit}
            />
          )}
        </div>
        <div>
          {!this.state.existGenialialityUser && (
            <Alert
              showIcon
              /* style={{ marginTop: '5px' }} */
              style={{
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                borderLeft: '5px solid #FF4E50',
                fontSize: '14px',
                textAlign: 'start',
                borderRadius: '5px',
                marginBottom: '15px',
              }}
              /* closable */
              message={
                <>
                  {'Usuario no está registrado en Geniality'}
                  <Button
                    style={{ fontWeight: 'bold', marginLeft: '2rem' }}
                    onClick={() => {
                      console.log('Se registra el usuario')
                      this.setState({ makeUserRegister: true })
                      this.setState({ existGenialialityUser: true })
                    }}
                    type="primary"
                  >
                    Registrar Usuario
                  </Button>
                </>
              }
              type="error"
            />
          )}
        </div>
        <div style={{ opacity: 0, display: 'none' }}>
          {user && badgeEvent && badgeEvent.BadgeFields && (
            <QRCode value={userId} size={qrSize ? qrSize?.size : 64} />
          )}
        </div>
        <iframe
          title="Print User"
          ref={this.ifrmPrint}
          style={{ opacity: 0, display: 'none' }}
        />
      </Modal>
    )
  }
}

export default injectIntl(withContext(UserModal))
