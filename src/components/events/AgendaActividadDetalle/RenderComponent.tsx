import { useCallback, useContext, useEffect, useState } from 'react';
import WithEviusContext from '../../../context/withContext';
import ImageComponentwithContext from './ImageComponent';
import { useHelper } from '../../../context/helperContext/hooks/useHelper';
import { DolbyCard } from './DolbyCard';
import ZoomIframe from '../ZoomIframe';
import { VideoActivity } from './VideoActivity';
import GameDrawer from '../game/gameDrawer';
import { withRouter } from 'react-router-dom';
import { firestore } from '../../../helpers/firebase';
import HeaderColumnswithContext from './HeaderColumns';
import WowzaStreamingPlayer from './wowzaStreamingPlayer';
import AgendaContext from '../../../context/AgendaContext';
import initBroadcastViewers from '@containers/broadcastViewers';
import { CurrentUserContext } from '@/context/userContext';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { UseEventContext } from '@/context/eventContext';

const RenderComponent = (props: any) => {
	let tabsdefault = {
		attendees: false,
		chat: true,
		games: true,
		surveys: false,
	};
	const userContext = useContext(CurrentUserContext);
	const eventContext = UseEventContext();
	const [tabsGeneral, settabsGeneral] = useState(tabsdefault);
	const [activityState, setactivityState] = useState('');
	const [activityStateGlobal, setactivityStateGlobal] = useState('');
	const [renderGame, setRenderGame] = useState('');
	const [platform, setplatform] = useState('');
	const [meetingId, setmeetingId] = useState('');
	const [fnCiclo, setFnCiclo] = useState(false);
	//ESTADO PARA CONTROLAR ORIGEN DE TRANSMISION
	const agendaContext = useContext(AgendaContext);
	const { transmition, setTransmition, setTypeActivity, typeActivity, inactiveOrActiveViewer } = agendaContext;
	const { currentActivity, chatAttendeChats, HandleChatOrAttende, HandlePublicPrivate, helperDispatch } = useHelper();

	async function listeningStateMeetingRoom(event_id: string, activity_id: string) {
		// console.log({ activity_id });
		if (!fnCiclo) {
			let tempactivty = currentActivity;
			firestore
				.collection('events')
				.doc(event_id)
				.collection('activities')
				.doc(activity_id)
				.onSnapshot(infoActivity => {
					if (!infoActivity.exists) return;
					const data = infoActivity.data() as any;
					const { habilitar_ingreso, meeting_id, platform, tabs, avalibleGames } = data as any;
					setplatform(platform);
					settabsGeneral(tabs);
					setactivityState(habilitar_ingreso);
					setactivityStateGlobal(habilitar_ingreso);
					setmeetingId(meeting_id);
					setTransmition(data.transmition);
					setTypeActivity(data.typeActivity);
					if (!tabs.games) {
						HandleChatOrAttende('1');
						HandlePublicPrivate('public');
					}
					//Validacion para colombina (quitar apenas pase el evento)
					if (event_id == '619d09f7cbd9a47c2d386372') {
						HandleChatOrAttende('4');
					}

					// handleChangeTabs(tabs);
					helperDispatch({ type: 'changeTabs', tabs: tabs });
					tempactivty.habilitar_ingreso = habilitar_ingreso;
					tempactivty.avalibleGames = avalibleGames;
					helperDispatch({ type: 'currentActivity', currentActivity: tempactivty });
					setFnCiclo(true);
					/* console.log('tempactivty', tempactivty); */
				});
		}
	}
	useEffect(() => {
		async function GetStateMeetingRoom() {
			await listeningStateMeetingRoom(props.cEvent.value._id, currentActivity._id);
		}

		if (currentActivity != null) {
			GetStateMeetingRoom();
		}
	}, [currentActivity, props.cEvent]);

	useEffect(() => {
		if (chatAttendeChats === '4') {
			setRenderGame('game');
		} else {
			// NO SE DEBE QUEMAR OPEN MEETEING ROOM POR QUE SE CAMBIA EL ESTADO AL DAR CLICK EN CUALQUIER TAB
			if (activityStateGlobal) {
				setactivityState(activityStateGlobal);
			}
		}
	}, [chatAttendeChats]);

	const RenderizarComponente = useCallback(
		(plataforma: string, actividad_estado: string, reder_Game) => {
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
							return <ImageComponentwithContext willStartSoon={true} />;

						case 'ended_meeting_room':
							return <VideoActivity />;
						case '':
						case 'created_meeting_room':
							return currentActivity?.video ? <VideoActivity /> : <ImageComponentwithContext />;
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
							return <ImageComponentwithContext willStartSoon={true} />;

						case 'ended_meeting_room':
							return <VideoActivity />;
						case '':
						case 'created_meeting_room':
							return currentActivity?.video ? <VideoActivity /> : <ImageComponentwithContext />;
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
							return <ImageComponentwithContext willStartSoon={true} />;

						case 'ended_meeting_room':
							return <VideoActivity />;
						case '':
						case 'created_meeting_room':
							return currentActivity?.video ? <VideoActivity /> : <ImageComponentwithContext />;
					}

				case 'wowza':
					switch (actividad_estado) {
						case 'open_meeting_room':
							switch (reder_Game) {
								case 'game':
									return (
										<>
											<WowzaStreamingPlayer
												activity={currentActivity}
												transmition={transmition}
												meeting_id={meetingId}
											/>
											<GameDrawer />
										</>
									);
							}
							return (
								<>
									{/* {webHookStreamStatus && (
                  <>
                    <b>Evius Meets Status: </b>
                    {webHookStreamStatus}
                    <br />
                  </>
                )} */}

									<WowzaStreamingPlayer activity={currentActivity} transmition={transmition} meeting_id={meetingId} />
								</>
							);

						case 'closed_meeting_room':
							/* {
              console.log('100. TYPE ACTIVITY==>', typeActivity);
            } */
							return typeActivity === 'url' || typeActivity === 'video' ? (
								<WowzaStreamingPlayer activity={currentActivity} transmition={transmition} meeting_id={meetingId} />
							) : (
								<ImageComponentwithContext willStartSoon={true} />
							);

						case 'ended_meeting_room':
							return typeActivity === 'url' || typeActivity === 'video' ? (
								<WowzaStreamingPlayer activity={currentActivity} transmition={transmition} meeting_id={meetingId} />
							) : (
								<VideoActivity />
							);
						case '':
						case 'created_meeting_room':
							return typeActivity === 'url' || typeActivity === 'video' ? (
								<WowzaStreamingPlayer activity={currentActivity} transmition={transmition} meeting_id={meetingId} />
							) : currentActivity?.video ? (
								<VideoActivity />
							) : (
								<ImageComponentwithContext />
							);
						case 'no_visibe':
							return <ImageComponentwithContext />;
						case null:
							return (
								<>
									<WowzaStreamingPlayer activity={currentActivity} transmition={transmition} meeting_id={meetingId} />
									<GameDrawer />
								</>
							);
					}
				case 'only':
					return (
						<>
							{/* {console.log({ meetingId, currentActivity })} */}
							<WowzaStreamingPlayer activity={currentActivity} transmition={transmition} meeting_id={meetingId} />
							<GameDrawer />
						</>
					);
			}
		},
		[platform, activityState, renderGame, fnCiclo]
	);

	return (
		<>
			{!props.isBingo && <HeaderColumnswithContext isVisible={true} activityState={activityState} />}
			{RenderizarComponente(platform, activityState, renderGame)}
		</>
	);
};

export default withRouter(WithEviusContext(RenderComponent));