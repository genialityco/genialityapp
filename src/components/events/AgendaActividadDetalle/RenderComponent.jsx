import React, { useContext, useEffect, useState } from 'react';
import WithEviusContext from '../../../Context/withContext';
import ImageComponentwithContext from './ImageComponent';
import { HelperContext } from '../../../Context/HelperContext';
import { DolbyCard } from './DolbyCard';
import ZoomIframe from '../ZoomIframe';
import { VideoActivity } from './VideoActivity';
import { Space } from 'antd';
import GameDrawer from '../game/gameDrawer';
import { LoadingOutlined } from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { firestore } from '../../../helpers/firebase';
import HeaderColumnswithContext from './HeaderColumns';

const RenderComponent = (props) => {
  let {
    currentActivity,
    chatAttendeChats,
    handleChangeTabs,
    handleChangeCurrentActivity,
    HandleChatOrAttende,
    HandlePublicPrivate,
  } = useContext(HelperContext);
  let tabsdefault = {
    attendees: false,
    chat: true,
    games: true,
    surveys: false,
  };
  const [tabsGeneral, settabsGeneral] = useState(tabsdefault);
  const [activityState, setactivityState] = useState('');
  const [renderGame, setRenderGame] = useState('');
  const [platform, setplatform] = useState('');
  const [meetingId, setmeetingId] = useState('');

  const Preloader = () => (
    <Space
      direction='horizontal'
      style={{
        background: '#F7F7F7',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        height: '80vh',
      }}>
      <LoadingOutlined style={{ fontSize: '100px', color: 'black' }} spin />
    </Space>
  );

  async function listeningStateMeetingRoom(event_id, activity_id) {
    let tempactivty = currentActivity;
    firestore
      .collection('events')
      .doc(event_id)
      .collection('activities')
      .doc(activity_id)
      .onSnapshot((infoActivity) => {
        if (!infoActivity.exists) return;
        const data = infoActivity.data();
        const { habilitar_ingreso, meeting_id, platform, tabs, avalibleGames } = data;
        setplatform(platform);
        setactivityState(habilitar_ingreso);
        setmeetingId(meeting_id);
        settabsGeneral(tabs);
        if (!tabs.games) {
          HandleChatOrAttende('1');
          HandlePublicPrivate('public');
        }
        handleChangeTabs(tabs);
        tempactivty.habilitar_ingreso = habilitar_ingreso;
        tempactivty.avalibleGames = avalibleGames;
      });

    handleChangeCurrentActivity(tempactivty);
  }

  useEffect(() => {
    async function GetStateMeetingRoom() {
      await listeningStateMeetingRoom(props.cEvent.value._id, currentActivity._id);
    }

    if (currentActivity) {
      GetStateMeetingRoom();
    }
  }, [currentActivity]);

  useEffect(() => {
    if (chatAttendeChats === '4') {
      setRenderGame('game');
    } else {
      setactivityState('open_meeting_room');
    }
  }, [chatAttendeChats]);

  function RenderizarComponente(plataforma, actividad_estado, reder_Game) {
    // console.log('10. si los recibe', plataforma, actividad_estado);
    switch (plataforma) {
      case 'vimeo':
        switch (actividad_estado) {
          case 'open_meeting_room':
            switch (reder_Game) {
              case 'game':
                return (
                  <>
                    <ZoomIframe platform={platform} meeting_id={meetingId} generalTabs={tabsGeneral} />
                    <GameDrawer />
                  </>
                );
            }
            return <ZoomIframe platform={platform} meeting_id={meetingId} generalTabs={tabsGeneral} />;

          case 'closed_meeting_room':
            return <ImageComponentwithContext />;

          case 'ended_meeting_room':
            return <VideoActivity />;
        }

      case 'zoom':
        switch (actividad_estado) {
          case 'open_meeting_room':
            switch (reder_Game) {
              case 'game':
                return (
                  <>
                    <ZoomIframe platform={platform} meeting_id={meetingId} generalTabs={tabsGeneral} />
                    <GameDrawer />
                  </>
                );
            }
            return <ZoomIframe platform={platform} meeting_id={meetingId} generalTabs={tabsGeneral} />;

          case 'closed_meeting_room':
            return <ImageComponentwithContext />;

          case 'ended_meeting_room':
            return <VideoActivity />;
        }

      case 'dolby':
        switch (actividad_estado) {
          case 'open_meeting_room':
            switch (reder_Game) {
              case 'game':
                return (
                  <>
                    <DolbyCard />
                    <GameDrawer />
                  </>
                );
            }
            return <DolbyCard />;

          case 'closed_meeting_room':
            return <ImageComponentwithContext />;

          case 'ended_meeting_room':
            return <VideoActivity />;
        }
    }
  }

  return (
    <>
      {' '}
      <HeaderColumnswithContext isVisible={true} activityState={activityState} />
      {RenderizarComponente(platform, activityState, renderGame)}
    </>
  );
};

export default withRouter(WithEviusContext(RenderComponent));