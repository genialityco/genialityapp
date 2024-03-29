import * as React from 'react';
import { useState, useContext, useMemo, useEffect } from 'react';

import {
  Row,
  Col,
  Affix,
  Card,
  Typography,
  Statistic,
} from 'antd';
import useActivityType from '@context/activityType/hooks/useActivityType';
import AgendaContext from '@context/AgendaContext';
import { CurrentEventContext } from '@context/eventContext';
import { obtenerVideos } from '@/adaptors/gcoreStreamingApi';
import VideoPreviewerCard from './components/manager/VideoPreviewerCard';
import TransmitionStatusCard from './components/manager/TransmitionStatusCard';
import VideoListCard from './components/manager/VideoListCard';
import LoadingActivityType from './components/LoadingActivityType';
import TransmitionOptionsCard from './components/manager/TransmitionOptionsCard';
import ParticipantRequestsCard from './components/manager/ParticipantRequestsCard';
import RTMPCard from './components/manager/RTMPCard';
import ShareMeetLinkCard from './components/manager/ShareMeetLinkCard';
import GoToMeet from './components/manager/GoToMeet';
import { activityContentValues } from '@context/activityType/constants/ui';
import type { ActivityType } from '@context/activityType/types/activityType';
import ModalListRequestsParticipate from '../roomManager/components/ModalListRequestsParticipate';
import { TypeDisplayment } from '@/context/activityType/constants/enum';

export interface ActivityContentManagerProps {
  activityName: string,
};

function ActivityContentManager(props: ActivityContentManagerProps) {
  const eventContext = useContext(CurrentEventContext);
  const {
    activityEdit,
    roomStatus,
    setRoomStatus,
    dataLive,
    meeting_id,
    obtainUrl,
    getRequestByActivity,
    getViewers,
    recordings,
    startRecordTransmition,
    stopRecordTransmition,
    request,
    loadingRecord,
    record,
    viewers,
    viewersOnline,
    totalViews,
    maxViewers,
    platform,
  } = useContext(AgendaContext);

  const [viewModal, setViewModal] = useState(false);
  const [videos, setVideos] = useState<any[] | null>(null);

  const refActivity = useMemo(() => (
    `request/${eventContext.value?._id}/activities/${activityEdit}`), [eventContext, activityEdit]);
  const refActivityViewers = useMemo(() => (
    `viewers/${eventContext.value?._id}/activities/${activityEdit}`), [eventContext, activityEdit]);

  const {
    contentSource,
    translateActivityType,
    activityContentType,
  } = useActivityType();

  const type = useMemo<ActivityType.TypeAsDisplayment | null>(() => {
    if (activityContentType)
      return translateActivityType(activityContentType);
    return null;
  }, [activityContentType]);

  const videoURL = useMemo(() => {
    if (type !== TypeDisplayment.VIDEO) return contentSource;
    if (contentSource?.includes('youtube')) {
      return contentSource;
    }
    return contentSource?.split('*')[0];
  }, [type, contentSource]);

  const getVideoList = async () => {
    setVideos(null);
    try {
      const videoList = await obtenerVideos(props.activityName, meeting_id);
      if (videoList) {
        setVideos(videoList);
      }
    } catch (err) {
      // Convert url and cargarvideo to VIDEO was an error I did think
      // pd: cargarvideo is a awful name
      console.error('Not watch if VIDEO is url or cargarvideo, then error', err);
    }
  };

  useEffect(() => {
    meeting_id && getVideoList();

    if (type !== TypeDisplayment.EVIUS_MEET) return;
    getRequestByActivity(refActivity);
  }, [type, meeting_id]);

  useEffect(() => {
    getViewers(refActivityViewers);
    /* console.debug('ActivityContentManager - take:', activityContentType);
    console.debug('ActivityContentManager - with source =', contentSource)
    console.debug('ActivityContentManager - dataLive:', JSON.stringify(dataLive));
    console.debug('ActivityContentManager - roomStatus:', JSON.stringify(roomStatus));
    console.debug('ActivityContentManager - platform:', JSON.stringify(platform)); */
  }, []);

  if (!type) {
    return (
      <Typography.Title>Tipo de contenido no soportado aún</Typography.Title>
    );
  }

  if ([activityContentValues.survey, activityContentValues.quizing].includes(activityContentType as ActivityType.ContentValue)) {
    return (
      <>
      <div style={{textAlign: 'center', width: '100%'}}>
        <Typography.Title>{activityContentType}</Typography.Title>
        <Typography.Text>Página de configuración del contenido.</Typography.Text>
      </div>
      </>
    );
  }

  return (
    <>
    <Row gutter={[16, 16]}>
      <Col span={10}>
        <Affix offsetTop={80}>
          <VideoPreviewerCard type={type} activityName={props.activityName} />
        </Affix>
      </Col>

      <Col span={14}>
        <Row gutter={[16, 16]}>
          {(type == TypeDisplayment.TRANSMISSION || type == TypeDisplayment.EVIUS_MEET) && !dataLive?.active && (
            <Col span={24}>
              <TransmitionStatusCard type={type} />
            </Col>
          )}

          {(type === TypeDisplayment.TRANSMISSION || type === TypeDisplayment.EVIUS_MEET) &&
            !dataLive?.active &&
            (videos ? (
              <Col span={24}>
                <VideoListCard
                  refreshData={getVideoList}
                  videos={videos}
                  toggleActivitySteps={() => console.log('toggleActivitySteps')}
                />
              </Col>
            ) : (
              <Col span={24}>
                <Card bodyStyle={{ padding: '21' }} style={{ borderRadius: '8px' }}>
                  <LoadingActivityType />
                </Card>
              </Col>
            ))}
          

          {(type == TypeDisplayment.MEETING || (type == TypeDisplayment.EVIUS_MEET && dataLive?.active)) && (
            <Col span={10}>
              <GoToMeet type={type} activityId={activityEdit} />
            </Col>
          )}

          {(((type === TypeDisplayment.EVIUS_MEET || type === TypeDisplayment.TRANSMISSION) && dataLive?.active) || (type !== TypeDisplayment.EVIUS_MEET && type !== TypeDisplayment.TRANSMISSION)) && (
            <Col span={type !== TypeDisplayment.EVIUS_MEET && type !== TypeDisplayment.MEETING ? 24 : 14}>
              <TransmitionOptionsCard type={type} />
            </Col>
          )}

          {type == TypeDisplayment.VIDEO && (
            <Col span={24}>
              <Card bodyStyle={{ padding: '21' }} style={{ borderRadius: '8px' }}>
                <Card.Meta
                  title={
                    <Typography.Text style={{ fontSize: '20px' }} strong>
                      Video cargado
                    </Typography.Text>
                  }
                  description={'Esta es la url cargada'}
                />
                <br /><strong>URL:</strong>{' '}{videoURL}
              </Card>
            </Col>
          )}

          {type == TypeDisplayment.MEETING ? (
            <Col span={24}>
              <ShareMeetLinkCard activityId={activityEdit} />
            </Col>
          ) : (
            type == TypeDisplayment.EVIUS_MEET && dataLive?.active && (
              <Col span={24}>
                <ShareMeetLinkCard activityId={activityEdit} />
              </Col>
            )
          )}

          {type == TypeDisplayment.EVIUS_MEET && dataLive?.active && (
            <Col span={24}>
              <ParticipantRequestsCard request={request} setViewModal={setViewModal} />
            </Col>
          )}

          {(type == TypeDisplayment.TRANSMISSION || type == TypeDisplayment.EVIUS_MEET) && dataLive?.active && (
            <Col span={24}><RTMPCard/></Col>
          )}

          {(!!roomStatus || type === 'reunión' || type === 'Video') && (
            <Col span={24}>
              <Card bodyStyle={{ padding: '21px' }} style={{ borderRadius: '8px' }}>
                <Card.Meta
                  title={
                    <Typography.Text style={{ fontSize: '20px' }} strong>
                      Estadísticas de la actividad
                    </Typography.Text>
                  }
                />
                <br />
                <Row gutter={[16, 16]} wrap>
                  <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <Statistic
                      style={{ textAlign: 'center' }}
                      title={<Typography.Text strong>Número de vistas totales</Typography.Text>}
                      value={totalViews.length}
                    />
                  </Col>

                  <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <Statistic
                      style={{
                        textAlign: 'center',
                      }}
                      title={<Typography.Text strong>Número de usuarios únicos</Typography.Text>}
                      value={viewers.length}
                    />
                  </Col>

                  {(roomStatus === 'open_meeting_room' || type === 'reunión' || type === 'Video') && (
                    <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                      <Statistic
                        style={{ textAlign: 'center' }}
                        title={<Typography.Text strong>Visualizaciones en curso</Typography.Text>}
                        value={viewersOnline.length}
                      />
                    </Col>
                  )}
                  <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <Statistic
                      style={{ textAlign: 'center' }}
                      title={<Typography.Text strong>Numero maximo de usuarios</Typography.Text>}
                      value={maxViewers || 0}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
    <ModalListRequestsParticipate handleModal={setViewModal} visible={viewModal} refActivity={refActivity}/>
    </>
  );
}

export default ActivityContentManager;
