import { Button, Col, Input, List, Modal, notification, Row, Select, Spin } from 'antd';
import moment from 'moment';
import { find, filter, keys, pathOr, propEq, whereEq } from 'ramda';
import { isNonEmptyArray } from 'ramda-adjunct';
import React, { useEffect, useState } from 'react';
import { SmileOutlined } from '@ant-design/icons';

import { getDatesRange } from '../../helpers/utils';
import { createAgendaToEventUser, getAgendasFromEventUser, getUsersId, getUserEvent } from './services';

const { Option } = Select;

// TODO: -> eliminar fakeEventTimetable
const fakeEventTimetable = {
  '2020-09-24': [
    {
      timestamp_start: '2020-09-24T21:00:00Z',
      timestamp_end: '2020-09-24T21:15:00Z',
    },
    {
      timestamp_start: '2020-09-24T21:15:00Z',
      timestamp_end: '2020-09-24T21:30:00Z',
    },
    {
      timestamp_start: '2020-09-24T21:30:00Z',
      timestamp_end: '2020-09-24T21:45:00Z',
    },
    {
      timestamp_start: '2020-09-24T21:45:00Z',
      timestamp_end: '2020-09-24T22:00:00Z',
    },
    {
      timestamp_start: '2020-09-24T22:00:00Z',
      timestamp_end: '2020-09-24T22:15:00Z',
    },
    {
      timestamp_start: '2020-09-24T22:15:00Z',
      timestamp_end: '2020-09-24T22:30:00Z',
    },
    {
      timestamp_start: '2020-09-24T22:30:00Z',
      timestamp_end: '2020-09-24T22:45:00Z',
    },
    {
      timestamp_start: '2020-09-24T22:45:00Z',
      timestamp_end: '2020-09-24T23:00:00Z',
    },
  ],
};

const { TextArea } = Input;
const buttonStatusText = {
  free: 'Reservar',
  pending: 'Pendiente',
  rejected: 'Rechazada',
};
const MESSAGE_MAX_LENGTH = 200;

function AppointmentModal({ event, currentEventUserId, targetEventUserId, closeModal, notificacion, idsend }) {
  console.log(targetEventUserId);
  const eventDatesRange = getDatesRange(event.date_start, event.date_end);
  const [openAgenda, setOpenAgenda] = useState('');
  const [agendaMessage, setAgendaMessage] = useState('');
  const [timetable, setTimetable] = useState({});
  const [selectedDate, setSelectedDate] = useState(eventDatesRange[0]);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  const reloadData = async (resp, target) => {
    setReloadFlag(!reloadFlag);
    console.log(target);
    notification.open({
      message: 'Solicitud enviada',
      description:
        'Le llegará un correo a la persona notificandole la solicitud, quien la aceptara o recharaza  y le llegará un correo de vuelta confirmando la respuesta',
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 30,
    });
    var r = null;
    var usId = await getUsersId(targetEventUserId, event._id);

    let notificationA = {
      idReceive: usId.account_id,
      idEmited: resp,
      emailEmited: 'email@gmail.com',
      message: 'Te ha enviado solicitud de agenda',
      name: 'notification.name',
      type: 'agenda',
      state: '0',
    };
    console.log('RESPUESTA SEND AGENDA' + resp);
    await notificacion(notificationA, currentEventUserId);
  };

  const resetModal = () => {
    closeModal();
    setSelectedDate(eventDatesRange[0]);
    setLoading(true);
    setTimetable({});
    setAgendaMessage('');
    setOpenAgenda('');
  };

  useEffect(() => {
    if (!(event._id && targetEventUserId && currentEventUserId)) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setTimetable({});
      setAgendaMessage('');
      setOpenAgenda('');

      try {
        const agendas = await getAgendasFromEventUser(event._id, targetEventUserId);

        const newTimetable = {};
        const eventTimetable = pathOr(fakeEventTimetable, ['timetable'], event); // TODO: -> cambiar fakeEventTimetable por {}
        const dates = keys(eventTimetable);

        dates.forEach((date) => {
          if (isNonEmptyArray(eventTimetable[date])) {
            eventTimetable[date].forEach((timetableItem) => {
              const occupiedAgendas = filter(
                whereEq({
                  timestamp_start: timetableItem.timestamp_start,
                  timestamp_end: timetableItem.timestamp_end,
                }),
                agendas
              );

              const occupiedAgendaFromMe = find(propEq('owner_id', currentEventUserId), occupiedAgendas);
              const occupiedAcceptedAgenda = find(propEq('request_status', 'accepted'), occupiedAgendas);
              const occupiedAgenda = occupiedAgendaFromMe || occupiedAcceptedAgenda;

              const newTimetableItem = {
                ...timetableItem,
                id: occupiedAgenda ? occupiedAgenda.id : null,
                status:
                  !!occupiedAgenda &&
                  (occupiedAgenda.request_status === 'accepted' || occupiedAgenda.owner_id === currentEventUserId)
                    ? occupiedAgenda.request_status
                    : 'free',
              };

              if (isNonEmptyArray(newTimetable[date])) {
                newTimetable[date].push(newTimetableItem);
              } else {
                newTimetable[date] = [newTimetableItem];
              }
            });
          }
        });

        setTimetable(newTimetable);
      } catch (error) {
        console.error(error);
        notification.error({
          message: 'Error',
          description: 'Obteniendo las citas del usuario',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [reloadFlag, event, currentEventUserId, targetEventUserId]);

  return (
    <Modal visible={!!targetEventUserId} title={'Agendar cita'} footer={null} onCancel={resetModal}>
      {loading ? (
        <Row align='middle' justify='center' style={{ height: 300 }}>
          <Spin />
        </Row>
      ) : (
        <div>
          <Row justify='end'>
            <Select
              style={{ width: 200 }}
              value={selectedDate}
              onChange={(newSelectedDate) => {
                setSelectedDate(newSelectedDate);
                setAgendaMessage('');
                setOpenAgenda('');
              }}>
              {eventDatesRange.map((eventDate) => (
                <Option value={eventDate} key={eventDate}>
                  {moment(eventDate).format('D MMMM')}
                </Option>
              ))}
            </Select>
          </Row>
          <div>
            <List
              bordered
              itemLayout='vertical'
              dataSource={timetable[selectedDate]}
              renderItem={(timetableItem) => {
                if (timetableItem.status === 'accepted') {
                  return null;
                }

                const agendaId = `${timetableItem.timestamp_start}${timetableItem.timestamp_end}`;

                return (
                  <List.Item>
                    <Row align='middle'>
                      <Col xs={16}>
                        <Row justify='center'>
                          {`${moment(timetableItem.timestamp_start).format('hh:mm a')} - ${moment(
                            timetableItem.timestamp_end
                          ).format('hh:mm a')}`}
                        </Row>
                      </Col>
                      <Col xs={8}>
                        <Row justify='center'>
                          <Button
                            type='primary'
                            shape='round'
                            disabled={timetableItem.status !== 'free' || openAgenda === agendaId}
                            onClick={() => {
                              if (timetableItem.status === 'free') {
                                setAgendaMessage('');
                                setOpenAgenda(agendaId);
                              }
                            }}>
                            {buttonStatusText[timetableItem.status]}
                          </Button>
                        </Row>
                      </Col>
                    </Row>

                    {openAgenda === agendaId && (
                      <div>
                        <div style={{ padding: '10px 0' }}>
                          <TextArea
                            rows={3}
                            placeholder={`Puedes agregar un mensaje corto en la solicitud. Máximo ${MESSAGE_MAX_LENGTH} caracteres.`}
                            value={agendaMessage}
                            onChange={(e) => {
                              const newAgendaMessage = e.target.value;

                              if (newAgendaMessage.length <= MESSAGE_MAX_LENGTH) {
                                setAgendaMessage(newAgendaMessage);
                              }
                            }}
                          />
                        </div>
                        <Row justify='end' style={{ paddingBottom: '20px' }}>
                          <Button
                            shape='round'
                            onClick={() => {
                              setOpenAgenda('');
                              setAgendaMessage('');
                            }}
                            style={{ marginRight: '10px' }}>
                            {'Cancelar'}
                          </Button>
                          <Button
                            type='primary'
                            shape='round'
                            onClick={() => {
                              if (timetableItem.status === 'free') {
                                setLoading(true);
                                createAgendaToEventUser({
                                  eventId: event._id,
                                  currentEventUserId,
                                  targetEventUserId,
                                  timetableItem,
                                  message: agendaMessage,
                                })
                                  .then((resp) => {
                                    console.log('RESP AGENDA');
                                    console.log(resp);
                                    console.log(targetEventUserId);
                                    console.log(timetableItem);
                                    reloadData(resp, targetEventUserId);
                                  })
                                  .catch((error) => {
                                    console.error(error);
                                    if (!error) {
                                      notification.warning({
                                        message: 'Espacio reservado',
                                        description: 'Este espacio de tiempo ya fué reservado',
                                      });
                                    } else {
                                      notification.error({
                                        message: 'Error',
                                        description: 'Error creando la reserva',
                                      });
                                    }
                                    resetModal();
                                  });
                              }
                            }}>
                            {'Enviar solicitud'}
                          </Button>
                        </Row>
                      </div>
                    )}
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AppointmentModal;
