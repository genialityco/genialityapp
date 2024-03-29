import { useState, useEffect } from 'react';
import { Spin, Alert, Col, Card, Avatar, Row, Button, Typography, Result } from 'antd';
import { Networking } from '../../helpers/request';
import { EventFieldsApi } from '../../helpers/request';
import { formatDataToString } from '../../helpers/utils';

//context
import { UseUserEvent } from '../../context/eventUserContext';
import { UseEventContext } from '../../context/eventContext';
import { UseCurrentUser } from '../../context/userContext';
import { useIntl } from 'react-intl';

const { Meta } = Card;

const ContactList = ({ tabActive, agendarCita }) => {
  const [contactsList, setContactsList] = useState([]);
  const [messageService, setMessageService] = useState('');
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  let userEventContext = UseUserEvent();
  let eventContext = UseEventContext();
  let userCurrentContext = UseCurrentUser();

  useEffect(() => {
    setLoading(true);

    const getContactList = async () => {
      // Servicio que trae los contactos
      if (!userEventContext.value) {
        return {};
      }
      Networking.getContactList(eventContext.value._id, userEventContext.value._id).then((result) => {
        if (typeof result == 'object') {
          setContactsList(result);
        }
        if (typeof result == 'string') {
          setMessageService(result === 'aun no tienes contactos.' ? intl.formatMessage({id: 'networking_not_contacts_yet', defaultMessage: 'Aún no tienes contactos.'}) : result);
        };

        setLoading(false);
      });
    };
    const getProperties = async () => {
      let properties = await EventFieldsApi.getAll(eventContext.value._id);
      setUserProperties(properties);
    };

    if (tabActive === 'mis-contactos' && eventContext.value && userCurrentContext.value) {
      getProperties();
      // getuserContactList();
      getContactList();
    } else {
      setLoading(false);
    }
  }, [eventContext.value._id, tabActive]);

  if (!loading)
    return userCurrentContext.value === null ? (
      <Col xs={22} sm={22} md={15} lg={15} xl={15} xxl={15} style={{ margin: '0 auto' }}>
        <Alert
          message={intl.formatMessage({id: 'log_in', defaultMessage:'Iniciar sesión'})}
          description={intl.formatMessage({id: 'see_contacts_login', defaultMessage: 'Para poder ver contactos es necesario iniciar sesión.'})}
          type='info'
          showIcon
        />
      </Col>
    ) : contactsList.length > 0 && !loading ? (
      <div>
        <Row gutter={[10, 10]}>
          {contactsList.map((contact, key) => {
            const user = contact.properties ? { ...contact.properties, picture: contact.user?.picture } : contact.user;
            return (
              <Col key={'contactlist' + key} xs={24} sm={24} md={24} lg={10} xl={10} xxl={10}>
                <Card
                  // extra={
                  //   ((user.telefono && user.telefono !== null && user.telefono.length === 10) ||
                  //     (user.nodewhatsapp && user.nodewhatsapp !== null && user.nodewhatsapp.length === 10) ||
                  //     (user.nodecelular && user.nodecelular !== null && user.nodecelular.length === 10) ||
                  //     (user.numerodecelular &&
                  //       user.numerodecelular !== null &&
                  //       user.numerodecelular.length === 10)) && (
                  //     <a
                  //       href={
                  //         'https://api.whatsapp.com/send?phone=57' +
                  //         (user.nodewhatsapp
                  //           ? user.nodewhatsapp
                  //           : user.nodecelular
                  //           ? user.nodecelular
                  //           : user.numerodecelular
                  //           ? user.numerodecelular
                  //           : user.telefono)
                  //       }
                  //       target='_blank'
                  //       rel='noreferrer'>
                  //       <span>
                  //         Hola soy {user.names}, <br />
                  //         Escribeme por WhatsApp
                  //       </span>
                  //     </a>
                  //   )
                  // }
                  style={{ width: '100%', textAlign: 'left' }}
                  bordered={true}>
                  <Meta
                    avatar={
                      <Avatar size={65} src={user['picture'] ? user['picture'] : ''}>
                        {!user['picture'] && user.names ? user.names.charAt(0).toUpperCase() : user.names}
                      </Avatar>
                    }
                    title={user.names ? user.names : intl.formatMessage({id: 'not_registed_name', defaultMessage: 'No registra nombre'})}
                    description={[
                      <div key={'contact' + key}>
                        <br />

                        {userProperties.map(
                          (property, key) =>
                            user[property.name] !== undefined &&
                            (!property.sensibility ||
                              property.visibleByContacts ||
                              property.visibleByContacts == 'only_for_my_contacts') &&
                            property.name != 'picture' &&
                            property.name !== 'imagendeperfil' && (
                              <div key={'contact-property' + key}>
                                {
                                  <p>
                                    <strong>{property.label}</strong>:{' '}
                                    {formatDataToString(
                                      property.type != 'codearea'
                                        ? user[property.name]
                                        : '(' + user[`code`] + ')' + user[property.name],
                                      property
                                    )}
                                  </p>
                                }
                              </div>
                            )
                        )}
                      </div>,
                    ]}
                  />
                  <Col xs={24}>
                    <Button
                      block
                      size='large'
                      style={{ backgroundColor: '#363636', color: 'white' }}
                      onClick={() => agendarCita(contact._id, contact)}>
                      {intl.formatMessage({id: 'schedule_appointment', defaultMessage: 'Agendar cita'})}
                    </Button>
                  </Col>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    ) : (
      contactsList.length == 0 &&
      !loading && (
        <Row justify='center' align='middle'>
          <Col >
            <Result 
              title={messageService}
            />
          </Col>
        </Row>
      )
    );
  if (userCurrentContext.value || loading) return <Row justify='center' align='middle'><Col><Spin size='large'
  tip={<Typography.Text strong>{intl.formatMessage({id: 'loading', defaultMessage: 'Cargando...'})}</Typography.Text>}/></Col></Row>;
  if (!userCurrentContext.value) return <Row justify='center' align='middle'><Col><Spin size='large'
  tip={<Typography.Text strong>{intl.formatMessage({id: 'loading', defaultMessage: 'Cargando...'})}</Typography.Text>}/></Col></Row>;
};
export default ContactList;
