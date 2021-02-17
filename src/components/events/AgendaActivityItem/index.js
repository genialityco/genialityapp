import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Tag, Avatar, Alert, Card } from 'antd';
import ReactPlayer from 'react-player';
import Moment from 'moment';
import './style.scss';
import { firestore } from '../../../helpers/firebase';
import { TagOutlined, CaretRightFilled } from '@ant-design/icons';

export default function AgendaActivityItem({
  item,
  Surveys,
  Documents,
  btnDetailAgenda,
  toggleConference,
  event_image,
  gotoActivity,
  registerStatus,
  registerInActivity,
  eventId,
  userId,
  show_inscription,
  userRegistered,
  handleOpenModal,
}) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [related_meetings, setRelatedMeetings] = useState();

  useEffect(() => {
    if (registerStatus) {
      setIsRegistered(registerStatus);
    }
    const listeningStateMeetingRoom = async () => {
      await firestore
        .collection('languageState')
        .doc(item._id)
        .onSnapshot((info) => {
          if (!info.exists) return;
          let related_meetings = info.data().related_meetings;
          setRelatedMeetings(related_meetings);
        });
    };

    listeningStateMeetingRoom();
  }, [registerStatus, item]);

  useEffect(() => {
    console.log('item', item);
  }, []);

  return (
    <div className='container_agenda-information'>
      <Card
        className='agenda_information'
        title={item.name}
        extra={
          eventId != '5f80b6c93b4b966dfe7cd012' &&
          eventId != '5f80a72272ccfd4e0d44b722' &&
          eventId != '5f80a9b272ccfd4e0d44b728' &&
          eventId != '5f8099c29564bf4ee44da4f3' && (
            <span className='date-activity'>
              {Moment(item.datetime_start).format('DD MMMM YYYY') ===
              Moment(item.datetime_end).format('DD MMMM YYYY') ? (
                <>
                  {Moment(item.datetime_start).format('DD MMMM YYYY h:mm a')} -{' '}
                  {Moment(item.datetime_end).format('h:mm a')}
                </>
              ) : (
                Moment(item.datetime_start).format('DD MMMM YYYY   hh:mm') -
                Moment(item.datetime_end).format('DD MMMM YYYY     hh:mm')
              )}
            </span>
          )
        }>
        <Row justify='space-between'>
          {item.description === null || item.hosts.length === 0 ? (
            <>
              <Col xs={24} sm={24} md={24} xl={24} xxl={24}>
                <div className='img-agenda-event'>
                  {!item.habilitar_ingreso && <img src={item.image ? item.image : event_image} />}
                  {item.habilitar_ingreso === 'closed_meeting_room' && (
                    <>
                      <img src={item.image ? item.image : event_image} />
                      <Alert
                        message={`La sesión inicia: ${Moment(item.datetime_start).format(
                          'DD MMMM YYYY h:mm a'
                        )} ${' - '} ${Moment(item.datetime_end).format('h:mm a')}`}
                        type='warning'
                      />
                    </>
                  )}
                  {item.habilitar_ingreso === 'ended_meeting_room' && (
                    <>
                      {item.video ? (
                        item.video && (
                          <>
                            <Alert message='Conferencia Terminada. Observa el video Aquí' type='success' />
                            <ReactPlayer
                              width={'100%'}
                              style={{
                                display: 'block',
                                margin: '0 auto',
                              }}
                              url={item.video}
                              //url="https://firebasestorage.googleapis.com/v0/b/eviusauth.appspot.com/o/eviuswebassets%2FLa%20asamblea%20de%20copropietarios_%20una%20pesadilla%20para%20muchos.mp4?alt=media&token=b622ad2a-2d7d-4816-a53a-7f743d6ebb5f"
                              controls
                              config={{
                                file: { attributes: { controlsList: 'nodownload' } },
                              }}
                            />
                          </>
                        )
                      ) : (
                        <>
                          <img src={item.image ? item.image : event_image} />
                          <Alert
                            message={`La Conferencia ha Terminado: ${Moment(item.datetime_start).format(
                              'DD MMMM YYYY h:mm a'
                            )} ${' - '} ${Moment(item.datetime_end).format('h:mm a')}`}
                            type='info'
                          />
                        </>
                      )}
                    </>
                  )}
                  {item.habilitar_ingreso === 'open_meeting_room' && (
                    <>
                      <img
                        onClick={() => item.meeting_id && toggleConference(true, item.meeting_id, item)}
                        src={item.image ? item.image : event_image}
                      />
                      <div>
                        <Button
                          block
                          type='primary'
                          disabled={item.meeting_id || item.vimeo_id ? false : true}
                          onClick={() =>
                            toggleConference(
                              true,
                              item.meeting_id || item.vimeo_id ? item.meeting_id : item.vimeo_id,
                              item
                            )
                          }>
                          {item.meeting_id || item.vimeo_id
                            ? 'Conéctate a la conferencia en vivo'
                            : 'Aún no empieza Conferencia Virtual'}
                        </Button>
                      </div>
                      <Row>
                        {related_meetings &&
                          related_meetings.map((item, key) => (
                            <>
                              {item.state === 'open_meeting_room' && (
                                <Button
                                  disabled={item.meeting_id || item.vimeo_id ? false : true}
                                  onClick={() =>
                                    toggleConference(true, item.meeting_id ? item.meeting_id : item.vimeo_id, item)
                                  }
                                  type='primary'
                                  className='button-Agenda'
                                  key={key}>
                                  {item.informative_text}
                                </Button>
                              )}
                              {item.state === 'closed_meeting_room' && (
                                <Alert message={`La  ${item.informative_text} no ha iniciado`} type='info' />
                              )}

                              {item.state === 'ended_meeting_room' && (
                                <Alert message={`La ${item.informative_text} ha terminado`} type='info' />
                              )}
                            </>
                          ))}
                      </Row>
                    </>
                  )}
                </div>
              </Col>
            </>
          ) : (
            <>
              <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
                <div className='img-agenda-event'>
                  {!item.habilitar_ingreso && <img src={item.image ? item.image : event_image} />}
                  {item.habilitar_ingreso === 'closed_meeting_room' && (
                    <>
                      <img src={item.image ? item.image : event_image} />
                      <Alert
                        message={`La sesión inicia: ${Moment(item.datetime_start).format(
                          'DD MMMM YYYY h:mm a'
                        )} ${' - '} ${Moment(item.datetime_end).format('h:mm a')}`}
                        type='warning'
                      />
                    </>
                  )}
                  {item.habilitar_ingreso === 'ended_meeting_room' && (
                    <>
                      {item.video ? (
                        item.video && (
                          <>
                            <Alert message='Conferencia Terminada. Observa el video Aquí' type='success' />
                            <ReactPlayer
                              width={'100%'}
                              style={{
                                display: 'block',
                                margin: '0 auto',
                              }}
                              url={item.video}
                              //url="https://firebasestorage.googleapis.com/v0/b/eviusauth.appspot.com/o/eviuswebassets%2FLa%20asamblea%20de%20copropietarios_%20una%20pesadilla%20para%20muchos.mp4?alt=media&token=b622ad2a-2d7d-4816-a53a-7f743d6ebb5f"
                              controls
                              config={{
                                file: { attributes: { controlsList: 'nodownload' } },
                              }}
                            />
                          </>
                        )
                      ) : (
                        <>
                          <img src={item.image ? item.image : event_image} />
                          <Alert
                            message={`La Conferencia ha Terminado: ${Moment(item.datetime_start).format(
                              'DD MMMM YYYY h:mm a'
                            )} ${' - '} ${Moment(item.datetime_end).format('h:mm a')}`}
                            type='info'
                          />
                        </>
                      )}
                    </>
                  )}
                  {item.habilitar_ingreso === 'open_meeting_room' && (
                    <>
                      <img
                        onClick={() => item.meeting_id && toggleConference(true, item.meeting_id, item)}
                        src={item.image ? item.image : event_image}
                      />
                      <div>
                        <Button
                          block
                          type='primary'
                          disabled={item.meeting_id || item.vimeo_id ? false : true}
                          onClick={() =>
                            toggleConference(
                              true,
                              item.meeting_id || item.vimeo_id ? item.meeting_id : item.vimeo_id,
                              item
                            )
                          }>
                          {item.meeting_id || item.vimeo_id
                            ? 'Conéctate a la conferencia en vivo'
                            : 'Aún no empieza Conferencia Virtual'}
                        </Button>
                      </div>
                      <Row>
                        {related_meetings &&
                          related_meetings.map((item, key) => (
                            <>
                              {item.state === 'open_meeting_room' && (
                                <Button
                                  disabled={item.meeting_id || item.vimeo_id ? false : true}
                                  onClick={() =>
                                    toggleConference(true, item.meeting_id ? item.meeting_id : item.vimeo_id, item)
                                  }
                                  type='primary'
                                  className='button-Agenda'
                                  key={key}>
                                  {item.informative_text}
                                </Button>
                              )}
                              {item.state === 'closed_meeting_room' && (
                                <Alert message={`La  ${item.informative_text} no ha iniciado`} type='info' />
                              )}

                              {item.state === 'ended_meeting_room' && (
                                <Alert message={`La ${item.informative_text} ha terminado`} type='info' />
                              )}
                            </>
                          ))}
                      </Row>
                    </>
                  )}
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={16} xxl={16}>
                {item.description !== null && item.description !== '<p><br></p>' && (
                  <div
                    className='description-agenda'
                    style={item.description !== null && item.description !== '<p><br></p>' ? {} : { display: 'none' }}>
                    {
                      <>
                        <Row>
                          <div dangerouslySetInnerHTML={{ __html: item.description }} />
                        </Row>
                      </>
                    }
                  </div>
                )}

                {item.hosts.length > 0 && (
                  <>
                    <Row justify='start' className='txt-agenda-Panelistas'>
                      <h4>Panelistas:</h4>
                    </Row>
                    <Row justify='start' className='Agenda-Panelistas'>
                      {item.hosts.map((speaker, key) => (
                        <span key={key} className='Agenda-speaker'>
                          <Col lg={24} xl={24} xxl={24}>
                            <Avatar size={30} src={speaker.image} /> {speaker.name} &nbsp;
                          </Col>
                        </span>
                      ))}
                    </Row>
                  </>
                )}
              </Col>
            </>
          )}
        </Row>
        <Row>
          <Col xs={24} sm={24} md={24} lg={8} xxl={8} xl={8}>
            <Row justify='start' align='middle'>
              <div
                onClick={() => {
                  gotoActivity(item);
                }}
                className='tag-agenda'
                style={{ marginBottom: '5%' }}>
                <TagOutlined style={{ marginRight: '12px', fontSize: '15px' }} />
                {item.activity_categories.length > 0 && (
                  <>
                    {item.activity_categories.map((item) => (
                      <>
                        <Tag>{item.name}</Tag>
                      </>
                    ))}
                  </>
                )}
              </div>
            </Row>
          </Col>
          <Col xs={24} sm={24} md={24} lg={16} xl={16} xxl={16}>
            <Row justify='end' align='bottom'>
              {show_inscription === 'true' && (
                <Button
                  type='primary'
                  onClick={() => registerInActivity(item._id, eventId, userId, setIsRegistered)}
                  className='space-align-block button-Agenda'
                  disabled={isRegistered}>
                  {isRegistered ? 'Inscrito' : 'Inscribirme'}
                </Button>
              )}
              {btnDetailAgenda === 'true' && (
                <Button
                  type='primary'
                  onClick={() => {
                    gotoActivity(item);
                  }}
                  className='space-align-block button-Agenda'>
                  Detalle de actividad
                </Button>
              )}
              {Documents &&
                Documents.length > 0 &&
                Documents.filter((element) => element.activity_id === item._id).length > 0 && (
                  <Button
                    type='primary'
                    onClick={() => {
                      gotoActivity(item);
                    }}
                    className='space-align-block button-Agenda'>
                    Documentos
                  </Button>
                )}
              {Surveys &&
                Surveys.length > 0 &&
                Surveys.filter((element) => element.activity_id === item._id).length > 0 && (
                  <Button
                    type='primary'
                    onClick={() => {
                      gotoActivity(item);
                    }}
                    className='space-align-block button-Agenda'>
                    Encuestas
                  </Button>
                )}
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
