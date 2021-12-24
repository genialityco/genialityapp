import React, { Component } from 'react';
import { app, firestore } from '../../helpers/firebase';
import { Activity, AttendeeApi, eventTicketsApi, TicketsApi, UsersApi } from '../../helpers/request';
import { toast } from 'react-toastify';
import Dialog from './twoAction';
import { FormattedDate, FormattedMessage, FormattedTime } from 'react-intl';
import QRCode from 'qrcode.react';
import { icon } from '../../helpers/constants';
import { Redirect } from 'react-router-dom';
import { Actions } from '../../helpers/request';
import Moment from 'moment';
import FormComponent from '../events/registrationForm/form';
import { message, Modal } from 'antd';
import withContext from '../../Context/withContext';
import { ComponentCollection } from 'survey-react';
import { saveImageStorage } from '../../helpers/helperSaveImage';
import { DeleteOutlined } from '@ant-design/icons';

class UserModal extends Component {
  constructor(props) {
    super(props);
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
    };
  }

  async componentDidMount() {
    const self = this;
    const { rolesList } = this.props;
    self.setState({ rolesList, rol: rolesList.length > 0 ? rolesList[0]._id : '' });
    const tickets = await eventTicketsApi.getAll(this.props.cEvent?.value?._id || '5ea23acbd74d5c4b360ddde2');
    if (tickets.length > 0) this.setState({ tickets });
    let user = {};
    if (this.props.edit) {
      const { value } = this.props;
      if (value.properties) {
        Object.keys(value.properties).map((obj) => {
          return (user[obj] = value.properties[obj]);
        });
        let checked_in = value.checkedin_at ? true : false;
        user = { ...user, _id: value._id };
        this.setState({
          user,
          ticket_id: value.ticket_id,
          edit: true,
          rol: value.rol_id,
          confirmCheck: checked_in,
          userId: value._id,
          prevState: value.state_id,
          valid: false,
        });
      } else {
        Object.keys(value).map((obj) => {
          return (user[obj] = value[obj]);
        });
        let checked_in = value.checkedin_at ? true : false;
        this.setState({
          user,
          ticket_id: value.ticket_id,
          edit: true,
          rol: value.rol,
          confirmCheck: checked_in,
          userId: value._id,
          prevState: value.state_id,
          valid: false,
        });
      }
    } else {
      this.props.extraFields.map((obj) => {
        user[obj.name] = obj.type === 'boolean' ? false : obj.type === 'number' ? 0 : '';
        return user;
      });
      this.setState({ found: 1, user, edit: false, ticket_id: this.props.ticket });
    }
    //console.log('EXTRAFIELDS===>', this.props.extraFields);
  }

  componentWillUnmount() {
    this.setState({ user: {}, edit: false });
  }
  options = [
    {
      type: 'danger',
      text: 'Eliminar/Borrar',
      icon: <DeleteOutlined />,
      action: () => this.deleteUser(this.state.user),
    },
  ];

  deleteUser = async (user) => {
    const { substractSyncQuantity } = this.props;
    let messages = {};
    // let resultado = null;
    const self = this;

    const userRef = !this.props.byActivity
      ? firestore.collection(`${this.props.cEvent.value?._id}_event_attendees`)
      : firestore
          .collection(`${this.props.cEvent.value?._id}_event_attendees`)
          .doc('activity')
          .collection(`${this.props.activityId}`);

    try {
      !this.props.byActivity &&
        (await Actions.delete(`/api/events/${this.props.cEvent.value?._id}/eventusers`, user._id));
      // message = { class: 'msg_warning', content: 'USER DELETED' };
      toast.info(<FormattedMessage id='toast.user_deleted' defaultMessage='Ok!' />);

      this.props.byActivity && (await Activity.DeleteRegister(this.props.cEvent.value?._id, user.idActivity));
      this.props.byActivity && (await this.props.updateView());
      message.success('Eliminado correctamente');

      //message.success('Eliminado correctamente');
    } catch (e) {
      ///Esta condición se agrego porque algunas veces los datos no se sincronizan
      //bien de mongo a firebase y terminamos con asistentes que no existen
      if (e.response && e.response.status === 404) {
        //let respdelete1 = await UsersApi.deleteUsers('615dd4876a959d694a2a7ab6');
        //let respdelete2 = await UsersApi.deleteUsers('615ddb385dae82055078a544');
        //console.log('RESPDELETE==>', respdelete1);
        // console.log('RESPDELETE2==>', respdelete1);
        //userRef.doc(user._id).delete();
        message.success('Eliminado correctamente');
      } else {
        messages = { class: 'msg_danger', content: e };
        message.error('Error al eliminar');
      }
    } finally {
      setTimeout(() => {
        messages.class = message.content = '';
        //self.closeModal();
      }, 500);
    }

    //Borrado de usuario en Firebase
    userRef
      .doc(this.state.userId)
      .delete()
      .then(function() {
        message.class = 'msg_warning';
        message.content = 'USER DELETED';
        toast.info(<FormattedMessage id='toast.user_deleted' defaultMessage='Ok!' />);

        //Ejecuta la funcion si se realiza la actualizacion en la base de datos correctamente
        //substractSyncQuantity();
      });
    setTimeout(() => {
      message.class = message.content = '';
      self.closeModal();
    }, 500);
  };

  closeModal = () => {
    let message = { class: '', content: '' };
    this.setState({ user: {}, valid: true, modal: false, uncheck: false, message }, this.props.handleModal());
  };

  saveUser = async (values) => {
    this.setState({ loadingregister: true });
    //console.log('callback=>', values);
    let resp;
    let respActivity = true;
    if (values) {
      if (values?.checked_in) {
        values.checkedin_at = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      } else {
        values.checkedin_at = '';
      }
      /* console.log("ACA VALUES==>",values) */
      const snap = { properties: values, checked_in: values.checked_in, checkedin_at: values.checkedin_at };
      if (this.props.organizationId) {
        resp = await OrganizationApi.saveUser(this.props.organizationId, snap);
        /* console.log("10. resp ", resp) */
      } else {
        /* console.log("se va por aca",this.props.cEvent) */
        if (!this.props.edit) {
          resp = await UsersApi.createOne(snap, this.props.cEvent?.value?._id || this.props.cEvent?.value?.idEvent);
        } else {
          resp = await UsersApi.editEventUser(
            snap,
            this.props.cEvent?.value?._id || this.props.cEvent?.value?.idEvent,
            this.props.value?._id
          );
        }
        /* console.log("10. USERADD==>",resp) */
      }
      if (this.props.byActivity && resp?.data?._id && !this.props.edit) {
        respActivity = await Activity.Register(
          this.props.cEvent?.value?._id,
          resp.data.user._id,
          this.props.activityId
        );
      }

      if (this.props.byActivity && this.props.edit) {
        //console.log('VALUES ACTIVITY==>', this.props.value);
        //respActivity = await Activity.Update(this.props.cEvent?.value?._id, this.props.value.idActivity, datos);
        //console.log('RESPUESTA ACTIVITY UPDATE==>', respActivity, this.props.value.idActivity);
        resp = await AttendeeApi.update(this.props.cEvent?.value?._id, snap, this.props.value._id);
        if (resp) {
          resp = { ...resp, data: { _id: resp._id } };
        }
      }

      // if (values.checked_in && this.props.activityId) {
      //   let userRef = await firestore
      //     .collection(`${this.props.cEvent?.value?._id}_event_attendees`)
      //     .doc('activity')
      //     .collection(`${this.props.activityId}`);
      //   userRef.doc(resp?._id || this.props.value.idActivity).set({
      //     ...resp.data,
      //     updated_at: new Date(),
      //     checked_in: true,
      //     checkedin_at: new Date(),
      //     checked_at: new Date(),
      //   });
      // } else {
      //   let userRef = await firestore
      //     .collection(`${this.props.cEvent?.value?._id}_event_attendees`)
      //     .doc('activity')
      //     .collection(`${this.props.activityId}`);
      //   userRef.doc(resp?._id || this.props.value?.idActivity).set({
      //     ...(resp?.data || respActivity),
      //     updated_at: new Date(),
      //     checked_in: false,
      //     checkedin_at: '',
      //     checked_at: '',
      //   });
      // }
      if (this.props.updateView) {
        await this.props.updateView();
      }
    }

    if (resp || respActivity) {
      message.success('Usuario agregado correctamente');
      this.props.handleModal();
    } else {
      message.error('error al guardar');
    }

    this.setState({ loadingregister: false });
  };

  render() {
    const { user, checked_in, ticket_id, rol, rolesList, userId, tickets } = this.state;
    const { modal } = this.props;
    if (this.state.redirect) return <Redirect to={{ pathname: this.state.url_redirect }} />;
    return (
      <Modal closable footer={false} onCancel={() => this.props.handleModal()} visible={true}>
        <div
          // className='asistente-list'
          style={{
            paddingLeft: '0px',
            paddingRight: '0px',
            paddingTop: '0px',
            paddingBottom: '0px',
            marginTop: '30px',
          }}>
          <FormComponent
            conditionalsOther={this.props.cEvent?.value?.fields_conditions || []}
            initialOtherValue={this.props.value || {}}
            eventUserOther={user || {}}
            fields={this.props.extraFields}
            organization={true}
            options={this.options}
            callback={this.saveUser}
            loadingregister={this.state.loadingregister}
          />
        </div>
      </Modal>
    );
  }
}

export default withContext(UserModal);
