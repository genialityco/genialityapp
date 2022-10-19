import { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'moment-timezone';
import { useIntl } from 'react-intl';
import { Row, Card, Alert, Spin } from 'antd';
import WithEviusContext from '@context/withContext';
import { setTopBanner } from '../../../redux/topBanner/actions';
import { AgendaApi } from '@helpers/request';
import { setVirtualConference } from '../../../redux/virtualconference/actions';
import { useHelper } from '@context/helperContext/hooks/useHelper';
import { useSurveysContext } from '@context/surveysContext';
import { isMobile } from 'react-device-detect';
import * as SurveyActions from '../../../redux/survey/actions';
import SurveyDrawer from '../surveys/components/surveyDrawer';
import HOCActividad from './HOC_Actividad';
import { activitiesCode, cityValid, codeActivity } from '@helpers/constants';
import AditionalInformation from './AditionalInformation';
import { checkinAttendeeInActivity } from '@helpers/HelperAuth';
import { useUserEvent } from '@context/eventUserContext';
import { useEventContext } from '@context/eventContext';
import { useCurrentUser } from '@context/userContext';
import { PreloaderApp } from '@/PreloaderApp/PreloaderApp';

const { setHasOpenSurveys } = SurveyActions;

const AgendaActividadDetalle = props => {
  let { chatAttendeChats, HandleOpenCloseMenuRigth, currentActivity, helperDispatch } = useHelper();
  let [orderedHost, setOrderedHost] = useState([]);
  let cSurveys = useSurveysContext();
  const [videoStyles, setVideoStyles] = useState(null);
  const [videoButtonStyles, setVideoButtonStyles] = useState(null);
  let [blockActivity, setblockActivity] = useState(false);
  const [activity, setactivity] = useState('');
  const cUser = useCurrentUser();
  let cEventUser = useUserEvent();
  const cEvent = useEventContext();

  const intl = useIntl();
  {
    Moment.locale(window.navigator.language);
  }

  useEffect(() => {
    async function getActividad() {
      return await AgendaApi.getOne(props.match.params.activity_id, cEvent.value._id);
    }

    function orderHost(hosts) {
      hosts.sort(function(a, b) {
        return a.order - b.order;
      });
      setOrderedHost(hosts);
    }

    getActividad().then(result => {
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
      props.setTopBanner(true);
      props.setVirtualConference(true);
      HandleOpenCloseMenuRigth(true);
      helperDispatch({ type: 'currentActivity', currentActivity: null });
      setactivity(null);
    };
  }, [props.match.params.activity_id]);

  useEffect(() => {
    if (!currentActivity) return;
    if (cEventUser.status == 'LOADED' && cEventUser.value != null) {
      cSurveys.set_current_activity(currentActivity);
      console.log('cEvent.value.type_event', cEvent.value.type_event);
      // if (cEvent.value.type_event === 'onlineEvent') {
      //   console.log('Haciendo checking en la actividad');
      checkinAttendeeInActivity(cEventUser.value, props.match.params.activity_id);
      // }
    }
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

  // VALIDAR LECCIONES POR CODIGO
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

  // {activity.type === undefined ? (<PreloaderApp />) : (<HCOActividad activity={activity}/>)}
  return (
    <div>
      <div className=' container_agenda-information container-calendar2'>
        <Card style={{ padding: '1 !important' }} className='agenda_information'>

          {activity?.type === undefined ? <PreloaderApp /> : <HOCActividad activity={activity} />}

          <AditionalInformation orderedHost={orderedHost} />
        </Card>
      </div>
      {/* Drawer encuestas */}
      {/* <SurveyDrawer colorFondo={cEvent.value.styles.toolbarDefaultBg} colorTexto={cEvent.value.styles.textMenu} /> */}
    </div>
  );
};

const mapStateToProps = state => ({
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
