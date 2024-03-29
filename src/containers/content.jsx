import { Grid, Spin, Layout } from 'antd';
import { BrowserRouter as Router, Route, Redirect, Switch, useHistory, Link } from 'react-router-dom';
import Event from '../components/events/event';
import { ApiUrl } from '../helpers/constants';
import WithFooter from '../components/withFooter';

import { CurrentUserEventProvider } from '../context/eventUserContext';
import { CurrentEventProvider } from '../context/eventContext';
import { CurrentUserProvider } from '../context/userContext';
import { SurveysProvider } from '../context/surveysContext';
import { NewEventProvider } from '../context/newEventContext';

import { HelperContextProvider } from '../context/helperContext/helperProvider';
import { AgendaContextProvider } from '../context/AgendaContext';

import EventOrganization from '../components/eventOrganization';
import Organization from '@/pages/eventOrganization/index';
import OrganizationEventsByAccount from '@/pages/eventOrganization/OrganizationEventsByAccount';

import MainProfile from '../components/profile/main';

import { UseCurrentUser } from '../context/userContext';
import loadable from '@loadable/component';
import ModalAuth from '../components/authentication/ModalAuth';
import ModalNoRegister from '../components/authentication/ModalNoRegister';
import BlockedEvent from '@/components/events/Landing/BlockedEvent';
import ModalAuthAnonymous from '@/components/authentication/ModalAuthAnonymous';
import ModalUpdate from '@/components/events/Landing/ModalUpdate';
import BingoPresentation from '@/components/games/bingo/views/BingoPresentation';
import LGNotification from '@/components/shared/LGNotification';
import { memo } from 'react';
//Code splitting
const Header = loadable(() => import('./header'));
const Home = loadable(() => import('../pages/home'));
const Landing = loadable(() => import('../components/events/Landing/landing'));
const Transition = loadable(() => import('../components/shared/Animate_Img/index'));
/* const Events = loadable(() => import('../components/events')); */
const NewEvent = loadable(() => import('../components/events/createEvent/index'));
/* const MyProfile = loadable(() => import('../components/profile/index_old')); */
/* const Purchase = loadable(() => import('../components/profile/purchase_old')); */
/* const EventEdit = loadable(() => import('../components/profile/events_old')); */
const Terms = loadable(() => import('../components/policies/termsService'));
const Privacy = loadable(() => import('../components/policies/privacyPolicy'));
const Policies = loadable(() => import('../components/policies/policies'));
const About = loadable(() => import('../components/policies/about'));
const Faqs = loadable(() => import('../components/faqs/index'));
const socialZone = loadable(() => import('../components/socialZone/socialZone'));
const AppointmentAccept = loadable(() => import('../components/networking/appointmentAccept'));
const NotFoundPage = loadable(() => import('../components/notFoundPage'));
const ForbiddenPage = loadable(() => import('../components/forbiddenPage'));
const QueryTesting = loadable(() => import('../components/events/surveys/components/queryTesting'));
const EventFinished = loadable(() => import('../components/eventFinished/eventFinished'));
const LoginWithCode = loadable(() => import('../components/AdminUsers/WithCode'));
const NoMatchPage = loadable(() => import('../components/notFoundPage/noMatchPage'));
const ViewPrelanding = loadable(() => import('@/components/prelanding/viewPrelanding'));

const { useBreakpoint } = Grid;
const ContentContainer = () => {
  const screens = useBreakpoint();
  const organizationCetaId = '653047d0b2b1aee7e00b57e2';
  return (
    <Router
      basename='/'
      getUserConfirmation={ () => {
        /* Empty callback to block the default browser prompt, it is necessary to be able to use in custon hook RouterPrompt */
      } }>
      <main className='main'>
        <Switch>
          <Route exact path={'/'} render={ ()=> <Redirect to={`organization/${organizationCetaId}`} /> } />
          <Route exact path={'/organization'} render={ ()=> <Redirect to={`organization/${organizationCetaId}`} /> } />
          <RouteContext path={ ['/landing/:event_id', '/event/:event_name'] } component={ Landing } />
          <RouteContext path={ '/bingo/:event_id/' } component={ BingoPresentation } />
          {/*Ruta para ver resumen */ }
          <PrivateRoute exact path='/myprofile/:tab' component={ MainProfile } />
          { screens.xs ? (
            <Route exact path='/myprofile' render={ () => <Redirect to='/myprofile/organization' /> } />
          ) : (
            <PrivateRoute exact path='/myprofile' component={ MainProfile } />
          ) }
          <PrivateRoute exact path='/myprofile' component={ MainProfile } />
          <Route path='/loginWithCode' component={ LoginWithCode } />
          <RouteContext exact path={ '/:event_id' } component={ ViewPrelanding } />

          <Route path='/social/:event_id' component={ socialZone } />
          {/* Arreglo temporal de mastercard para que tenga una url bonita, evius aún no soporta esto*/ }
          <Route path='/mentoriamastercard' render={ () => <Redirect to='/landing/5ef49fd9c6c89039a14c6412' /> } />
          <Route path='/meetupsfenalco' render={ () => <Redirect to='/landing/5f0622f01ce76d5550058c32' /> } />
          <Route path='/evento/tpgamers' render={ () => <Redirect to='/landing/5f4e41d5eae9886d464c6bf4' /> } />
          <Route path='/notfound' component={ NotFoundPage } />
          <RouteContext path='/blockedEvent/:event_id' component={ BlockedEvent } />
          <PrivateRoute path='/create-event/:user?'>
            <NewEventProvider>
              <NewEvent />
            </NewEventProvider>
          </PrivateRoute>
          <PrivateRoute path='/eventadmin/:event' component={ Event } />
          <PrivateRoute path='/orgadmin/:event' component={ Event } />
          <PrivateRoute path='/create-event' component={ NewEvent } />
          <RouteContextValidationCeta exact path='/organization/:id/events' component={ EventOrganization } />
          <RouteContextValidationCeta exact path='/organization/:id' component={ EventOrganization } />
          {/* <PrivateRouteCetaValidation exact path='/admin/organization/:id/eventsbyaccount/:account_id' component={ OrganizationEventsByAccount } />
    */}
          <PrivateRouteCetaValidation path='/admin/organization/:id' component={ Organization } />
       
          {/*DEV*/}
          <PrivateRoute path='/noaccesstocms/:id/:withoutPermissions' component={ NoMatchPage } />
          <Route path='/terms' component={ Terms } />
          <Route path='/privacy' component={ Privacy } />
          <Route path='/policies' component={ Policies } />
          <Route path='/about' component={ About } />
          <Route path='/faqs' component={ Faqs } />
          {/* Ruta para realizar pruebas de consultas a firebase */ }
          <Route path='/queryTesting' component={ QueryTesting } />
          <Route path='/api/generatorQr/:id' component={ QRedirect } />
          <Route exact path='/transition/:event' component={ Transition } />
          <Route exact path='/eventfinished' component={ EventFinished } />

          {/* <Route exact path='/' component={RedirectPortal} /> */ }

          <Route
            path='/meetings/:event_id/acceptmeeting/:meeting_id/id_receiver/:id_receiver'
            component={ AppointmentAccept }
          />
          <RouteContext exact path='/' component={ PageWithFooter } />
          <Route component={ NotFoundPage } />
        </Switch>
      </main>
    </Router>
  );
};

function QRedirect({ match }) {
  window.location.replace(`${ApiUrl}/api/generatorQr/${match.params.id}`);
  return <p>Redirecting...</p>;
}

const RouteContext = ({ component: Component, ...rest }) => (
  <Route
    { ...rest }
    render={ (props) => (
      <CurrentEventProvider {...props}>
        <CurrentUserEventProvider>
          <CurrentUserProvider>
            <AgendaContextProvider>
              <HelperContextProvider>
                <SurveysProvider>
                  <Layout
                    style={ {
                      minHeight: '100vh',
                    } }>
                    { props.location.pathname.split('/')[1] !== 'bingo' &&
                      <Header />
                    }
                    <Component { ...props } />
                    <LGNotification />
                    <ModalAuth />
                    <ModalAuthAnonymous />
                    <ModalNoRegister />
                    <ModalUpdate />
                  </Layout>
                </SurveysProvider>
              </HelperContextProvider>
            </AgendaContextProvider>
          </CurrentUserProvider>
        </CurrentUserEventProvider>
      </CurrentEventProvider>
    ) }
  />
);

const RouteContextValidationCeta = ({ component: Component, ...rest }) => {
  const history = useHistory();
  const organizationCetaIdPrincipal = '653047d0b2b1aee7e00b57e2'
  const organizationCetaIdDev = '64b7f26a920809c56a0e6e52'
  const organizationPaths = ['/organization/:id', '/admin/organization/:id', '/organization/:id/events', '/organization/:id/eventsbyaccount/:account_id/:orguser_is'];
  const organizationId = rest.computedMatch.params.id;
  if (organizationPaths.includes(rest.path) && ![organizationCetaIdDev,organizationCetaIdPrincipal].includes(organizationId)) {
    history.replace(rest.path.replaceAll(organizationId, organizationCetaIdPrincipal));
    return <Link to={rest.path.replaceAll(organizationId, organizationCetaIdPrincipal)} />;
  }
  return (
    <Route
      {...rest}
      render={(props) => (
        <CurrentEventProvider {...props}>
          <CurrentUserEventProvider>
            <CurrentUserProvider>
              <AgendaContextProvider>
                <HelperContextProvider>
                  <SurveysProvider>
                    <Layout
                      style={{
                        minHeight: '100vh',
                      }}>
                      {props.location.pathname.split('/')[1] !== 'bingo' && <Header />}
                      <Component {...props} />
                      <LGNotification />
                      <ModalAuth />
                      <ModalAuthAnonymous />
                      <ModalNoRegister />
                      <ModalUpdate />
                    </Layout>
                  </SurveysProvider>
                </HelperContextProvider>
              </AgendaContextProvider>
            </CurrentUserProvider>
          </CurrentUserEventProvider>
        </CurrentEventProvider>
      )}
    />
  );
};


const PrivateRoute = ({ component: Component, ...rest }) => {
  const cUser = UseCurrentUser();
  return (
    <Route
      { ...rest }
      render={ (props) => (
        <CurrentEventProvider {...props}>
          <CurrentUserEventProvider>
            <CurrentUserProvider>
              <NewEventProvider>
                <HelperContextProvider>
                  <AgendaContextProvider>
                    <SurveysProvider>
                      <Layout style={ { minHeight: '100vh' } }>
                        <Header />
                        { cUser.value ? (
                          <Component { ...props } />
                        ) : cUser.value == null && cUser.status === 'LOADED' ? (
                          <>
                            <ModalAuth isPrivateRoute={ true } />

                            <ForbiddenPage />
                          </>
                        ) : (
                          <Spin />
                        ) }
                      </Layout>
                    </SurveysProvider>
                  </AgendaContextProvider>
                </HelperContextProvider>
              </NewEventProvider>
            </CurrentUserProvider>
          </CurrentUserEventProvider>
        </CurrentEventProvider>
      ) }
    />
  );
};

const PrivateRouteCetaValidation = ({ component: Component, ...rest }) => {
  const cUser = UseCurrentUser();
  const history = useHistory();
  const organizationCetaIdPrincipal = '653047d0b2b1aee7e00b57e2'
  const organizationCetaIdDev = '64b7f26a920809c56a0e6e52'
  const organizationPaths = ['/organization/:id', '/admin/organization/:id', '/organization/:id/events',' /admin/organization/:id/eventsbyaccount/:account_id/:orguser_id'];
  const organizationId = rest.computedMatch.params.id;
  if (organizationPaths.includes(rest.path) && ![organizationCetaIdDev,organizationCetaIdPrincipal].includes(organizationId)) {
    history.replace(rest.path.replaceAll(organizationId, organizationCetaIdPrincipal));
    return <Link to={rest.path.replaceAll(organizationId, organizationCetaIdPrincipal)} />;
  }
  return (
    <Route
      { ...rest }
      render={ (props) => (
        <CurrentEventProvider {...props}>
          <CurrentUserEventProvider>
            <CurrentUserProvider>
              <NewEventProvider>
                <HelperContextProvider>
                  <AgendaContextProvider>
                    <SurveysProvider>
                      <Layout style={ { minHeight: '100vh' } }>
                        <Header />
                        { cUser.value ? (
                          <Component { ...props } />
                        ) : cUser.value == null && cUser.status === 'LOADED' ? (
                          <>
                            <ModalAuth isPrivateRoute={ true } />

                            <ForbiddenPage />
                          </>
                        ) : (
                          <Spin />
                        ) }
                      </Layout>
                    </SurveysProvider>
                  </AgendaContextProvider>
                </HelperContextProvider>
              </NewEventProvider>
            </CurrentUserProvider>
          </CurrentUserEventProvider>
        </CurrentEventProvider>
      ) }
    />
  );
};

const PageWithFooter = () => {
  return (
    <WithFooter>
      <Home />
    </WithFooter>
  );
};

export default memo(ContentContainer);
