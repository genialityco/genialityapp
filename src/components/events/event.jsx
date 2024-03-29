import { Component } from 'react';
import { Route, Redirect, Switch, Link } from 'react-router-dom';
import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import Loading from '../loaders/loading';
import { EventsApi } from '../../helpers/request';
import ListEventUser from '../event-users';
import { fetchRol } from '../../redux/rols/actions';
import { fetchPermissions } from '../../redux/permissions/actions';
import connect from 'react-redux/es/connect/connect';
import ChatExport from './ChatExport/';
import Espacios from '../espacios';
import Menu from './shared/menu';
import Datos from './datos';
import TipoAsistentes from './tipoUsers';
import ConfirmacionRegistro from './registro/confirmacionRegistro';
import ErrorServe from '../modal/serverError';
import AgendaRoutes from '../agenda';
import EmpresasRoutes from '../empresas';
import TriviaRoutes from '../trivia';
import DocumentsRoutes from '../documents';
import Speakers from '../speakers';
import MenuLanding from '../menuLanding/index';
import ReportList from '../agenda/report';
import ConferenceRoute from '../zoom/index';
import NetworkingPage from '../networking/Networking.page';
import NewsSectionRoutes from '../news/newsRoute';
import ProductSectionRoutes from '../products/routes/productsRoute';
import { withRouter } from 'react-router-dom';
import withContext from '../../context/withContext';
import { Layout, Space, Row, Col, Button, Result } from 'antd';
import { AdminUsers } from '../../components/AdminUsers/AdminUsers';
import loadable from '@loadable/component';
import NoMatchPage from '../notFoundPage/noMatchPage';
import ValidateAccessRouteCms from '../roles/hooks/validateAccessRouteCms';
import { DispatchMessageService } from '@/context/MessageService';
import { handleRequestError } from '@/helpers/utils';
import { ValidateEndEvent } from '@/hooks/validateEventStartAndEnd';
import { featureBlockingListener, featureBlockingStatusSave } from '@/services/featureBlocking/featureBlocking';
import Bingo from '../games/bingo';
import WhereIs from '../games/whereIs';
import SharePhoto from '../games/sharePhoto';
import WhoWantsToBeAMillonaire from '../games/WhoWantsToBeAMillonaire';
import Assembly from '../assembly';
import auctionModule from '../dinamicas/subasta';
import SectionHtml from './informativeSections/SectionHtml';

const { Sider, Content } = Layout;
//import Styles from '../App/styles';

//Code Splitting
const General = loadable(() => import('./general'));
/* const Badge = loadable(() => import('../badge')); */
const Informativesection = loadable(() => import('../events/informativeSections/adminInformativeSection'));

//invitations
const InvitedUsers = loadable(() => import('../invitations'));

//Messages
const Messages = loadable(() => import('../messages'));

/* const TicketInfo = loadable(() => import('../tickets/index_old')); */
const Styles = loadable(() => import('../App/styles'));
const DashboardEvent = loadable(() => import('../dashboard'));
const BadgeEvent = loadable(() => import('../badge'));
const OrdersEvent = loadable(() => import('../orders'));
const ListCertificados = loadable(() => import('../certificados'));
/* const ReporteCertificados = loadable(() => import('../certificados/reporte_old')); */
/* const ConfigurationApp = loadable(() => import('../App/configuration')); */
const NotificationsApp = loadable(() => import('../pushNotifications/index'));
const Wall = loadable(() => import('../wall/index'));

const FAQS = loadable(() => import('../faqs'));
const EventsTicket = loadable(() => import('../ticketsEvent'));

Moment.locale('es');
momentLocalizer();

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      generalTab: true,
      guestTab: true,
      ticketTab: true,
      styleTab: true,
      menuMobile: false,
      ConfigurationApp: true,
      NotificationsApp: true,
      CreateSuervey: true,
      NewsApp: true,
      SurveysCreate: true,
      FAQS: true,
      Trivia: true,
      event: null,
      collapsed: false,
      iMustValidate: true,
    };
    this.addNewFieldsToEvent = this.addNewFieldsToEvent.bind(this);
  }

  async componentDidMount() {
    const helperDispatch = this.props.cHelper.helperDispatch;

    try {
      await this.props.dispatch(fetchRol());
      let eventId = this.props.match.params.event;
      await this.props.dispatch(fetchPermissions(eventId));
      const event = await EventsApi.getOne(eventId);
      const eventWithExtraFields = this.addNewFieldsToEvent(event);
      featureBlockingListener(eventId, helperDispatch);
      this.setState({ event: eventWithExtraFields, loading: false });
    } catch (e) {
      DispatchMessageService({
        type: 'error',
        msj: handleRequestError(e).message,
        action: 'show',
      });
      this.setState({ loading: false, error: e });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.event !== this.state.event) {
      const { event } = this.state;
      const eventWithExtraFields = this.addNewFieldsToEvent(event);
      this.setState({ event: eventWithExtraFields });
    }
  }

  addNewFieldsToEvent(event) {
    const dateFrom = event.datetime_from.split(' ');
    const dateTo = event.datetime_to.split(' ');
    event.hour_start = Moment(dateFrom[1], 'HH:mm').toDate();
    event.hour_end = Moment(dateTo[1], 'HH:mm').toDate();
    event.date_start = Moment(dateFrom[0], 'YYYY-MM-DD').toDate();
    event.date_end = Moment(dateTo[0], 'YYYY-MM-DD').toDate();
    event.address = event.address ? event.address : '';

    return event;
  }

  componentWillUnmount() {
    this.setState({ newEvent: false });
  }

  handleClick = (e) => {
    if (!navigator.onLine) e.preventDefault();
  };

  updateEvent = (event) => {
    this.setState({ event });
  };

  isUpper(str) {
    return !/[a-z]/.test(str) && /[A-Z]/.test(str);
  }

  isLowerCase(str) {
    return /[a-z]/.test(str) && !/[A-Z]/.test(str);
  }

  FriendLyUrl(url) {
    let formatupperorlowercase = url.toString().toLowerCase();
    if (this.isUpper(url.toString())) {
      formatupperorlowercase = url.toString().toUpperCase();
    } else if (this.isLowerCase(url.toString())) {
      formatupperorlowercase = url.toString().toLowerCase();
    } else {
      formatupperorlowercase = url.toString();
    }

    var encodedUrl = formatupperorlowercase;
    encodedUrl = encodedUrl.split(/\&+/).join('-and-');
    if (this.isUpper(url)) {
      encodedUrl = encodedUrl.split(/[^A-Z0-9]/).join('-');
    } else if (this.isLowerCase(url.toString())) {
      encodedUrl = encodedUrl.split(/[^a-z0-9]/).join('-');
    } else {
      encodedUrl = encodedUrl.split(/-+/).join('-');
    }

    encodedUrl = encodedUrl.replaceAll(' ', '-');
    encodedUrl = encodedUrl.trim('-');
    return encodedUrl;
  }

  collapseMenu = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  /** RESTRICIONES */
  theEventIsActive = (state) => {
    const eventId = this.state.event._id;

    featureBlockingStatusSave(eventId, state);

    this.setState({
      iMustValidate: false,
    });
  };

  render() {
    const { match, permissions, showMenu } = this.props;
    const { error, collapsed, iMustValidate, event } = this.state;
    const cUser = this.props.cUser?.value;

    if (this.state.loading || this.props.loading || permissions.loading) return <Loading />;
    if (this.props.error || permissions.error) return <ErrorServe errorData={permissions.error} />;
    if (error)
      return (
        <Result
          status='404'
          title='Evento no encontrado'
          subTitle={`Lo sentimos, hubo un error inesperado`}
          extra={[
            <Link to={`/`}>
              <Button type='primary' key='eventData'>
                Ver más eventos
              </Button>
            </Link>,
          ]}
        />
      );

    return (
      <Layout className='columns'>
        {/* RESTRICIONES */}
        {/* {iMustValidate && (
          <>
            <ValidateEndEvent
              endDate={event.datetime_to}
              callBackTheEventIsActive={this.theEventIsActive}
              user={cUser}
            />
          </>
        )} */}
        <Sider
          style={{
            // overflow: 'auto',
            background: '#1B1E28',
          }}
          width={250}
          collapsed={collapsed}>
          <Menu match={match} collapseMenu={this.collapseMenu} collapsed={collapsed} />
        </Sider>
        <Content className='column event-main' style={{ width: 500 }}>
          {/* <Row gutter={[16, 16]} wrap>
            <Col>
              <Button
                type='primary'
                size='small'
                target='_blank'
                href={`${window.location.origin}/landing/${this.state.event._id}`}>
                Ir al evento
              </Button>
            </Col>
          </Row> */}
          <section className='section event-wrapper'>
            <Switch>
              <Route
                exact
                path={`${match.url}/`}
                render={() => <Redirect to={`${match.url}${match.url.substr(-1) === '/' ? 'main' : '/main'}`} />}
              />
              <Protected
                path={`${match.url}/main`}
                component={General}
                eventId={event._id}
                event={event}
                updateEvent={this.updateEvent}
                componentKey='main'
              />
              {/* En esta ruta se pueden crear y ver los post de la seccion muro que hay en la landing */}
              <Protected
                path={`${match.url}/wall`}
                component={Wall}
                eventId={event._id}
                event={event}
                componentKey='wall'
              />
              <Protected
                path={`${match.url}/datos`}
                component={Datos}
                eventId={event._id}
                event={event}
                componentKey='datos'
              />
              <Protected
                path={`${match.url}/agenda`}
                component={AgendaRoutes}
                eventId={event._id}
                event={event}
                updateEvent={this.updateEvent}
                componentKey='agenda'
              />
              <Protected
                path={`${match.url}/adminUsers`}
                component={AdminUsers}
                eventId={event._id}
                event={event}
                componentKey='adminUsers'
              />
              <Protected
                path={`${match.url}/bingo`}
                component={Bingo}
                eventId={event._id}
                event={event}
                updateEvent={this.updateEvent}
                componentKey='bingo'
              />
              <Protected
                path={`${match.url}/whoWantsToBeAMillonaire`}
                component={WhoWantsToBeAMillonaire}
                eventId={event._id}
                event={event}
                updateEvent={this.updateEvent}
                componentKey='WhoWantsToBeAMillonaire'
              />
              <Protected
                path={`${match.url}/whereIs`}
                component={WhereIs}
                eventId={event._id}
                event={event}
                updateEvent={this.updateEvent}
                componentKey='whereIs'
              />
              <Protected
                path={`${match.url}/share-photo`}
                component={SharePhoto}
                eventId={event._id}
                event={event}
                updateEvent={this.updateEvent}
                componentKey='sharePhoto'
              />
              <Protected
                path={`${match.url}/empresas`}
                component={EmpresasRoutes}
                event={event}
                componentKey='empresas'
              />
              <Protected path={`${match.url}/trivia`} component={TriviaRoutes} event={event} componentKey='trivia' />
              <Protected
                path={`${match.url}/documents`}
                component={DocumentsRoutes}
                event={event}
                componentKey='documents'
              />
              {/* esta ruta carga en blanco */}
              <Protected
                path={`${match.url}/conference`}
                component={ConferenceRoute}
                event={event}
                componentKey='conference'
              />
              <Protected
                path={`${match.url}/menuLanding`}
                component={MenuLanding}
                event={event}
                componentKey='menuLanding'
              />
              <Protected
                path={`${match.url}/reportNetworking`}
                component={NetworkingPage}
                eventId={event._id}
                event={event}
                componentKey='reportNetworking'
              />
              <Protected
                path={`${match.url}/subasta`}
                component={auctionModule}
                eventId={event._id}
                event={event}
                componentKey='subasta'
              />
              <Protected
                path={`${match.url}/assistants`}
                component={ListEventUser}
                eventId={event._id}
                event={event}
                url={match.url}
                componentKey='event-checkin'
                type='event-checkin'
              />

              <Protected
                path={`${match.url}/chatexport`}
                component={ChatExport}
                eventId={event._id}
                event={event}
                url={match.url}
              />

              <Protected
                path={`${match.url}/checkin/:id`}
                component={ListEventUser}
                event={event}
                eventId={event._id}
                url={match.url}
                componentKey='activity-checkin'
              />

              <Protected
                path={`${match.url}/checkin-actividad`}
                component={ReportList}
                eventId={event._id}
                event={event}
                url={match.url}
                componentKey='checkin-actividad'
              />

              <Protected
                path={`${match.url}/informativesection`}
                component={Informativesection}
                eventId={event._id}
                event={event}
                url={match.url}
              />
              <Protected
                path={`${match.url}/informativesectionhtml`}
                component={SectionHtml}
                eventId={event._id}
                event={event}
                url={match.url}
              />
              {/** AÚN NO TIENEN PERMISOS */}
              <Protected
                path={`${match.url}/invitados`}
                component={InvitedUsers}
                eventId={event._id}
                event={event}
                componentKey='invitados'
              />
              <Protected path={`${match.url}/messages`} component={Messages} event={event} componentKey='messages' />
              <Protected
                path={`${match.url}/confirmacion-registro`}
                component={ConfirmacionRegistro}
                event={event}
                componentKey='tconfirmacion-registro'
              />
              <Protected
                path={`${match.url}/tipo-asistentes`}
                component={TipoAsistentes}
                event={event}
                componentKey='tipo-asistentes'
              />
              {/* <Protected
                path={`${match.url}/ticket`}
                component={TicketInfo}
                event={this.state.event}
                componentKey='ticket'
              /> */}
              <Protected
                path={`${match.url}/dashboard`}
                component={DashboardEvent}
                eventId={event._id}
                event={event}
                componentKey='dashboard'
              />
              <Protected
                path={`${match.url}/assembly-dashboard`}
                component={Assembly}
                eventId={event._id}
                event={event}
                componentKey='estadisticas-asamblea'
              />
              <Protected
                path={`${match.url}/badge`}
                component={BadgeEvent}
                eventId={event._id}
                event={event}
                componentKey='badge'
              />
              <Protected path={`${match.url}/orders`} component={OrdersEvent} event={event} componentKey='orders' />
              <Protected
                path={`${match.url}/certificados`}
                component={ListCertificados}
                event={event}
                componentKey='certificados'
              />
              <Protected
                path={`${match.url}/espacios`}
                component={Espacios}
                matchUrl={match.url}
                event={event}
                componentKey='espacios'
              />
              {/* <Protected
                path={`${match.url}/reporte-certificados`}
                component={ReporteCertificados}
                event={this.state.event}
                componentKey='reporte-certificados'
              /> */}
              <Protected
                path={`${match.url}/speakers`}
                component={Speakers}
                event={event}
                eventID={event._id}
                componentKey='speakers'
              />

              <Protected
                path={`${match.url}/styles`}
                component={Styles}
                eventId={event._id}
                event={event}
                componentKey='styles'
              />
              {/* Ruta no usada posiblemente es la version 1 de la ruta /menuLanding */}
              {/* <Protected
                path={`${match.url}/configurationApp`}
                component={ConfigurationApp}
                eventId={this.state.event._id}
                event={this.state.event}
                componentKey='configurationApp'
              /> */}
              <Protected
                path={`${match.url}/notificationsApp`}
                component={NotificationsApp}
                event={event}
                componentKey='notificationsApp'
              />
              <Protected
                path={`${match.url}/news`}
                component={NewsSectionRoutes}
                eventId={event._id}
                event={event}
                componentKey='news'
              />
              <Protected
                path={`${match.url}/product`}
                component={ProductSectionRoutes}
                eventId={event._id}
                event={event}
                componentKey='product'
              />
              <Protected
                path={`${match.url}/faqs`}
                matchUrl={match.url}
                component={FAQS}
                event={event}
                componentKey='faqs'
              />
              <Protected
                path={`${match.url}/ticketsEvent`}
                matchUrl={match.url}
                component={EventsTicket}
                event={event}
                eventId={event._id}
                componentKey='ticketsEvent'
              />
              {/* Este componente se muestra si una ruta no coincide */}
              <Protected
                path={`${match.url}`}
                component={NoMatchPage}
                event={event}
                eventId={event._id}
                componentKey='NoMatch'
              />
            </Switch>
          </section>
        </Content>
      </Layout>
    );
  }
}

const Protected = ({ component: Component, event, eventId, url, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      event?.user_properties && event?.user_properties?.length > 0 ? (
        <ValidateAccessRouteCms>
          <Component key='cms' {...props} {...rest} event={event} eventId={eventId} url={url} />
        </ValidateAccessRouteCms>
      ) : (
        <Redirect push to={`${url}/agenda`} />
      )
    }
  />
);

const mapStateToProps = (state) => ({
  loading: state.rols.loading,
  permissions: state.permissions,
  showMenu: state.user.menu,
  error: state.rols.error,
});

export default connect(mapStateToProps)(withContext(withRouter(Event)));
