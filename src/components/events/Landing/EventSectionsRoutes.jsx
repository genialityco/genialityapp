import React, { useEffect, useContext } from 'react';
import { Redirect, Route, Switch, useRouteMatch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

/** --------------------
 *  secciones del evento
 * ---------------------*/
import DocumentsForm from '../../documents/front/documentsLanding';
import SpeakersForm from '../speakers';
import SurveyForm from '../surveys';
import FaqsForm from '../../faqsLanding';
import Partners from '../Partners';
import Agenda from '../agendaLanding';
import EventHome from '../eventHome';
import TicketsForm from '../../tickets/formTicket';
import WallForm from '../../wall/index';
import Ferias from '../ferias/index';
import VirtualConferenceBig from '../virtualConferenceBig';
import CertificadoLanding from '../../certificados/cerLanding';

import { setVirtualConference } from '../../../redux/virtualconference/actions';
import { setSpaceNetworking } from '../../../redux/networking/actions';
import MyAgendaIndepend from '../../networking/myAgendaIndepend';
import NetworkingForm from '../../networking';
import InformativeSection2 from '../informativeSections/informativeSection2';
import InformativeSection from '../informativeSections/informativeSection';
import Noticias from '../noticias';
import withContext from '../../../Context/withContext';
import Productos from '../producto/index';
import MessageRegister from '../registrationForm/messageRegister';
import { setSectionPermissions } from '../../../redux/sectionPermissions/actions';
import ListVideoCard from '../../shared/listVideoCard';
import initUserPresence from '../../../containers/userPresenceInEvent';
import { HelperContext } from '../../../Context/HelperContext';
import Videos from '../videos';
import UserLoginContainer from '../UserLoginContainer';
import InfoEvent from '../../shared/infoEvent';
import ResponsePayu from '../registrationForm/responsePayu';
import { useParams } from 'react-router-dom';
import AgendaActividadDetalle from '../../events/AgendaActividadDetalle/index';
import MySection from '../newSection';

const EventSectionRoutes = (props) => {
  let { path } = useRouteMatch();
  let { event_id, event_name } = useParams();
  let { eventPrivate, GetPermissionsEvent, handleChangeTypeModal, handleChangeTabModal } = useContext(HelperContext);

  //redirigir a evento Cancilleria
  if (event_id === '610976f24e10472fb738d65b') {
    window.location.replace('https://cancilleria.evius.co/landing/610976f24e10472fb738d65b/evento');
  }
  function ValidateViewPermissions(route, nombresection) {
    if (props.cEvent.value !== null) {
      let routePermissions =
        props.cEvent.value && Object.values(props.cEvent.value?.itemsMenu).filter((item) => item.section === route);
    }
  }

  const obtenerFirstSection = () => {
    if (props.cEvent.value == null) return;
    let firstroute = Object.keys(props.cEvent.value.itemsMenu);
    let firstrouteValues = Object.values(props.cEvent.value.itemsMenu);
    let index = -1;
    if (firstroute && firstrouteValues) {
      if (firstroute.length > 0 && firstrouteValues.length > 0) {
        for (let i = 0; i < firstrouteValues.length; i++) {
          if (firstrouteValues[i]?.position == '1') {
            index = i;
            break;
          }
        }
        if (index > -1) {
          return firstroute[index];
        } else {
          return firstroute[0];
        }
      }
    }
  };
  useEffect(async () => {
    props.cEvent.value && (await initUserPresence(props.cEvent.value._id));
  }, [props.cEvent.value]);

  useEffect(() => {
    GetPermissionsEvent();

    if(window.location.pathname.includes('/event/Gorilla-Logic/evento')){
      window.location.replace("https://app.evius.co/landing/618c502f8ceb9e109464f1c4")
    }
  }, []);

  const validateTypeUrl = () => {
    let url;
    if (event_name) {
      url = `/event/${event_name}/${obtenerFirstSection()}`;
    } else {
      url = `/landing/${event_id}/${obtenerFirstSection()}`;
    }

    return url;
  };

  return (
    <>
      {props.viewVirtualconference && (
        <>
          {props.cEvent.value?.styles?.show_title &&
            (props.cEvent.value?.styles.show_title === true || props.cEvent.value?.styles?.show_title === 'true') && (
              <InfoEvent />
            )}
          <VirtualConferenceBig />
          {props.cEvent.value?.styles?.show_video_widget &&
            (props.cEvent.value?.styles?.show_video_widget === true ||
              props.cEvent.value?.styles?.show_video_widget === 'true') && (
              <ListVideoCard idevent={props.cEvent.value} />
            )}
        </>
      )}

      <Switch>
        <Route exact path={`${path}/`}>
          {props.cEvent.value?.itemsMenu && <Redirect to={validateTypeUrl()} />}
        </Route>

        <Route path={`${path}/documents`}>
          {() =>
            ValidateViewPermissions('documents', 'Documentos') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <DocumentsForm />
            )
          }
        </Route>

        <Route path={`${path}/interviews`}>
          {() =>
            ValidateViewPermissions('interviews', 'interviews') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <MyAgendaIndepend />
            )
          }
        </Route>

        <Route path={`${path}/networking`}>
          {() =>
            ValidateViewPermissions('networking', 'Networking') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <NetworkingForm />
            )
          }
        </Route>

        <Route path={`${path}/informativeSection1`}>
          {() =>
            ValidateViewPermissions('informativeSection1', 'informativeSection1') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <InformativeSection2 />
            )
          }
        </Route>

        {/* DESHABILITADO POR NUEVO FLUJO DE REGISTRO Y LOGIN */}
        {/* <Route path={`${path}/login`}>
          <UserLoginContainer eventId={props.cEvent.value._id} />
        </Route> */}

        <Route path={`${path}/informativeSection`}>
          {() =>
            ValidateViewPermissions('informativeSection', 'informativeSection') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <InformativeSection />
            )
          }
        </Route>

        <Route path={`${path}/my_section`}>
          {() =>
            ValidateViewPermissions('informativeSection', 'informativeSection') ? (
              <>
                <Redirect to={`/landing/${props.cEvent.value._id}/permissions`} />
              </>
            ) : (
              <MySection />
            )
          }
        </Route>

        <Route path={`${path}/activity/:activity_id`}>
          {() =>
            ValidateViewPermissions('agenda', 'Agenda') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <>
                <AgendaActividadDetalle />
              </>
            )
          }
        </Route>

        <Route path={`${path}/speakers`}>
          {() =>
            ValidateViewPermissions('speakers', 'Conferencistas') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <SpeakersForm />
            )
          }
        </Route>
        <Route path={`${path}/surveys`}>
          {() =>
            ValidateViewPermissions('surveys', 'Encuestas') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <SurveyForm />
            )
          }
        </Route>
        <Route path={`${path}/partners`}>
          {() =>
            ValidateViewPermissions('partners', 'partners') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <Partners />
            )
          }
        </Route>
        <Route path={`${path}/faqs`}>
          {() =>
            ValidateViewPermissions('faqs', 'faqs') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <FaqsForm />
            )
          }
        </Route>

        <Route path={`${path}/evento`}>
          {() =>
            ValidateViewPermissions('evento', 'Evento') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <EventHome />
            )
          }
        </Route>

        <Route path={`${path}/wall`}>
          {() =>
            ValidateViewPermissions('wall', 'Muro') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <WallForm />
            )
          }
        </Route>
        <Route path={`${path}/videos`}>
          {() =>
            ValidateViewPermissions('videos', 'Videos') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <Videos />
            )
          }
        </Route>

        <Route path={`${path}/ferias`}>
          {() =>
            ValidateViewPermissions('ferias', 'Ferias') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <Ferias />
            )
          }
        </Route>
        <Route path={`${path}/noticias`}>
          {() =>
            ValidateViewPermissions('noticias', 'Noticias') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <Noticias />
            )
          }
        </Route>

        {/* DESHABILITADO POR NUEVO FLUJO DE REGISTRO Y LOGIN */}
        {/* <Route path={`${path}/tickets`}>
          {() =>
            ValidateViewPermissions('tickets', 'Registro') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <div className='columns is-centered'>
                <TicketsForm setVirtualConference={props.setVirtualConference} />
              </div>
            )
          }
        </Route> */}

        <Route path={`${path}/certs`}>
          {() =>
            ValidateViewPermissions('certs', 'certs') ? (
              <>
                <Redirect to={redirectToPermissions} />
              </>
            ) : (
              <CertificadoLanding />
            )
          }
        </Route>
        <Route path={`${path}/producto`}>
          {() =>
            ValidateViewPermissions('producto', 'Galería') ? <Redirect to={redirectToPermissions} /> : <Productos />
          }
        </Route>
        <Route path={`${path}/agenda`}>
          {() =>
            ValidateViewPermissions('agenda', 'Agenda') ? (
              <>
                <Redirect to={`/landing/${props.cEvent.value._id}/agenda`} />
              </>
            ) : (
              <Agenda
                activity={props.currentActivity}
                generalTabs={props.generalTabs}
                setVirtualConference={props.setVirtualConference}
              />
            )
          }
        </Route>

        {/* DESHABILITADO POR NUEVO FLUJO DE REGISTRO Y LOGIN */}
        {/* <Route path={`${path}/permissions`}>
          <PageNotPermissions setVirtualConference={props.setVirtualConference} />
        </Route> */}

        <Route path={`${path}/success/:type?`}>
          <MessageRegister />
        </Route>
        <Route path={`${path}/responsePayu`}>
          <ResponsePayu />
        </Route>
      </Switch>
    </>
  );
};

const mapStateToProps = (state) => ({
  viewVirtualconference: state.virtualConferenceReducer.view,
  viewSocialZoneNetworking: state.spaceNetworkingReducer.view,
  sectionPermissions: state.viewSectionPermissions.view,
});

const mapDispatchToProps = {
  setVirtualConference,
  setSpaceNetworking,
  setSectionPermissions,
};

let eventSectionsContext = withRouter(withContext(EventSectionRoutes));
export default connect(mapStateToProps, mapDispatchToProps)(eventSectionsContext);
