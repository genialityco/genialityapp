import React, { Component } from 'react';
import { Card, Tabs, Alert, Spin, message as Message, message } from 'antd';
import RoomController from './controller';
import RoomConfig from './config';
import Service from './service';
import Moment from 'moment';
import * as Cookie from 'js-cookie';

const { TabPane } = Tabs;
class RoomManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //Servicio de firebase
      service: new Service(this.props.firestore),

      // Configuracion del gestor de salas
      isPublished: true,
      hasVideoconference: false,
      activeTab: 'config',
      loading: false,

      // Configuracion de sala
      platform: null,
      meeting_id: null,
      roomStatus: null,
      host_id: null,
      host_name: null,

      // si este valor esta en false no se muestra el listado de host
      // tambien se termina a partir del valor de la variable si se envia un array por host_ids o un string por host_id
      select_host_manual: false,

      // campo para pasar por el request de crear room
      host_ids: [],
      host_list: [
        {
          host_id: 'KthHMroFQK24I97YoqxBZw',
          host_name: 'host1@evius.co',
        },
        {
          host_id: '15DKHS_6TqWIFpwShasM4w',
          host_name: 'host2@evius.co',
        },
        {
          host_id: 'FIRVnSoZR7WMDajgtzf5Uw',
          host_name: 'host3@evius.co',
        },
        {
          host_id: 'YaXq_TW2f791cVpP8og',
          host_name: 'host4@evius.co',
        },
        {
          host_id: 'mSkbi8PmSSqQEWsm6FQiAA',
          host_name: 'host5@evius.co',
        },
      ],

      // Estado de los tabs
      chat: true,
      surveys: false,
      games: false,
      attendees: false,
    };
  }

  componentDidMount = async () => {
    const { event_id, activity_id } = this.props;
    const { host_list } = this.state;

    const host_ids = host_list.map((host) => host.host_id);
    this.setState({ host_ids });

    if (typeof event_id === 'undefined' || typeof activity_id === 'undefined' || activity_id === false) return;

    this.setState({ loading: true });

    // Si valida si existe informacion en Firebase del espacio virtual
    const validation = await this.validationRoom();

    // Si no existe información del espacio virtual en firebase se procede inicializa el documento
    if (!validation) {
      await this.saveConfig();
    }

    this.setState({ loading: false });
  };

  componentDidUpdate = async (prevProps) => {
    // Se escucha el cambio de activity_id esto sucede cuando se crea una actividad nueva
    if (prevProps.activity_id !== this.props.activity_id) {
      // Si valida si existe informacion en Firebase del espacio virtual
      const validation = await this.validationRoom();

      // Si no existe información del espacio virtual en firebase se procede inicializa el documento
      if (!validation) {
        await this.saveConfig();
      }
    }
  };

  // validacion de existencia de sala e inicializacion de estado
  validationRoom = async () => {
    const { event_id, activity_id } = this.props;
    const { service } = this.state;

    const hasVideoconference = await service.validateHasVideoconference(event_id, activity_id);

    if (hasVideoconference) {
      const configuration = await service.getConfiguration(event_id, activity_id);

      this.setState({
        isPublished: typeof configuration.isPublished !== 'undefined' ? configuration.isPublished : true,
        platform: configuration.platform ? configuration.platform : null,
        meeting_id: configuration.meeting_id ? configuration.meeting_id : null,
        roomStatus: configuration.habilitar_ingreso,
        chat: configuration.tabs && configuration.tabs.chat ? configuration.tabs.chat : false,
        surveys: configuration.tabs && configuration.tabs.surveys ? configuration.tabs.surveys : false,
        games: configuration.tabs && configuration.tabs.games ? configuration.tabs.games : false,
        attendees: configuration.tabs && configuration.tabs.attendees ? configuration.tabs.attendees : false,
        host_id: typeof configuration.host_id !== 'undefined' ? configuration.host_id : null,
        host_name: typeof configuration.host_name !== 'undefined' ? configuration.host_name : null,
      });

      // Si en firebase ya esta inicializado el campo platfom y meeting_id se habilita el tab controller
      if (
        configuration.platform !== null &&
        configuration.platform !== '' &&
        configuration.meeting_id !== null &&
        configuration.meeting_id !== ''
      ) {
        this.setState({ hasVideoconference: true, activeTab: 'controller' });
      }
      return true;
    } else {
      return false;
    }
  };

  // Engargado de la navegacion entre los tabs del administrado de salas
  handleTab = (tab) => {
    this.setState({ activeTab: tab });
  };

  // Encargado de gestionar los estados de la videoConferencia
  // Estados: open_meeting_room, closed_meeting_room, ended_meeting_room
  handleRoomState = (e) => {
    this.setState({ roomStatus: e.target.value }, async () => await this.saveConfig());
  };

  // Encargado de gestionar los tabs de la video conferencia
  handleTabsController = (e, tab) => {
    const valueTab = e.target.value === 'true' ? true : false;
    const { chat, surveys, games, attendees } = this.state;
    const tabs = { chat, surveys, games, attendees };

    if (tab === 'chat') {
      tabs.chat = valueTab;
      this.setState({ chat: valueTab }, async () => await this.saveConfig());
    } else if (tab === 'surveys') {
      tabs.surveys = valueTab;
      this.setState({ surveys: valueTab }, async () => await this.saveConfig());
    } else if (tab === 'games') {
      tabs.games = valueTab;
      this.setState({ games: valueTab }, async () => await this.saveConfig());
    } else if (tab === 'attendees') {
      tabs.attendees = valueTab;
      this.setState({ attendees: valueTab }, async () => await this.saveConfig());
    }
  };

  // Encargado de recibir los cambios de los input y select
  handleChange = (e) => {
    if (e.target.name === 'isPublished') {
      const isPublished = e.target.value === 'true' ? true : false;
      this.setState({ [e.target.name]: isPublished }, async () => await this.saveConfig());
    } else if (e.target.name === 'select_host_manual') {
      const select_host_manual = e.target.value === 'true' ? true : false;
      this.setState({ [e.target.name]: select_host_manual });
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }
  };

  //Preparacion de la data para guardar en firebase
  prepareData = () => {
    const {
      roomStatus,
      platform,
      meeting_id,
      chat,
      surveys,
      games,
      attendees,
      isPublished,
      host_id,
      host_name,
    } = this.state;
    const roomInfo = { roomStatus, platform, meeting_id, isPublished, host_id, host_name };
    const tabs = { chat, surveys, games, attendees };
    return { roomInfo, tabs };
  };

  // Se usa al eliminar una sala de zoom, elimnar la informacion asociada a ella, se mantiene la configuración de la misma
  restartData = () => {
    const { roomStatus, chat, surveys, games, attendees, isPublished } = this.state;
    const roomInfo = {
      roomStatus,
      isPublished,
      platform: null,
      meeting_id: null,
      host_id: null,
      host_name: null,
    };
    const tabs = { chat, surveys, games, attendees };

    this.setState({
      platform: '',
      meeting_id: '',
      host_id: null,
      host_name: null,
      hasVideoconference: false,
    });

    return { roomInfo, tabs };
  };

  // Método para guarda la información de la configuración
  saveConfig = async () => {
    const { event_id, activity_id } = this.props;

    /* Se valida si hay cambios pendientes por guardar en la fecha/hora de la actividad */
    const { roomInfo, tabs } = this.prepareData();
    const { service } = this.state;

    const result = await service.createOrUpdateActivity(event_id, activity_id, roomInfo, tabs);

    if (result) Message.success(result.message);

    if (result.state && result.state === 'updated' && roomInfo.meeting_id !== null && roomInfo.platform !== null) {
      this.setState({ hasVideoconference: true });
    }
  };

  //
  handleClickSaveConfig = async () => {
    const { event_id, activity_id, pendingChangesSave } = this.props;

    /* Se valida si hay cambios pendientes por guardar en la fecha/hora de la actividad */
    if (!pendingChangesSave) {
      const { service, platform, meeting_id } = this.state;

      // Validación de los campos requeridos
      if (platform === '' || platform === null || meeting_id === '' || meeting_id === null) {
        message.warning('Seleccione una plataforma e ingrese el id de la videoconferencia');
        return false;
      }

      // Se utiliza solo cuando el usuario guarda de manera manual el id del evento en zoom o zoomExterno
      if (platform === 'zoom' || platform === 'zoomExterno') {
        const data = {
          event_id,
          activity_id,
          meeting_id,
        };
        const response = await service.getZoomRoom(data);
        console.log('get', response);
        if (
          Object.keys(response).length > 0 &&
          typeof response.meeting_id !== 'undefined' &&
          typeof response.zoom_host_id !== 'undefined' &&
          typeof response.zoom_host_name !== 'undefined'
        ) {
          this.setState({ host_id: response.zoom_host_id, host_name: response.zoom_host_name });
        } else {
          message.error('El id de la videoconferencia NO es valido');
          return false;
        }
      }

      //Si las validaciones  son aprobadas  se procede a salvar en firebase
      await this.saveConfig();
    } else {
      message.warning('Cambios pendientes por guardar en la fecha y hora de la actividad');
    }
  };

  // Create Room Zoom
  createZoomRoom = async () => {
    this.validateForCreateZoomRoom();
    const evius_token = Cookie.get('evius_token');
    const { activity_id, activity_name, event_id, date_start_zoom, date_end_zoom } = this.props;
    const { select_host_manual, host_id, host_ids } = this.state;
    const host_field = select_host_manual ? 'host_id' : 'host_ids';
    const host_value = select_host_manual ? host_id : host_ids;

    const body = {
      token: evius_token,
      activity_id,
      activity_name,
      event_id: event_id,
      agenda: activity_name,
      date_start_zoom,
      date_end_zoom,
      [host_field]: host_value,
    };
    const response = await this.state.service.setZoomRoom(evius_token, body);
    console.log('set response:', response);
    if (
      Object.keys(response).length > 0 &&
      typeof response.meeting_id !== 'undefined' &&
      typeof response.zoom_host_id !== 'undefined' &&
      typeof response.zoom_host_name !== 'undefined'
    ) {
      console.log('Request Success!!');
      const { meeting_id, zoom_host_id, zoom_host_name } = response;
      this.setState(
        {
          meeting_id,
          host_id: zoom_host_id,
          host_name: zoom_host_name,
        },
        async () => await this.saveConfig()
      );
    } else {
      message.warning('Hubo un problema, espere unos segundos y vuelva a intentarlo');
    }
  };

  // Se ejecuta cuando se solicita la creación de una trasmisión de manera automática
  validateForCreateZoomRoom = () => {
    const { event_id, activity_id, pendingChangesSave } = this.props;

    /* Se valida si hay cambios pendientes por guardar en la fecha/hora de la actividad */
    if (pendingChangesSave) {
      message.warning('Cambios pendientes por guardar en la fecha y hora de la actividad');
      return false;
    }
    //Esta validacion aplcia para actividades creadas antes de el backend devolviera los campos date_start_zoom y date_end_zoom
    if (typeof this.props.date_start_zoom === 'undefined' || typeof this.props.date_end_zoom === 'undefined') {
      Message.error('Guarde primero la actividad antes de continuar');
      return false;
    }
    if (!Moment(this.props.date_start_zoom).isValid()) {
      Message.error('La fecha de inicio no es valida');
      return false;
    }
    if (!Moment(this.props.date_end_zoom).isValid()) {
      Message.error('La fecha de finalización no es valida');
      return false;
    }
  };

  //Eliminar trasmisión de zoom
  deleteZoomRoom = () => {
    const { service, meeting_id, platform } = this.state;
    const { event_id, activity_id } = this.props;
    if (platform === 'zoom' || platform === 'zoomExterno') {
      const updatedData = service.deleteZoomRoom(event_id, meeting_id);
      console.log('before delete', updatedData);
    }
    const response = this.restartData();
    const { roomInfo, tabs } = response;
    service.createOrUpdateActivity(event_id, activity_id, roomInfo, tabs);
  };

  render() {
    const {
      activeTab,
      hasVideoconference,
      platform,
      host_name,
      roomStatus,
      loading,
      chat,
      surveys,
      games,
      attendees,
      meeting_id,
      isPublished,
      select_host_manual,
      host_list,
      host_id,
    } = this.state;
    const { event_id, activity_id, activity_name } = this.props;
    return (
      <Card title={activity_name}>
        {typeof event_id === 'undefined' || typeof activity_id === 'undefined' || activity_id === false ? (
          <>
            <Alert
              message='Primero cree la actividad y luego podrá crear una conferencia virtual asociada'
              type='warning'
            />
          </>
        ) : (
          <Tabs defaultActiveKey={activeTab} activeKey={activeTab} onChange={this.handleTab}>
            <TabPane tab='Configuración' key='config'>
              {loading ? (
                <Spin />
              ) : (
                <RoomConfig
                  host_id={host_id}
                  host_name={host_name}
                  host_list={host_list}
                  meeting_id={meeting_id}
                  platform={platform}
                  select_host_manual={select_host_manual}
                  hasVideoconference={hasVideoconference}
                  handleChange={this.handleChange}
                  handleClick={this.handleClickSaveConfig}
                  createZoomRoom={this.createZoomRoom}
                  deleteZoomRoom={this.deleteZoomRoom}
                />
              )}
            </TabPane>
            {hasVideoconference && (
              <TabPane tab='Controlador' key='controller'>
                {loading ? (
                  <Spin />
                ) : (
                  <RoomController
                    platform={platform}
                    roomStatus={roomStatus}
                    isPublished={isPublished}
                    attendees={attendees}
                    chat={chat}
                    surveys={surveys}
                    games={games}
                    handleChange={this.handleChange}
                    handleRoomState={this.handleRoomState}
                    handleTabsController={this.handleTabsController}
                  />
                )}
              </TabPane>
            )}
          </Tabs>
        )}
      </Card>
    );
  }
}

export default RoomManager;
