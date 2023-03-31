import * as React from 'react'
import { FunctionComponent, useState, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { OrganizationFuction, UsersApi } from '@helpers/request'
import { Steps, Button, Card, Row, Spin } from 'antd'
import { ContactsOutlined, PictureOutlined, ScheduleOutlined } from '@ant-design/icons'
import { DispatchMessageService } from '@context/MessageService'

import InitialNewEventFormSection from './newEvent/InitialNewEventFormSection'
import EventAccessTypeSection from './newEvent/EventAccessTypeSection'

/*vista de resultado de la creacion de un curso */
import { cNewEventContext } from '@context/newEventContext'


interface INewEventPageProps {
  match: any,
}

const NewEventPage: FunctionComponent<INewEventPageProps> = (props) => {
  const [orgId, setOrgId] = useState<string | null>(null)
  const [stepsValid, setStepsValid] = useState({
    info: false,
    fields: false,
  })
  const [current, setCurrent] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [steps, setSteps] = useState([
    {
      title: 'Información',
      icon: <ScheduleOutlined />,
    },
    {
      title: 'Tipo de acceso',
      icon: <ContactsOutlined />,
    },
  ])

  const eventNewContext: any = useContext(cNewEventContext)

  const goNextPage = () => {
    setCurrent((previous) => previous + 1)
  }

  const goPreviousPage = () => {
    setCurrent((previous) => previous - 1)
  }

  const obtainContent = (step: typeof steps[number]) => {
    switch (step.title) {
      case 'Información':
        return <InitialNewEventFormSection orgId={orgId || undefined} currentUser={currentUser} />
      case 'Tipo de acceso':
        return <EventAccessTypeSection />
    }
  }

  const goNext = () => {
    switch (current) {
      case 0:
        if (
          eventNewContext.validateField([
            { name: 'name', required: true, length: 4 },
            { name: 'description', required: eventNewContext.addDescription, length: 9 },
          ])
        ) {
          DispatchMessageService({
            type: 'error',
            msj: 'Error en los campos...',
            action: 'show',
          })
        } else {
          goNextPage()
        }
        break
      case 1:
        eventNewContext.changeTransmision(false)
        goNextPage()
        console.log(eventNewContext.valueInputs)
        break
      case 2:
        break
    }
  }

  const goPrevious = () => {
    if (eventNewContext.optTransmitir && current == 2) {
      eventNewContext.changeTransmision(false);
    } else {
      goPreviousPage()
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const newOrgId = urlParams.get('orgId')
    setOrgId(newOrgId)

    if (props.match?.params?.user) {
      // eslint-disable-next-line react/prop-types
      UsersApi.getProfile(props.match?.params?.user).then((profileUser) => {
        setCurrentUser(profileUser)
      })
    }
  
  }, [])

  useEffect(() => {
    if (orgId) {
      OrganizationFuction.obtenerDatosOrganizacion(orgId).then((organization) => {
        if (organization) {
          organization = { ...organization, id: organization._id }
          eventNewContext.selectedOrganization(organization)
          eventNewContext.eventByOrganization(false)

          // I saw the NewEventContext and i have seen that the saveEvent method
          // will take data from the reducer state instead the context state.
          // Then, I call the dispatcher too
          // eventNewContext.dispatch({ type: 'SELECT_ORGANIZATION', payload: { organization } })
          // Well.. I comment because the component ModalOrgListCreate is setting now
          // this value, and when its orgId prop change, the component will update the state
        }
      })
    }
  }, [orgId])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#FCEAD9',
      }}>
      <Row justify="center" className="newEvent" style={{ transition: 'all 1.5s ease-out' }}>
        {/* Items del paso a paso */}
        <div className="itemStep">
          <Steps current={current} responsive>
            {steps.map((item) => (
              <Steps.Step key={item.title} title={item.title} icon={item.icon} />
            ))}
          </Steps>
        </div>
        <Card
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            width: `90%`,
            height: `80%`,
            borderRadius: '25px',
          }}
          className="card-container">
          {/* Contenido de cada item del paso a paso */}
          <Row justify="center" style={{ marginBottom: '8px' }}>
            {obtainContent(steps[current])}
          </Row>
          {/* Botones de navegacion dentro del paso a paso */}
          {/* SE VALIDA CON window.history.length  PARA DETECTAR SI ES POSIBLE HACER EL BACK YA QUE AVECES SE ABRE UNA PESTAÑA NUEVA*/}
          {!eventNewContext.state.loading && (
            <div className="button-container">
              {current <= 0 && (
                <Button
                  className="button"
                  size="large"
                  onClick={() => (window.history.length == 1 ? window.close() : window.history.back())}
                >
                  {window.history.length == 1 ? 'Salir' : 'Cancelar'}
                </Button>
              )}
              {current > 0 && (
                <Button className="button" size="large" onClick={() => goPrevious()}>
                  Anterior
                </Button>
              )}
              {current < steps.length - 1 && (
                <Button className="button" type="primary" size="large" onClick={() => goNext()}>
                  Siguiente
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button
                  className="button"
                  type="primary"
                  size="large"
                  onClick={async () => await eventNewContext.saveEvent()}
                >
                  Crear curso
                </Button>
              )}
            </div>
          )}
          {eventNewContext.state.loading && (
            <Row justify="center">
              Espere.. <Spin />
            </Row>
          )}
        </Card>
      </Row>
    </div>
  )
}

export default withRouter(NewEventPage)