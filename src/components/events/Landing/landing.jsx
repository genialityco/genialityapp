import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { UseEventContext } from '../../../context/eventContext';
import { UseCurrentUser } from '../../../context/userContext';
import { UseUserEvent } from '../../../context/eventUserContext';

/** ant design */
import { Layout, Spin, notification, Button, Result } from 'antd';
/* import 'react-toastify/dist/ReactToastify.css'; */


import { setUserAgenda } from '../../../redux/networking/actions';
import { DesktopOutlined, LoadingOutlined, IssuesCloseOutlined, NotificationOutlined } from '@ant-design/icons';

/** Google tag manager */
import { EnableGTMByEVENT } from './helpers/tagManagerHelper';
/** Google Analytics */
import { EnableAnalyticsByEVENT } from './helpers/analyticsHelper';
/** Facebook Pixel */
import { EnableFacebookPixelByEVENT } from './helpers/facebookPixelHelper';

import loadable from '@loadable/component';
import { DispatchMessageService } from '../../../context/MessageService.tsx';
import WithEviusContext from '../../../context/withContext';
import { checkinAttendeeInEvent } from '../../../helpers/HelperAuth';
import { useHelper } from '../../../context/helperContext/hooks/useHelper';
import initBroadcastViewers from '@/containers/broadcastViewers';
import DateEvent from '../dateEvent';
import moment from 'moment';
import { useHistory } from 'react-router';
import { recordTypeForThisEvent } from './helpers/thisRouteCanBeDisplayed';
import { app } from '@helpers/firebase';

const { Content } = Layout;
const EviusFooter = loadable(() => import('./EviusFooter'));
const AppointmentModal = loadable(() => import('../../networking/appointmentModal'));
const ModalRegister = loadable(() => import('./modalRegister'));
const ModalLoginHelpers = loadable(() => import('../../authentication/ModalLoginHelpers'));
const ModalPermission = loadable(() => import('../../authentication/ModalPermission'));
const ModalFeedback = loadable(() => import('../../authentication/ModalFeedback'));
const ModalNoRegister = loadable(() => import('../../authentication/ModalNoRegister'));

/** Components */
const TopBanner = loadable(() => import('./TopBanner'));
const EventSectionRoutes = loadable(() => import('./EventSectionsRoutes'));
const EventSectionsInnerMenu = loadable(() => import('./EventSectionsInnerMenu'));
const EventSectionMenuRigth = loadable(() => import('./EventSectionMenuRigth'));
const MenuTablets = loadable(() => import('./Menus/MenuTablets'));
const MenuTabletsSocialZone = loadable(() => import('./Menus/MenuTabletsSocialZone'));

const iniitalstatetabs = {
  attendees: false,
  privateChat: false,
  publicChat: false,
};

const IconRender = (type) => {
  let iconRender;
  switch (type) {
    case 'open':
      iconRender = <DesktopOutlined style={{ color: '#108ee9' }} />;
      break;

    case 'close':
      iconRender = <LoadingOutlined style={{ color: 'red' }} />;
      break;

    case 'ended':
      iconRender = <IssuesCloseOutlined />;
      break;

    case 'networking':
      iconRender = <NotificationOutlined />;
      break;
  }
  return iconRender;
};

const Landing = (props) => {
  let cEventContext = UseEventContext();
  let cUser = UseCurrentUser();
  let cEventUser = UseUserEvent();

  //HISTORY PARA REDIRIGIR A LA PRE LANDING
  const history = useHistory();
  let { isNotification, ChangeActiveNotification, currentActivity, register, setRegister } = useHelper();

  useEffect(() => {
    if (!cEventContext.value) return;
    DispatchMessageService({
      type: 'loading',
      msj: 'Estamos configurando la mejor experiencia para tí!',
      action: 'show',
    });
    return () => {
      if (
        recordTypeForThisEvent(cEventContext) === 'UN_REGISTERED_PUBLIC_EVENT' &&
        sessionStorage?.getItem('session')
      ) {
        sessionStorage.removeItem('session');
      }
    };
  }, [cEventContext]);

  const anonymousAutoLogin = (name, email) => {
    app
      .auth()
      .signInAnonymously()
      .then(() => {
        app
          .auth()
          .currentUser.updateProfile({
            displayName: name,
            /**almacenamos el email en el photoURL para poder setearlo en el context del usuario y asi llamar el eventUser anonimo */
            photoURL: email,
          })
          .then(async () => {
            await app.auth().currentUser.reload();
          });
      });
  };
  /// inicio automatic con anonymous
  useEffect(() => {
    if (!cEventContext?.value) return;
    const urlParams = new URLSearchParams(window.location.search);
    let email = urlParams.get('email');
    let names = urlParams.get('names');
    if (cEventContext && cEventContext.value?.visibility != 'ANONYMOUS') return;
    if (!names && !email) return;
    if (cUser && cUser.value) {
      if (cUser.value.names === names && cUser.value.email === email) return;

      app
        .auth()
        .signOut()
        .then(() => {
          anonymousAutoLogin(names, email);
        });
      return;
    }

    anonymousAutoLogin(names, email);
  }, [cEventContext]);

  //PERMITE VALIDAR SI TIENE O NO ACCESO A LA LANDING // SE MANEJA POR SESION STORAGE

  useEffect(() => {
    if (!cEventContext?.value) return;
    const urlParams = new URLSearchParams(window.location.search);
    let email = urlParams.get('email');
    let names = urlParams.get('names');

    if (sessionStorage?.getItem('session') !== props.match?.params?.event_id) {
      //SE REMUEVE LA SESION EN EL EVENTO OBLIGANDO A UNIR AL USUARIO
      window.sessionStorage.removeItem('session');
      if (email && names) history.replace(`/${props.match?.params?.event_id}?email=${email}&names=${names}`);
      history.replace(`/${props.match?.params?.event_id}`);
      return;
    }
  }, [window.sessionStorage, cUser.value, cEventUser.value, cEventContext.value]);

  const ButtonRender = (status, activity) => {
    return status == 'open' ? (
      <Button
        type='primary'
        size='small'
        onClick={() =>
          window.location.replace(`${window.location.origin}/landing/${cEventContext.value._id}/activity/${activity}`)
        }>
        Ir a la actividad
      </Button>
    ) : null;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') !== null) {
      setRegister(urlParams.get('register'));
    }
  }, []);

  //PARA OBTENER PARAMETRO AL LOGUEARME
  const NotificationHelper = ({ message, type, activity }) => {
    notification.open({
      message: 'Nueva notificación',
      description: message,
      icon: IconRender(type),
      onClose: () => {
        ChangeActiveNotification(false, 'none', 'none');
      },
      btn: ButtonRender(type, activity),
      duration: type == 'ended' || type == 'open' ? 7 : 3,
    });
  };

  useEffect(() => {
    if (isNotification.notify) {
      NotificationHelper(isNotification);
    }
  }, [isNotification]);

  let [generaltabs, setgeneraltabs] = useState(iniitalstatetabs);
  let [totalNewMessages, settotalnewmessages] = useState(0);

  useEffect(() => {
    if (cEventContext.status === 'LOADED') {
      import('../../../helpers/firebase').then((fb) => {
        fb.firestore
          .collection('events')
          .doc(cEventContext.value?._id)
          .onSnapshot(function(eventSnapshot) {
            if (eventSnapshot.exists) {
              if (eventSnapshot.data().tabs !== undefined) {
                setgeneraltabs(eventSnapshot.data().tabs);
              }
            }
          });

        fb.firestore
          .collection('eventchats/' + cEventContext.value._id + '/userchats/' + cUser.uid + '/' + 'chats/')
          .onSnapshot(function(querySnapshot) {
            let data;
            querySnapshot.forEach((doc) => {
              data = doc.data();

              if (data.newMessages) {
                settotalnewmessages(
                  (totalNewMessages += !isNaN(parseInt(data.newMessages.length))
                    ? parseInt(data.newMessages.length)
                    : 0)
                );
              }
            });
          });

        if (cEventUser.status == 'LOADED' && cEventUser.value != null && cEventContext.status == 'LOADED') {
          // console.log(EventContext.value.type_event);
          if (cEventContext.value.type_event !== 'physicalEvent') {
            checkinAttendeeInEvent(cEventUser.value, cEventContext.value._id);
          }
        }
      });
    }
  }, [cEventContext.status, cEventUser.status, cEventUser.value]);

  if (cEventContext.status === 'LOADING') return <Spin />;

  return (
    <>
      {/* <ModalFeedback /> */}
      {/* <ModalNoRegister /> */}
      {/* <ModalAuth /> */}

      <ModalLoginHelpers />
      {cEventContext.value.visibility !== 'ANONYMOUS' && <ModalPermission />}
      <ModalFeedback />
      {/*update: modal de actualizar || register: modal de registro */}
      {register !== null && cEventContext.value.visibility !== 'ANONYMOUS' && (
        <ModalRegister register={register} setRegister={setRegister} event={cEventContext.value} />
      )}
      <Layout>
      {cEventUser.value && props.userAgenda && <AppointmentModal
          targetEventUserId={props.userAgenda?.eventUserId}
          targetEventUser={{...props.userAgenda,user:props.userAgenda.properties}}
          cEventUser={cEventUser}
          cEvent={cEventContext}
          closeModal={() => {
            props.setUserAgenda(null);
          }}
        />}

        <EventSectionsInnerMenu />
        <MenuTablets />

        <Layout className='site-layout'>
          <Content
            className='site-layout-background'
            style={{
              // paddingBottom: '15vh',
              backgroundSize: 'cover',
              background: `${cEventContext.value && cEventContext.value?.styles?.containerBgColor}`,
              backgroundImage: `url(${cEventContext.value && cEventContext.value?.styles?.BackgroundImage})`,
            }}>
            {props.view && <TopBanner currentActivity={currentActivity} />}

            <EventSectionRoutes generaltabs={generaltabs} currentActivity={currentActivity} />
            <EviusFooter />
          </Content>
        </Layout>
        <EventSectionMenuRigth
          generalTabs={generaltabs}
          currentActivity={currentActivity}
          totalNewMessages={totalNewMessages}
          tabs={props.tabs}
        />
        <MenuTabletsSocialZone
          totalNewMessages={totalNewMessages}
          currentActivity={currentActivity}
          generalTabs={generaltabs}
        />
        <EnableGTMByEVENT />
        <EnableAnalyticsByEVENT />
        <EnableFacebookPixelByEVENT />
      </Layout>
    </>
  );
};

const mapStateToProps = (state) => ({
  currentActivity: state.stage.data.currentActivity,
  tabs: state.stage.data.tabs,
  view: state.topBannerReducer.view,
  userAgenda: state.spaceNetworkingReducer.userAgenda,
});

const mapDispatchToProps = {
  setUserAgenda,
};

export default connect(mapStateToProps, mapDispatchToProps)(WithEviusContext(Landing));
