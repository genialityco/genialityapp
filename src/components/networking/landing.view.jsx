import { Component, Fragment } from 'react'; 
import {
  Row,
  Button,
  Col,
  Card,
  Avatar,
  Alert,
  Tabs,
  Form,
  Badge,
  notification,
  Modal,
  Result,
  Space,
  Spin,
  Typography,
} from 'antd';
import AppointmentModal from './appointmentModal';
import MyAgenda from './myAgenda';
import AppointmentRequests from './appointmentRequests';
import SearchComponent from '../shared/searchTable';
import Pagination from '../shared/pagination';
import FilterNetworking from './FilterNetworking';
import { EventFieldsApi } from '../../helpers/request';
import { formatDataToString } from '../../helpers/utils';
import { userRequest } from './services';
import ContactList from './contactList';
import RequestList from './requestList';
import withContext from '../../context/withContext';
import { addNotification, haveRequest, isMyContacts, SendFriendship } from '../../helpers/netWorkingFunctions';
import { setVirtualConference } from '../../redux/virtualconference/actions';
import { connect } from 'react-redux';
import { GetTokenUserFirebase } from '../../helpers/HelperAuth';
import { parseStringBoolean } from '@/Utilities/parseStringBoolean';
import { FormattedMessage } from 'react-intl';

const { Meta } = Card;
const { TabPane } = Tabs;
class ListEventUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userReq: [], //Almacena el request original
      usersFiltered: [],
      users: [], //contiene los usuarios filtrados
      pageOfItems: [],
      clearSearch: false,
      loading: true,
      changeItem: false,
      activeTab: 'asistentes',
      eventUserId: null,
      currentUserName: null,
      eventUserIdToMakeAppointment: null,
      eventUserToMakeAppointment: null,
      asistantData: [],
      matches: [],
      filterSector: null,
      typeAssistant: null,
      requestListSent: [],
      modalView: false,
      listTotalUser: [],
      updatetable: false
    };
  }
  
  async componentDidMount() {
    await this.getInfoCurrentUser();
    this.loadData();
    await this.props.cHelper.obtenerContactos();
    this.props.setVirtualConference(false);
  }

  changeActiveTab = async (activeTab) => {
    this.setState({ activeTab });
    //console.log("TAB ACTIVA==>",activeTab)
    if (activeTab === 'asistentes') {
      this.setState({ loading: true });
      await this.loadData();
      await this.props.cHelper.obtenerContactos();
    }
  };
  closeAppointmentModal = () => {
    this.setState({ eventUserIdToMakeAppointment: null, eventUserToMakeAppointment: null });
  };
  agendarCita = (iduser, user) => {
    this.setState({ eventUserIdToMakeAppointment: iduser, eventUserToMakeAppointment: user });
  };
  loadData = async () => {
    let { changeItem } = this.state;
    let showModal = window.sessionStorage.getItem('message') === null ? true : false;
    this.setState({ modalView: showModal });
    // NO BORRAR ES UN AVANCE  PARA OPTIMIZAR LAS PETICIONES A LA API DE LA SECCION NETWORKING
    let eventUserList = [];
    // const response = await UsersApi.getAll(event._id);
    // if(response.data){
    //   eventUserList = response.data.filter(user => user.account_id !== )
    // }

    //Servicio que trae la lista de asistentes excluyendo el usuario logeado
    let evius_token = await GetTokenUserFirebase();
    eventUserList = await userRequest.getEventUserList(this.props.cEvent.value._id, evius_token, this.state.eventUser);

    /** Inicia destacados
     * Búscamos usuarios destacados para colocarlos de primeros en la lista(destacados), tiene varios usos cómo publicitarios
     * estos tienen una propiedad llamada destacados, en un futuro debemos poner esto cómo un rol de asistente para facilitar
     * la administración por el momento este valor se esta quemando directamente en la base de datos
     */

    if (eventUserList && eventUserList.length > 0) {
      let destacados = [];
      destacados = eventUserList.filter((asistente) => asistente.destacado && asistente.destacado == true);
      if (destacados && destacados.length >= 0) {
        eventUserList = [...destacados, ...eventUserList];
      }
      //Finaliza destacados

      /*** INICIO CONTACTOS SUGERIDOS ***/

      // Arreglo para almacenar los matches resultantes segun los campos que se indiquen para este fin
      let matches = [];

      //Búscamos usuarios sugeridos según el campo sector esto es para el proyecto FENALCO
      if (this.props.cEvent.value) {
        let meproperties = this.state.eventUser.properties;

        //
        if (this.props.cEvent.value._id === '60413a3cf215e97bb908bec9') {
          let prospectos = eventUserList.filter((asistente) => asistente.properties.interes === 'Vender');
          prospectos.forEach((prospecto) => {
            matches.push(prospecto);
          });
        }

        //Finanzas del clima
        else if (this.props.cEvent.value._id === '5f9708a2e4c9eb75713f8cc6') {
          let prospectos = eventUserList.filter((asistente) => asistente.properties.participacomo);
          prospectos.forEach((prospecto) => {
            if (prospecto.properties.participacomo === 'Financiador') {
              matches.push(prospecto);
            }
          });
        }
        // Rueda de negocio naranja videojuegos
        else if (this.props.cEvent.value._id === '5f92d0cee5e2552f1b7c8ea2') {
          if (meproperties.tipodeparticipante === 'Oferente') {
            matches = eventUserList.filter((asistente) => asistente.properties.tipodeparticipante === 'Comprador');
          } else if (meproperties.tipodeparticipante === 'Comprador') {
            matches = eventUserList.filter((asistente) => asistente.properties.tipodeparticipante === 'Oferente');
          }
        }

        // Rueda de negocio naranja
        else if (this.props.cEvent.value._id === '5f7f21217828e17d80642856') {
          let prospectos = eventUserList.filter((asistente) => asistente.properties.participacomo);
          prospectos.forEach((prospecto) => {
            if (
              prospecto.properties.queproductooserviciodeseacomprarpuedeseleccionarvariasopciones &&
              Array.isArray(prospecto.properties.queproductooserviciodeseacomprarpuedeseleccionarvariasopciones) &&
              prospecto.properties.queproductooserviciodeseacomprarpuedeseleccionarvariasopciones.length > 0
            ) {
              prospecto.properties.queproductooserviciodeseacomprarpuedeseleccionarvariasopciones.forEach((interes) => {
                const matchOk = interes.label.match(new RegExp(meproperties.queproductooservicioofreces, 'gi'));
                if (matchOk !== null) {
                  matches.push(prospecto);
                }
              });
            }
          });
        }

        // Fenalco Meetups
        else if (this.props.cEvent.value._id === '5f0622f01ce76d5550058c32') {
          let prospectos = eventUserList.filter(
            (asistente) =>
              (asistente.properties.ingresasameetupspara === 'Hacer negocios' ||
                asistente.properties.ingresasameetupspara === 'Asitir a Charlas + Hacer negocios') &&
              (meproperties.ingresasameetupspara === 'Hacer negocios' ||
                meproperties.ingresasameetupspara === 'Asitir a Charlas + Hacer negocios')
          );

          if (
            meproperties.asistecomo === 'Persona' &&
            meproperties.seleccioneunadelassiguientesopciones === 'Voy a Vender'
          ) {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones === 'Voy a Comprar' ||
                asistente.properties.seleccioneunadelassiguientesopciones === 'Voy a Vender y Comprar' ||
                asistente.properties.conquienquieroconectar === 'Proveedores'
            );
          } else if (
            (meproperties.asistecomo === 'Persona' &&
              meproperties.seleccioneunadelassiguientesopciones === 'Voy a Comprar') ||
            meproperties.seleccioneunadelassiguientesopciones === 'Voy a Vender y Comprar'
          ) {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones === 'Voy a Vender' ||
                asistente.properties.seleccioneunadelassiguientesopciones === 'Voy a Vender y Comprar' ||
                asistente.properties.conquienquieroconectar === 'Aliados' ||
                asistente.properties.conquienquieroconectar === 'Inversionistas'
            );
          } else if (meproperties.asistecomo === 'Empresa' && meproperties.conquienquieroconectar === 'Proveedores') {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones === 'Voy a Vender' ||
                asistente.properties.seleccioneunadelassiguientesopciones === 'Voy a Vender y Comprar' ||
                asistente.properties.conquienquieroconectar === 'Aliados'
            );
          } else if (
            (meproperties.asistecomo === 'Empresa' && meproperties.conquienquieroconectar === 'Aliados') ||
            meproperties.conquienquieroconectar === 'Inversionistas' ||
            meproperties.conquienquieroconectar === 'Consultores' ||
            meproperties.conquienquieroconectar === 'Fenalco'
          ) {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones === 'Voy a Comprar' ||
                asistente.properties.conquienquieroconectar === 'Aliados' ||
                asistente.properties.conquienquieroconectar === 'Inversionistas' ||
                asistente.properties.conquienquieroconectar === 'Consultores'
            );
          } else {
            matches = prospectos;
          }
        }
      }

      let asistantData = await EventFieldsApi.getAll(this.props.cEvent.value._id);

      this.setState((prevState) => {
        return {
          listTotalUser: eventUserList,
          userReq: eventUserList, //request original
          usersFiltered: eventUserList,
          users: eventUserList,
          pageOfItems: eventUserList,
          changeItem,
          loading: false,
          clearSearch: !prevState.clearSearch,
          asistantData,
          matches,
        };
      });
    } else {
      this.setState({
        loading: false,
      });
    }
  };

  // Funcion que trae el eventUserId del usuario actual
  getInfoCurrentUser = async () => {
    const eventUser = this.props.cEventUser.value;
    if (eventUser) {
      if (eventUser !== null) {
        this.setState({
          eventUser,
          eventUserId: eventUser._id,
          currentUserName: eventUser.names || eventUser.email,
        });
      }
    }
  };

  closeModal = () => {
    window.sessionStorage.setItem('message', true);
    this.setState({ modalView: false });
  };

  onChangePage = (pageOfItems) => {
    this.setState({ pageOfItems: pageOfItems });
  };

  //Se ejecuta cuando se selecciona el filtro
  handleSelectFilter = (value) => {
    let inputSearch = document.getElementById('inputSearch');
    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(inputSearch, value);
    let ev2 = new Event('input', { bubbles: true });
    inputSearch.dispatchEvent(ev2);
  };

  //Search records at third column
  searchResult = (data, search = 0) => {
    // console.log("USERS==>",this.state.listTotalUser,search)
    !data ? this.setState({ users: [] }) : this.setState({ pageOfItems: data, users: data });
  };

  //Método que se ejecuta cuando se selecciona el tipo de usuario
  handleSelectTypeUser = async (typeUser) => {
    const { userReq } = this.state;
    if (typeUser === '') {
      this.setState({ usersFiltered: userReq });
      this.searchResult(userReq);
    } else {
      const listByTypeuser = await userReq.filter((item) => item.properties.participacomo === typeUser);
      this.setState({ usersFiltered: listByTypeuser });
      this.searchResult(listByTypeuser);
    }

    let inputSearch = document.getElementById('inputSearch');
    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(inputSearch, '');
    let ev1 = new Event('input', { bubbles: true });
    inputSearch.dispatchEvent(ev1);

  };

  haveRequestUser(user) {
    //console.log("HEPERVALUE==>",this.props.cHelper.requestSend)
    return haveRequest(user, this.props.cHelper.requestSend);
  }

  isMyContact(user) {
    let formatUSer = { ...user, eventUserId: user._id };
    let isContact = isMyContacts(formatUSer, this.props.cHelper.contacts);
    return isContact;
  }

  componentWillUnmount() {
    this.props.setVirtualConference(true);
  }

  render() {
    const { event } = this.props;

    const {
      usersFiltered,
      users,
      pageOfItems,
      eventUserId,
      asistantData,
      activeTab,
    } = this.state;

    return (
      <Card style={{ /* padding: '5px', */ /* height: '100%' */ padding: 0}} bodyStyle={{paddingTop: 10}}>
        <Modal visible={this.state.modalView} footer={null} closable={false}>
          <Result
            extra={
              <Button type='primary' onClick={this.closeModal}>
                <FormattedMessage id='close' defaultMessage={'Cerrar'}/>
              </Button>
            }
            title={<Typography.Text strong><FormattedMessage id='additional_information' defaultMessage={'¡Información adicional!'}/></Typography.Text>}
            subTitle={
              <Typography.Paragraph style={{textAlign: 'justify'}}>
                <FormattedMessage id='networking_informative_modal_part1' defaultMessage={'Solo puedes ver una cantidad limitada de información pública de cada asistente, para ver toda la información de un asistente debes realizar una solicitud de contacto, luego de ello se le informará al asistente, quien aceptará o recharazá la solicitud enviada.'}/>
                <br /><br />
                <FormattedMessage id='networking_informative_modal_part2' defaultMessage={'Una vez el asistente haya aceptado solicitud te llegará un correo y podrás regresar a esta misma sección en mis contactos a ver la información completa del nuevo contacto.'}/>
              </Typography.Paragraph>
            }
          />
        </Modal>

        {/* Componente de busqueda */}
        <Tabs style={{ background: '#FFFFFF' }} activeKey={activeTab} onChange={this.changeActiveTab}>
          <TabPane tab={<Typography.Text><FormattedMessage id={'participants'} defaultMessage={'Participantes'} /></Typography.Text>} key='asistentes'>
            {
              <AppointmentModal
                targetEventUserId={this.state.eventUserIdToMakeAppointment}
                targetEventUser={this.state.eventUserToMakeAppointment}
                closeModal={this.closeAppointmentModal}
                cEvent={this.props.cEvent}
                cEventUser={this.props.cEventUser}
              />
            }

            {!this.state.loading && (
              <Form>
                <Row justify='space-around' gutter={[16, 16]}>
                  <Col span={24} style={{ margin: '0 auto' }}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      label={<FormattedMessage id='networking_search_participant' defaultMessage={'Busca aquí las personas que deseas contactar'} />}
                      name='searchInput'>
                      <SearchComponent
                        id='searchInput'
                        placeholder={''}
                        data={usersFiltered}
                        kind={'user'}
                        event={this.props.cEvent.value._id}
                        searchResult={this.searchResult}
                        users={this.state.users}
                        clear={this.state.clearSearch}
                        styles={{ width: '300px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row justify='space-around' gutter={[16, 16]}>
                  {/*Alerta quemado para el eventop de finanzas de clima*/}
                  {this.props.cEvent.value._id === '5f9708a2e4c9eb75713f8cc6' && (
                    <>
                      {/* <Alert
                      message='Sugerencias de Busqueda'
                      description='Te recomendamos buscar de acuerdo a las 
                        siguientes palabras claves: Adaptación, Mitigación, 
                        Energía, Agropecuario, Industria, Circular, TIC, Residuos, 
                        Turismo, Transporte, Forestal,  Vivienda, Start Up, Pyme, Entes territoriales, 
                        Gran empresa, Pública, Privada, Mixta, ONG'
                      type='info'
                      showIcon
                      closable
                    /> */}
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label={<FormattedMessage id='attendee_type' defaultMessage={'Tipo de asistente'}/>} name='filterTypeUser' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'participacomo'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label='Sector' name='filterSector' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'sector'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/*Ruedas de negocio naranja videojuegos*/}
                  {this.props.cEvent.value._id === '5f92d0cee5e2552f1b7c8ea2' && (
                    <>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label={<FormattedMessage id='attendee_type' defaultMessage={'Tipo de asistente'}/>} name='filterTypeUser' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'participascomo'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label={<FormattedMessage id='attendee_type' defaultMessage={'Tipo de asistente'}/>} name='filterSector' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'tipodeparticipante'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/*Ruedas de negocio naranja*/}
                  {this.props.cEvent.value._id === '5f7f21217828e17d80642856' && (
                    <>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label={<FormattedMessage id='attendee_type' defaultMessage={'Tipo de asistente'}/>} name='filterTypeUser' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'participacomo'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label={<FormattedMessage id='sector' defaultMessage={'Sector'}/>} name='filterSector' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'queproductooservicioofreces'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/*Fenalco Meetups*/}
                  {this.props.cEvent.value._id === '5f0622f01ce76d5550058c32' && (
                    <>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label={<FormattedMessage id='attendee_type' defaultMessage={'Tipo de asistente'}/>} name='filterTypeUser' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'asistecomo'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item label={<FormattedMessage id='sector' defaultMessage={'Sector'}/>} name='filterSector' labelCol={{ span: 24 }}>
                          <FilterNetworking
                            id='filterSector'
                            properties={this.props.cEvent.value.user_properties || []}
                            filterProperty={'sector'}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
              </Form>
            )}
            
            {!this.state.loading && !eventUserId && (
              <div>
                <br />
                <Col xs={22} sm={22} md={10} lg={10} xl={10} style={{ margin: '0 auto' }}>
                  <Alert
                    message={<FormattedMessage id='requests' defaultMessage={'Solicitudes'}/>}
                    description={<FormattedMessage id='networking_send_request_subscribed_event' defaultMessage={'Para enviar solicitudes debes estar suscrito al evento'}/>}
                    type='info'
                    closable
                  />
                </Col>
              </div>
            )}

            <div>
            {this.state.loading ? (
              <Row justify='center' align='middle'>
                <Col>
                  <Spin 
                    size='large'
                    tip={<Typography.Text strong><FormattedMessage id='loading' defaultMessage={'Cargando...'}/></Typography.Text>}
                  />
                </Col>
              </Row>
              ) : (
                <div className='container card-Sugeridos'>
                  <Row /* justify='space-between' */ gutter={[10, 10]}>
                    {/* Mapeo de datos en card, Se utiliza Row y Col de antd para agregar columnas */}
                    {pageOfItems.map((users, userIndex) => (
                      <Col
                        id={`user-item-${userIndex}`}
                        key={`user-item-${userIndex}`}
                        xs={24}
                        sm={24}
                        md={24}
                        lg={12}
                        xl={12}
                        xxl={8}>
                        <Card
                          hoverable={8}
                          headStyle={
                            users.destacado && users.destacado === true
                              ? { backgroundColor: '#6ddab5' }
                              : {
                                  backgroundColor: this.props.cEvent.value.styles.toolbarDefaultBg,
                                }
                          }
                          style={{
                            width: '100%',
                            marginTop: '2%',
                            marginBottom: '2%',
                            textAlign: 'left',
                          }}
                          bordered={true}>
                          <Meta
                            avatar={
                              <Avatar size={65} src={users?.user?.picture ? users?.user?.picture : ''}>
                                {!users?.user?.picture && users.properties.names
                                  ? users.properties.names.charAt(0).toUpperCase()
                                  : users.properties.names}
                              </Avatar>
                            }
                            title={users.properties.names ? users.properties.names : <FormattedMessage id='not_registered_name' defaultMessage={'No registra Nombre'}/>}
                            description={[
                              <div key={`ug-${userIndex}`}>
                                <br />
                                <Row>
                                  <Col xs={24}>
                                    <div>
                                      {/*console.log("ASSISTANTDATA==>",asistantData )*/}
                                      {/* {!data.visible || !data.visibleByContacts && */
                                      asistantData.map(
                                        (property, propertyIndex) =>
                                          (parseStringBoolean(property.visibleByContacts) === false ||
                                            property?.visibleByContacts === undefined ||
                                            property.visibleByContacts === 'public') &&
                                          (parseStringBoolean(property?.sensibility) === false || property?.sensibility === undefined) &&
                                          users.properties[property.name] &&
                                          property.name !== 'picture' &&
                                          property.name !== 'imagendeperfil' &&
                                          property.type !== 'avatar' && (
                                            <div key={`public-field-${userIndex}-${propertyIndex}`}>
                                              <p>
                                                <b>{`${property.label}: `}</b>
                                                {formatDataToString(
                                                  property.type !== 'codearea'
                                                    ? users.properties[property.name]
                                                    : '(+' +
                                                        users.properties['code'] +
                                                        ')' +
                                                        users.properties[property.name],
                                                  property
                                                )}
                                              </p>
                                            </div>
                                          )
                                      )}
                                    </div>
                                  </Col>
                                  {(eventUserId !== null && this.props.cEventUser.value._id !==users._id) && (
                                    <Space wrap>
                                      <Button
                                        type='primary'
                                        onClick={() => {
                                          //alert("ACAAA")

                                          this.setState({
                                            eventUserIdToMakeAppointment: users._id,
                                            eventUserToMakeAppointment: users,
                                          });
                                        }}>
                                        <FormattedMessage id='schedule_appointment' defaultMessage={'Agendar cita'}/>
                                      </Button>
                                      <Button
                                        type='primary'
                                        disabled={
                                          this.isMyContact(users) ||
                                          this.haveRequestUser(users) ||
                                          (users.send && users.send === 1) ||
                                          users.loading
                                        }
                                        onClick={
                                          !this.isMyContact(users)
                                            ? async () => {
                                                this.state.users[userIndex] = {
                                                  ...this.state.users[userIndex],
                                                  loading: true,
                                                };
                                                this.setState({ users: this.state.users });
                                                let sendResp = await SendFriendship(
                                                  {
                                                    eventUserIdReceiver: users._id,
                                                    userName: users.properties.names || users.properties.email,
                                                  },
                                                  this.props.cEventUser.value,
                                                  this.props.cEvent.value
                                                );

                                                let us = users;

                                                if (sendResp._id) {
                                                  let notificationR = {
                                                    idReceive: us.account_id,
                                                    idEmited: sendResp._id,
                                                    emailEmited:
                                                      this.props.cEventUser.value.email ||
                                                      this.props.cEventUser.value.user.email,
                                                    message:
                                                      (this.props.cEventUser.value.names ||
                                                        this.props.cEventUser.value.user.names) +
                                                      <FormattedMessage id='sent_you_a_friend_request' defaultMessage={' te ha enviado solicitud de amistad'}/>,
                                                    name: 'notification.name',
                                                    type: 'amistad',
                                                    state: '0',
                                                  };

                                                  addNotification(
                                                    notificationR,
                                                    this.props.cEvent.value,
                                                    this.props.cEventUser.value
                                                  );
                                                  notification['success']({
                                                    message: <FormattedMessage id='correct' defaultMessage={'Correcto!'}/>,
                                                    description: <FormattedMessage id='friend_request_sent_successfully' defaultMessage={'Se ha enviado la solicitud de amistad correctamente'}/>,
                                                  });

                                                  for (let i = 0; i < this.state.users.length; i++) {
                                                    if (this.state.users[i]._id === users._id) {
                                                      // console.log("STATE USER==>",this.state.users[i])
                                                      this.state.users[i] = {
                                                        ...this.state.users[i],
                                                        send: 1,
                                                        loading: false,
                                                      };
                                                      //  console.log("USER_CHANGE==>",this.state.users[i])
                                                    } else {
                                                      this.state.users[i] = {
                                                        ...this.state.users[i],
                                                        loading: false,
                                                      };
                                                    }
                                                  }
                                                  this.setState({ users: this.state.users }, () => {
                                                    this.setState({ updatetable: !this.state.updatetable });
                                                  });
                                                }
                                              }
                                            : null
                                        }>
                                        {!users.loading ? (
                                          this.isMyContact(users) ? (
                                            <FormattedMessage id='already_your_contact' defaultMessage={'Ya es tu contacto'}/>
                                          ) : this.haveRequestUser(users) || (users.send && users.send == 1) ? (
                                            <FormattedMessage id='pending_confirmation' defaultMessage={'Confirmación pendiente'}/>
                                          ) : (
                                            <FormattedMessage id='send_contact_request' defaultMessage={'Enviar solicitud de contacto'}/>
                                          )
                                        ) : (
                                          <Row justify='center' align='middle'>
                                            <Col>
                                              <Spin size='large' tip={<Typography.Text strong><FormattedMessage id='loading' defaultMessage={'Cargando...'}/></Typography.Text>}/>
                                            </Col>
                                          </Row>
                                        )}
                                      </Button>
                                    </Space>
                                  )}
                                </Row>
                                <br />
                              </div>,
                            ]}
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Paginacion para mostrar datos de una manera mas ordenada */}
                  {!this.state.loading && users.length > 0 && pageOfItems.length > 0 && this.props.cEventUser.value && (
                    <Pagination
                      updatetable={this.state.updatetable}
                      items={users}
                      change={this.state.changeItem}
                      onChangePage={this.onChangePage}
                    />
                  )}
                  {!this.state.loading && users.length === 0 && this.props.cEventUser.value && (
                    <Row justify='center' align='middle'>
                      <Col>
                        <Result 
                          title={<FormattedMessage id='no_users' defaultMessage={'No existen usuarios'}/>}
                        />
                      </Col>
                    </Row>
                  )}

                  {!this.state.loading && !this.props.cEventUser.value && (
                    <Alert
                      message={<FormattedMessage id='log_in' defaultMessage={'Iniciar Sesión'}/>}
                      description={<FormattedMessage id='see_attendess_login' defaultMessage={'Para poder ver los asistentes es necesario iniciar sesión.'}/>}
                      type='info'
                      showIcon
                    />
                  )}
                </div>
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <Typography.Text>
                <FormattedMessage id='my_agenda' defaultMessage={'Mi agenda'}/>
              </Typography.Text>
            }
            key='mi-agenda'>
            {activeTab === 'mi-agenda' && (
              <>
                
                {this.props.cEventUser && this.props.cEventUser.value && (
                  <MyAgenda
                    event={this.props.cEvent.value}
                    eventUser={this.props.cEventUser.value}
                    currentEventUserId={this.props.cEventUser.value._id}
                    eventUsers={users}
                  />
                )}
              </>
            )}
          </TabPane>

          <TabPane tab={<Typography.Text><FormattedMessage id='my_contacts' defaultMessage={'Mis contactos'}/></Typography.Text>} key='mis-contactos'>
            <ContactList
              agendarCita={this.agendarCita}
              eventId={this.props.cEvent.value._id}
              tabActive={this.state.activeTab}
            />
          </TabPane>

          <TabPane
            tab={
              <Badge
                color={this.props.cHelper.totalSolicitudAmistad <= 0 ? 'transparent' : 'red'}
                dot={this.props.cHelper.totalSolicitudAmistad <= 0}
                count={
                  this.props.cHelper.totalSolicitudAmistad > 0 && this.props.cHelper.totalSolicitudAmistad}
              >
                <Typography.Text><FormattedMessage id='contact_requests' defaultMessage={'Solicitudes de contacto'}/></Typography.Text>
              </Badge>
            }
            key='solicitudes'>
            <RequestList
              currentUser={this.props.cEventUser.value}
              currentUserAc={this.props.cUser.value}
              event={this.props.cEvent.value}
              //notification={this.props.notification}
              eventId={this.props.cEvent.value._id}
              tabActive={this.state.activeTab}
            />
          </TabPane>

          <TabPane
            tab={
              <Badge
                color={this.props.cHelper.totalsolicitudAgenda <= 0 ? 'transparent' : 'red'} //cyan
                dot={this.props.cHelper.totalsolicitudAgenda <= 0}
                count={
                  this.props.cHelper.totalsolicitudAgenda > 0 && this.props.cHelper.totalsolicitudAgenda
                }>
                  <Typography.Text>
                    <FormattedMessage id='appointment_requests' defaultMessage={'Solicitudes de citas'}/> 
                  </Typography.Text>
                </Badge>
            }
            key='solicitudes-de-citas'>
            {activeTab === 'solicitudes-de-citas' && (
              <AppointmentRequests
                eventId={this.props.cEvent.value._id}
                currentEventUserId={eventUserId}
                currentUser={this.props.currentUser}
                notificacion={this.props.notification}
                eventUsers={users}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}
const mapDispatchToProps = {
  setVirtualConference,
};

let ListEventUserWithContext = connect(null, mapDispatchToProps)(withContext(ListEventUser));
export default ListEventUserWithContext;
