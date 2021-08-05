import React, { Component, Fragment } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Row, Button, Col, Card, Avatar, Alert, Tabs, Form, Badge } from "antd";
import AppointmentModal from "./appointmentModal";
import MyAgenda from "./myAgenda";
import AppointmentRequests from "./appointmentRequests";
import SearchComponent from "../shared/searchTable";
import Pagination from "../shared/pagination";
import Loading from "../loaders/loading";
import EventContent from "../events/shared/content";
import FilterNetworking from "./FilterNetworking";
import * as Cookie from "js-cookie";
import { EventsApi, EventFieldsApi } from "../../helpers/request";
import { formatDataToString } from "../../helpers/utils";
import { userRequest } from "./services";
import ContactList from "./contactList";
import RequestList from "./requestList";
import withContext from "../../Context/withContext";
import { SendFriendship } from "../../helpers/netWorkingFunctions";
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
      activeTab: "asistentes",
      eventUserId: null,
      currentUserName: null,
      eventUserIdToMakeAppointment: null,
      eventUserToMakeAppointment: null,
      asistantData: [],
      matches: [],
      filterSector: null,
      typeAssistant: null,
    };
  }

  async componentDidMount() {
    await this.getInfoCurrentUser();
    this.loadData();
  }

  changeActiveTab = (activeTab) => {
    this.setState({ activeTab });
  };

  loadData = async () => {
    let { changeItem } = this.state;

    // NO BORRAR ES UN AVANCE  PARA OPTIMIZAR LAS PETICIONES A LA API DE LA SECCION NETWORKING
    let eventUserList = [];
    // const response = await UsersApi.getAll(event._id);
    // if(response.data){
    //   eventUserList = response.data.filter(user => user.account_id !== )
    // }

    //Servicio que trae la lista de asistentes excluyendo el usuario logeado
    eventUserList = await userRequest.getEventUserList(
      this.props.cEvent.value._id,
      Cookie.get("evius_token"),
      this.state.eventUser
    );
    console.log("USERS LIST");
    console.log(eventUserList);

    /** Inicia destacados
     * Búscamos usuarios destacados para colocarlos de primeros en la lista(destacados), tiene varios usos cómo publicitarios
     * estos tienen una propiedad llamada destacados, en un futuro debemos poner esto cómo un rol de asistente para facilitar
     * la administración por el momento este valor se esta quemando directamente en la base de datos
     */

    if (eventUserList && eventUserList.length > 0) {
      let destacados = [];
      destacados = eventUserList.filter(
        (asistente) => asistente.destacado && asistente.destacado == true
      );
      if (destacados && destacados.length >= 0) {
        eventUserList = [...destacados, ...eventUserList];
      }
      //Finaliza destacados

      /*** INICIO CONTACTOS SUGERIDOS ***/

      // Arreglo para almacenar los matches resultantes segun los campos que se indiquen para este fin
      let matches = [];

      //Búscamos usuarios sugeridos según el campo sector esto es para el proyecto FENALCO
      if (this.EventContext) {
        let meproperties = this.state.eventUser.properties;

        //
        if (event._id === "60413a3cf215e97bb908bec9") {
          let prospectos = eventUserList.filter(
            (asistente) => asistente.properties.interes === "Vender"
          );
          prospectos.forEach((prospecto) => {
            matches.push(prospecto);
          });
        }

        //Finanzas del clima
        else if (event._id === "5f9708a2e4c9eb75713f8cc6") {
          let prospectos = eventUserList.filter(
            (asistente) => asistente.properties.participacomo
          );
          prospectos.map((prospecto) => {
            if (prospecto.properties.participacomo == "Financiador") {
              matches.push(prospecto);
            }
          });
        }
        // Rueda de negocio naranja videojuegos
        else if (event._id === "5f92d0cee5e2552f1b7c8ea2") {
          if (meproperties.tipodeparticipante === "Oferente") {
            matches = eventUserList.filter(
              (asistente) =>
                asistente.properties.tipodeparticipante === "Comprador"
            );
          } else if (meproperties.tipodeparticipante === "Comprador") {
            matches = eventUserList.filter(
              (asistente) =>
                asistente.properties.tipodeparticipante === "Oferente"
            );
          }
        }

        // Rueda de negocio naranja
        else if (event._id === "5f7f21217828e17d80642856") {
          let prospectos = eventUserList.filter(
            (asistente) => asistente.properties.participacomo
          );
          prospectos.map((prospecto) => {
            if (
              prospecto.properties
                .queproductooserviciodeseacomprarpuedeseleccionarvariasopciones &&
              Array.isArray(
                prospecto.properties
                  .queproductooserviciodeseacomprarpuedeseleccionarvariasopciones
              ) &&
              prospecto.properties
                .queproductooserviciodeseacomprarpuedeseleccionarvariasopciones
                .length > 0
            ) {
              prospecto.properties.queproductooserviciodeseacomprarpuedeseleccionarvariasopciones.map(
                (interes) => {
                  const matchOk = interes.label.match(
                    new RegExp(meproperties.queproductooservicioofreces, "gi")
                  );
                  if (matchOk !== null) {
                    matches.push(prospecto);
                  }
                }
              );
            }
          });
        }

        // Fenalco Meetups
        else if (event._id === "5f0622f01ce76d5550058c32") {
          let prospectos = eventUserList.filter(
            (asistente) =>
              (asistente.properties.ingresasameetupspara === "Hacer negocios" ||
                asistente.properties.ingresasameetupspara ===
                  "Asitir a Charlas + Hacer negocios") &&
              (meproperties.ingresasameetupspara === "Hacer negocios" ||
                meproperties.ingresasameetupspara ===
                  "Asitir a Charlas + Hacer negocios")
          );

          if (
            meproperties.asistecomo === "Persona" &&
            meproperties.seleccioneunadelassiguientesopciones === "Voy a Vender"
          ) {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones ===
                  "Voy a Comprar" ||
                asistente.properties.seleccioneunadelassiguientesopciones ===
                  "Voy a Vender y Comprar" ||
                asistente.properties.conquienquieroconectar === "Proveedores"
            );
          } else if (
            (meproperties.asistecomo === "Persona" &&
              meproperties.seleccioneunadelassiguientesopciones ===
                "Voy a Comprar") ||
            meproperties.seleccioneunadelassiguientesopciones ===
              "Voy a Vender y Comprar"
          ) {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones ===
                  "Voy a Vender" ||
                asistente.properties.seleccioneunadelassiguientesopciones ===
                  "Voy a Vender y Comprar" ||
                asistente.properties.conquienquieroconectar === "Aliados" ||
                asistente.properties.conquienquieroconectar === "Inversionistas"
            );
          } else if (
            meproperties.asistecomo === "Empresa" &&
            meproperties.conquienquieroconectar === "Proveedores"
          ) {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones ===
                  "Voy a Vender" ||
                asistente.properties.seleccioneunadelassiguientesopciones ===
                  "Voy a Vender y Comprar" ||
                asistente.properties.conquienquieroconectar === "Aliados"
            );
          } else if (
            (meproperties.asistecomo === "Empresa" &&
              meproperties.conquienquieroconectar === "Aliados") ||
            meproperties.conquienquieroconectar === "Inversionistas" ||
            meproperties.conquienquieroconectar === "Consultores" ||
            meproperties.conquienquieroconectar === "Fenalco"
          ) {
            matches = prospectos.filter(
              (asistente) =>
                asistente.properties.seleccioneunadelassiguientesopciones ===
                  "Voy a Comprar" ||
                asistente.properties.conquienquieroconectar === "Aliados" ||
                asistente.properties.conquienquieroconectar ===
                  "Inversionistas" ||
                asistente.properties.conquienquieroconectar === "Consultores"
            );
          } else {
            matches = prospectos;
          }
        }
      }

      let asistantData = await EventFieldsApi.getAll(
        this.props.cEvent.value._id
      );
      console.log("ASISTANT DATA");
      console.log(asistantData);
      console.log(eventUserList);
      console.log(matches);
      this.setState((prevState) => {
        return {
          userReq: eventUserList, //request original
          usersFiltered: eventUserList,
          users: eventUserList,
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
    const event = this.props.cEvent.value;
    const currentUser = this.props.cEventUser.value;
    console.log(this.props);
    if (currentUser) {
      alert("SI CURRENT USER");
      const eventUser = await EventsApi.getcurrentUserEventUser(event._id);
      console.log(eventUser);

      if (eventUser !== null) {
        this.setState({
          eventUser,
          eventUserId: eventUser._id,
          currentUserName: eventUser.names || eventUser.email,
        });
      }
    }
  };

  onChangePage = (pageOfItems) => {
    this.setState({ pageOfItems: pageOfItems });
  };

  //Se ejecuta cuando se selecciona el filtro
  handleSelectFilter = (value) => {
    let inputSearch = document.getElementById("inputSearch");
    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(inputSearch, value);
    let ev2 = new Event("input", { bubbles: true });
    inputSearch.dispatchEvent(ev2);
  };

  //Search records at third column
  searchResult = (data) => {
    !data ? this.setState({ users: [] }) : this.setState({ users: data });
  };

  //Método que se ejecuta cuando se selecciona el tipo de usuario
  handleSelectTypeUser = async (typeUser) => {
    const { userReq } = this.state;
    if (typeUser === "") {
      this.setState({ usersFiltered: userReq });
      this.searchResult(userReq);
    } else {
      const listByTypeuser = await userReq.filter(
        (item) => item.properties.participacomo === typeUser
      );
      this.setState({ usersFiltered: listByTypeuser });
      this.searchResult(listByTypeuser);
    }

    let inputSearch = document.getElementById("inputSearch");
    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(inputSearch, "");
    let ev1 = new Event("input", { bubbles: true });
    inputSearch.dispatchEvent(ev1);

    // let filterSector = document.getElementById('filterSector')
    // let nativeInputValueSetter2 = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
    // nativeInputValueSetter2.call(filterSector, '');
    // let ev2 = new Event('select', { bubbles: true});
    // filterSector.dispatchEvent(ev2);
  };

  render() {
    const { event } = this.props;

    const {
      usersFiltered,
      users,
      pageOfItems,
      eventUserId,
      eventUser,
      asistantData,
      eventUserIdToMakeAppointment,
      eventUserToMakeAppointment,
      activeTab,
      matches,
    } = this.state;

    console.log("LENGTH");
    console.log(users.length);

    return (
      <div style={{ padding: "12px" }}>
        <EventContent>
          {/* Componente de busqueda */}
          <Tabs activeKey={activeTab} onChange={this.changeActiveTab}>
            <TabPane tab="Sugeridos" key="sugeridos">
              <Col
                xs={22}
                sm={22}
                md={10}
                lg={10}
                xl={10}
                style={{ margin: "0 auto", marginBottom: 20 }}
              >
                <h1>
                  {" "}
                  Encuentra aquí tus contactos sugeridos, basados en la
                  información de registro al evento.
                </h1>
              </Col>
              <Col
                xs={22}
                sm={22}
                md={10}
                lg={10}
                xl={10}
                style={{ margin: "0 auto" }}
              >
                <Alert
                  message="Información Adicicional"
                  description="Solo puedes ver una cantidad de información pública limitada de cada asistente, para ver toda la información de otro asistente debes realizar una solicitud de contacto
                  se le informara al asistente quien aceptara o recharaza la solicitud, Una vez la haya aceptado te llegará un correo confirmando y podrás regresar a esta misma sección en mis contactos a ver la información completa del nuevo contacto."
                  type="info"
                  closable
                />
              </Col>
              {!this.state.loading && !eventUserId && (
                <div>
                  <br />
                  <Col
                    xs={22}
                    sm={22}
                    md={10}
                    lg={10}
                    xl={10}
                    style={{ margin: "0 auto" }}
                  >
                    <Alert
                      message="Solicitudes"
                      description="Para enviar solicitudes debes estar suscrito al evento"
                      type="info"
                      closable
                    />
                  </Col>
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                {this.state.loading ? (
                  <Fragment>
                    <Loading />
                    <h2 className="has-text-centered">Cargando...</h2>
                  </Fragment>
                ) : !this.state.loading &&
                  users.length > 0 &&
                  matches.length > 0 ? (
                  <div className="card-Networking">
                    <div className="container" justify="center">
                      <Row justify="space-between">
                        {/* Mapeo de datos en card, Se utiliza Row y Col de antd para agregar columnas */}
                        {matches.length > 0 &&
                          matches.map((user, userIndex) => (
                            <Col
                              key={`user-item-${userIndex}`}
                              xs={20}
                              sm={20}
                              md={20}
                              lg={10}
                              xl={10}
                              xxl={10}
                              offset={2}
                            >
                              <Card
                                extra={
                                  <a
                                    onClick={() => {
                                      SendFriendship({
                                        eventUserIdRaeceiver: user._id,
                                        userName:
                                          user.properties.names ||
                                          user.properties.email,
                                      },this.props.cEventUser.value,this.props.cEvent.value);
                                    }}
                                  ></a>
                                }
                                hoverable={8}
                                headStyle={
                                  user.destacado && user.destacado == true
                                    ? { backgroundColor: "#33FFEC" }
                                    : {
                                        backgroundColor:
                                          event.styles.toolbarDefaultBg,
                                      }
                                }
                                style={{
                                  width: 500,
                                  marginTop: "2%",
                                  marginBottom: "2%",
                                  textAlign: "left",
                                }}
                                bordered={true}
                              >
                                <Meta
                                  avatar={
                                    <Avatar>
                                      {user.properties && user.properties.names
                                        ? user.properties.names
                                            .charAt(0)
                                            .toUpperCase()
                                        : user.properties.names}
                                    </Avatar>
                                  }
                                  title={
                                    user.properties.names
                                      ? user.properties.names
                                      : "No registra Nombre"
                                  }
                                  description={[
                                    <div key={`ui-${userIndex}`}>
                                      <br />
                                      <Row>
                                        <Col xs={24}>
                                          <div>
                                            {asistantData.map(
                                              (data, dataIndex) =>
                                                /*Condicion !data.visible para poder tener en cuenta el campo visible en los datos que llegan, 
                                                  esto ya que visibleByContacst es variable nueva, ambas realizan la misma funcionalidad
                                                */
                                                !data.visibleByAdmin &&
                                                user.properties[data.name] && (
                                                  <div
                                                    key={`public-field-${userIndex}-${dataIndex}`}
                                                  >
                                                    <p>
                                                      <b>{data.label}:</b>{" "}
                                                      {formatDataToString(
                                                        user.properties[
                                                          data.name
                                                        ],
                                                        data
                                                      )}
                                                    </p>
                                                  </div>
                                                )
                                            )}
                                          </div>
                                        </Col>
                                        {eventUserId !== null && (
                                          <Col xs={24}>
                                            <Button
                                              type="primary"
                                              onClick={() => {
                                                this.setState({
                                                  eventUserIdToMakeAppointment:
                                                    user._id,
                                                  eventUserToMakeAppointment: user,
                                                });
                                              }}
                                            >
                                              {"Agendar cita"}
                                            </Button>
                                          </Col>
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
                    </div>
                  </div>
                ) : (
                  <Col xs={24} sm={22} md={18} lg={18} xl={18} style={{ margin: '0 auto' }}>
                  <Card style={{textAlign:'center'}}>{'No existen sugeridos'}</Card>
                </Col>
                )}
              </div>
            </TabPane>

            <TabPane tab="Todos los Asistentes" key="asistentes">
              <AppointmentModal
                event={event}
                currentEventUserId={eventUserId}
                eventUser={eventUser}
                targetEventUserId={eventUserIdToMakeAppointment}
                targetEventUser={eventUserToMakeAppointment}
                closeModal={this.closeAppointmentModal}
              />
              <Form>
                <Row justify="space-around" gutter={[16, 16]}>
                  <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={24}
                    xl={24}
                    style={{ margin: "0 auto" }}
                  >
                    <Form.Item
                      labelCol={{ span: 24 }}
                      label="Busca aquí las personas que deseas contactar"
                      name="searchInput"
                    >
                      <SearchComponent
                        id="searchInput"
                        placeholder={""}
                        data={usersFiltered}
                        kind={"user"}
                        event={this.props.cEvent.value._id}
                        searchResult={this.searchResult}
                        clear={this.state.clearSearch}
                        styles={{ width: "300px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row justify="space-around" gutter={[16, 16]}>
                  {/*Alerta quemado para el eventop de finanzas de clima*/}
                  {this.props.cEvent.value._id ===
                    "5f9708a2e4c9eb75713f8cc6" && (
                    <>
                      <Alert
                        message="Sugerencias de Busqueda"
                        description="Te recomendamos buscar de acuerdo a las 
                          siguientes palabras claves: Adaptación, Mitigación, 
                          Energía, Agropecuario, Industria, Circular, TIC, Residuos, 
                          Turismo, Transporte, Forestal,  Vivienda, Start Up, Pyme, Entes territoriales, 
                          Gran empresa, Pública, Privada, Mixta, ONG"
                        type="info"
                        showIcon
                        closable
                      />
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Tipo de asistente"
                          name="filterTypeUser"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"participacomo"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Sector"
                          name="filterSector"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"sector"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/*Ruedas de negocio naranja videojuegos*/}
                  {this.props.cEvent.value._id ===
                    "5f92d0cee5e2552f1b7c8ea2" && (
                    <>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Tipo de asistente"
                          name="filterTypeUser"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"participascomo"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Tipo de participante"
                          name="filterSector"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"tipodeparticipante"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/*Ruedas de negocio naranja*/}
                  {this.props.cEvent.value._id ===
                    "5f7f21217828e17d80642856" && (
                    <>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Tipo de asistente"
                          name="filterTypeUser"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"participacomo"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Sector"
                          name="filterSector"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"queproductooservicioofreces"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/*Fenalco Meetups*/}
                  {this.props.cEvent.value._id ===
                    "5f0622f01ce76d5550058c32" && (
                    <>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Tipo de asistente"
                          name="filterTypeUser"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"asistecomo"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Form.Item
                          label="Sector"
                          name="filterSector"
                          labelCol={{ span: 24 }}
                        >
                          <FilterNetworking
                            id="filterSector"
                            properties={
                              this.props.cEvent.value.user_properties || []
                            }
                            filterProperty={"sector"}
                            handleSelect={this.handleSelectFilter}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
              </Form>
              <Col
                xs={22}
                sm={22}
                md={10}
                lg={10}
                xl={10}
                style={{ margin: "0 auto" }}
              >
                <Alert
                  message="Información Adicicional"
                  description="Solo puedes ver una cantidad de información pública limitada de cada asistente, para ver toda la información de otro asistente debes realizar una solicitud de contacto
                  se le informara al asistente quien aceptara o recharaza la solicitud, Una vez la haya aceptado te llegará un correo confirmando y podrás regresar a esta misma sección en mis contactos a ver la información completa del nuevo contacto."
                  type="info"
                  closable
                />
              </Col>
              {!this.state.loading && !eventUserId && (
                <div>
                  <br />
                  <Col
                    xs={22}
                    sm={22}
                    md={10}
                    lg={10}
                    xl={10}
                    style={{ margin: "0 auto" }}
                  >
                    <Alert
                      message="Solicitudes"
                      description="Para enviar solicitudes debes estar suscrito al evento"
                      type="info"
                      closable
                    />
                  </Col>
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                {this.state.loading ? (
                  <Fragment>
                    <Loading />
                    <h2 className="has-text-centered">Cargando...</h2>
                  </Fragment>
                ) : (
                  <div className="container card-Sugeridos">
                    <Row justify="space-between">
                      {/* Mapeo de datos en card, Se utiliza Row y Col de antd para agregar columnas */}
                      {pageOfItems.map((users, userIndex) => (
                        <Col
                          key={`user-item-${userIndex}`}
                          xs={20}
                          sm={20}
                          md={20}
                          lg={10}
                          xl={10}
                          xxl={10}
                          offset={2}
                        >
                          <Card
                            extra={
                              <a
                              /* style={{ color: "white" }}
                                  onClick={() => {
                                    this.SendFriendship({
                                      eventUserIdReceiver: users._id,
                                      userName: users.properties.names || users.properties.email,
                                    });
                                  }}*/
                              ></a>
                            }
                            hoverable={8}
                            headStyle={
                              users.destacado && users.destacado == true
                                ? { backgroundColor: "#6ddab5" }
                                : {
                                    backgroundColor: this.props.cEvent.value
                                      .styles.toolbarDefaultBg,
                                  }
                            }
                            style={{
                              width: "100%",
                              marginTop: "2%",
                              marginBottom: "2%",
                              textAlign: "left",
                            }}
                            bordered={true}
                          >
                            <Meta
                              avatar={
                                <Avatar>
                                  {users.properties.names
                                    ? users.properties.names
                                        .charAt(0)
                                        .toUpperCase()
                                    : users.properties.names}
                                </Avatar>
                              }
                              title={
                                users.properties.names
                                  ? users.properties.names
                                  : "No registra Nombre"
                              }
                              description={[
                                <div key={`ug-${userIndex}`}>
                                  <br />
                                  <Row>
                                    <Col xs={24}>
                                      <div>
                                        {/* {!data.visible || !data.visibleByContacts && */
                                        asistantData.map(
                                          (property, propertyIndex) =>
                                            !property.visibleByAdmin &&
                                            (!property.visibleByContacts ||
                                              property.visibleByContacts ==
                                                "public") &&
                                            users.properties[property.name] && (
                                              <div
                                                key={`public-field-${userIndex}-${propertyIndex}`}
                                              >
                                                <p>
                                                  <b>{`${property.label}: `}</b>
                                                  {formatDataToString(
                                                    users.properties[
                                                      property.name
                                                    ],
                                                    property
                                                  )}
                                                </p>
                                              </div>
                                            )
                                        )}
                                      </div>
                                    </Col>
                                    {eventUserId !== null && (
                                      <Col xs={24}>
                                        <Button
                                          style={{
                                            backgroundColor: "#363636",
                                            color: "white",
                                          }}
                                          onClick={() => {
                                            this.props.agendarCita(
                                              users._id,
                                              users
                                            );
                                          }}
                                        >
                                          {"Agendar cita"}
                                        </Button>
                                        <Button
                                          style={{
                                            backgroundColor: "#363636",
                                            color: "white",
                                          }}
                                          onClick={async () => {                                       
                                          console.log(users)
                                          let sendResp=  await SendFriendship({
                                            eventUserIdReceiver: users._id,
                                              userName:
                                                users.properties.names ||
                                                users.properties.email,
                                            },this.props.cEventUser.value,this.props.cEvent.value);
                                            console.log("RESPUESTA FRIENDSHIP")
                                            console.log(sendResp)
                                           
                                            let us=this.props.cEventUser.value;
                                            console.log(this.props.cEventUser.value)
                                         
                                            if (sendResp._id) {
                                              let notificationU = {
                                                idReceive: us
                                                  ? us._id
                                                  : users.account_id,
                                                idEmited: sendResp._id,
                                                emailEmited:this.props.cEventUser.value.email                                         ,
                                                message:
                                                  "Te ha enviado solicitud de amistad",
                                                name: "notification.name",
                                                type: "amistad",
                                                state: "0",
                                              };
                                             /* await this.props.notification(
                                                notificationU,
                                                this.props.cEventUser.value._id
                                              );*/
                                            }
                                          }}
                                        >
                                          {"Enviar solicitud de Contacto"}
                                        </Button>
                                      </Col>
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
                    {!this.state.loading && users.length > 0 && (
                      <Pagination
                        items={users}
                        change={this.state.changeItem}
                        onChangePage={this.onChangePage}
                      />
                    )}
                    {!this.state.loading && users.length == 0 && (
                      <Col
                        xs={24}
                        sm={22}
                        md={18}
                        lg={18}
                        xl={18}
                        style={{ margin: "0 auto" }}
                      >
                        <Card style={{textAlign:'center'}} >{"No existen usuarios"}</Card>
                      </Col>
                    )}
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane tab="Mis Contactos" key="mis-contactos">
              <ContactList
                agendarCita={this.props.agendarCita}
                eventId={this.props.cEvent.value._id}
                section={this.props.section}
                tabActive={this.state.activeTab}
              />
            </TabPane>

            <TabPane
              tab={
                <div style={{ position: "relative" }}>
                  Solicitudes de contacto{" "}
                  {this.props.notifyAmis &&
                    this.props.notifyAmis.length > 0 && (
                      <Badge
                        style={{
                          position: "absolute",
                          top: "-21px",
                          right: "-13px",
                        }}
                        count={this.props.notifyAmis.length}
                      ></Badge>
                    )}
                </div>
              }
              key="solicitudes"
            >
              <RequestList
                notify={this.props.notifyAmis}
                currentUser={this.props.currentUser}
                notification={this.props.notification}
                eventId={this.props.cEvent.value._id}
                tabActive={this.state.activeTab}
              />
            </TabPane>

            <TabPane
              tab={
                <div style={{ position: "relative" }}>
                  Solicitudes de citas{" "}
                  {this.props.notifyAgenda &&
                    this.props.notifyAgenda.length > 0 && (
                      <Badge
                        style={{
                          position: "absolute",
                          top: "-21px",
                          right: "-13px",
                        }}
                        count={this.props.notifyAgenda.length}
                      ></Badge>
                    )}
                </div>
              }
              key="solicitudes-de-citas"
            >
              {activeTab === "solicitudes-de-citas" && (
                <AppointmentRequests
                  eventId={this.props.cEvent.value._id}
                  currentEventUserId={eventUserId}
                  currentUser={this.props.currentUser}
                  notificacion={this.props.notification}
                  eventUsers={users}
                />
              )}
            </TabPane>

            <TabPane tab="Mi agenda" key="mi-agenda">
              {activeTab === "mi-agenda" && (
                <MyAgenda
                  event={this.props.cEvent.value}
                  eventUser={eventUser}
                  currentEventUserId={eventUserId}
                  eventUsers={users}
                />
              )}
            </TabPane>
          </Tabs>
        </EventContent>
      </div>
    );
  }
}

let ListEventUserWithContext = withContext(ListEventUser);
export default ListEventUserWithContext;
