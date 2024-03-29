import { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'moment-timezone';
import { useIntl } from 'react-intl';
import { Row, Card, Alert, Button, Space } from 'antd';
import WithEviusContext from '../../../context/withContext';
import { setTopBanner } from '../../../redux/topBanner/actions';
import { AgendaApi } from '../../../helpers/request';
import { setVirtualConference } from '../../../redux/virtualconference/actions';
import { useHelper } from '../../../context/helperContext/hooks/useHelper';
import { UseSurveysContext } from '../../../context/surveysContext';
import { isMobile } from 'react-device-detect';
import * as SurveyActions from '../../../redux/survey/actions';
import SurveyDrawer from '../surveys/components/surveyDrawer';
import HCOActividad from './HOC_Actividad';
import { activitiesCode, cityValid, codeActivity } from '../../../helpers/constants';
import AditionalInformation from './AditionalInformation';
import { checkinAttendeeInActivity } from '../../../helpers/HelperAuth';
import { UseUserEvent } from '@/context/eventUserContext';
import { UseEventContext } from '@/context/eventContext';
import { UseCurrentUserContext } from '@/context/userContext';
import DrawerBingo from '@components/games/bingo/components/DrawerBingo';
import SharePhotoInLanding from '@/components/games/sharePhoto/views/SharePhotoInLanding';
import WhereisInLanding from '@/components/games/whereIs/views/WhereIsInLanding';
const { setHasOpenSurveys } = SurveyActions;
import PlayMillonaire from '@/components/games/WhoWantsToBeAMillonaire/components/PlayMillonaire';
import PrintBingoCartonButton from '@/components/games/bingo/components/PrintBingoCartonButton';
import useActivityType from '@/context/activityType/hooks/useActivityType';
import { disconnectUserPresenceInActivity, listenUserPresenceInActivity } from './utils';
const sharePhotoEventStatus = true;
const whereIsEventStatus = true;
const millonaireEventSatus = true;

const AgendaActividadDetalle = (props) => {
  console.log(`I'm activity ${props}`)
  let { chatAttendeChats, HandleOpenCloseMenuRigth, currentActivity, helperDispatch } = useHelper();
  let [orderedHost, setOrderedHost] = useState([]);
  let cSurveys = UseSurveysContext();
  const [videoStyles, setVideoStyles] = useState(null);
  const [videoButtonStyles, setVideoButtonStyles] = useState(null);
  let [blockActivity, setblockActivity] = useState(false);
  const [activity, setactivity] = useState('');
  const cUser = UseCurrentUserContext();
  let cEventUser = UseUserEvent();
  // console.log('cUser', cUser)
  const cEvent = UseEventContext();
  // console.log('activityId', props.match.params.activity_id)
  const uid = cUser.value.uid
  const activityId = props.match.params.activity_id
  const eventId = cEvent.value._id
  console.log(cEvent)
  // const isAssambleyMod = cEvent.value
  const [openOrCloseModalDrawer, setOpenOrCloseModalDrawer] = useState(false);
  const intl = useIntl();
  {
    Moment.locale(window.navigator.language);
  }
  
  
  useEffect(() => {
    if (!!activityId && !!eventId && !!uid) {
      listenUserPresenceInActivity(eventId, activityId, uid)
    }
    async function getActividad() {
      return await AgendaApi.getOne(props.match.params.activity_id, cEvent.value._id);
    }

    function orderHost(hosts) {
      hosts.sort(function (a, b) {
        return a.order - b.order;
      });
      setOrderedHost(hosts);
    }

    getActividad().then((result) => {
      helperDispatch({ type: 'currentActivity', currentActivity: result });
      setactivity(result);
      orderHost(result.hosts);
      cSurveys.set_current_activity(result);
    });

    props.setTopBanner(false);
    props.setVirtualConference(false);

    HandleOpenCloseMenuRigth(false);
    if (props.socialzonetabs?.publicChat || props.socialzonetabs?.privateChat || props.socialzonetabs?.attendees) {
      HandleOpenCloseMenuRigth(false);
    } else {
      HandleOpenCloseMenuRigth(true);
    }

    return () => {
      disconnectUserPresenceInActivity(eventId, activityId, uid)
      props.setTopBanner(true);
      props.setVirtualConference(true);
      HandleOpenCloseMenuRigth(true);
      helperDispatch({ type: 'currentActivity', currentActivity: null });
      setactivity(null);
    };
  }, []);

  useEffect(() => {
    let unSuscribe = () => { };
    if (cEventUser.status == 'LOADED' && cEventUser.value != null) {
      cSurveys.set_current_activity(currentActivity);

      if (cEvent.value.type_event !== 'physicalEvent') {
        const eventId = cEvent.value._id;
        const activityId = props.match.params.activity_id;

        unSuscribe = checkinAttendeeInActivity(cEventUser.value, eventId, activityId);
      }
    }

    return () => unSuscribe();
  }, [currentActivity, cEventUser.status]);

  useEffect(() => {
    if (chatAttendeChats === '4') {
      const sharedProperties = {
        position: 'fixed',
        right: '0',
        width: '170px',
      };

      const verticalVideo = isMobile ? { top: '5%' } : { bottom: '0' };

      setVideoStyles({
        ...sharedProperties,
        ...verticalVideo,
        zIndex: '100',
        transition: '300ms',
      });

      const verticalVideoButton = isMobile ? { top: '9%' } : { bottom: '27px' };

      setVideoButtonStyles({
        ...sharedProperties,
        ...verticalVideoButton,
        zIndex: '101',
        cursor: 'pointer',
        display: 'block',
        height: '96px',
      });
    } else {
      setVideoStyles({ width: '100%', height: '80vh', transition: '300ms' });
      setVideoButtonStyles({ display: 'none' });
    }
  }, [chatAttendeChats, isMobile]);

  // VALIDAR ACTIVIDADES POR CODIGO
  useEffect(() => {
    if (cEvent.value && cUser.value) {
      if (cEvent.value?._id == '61200dfb2c0e5301fa5e9d86') {
        if (activitiesCode.includes(props.match.params.activity_id)) {
          if (cEventUser.value) {
            if (
              codeActivity.includes(cEventUser.value?.properties.codigo) ||
              cityValid.includes(cEventUser.value?.properties.ciudad)
            ) {
              setblockActivity(false);
            } else {
              setblockActivity(true);
            }
          }
        }
      } else {
        setblockActivity(false);
      }
    }
  }, [cEvent.value, cEventUser.value, cUser.value]);

  // console.log('cEvent', cEvent);

  return (
    <div>
      <div className=' container_agenda-information container-calendar2'>
        <Card style={ { padding: '1 !important' } } className='agenda_information'>
          {/* <HeaderColumnswithContext isVisible={true} /> */ }
          { !blockActivity ? (
            <>
              { props.match.params.activity_id === '61992d5f020bde260e068402' &&
                cEventUser.value.user.rol_id !== '619d0c9161162b7bd16fcb82' ? (
                <Alert
                  showIcon
                  style={ {
                    width: '100%',
                    marginTop: 40,
                    marginBottom: 40,
                    textAlign: 'center',
                    fontSize: '19px',
                  } }
                  message={
                    <>
                      { `Hola ${cEventUser.value.user.displayName} 👋, Este contenido es exclusivo para usuarios con paquete UNIVERSO` }
                    </>
                  }
                  type='warning'
                />
              ) : (
                !openOrCloseModalDrawer && <HCOActividad />
              ) }
            </>
          ) : (
            <>
              <Row>
                {/* <ImageComponentwithContext /> */ }
                <Alert
                  showIcon
                  style={ {
                    width: '100%',
                    marginTop: 40,
                    marginBottom: 40,
                    textAlign: 'center',
                    fontSize: '19px',
                  } }
                  message={
                    <>
                      ¿Quieres acceder a la membresía del taller? ingresa aqui:{ ' ' }
                      <a style={ { color: '#3273dc' } } target='_blank' href='https://iberofest.co/producto/edc/'>
                        https://iberofest.co/producto/edc/
                      </a>{ ' ' }
                    </>
                  }
                  type='warning'
                />
              </Row>
            </>
          ) }
          <div
            style={ { width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
            <Space direction='vertical' align='center'>
              {/* {cEvent.value?.bingo && (
								<>
									<Button
										size='large'
										type='primary'
										onClick={() => {
											setOpenOrCloseModalDrawer(true);
										}}>
										¡Jugar BINGO!
									</Button>

									<DrawerBingo openOrClose={openOrCloseModalDrawer} setOpenOrClose={setOpenOrCloseModalDrawer} />
								</>
							)} */}
              { sharePhotoEventStatus && <SharePhotoInLanding eventId={ cEvent.value._id } /> }
              { millonaireEventSatus && <PlayMillonaire /> }
              { whereIsEventStatus && <WhereisInLanding /> }
              {/* { <PrintBingoCartonButton /> } */}
            </Space>
          </div>
          <AditionalInformation orderedHost={ orderedHost } />
        </Card>
      </div>
      {/* Drawer encuestas */ }
      <SurveyDrawer colorFondo={ cEvent.value.styles.toolbarDefaultBg } colorTexto={ cEvent.value.styles.textMenu } />
    </div>
  );
};

const mapStateToProps = (state) => ({
  mainStageContent: state.stage.data.mainStage,
  userInfo: state.user.data,
  currentActivity: state.stage.data.currentActivity,
  currentSurvey: state.survey.data.currentSurvey,
  hasOpenSurveys: state.survey.data.hasOpenSurveys,
  tabs: state.stage.data.tabs,
  generalTabs: state.tabs.generalTabs,
  permissions: state.permissions,
  isVisible: state.survey.data.surveyVisible,
  viewSocialZoneNetworking: state.spaceNetworkingReducer.view,
});

const mapDispatchToProps = {
  setTopBanner,
  setVirtualConference,
  setHasOpenSurveys,
};

// let AgendaActividadDetalleWithContext = WithEviusContext(AgendaActividadDetalle);
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AgendaActividadDetalle));
