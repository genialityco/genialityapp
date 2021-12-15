import React, { Component, Fragment } from 'react';
import { Redirect, withRouter, Link } from 'react-router-dom';
import Moment from 'moment';
import EviusReactQuill from '../shared/eviusReactQuill';
import { DateTimePicker } from 'react-widgets';
import Select from 'react-select';
import Creatable from 'react-select';
import Loading from '../loaders/loading';
import {
  Tabs,
  message,
  Row,
  Col,
  Checkbox,
  Space,
  Typography,
  Button,
  Form,
  Input,
  Switch,
  Empty,
  Card,
  Image,
  Modal,
} from 'antd';
import RoomManager from './roomManager';
import SurveyManager from './surveyManager';
import { DeleteOutlined, ExclamationCircleOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import Header from '../../antdComponents/Header';
import RoomController from '../agenda/roomManager/controller';
// En revision vista previa
//import ZoomComponent from '../events/zoomComponent';

import {
  AgendaApi,
  CategoriesAgendaApi,
  RolAttApi,
  SpacesApi,
  SpeakersApi,
  TypesAgendaApi,
  DocumentsApi,
  eventTicketsApi,
  getCurrentUser,
} from '../../helpers/request';
import { fieldsSelect, handleRequestError, handleSelect, sweetAlert, uploadImage } from '../../helpers/utils';
import Dropzone from 'react-dropzone';
import { Select as SelectAntd } from 'antd';
import 'react-tabs/style/react-tabs.css';
import AgendaLanguaje from './language/index';
import { firestore } from '../../helpers/firebase';
import SurveyExternal from './surveyExternal';
import Service from './roomManager/service';
import AgendaContext from '../../Context/AgendaContext';
const { TabPane } = Tabs;
const { confirm } = Modal;

const formLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const { Option } = SelectAntd;

class AgendaEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      // Estado para la redireccion de navegacion interna al eliminar actividad o volver al listado de actividades.
      redirect: false,
      isLoading: { types: true, categories: true },
      name: '',
      subtitle: '',
      bigmaker_meeting_id: null,
      has_date: '',
      description: '',
      registration_message: '',
      date: Moment(new Date()).format('YYYY-MM-DD'),
      hour_start: new Date(),
      hour_end: new Date(),
      key: new Date(),
      image: '',
      locale: 'en',
      capacity: 0,
      type_id: '',
      space_id: '',
      access_restriction_type: 'OPEN',
      selectedCategories: [],
      selectedHosts: [],
      selectedType: '',
      selectedRol: [],
      days: [],
      spaces: [],
      categories: [],
      start_url: '',
      join_url: '',
      meeting_id: '',
      documents: [],
      types: [],
      roles: [],
      hosts: [],
      selected_document: [],
      nameDocuments: [],
      tickets: [],
      selectedTicket: [],
      vimeo_id: '',
      isExternal: false,
      service: new Service(firestore),
      externalSurveyID: '',
      length: '',
      latitude: '',
      isPhysical: false,

      //Estado para detectar cambios en la fecha/hora de la actividad sin guardar
      pendingChangesSave: false,

      // Fechas de la actividad con formato para la creacion de sala en zoom
      date_start_zoom: null,
      date_end_zoom: null,

      //Estado para determinar si una actividad requiere registro para ser accedida
      requires_registration: false,
      isPublished: true,
      avalibleGames: [],
      roomStatus: null,
      /* platform,
      meeting_id, */
      chat: false,
      surveys: false,
      games: false,
      attendees: false,
      host_id: null,
      host_name: null,
      habilitar_ingreso: '',
    };
    this.name = React.createRef();
    this.selectTickets = this.selectTickets.bind(this);
  }
  static contextType = AgendaContext;

  // VALIDAR SI TIENE ENCUESTAS EXTERNAS
  validateRoom = async () => {
    const { service } = this.state;
    const activity_id=this.context.activityEdit;
    const hasVideoconference = await service.validateHasVideoconference(this.props.event._id, activity_id);
    if (hasVideoconference) {
      const configuration = await service.getConfiguration(this.props.event._id, activity_id);
      console.log('configuration', configuration);
      this.setState({
        isExternal: configuration.platform && configuration.platform === 'zoomExterno' ? true : false,
        externalSurveyID: configuration.meeting_id ? configuration.meeting_id : null,
        isPublished: typeof configuration.isPublished !== 'undefined' ? configuration.isPublished : true,
        platform: configuration.platform ? configuration.platform : null,
        meeting_id: configuration.meeting_id ? configuration.meeting_id : null,
        roomStatus: configuration.roomStatus || null,
        avalibleGames: configuration.avalibleGames || [],
        chat: configuration.tabs && configuration.tabs.chat ? configuration.tabs.chat : false,
        surveys: configuration.tabs && configuration.tabs.surveys ? configuration.tabs.surveys : false,
        games: configuration.tabs && configuration.tabs.games ? configuration.tabs.games : false,
        attendees: configuration.tabs && configuration.tabs.attendees ? configuration.tabs.attendees : false,
        host_id: typeof configuration.host_id !== 'undefined' ? configuration.host_id : null,
        host_name: typeof configuration.host_name !== 'undefined' ? configuration.host_name : null,
        habilitar_ingreso: configuration.habilitar_ingreso ? configuration.habilitar_ingreso : '',
      });
    }
  };

  toggleConference = (isVisible) => {
    this.setState({ conferenceVisible: isVisible });
  };

  async componentDidMount() {
    const {
      event,
      location: { state },
    } = this.props;
    let days = [];
    const ticketEvent = [];
    let vimeo_id = '';
    try {
      const tickets = await eventTicketsApi.getAll(event?._id);
      for (let i = 0; tickets.length > i; i++) {
        ticketEvent.push({
          item: tickets[i],
          label: tickets[i].title,
          value: tickets[i]._id,
        });
      }

      vimeo_id = event.vimeo_id ? event.vimeo_id : '';
      this.setState({
        tickets: ticketEvent,
        /* platform: event.event_platform, */
        vimeo_id: vimeo_id,
      });

      //Si existe dates, itera sobre el array de fechas especificas, dandole el formato especifico
      if (event.dates && event.dates.length > 0) {
        let date = event.dates;
        Date.parse(date);

        for (var i = 0; i < date.length; i++) {
          let formatDate = Moment(date[i], ['YYYY-MM-DD']).format('YYYY-MM-DD');
          if (Date.parse(formatDate) >= Date.parse(Moment(new Date()).format('YYYY-MM-DD'))) {
            days.push({ value: formatDate, label: formatDate });
          }
        }
        //Si no, recibe la fecha inicio y la fecha fin y le da el formato especifico a mostrar
      } else {
        const init = Moment(event.date_start);
        const end = Moment(event.date_end);
        const diff = end.diff(init, 'days');
        //Se hace un for para sacar los días desde el inicio hasta el fin, inclusivos
        for (let i = 0; i < diff + 1; i++) {
          let formatDate = Moment(init)
            .add(i, 'd')
            .format('YYYY-MM-DD');
          if (Date.parse(formatDate) >= Date.parse(Moment(new Date()).format('YYYY-MM-DD'))) {
            days.push({ value: formatDate, label: formatDate });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    let documents = await DocumentsApi.byEvent(event._id);

    let nameDocuments = [];
    for (let i = 0; i < documents.length; i += 1) {
      nameDocuments.push({
        ...documents[i],
        value: documents[i].title,
        label: documents[i].title,
      });
    }
    this.setState({ nameDocuments });

    let spaces = await SpacesApi.byEvent(this.props.event._id);
    let hosts = await SpeakersApi.byEvent(this.props.event._id);

    let roles = await RolAttApi.byEvent(this.props.event._id);
    let categories = await CategoriesAgendaApi.byEvent(this.props.event._id);
    let types = await TypesAgendaApi.byEvent(this.props.event._id);

    //La información se neceista de tipo [{label,value}] para los select
    spaces = handleSelect(spaces);
    hosts = handleSelect(hosts);
    roles = handleSelect(roles);
    categories = handleSelect(categories);
    types = handleSelect(types);

    if (state?.edit) {
      this.context.setActivityEdit(state.edit);
      const info = await AgendaApi.getOne(state.edit, event._id);
      this.setState({
        selected_document: info.selected_document,
        start_url: info.start_url,
        join_url: info.join_url,
        platform: info.platform /*  || event.event_platform */,
        info: info,
        space_id: info.space_id || '',
        video: info.video,
        name_host: info.name_host,
        date_start_zoom: info.date_start_zoom,
        date_end_zoom: info.date_end_zoom,
        requires_registration: info.requires_registration || false,
      });

      Object.keys(this.state).map((key) => (info[key] ? this.setState({ [key]: info[key] }) : ''));
      console.log(
        Object.keys(this.state).map((key) => info[key]),
        'ObjectKey'
      );
      const { date, hour_start, hour_end } = handleDate(info);

      let currentUser = await getCurrentUser();
      this.setState({
        activity_id: state.edit,
        date,
        hour_start,
        hour_end,
        selectedHosts: fieldsSelect(info.host_ids, hosts),
        selectedTickets: info.selectedTicket ? info.selectedTicket : [],
        selectedRol: fieldsSelect(info.access_restriction_rol_ids, roles),
        selectedType: fieldsSelect(info.type_id, types),
        selectedCategories: fieldsSelect(info.activity_categories_ids, categories),
        currentUser: currentUser,
      });
    } else {
      this.setState({ days });
    }

    const isLoading = { types: false, categories: false };
    this.setState({
      days,
      spaces,
      hosts,
      categories,
      types,
      roles,
      loading: false,
      isLoading,
    });

    this.name?.current?.focus();
    this.validateRoom();

    /* console.log('isPublished=>>', this.state.isPublished); */
  }

  async componentDidUpdate(prevProps) {
    if (prevProps) {
    }
  }

  handlePhysical = () => {
    let isPhysical = this.state.isPhysical;
    this.setState({ isPhysical: !isPhysical });
  };

  //FN general para cambio en input
  handleChange = async (value, name) => {
    if (!name) {
      name = value.target.name;
      value = value.target.value;
    }
    if (name === 'requires_registration') {
      value = value.target.checked;
    } else if (name === 'isPublished') {
      this.context.setIsPublished(value)
      await this.saveConfig();
    } else {
      this.setState({ [name]: value });
    }
  };

  //FN para cambio en campo de fecha
  handleChangeDate = (value, name) => {
    this.setState({ [name]: value, pendingChangesSave: true });
  };
  //Cada select tiene su propia función para evitar errores y asegurar la información correcta
  selectType = (value) => {
    this.setState({ selectedType: value });
  };
  selectCategory = (selectedCategories) => {
    this.setState({ selectedCategories });
  };
  selectHost = (selectedHosts) => {
    this.setState({ selectedHosts });
  };
  selectRol = (selectedRol) => {
    this.setState({ selectedRol });
  };

  selectDocuments = (selected_document) => {
    this.setState({ selected_document });
  };
  //FN para los select que permiten crear opción
  handleCreate = async (value, name) => {
    const loading = message.open({
      key: 'loading',
      type: 'loading',
      content: <> Por favor espere miestras guarda la información..</>,
    });
    try {
      this.setState({ isLoading: { ...this.isLoading, [name]: true } });
      //Se revisa a que ruta apuntar
      const item =
        name === 'types'
          ? await TypesAgendaApi.create(this.props.event._id, { name: value })
          : await CategoriesAgendaApi.create(this.props.event._id, {
              name: value,
            });
      const newOption = { label: value, value: item._id, item };
      this.setState(
        (prevState) => ({
          isLoading: { ...prevState.isLoading, [name]: false },
          [name]: [...prevState[name], newOption],
        }),
        () => {
          if (name === 'types') this.setState({ selectedType: newOption });
          else
            this.setState((state) => ({
              selectedCategories: [...state.selectedCategories, newOption],
            }));
        }
      );
      message.destroy(loading.key);
      message.open({
        type: 'success',
        content: <> Información guardada correctamente!</>,
      });
    } catch (e) {
      this.setState((prevState) => ({
        isLoading: { ...prevState.isLoading, [name]: false },
      }));
      message.destroy(loading.key);
      message.open({
        type: 'error',
        content: handleRequestError(e).message,
      });
    }
  };
  //FN manejo de imagen input, la carga al sistema y la guarda en base64
  changeImg = async (files) => {
    const loading = message.open({
      key: 'loading',
      type: 'loading',
      content: <> Por favor espere miestras carga la imagen..</>,
    });
    try {
      const file = files[0];
      if (file) {
        const image = await uploadImage(file);
        this.setState({ image });
      } else {
        this.setState({
          errImg: 'Only images files allowed. Please try again :)',
        });
      }
      message.destroy(loading.key);
      message.open({
        type: 'success',
        content: <> Imagen cargada correctamente!</>,
      });
    } catch (e) {
      message.destroy(loading.key);
      message.open({
        type: 'error',
        content: handleRequestError(e).message,
      });
    }
  };

  //FN para el editor enriquecido
  chgTxt = (content) => this.setState({ description: content });

  // registrationMessage = (content) => {
  //   this.setState({ registration_message: content })
  // }

  //Envío de información

  submit = async () => {
    const loading = message.open({
      key: 'loading',
      type: 'loading',
      content: <> Por favor espere miestras se guarda la información..</>,
    });
    const validation = this.validForm();
    if (validation) {
      try {
        const info = this.buildInfo();

        const {
          event,
          location: { state },
        } = this.props;
        const { selected_document } = this.state;
        this.setState({ isLoading: true });

        if (state.edit) {
          const data = {
            activity_id: state.edit,
          };
          const result = await AgendaApi.editOne(info, state.edit, event._id);

          //Se actualizan los estados date_start_zoom y date_end_zoom para que componente de administracion actualice el valor pasado por props
          this.setState({
            date_start_zoom: result.date_start_zoom,
            date_end_zoom: result.date_end_zoom,
          });

          for (let i = 0; i < selected_document?.length; i++) {
            await DocumentsApi.editOne(data, selected_document[i]._id, event._id);
          }
        } else {
          const agenda = await AgendaApi.create(event._id, info);
          // Al crear una actividad de la agenda se inicializa el id de la actividad y las fechas de inicio y finalizacion como requisito del componente de administrador de salas
          this.setState({
            activity_id: agenda._id,
            date_start_zoom: agenda.date_start_zoom,
            date_end_zoom: agenda.date_end_zoom,
          });
        }

        //Se cambia el estado a pendingChangesSave encargado de detectar cambios pendientes en la fecha/hora sin guardar
        this.setState({ pendingChangesSave: false });

        message.destroy(loading.key);
        message.open({
          type: 'success',
          content: <> Información guardada correctamente!</>,
        });
        this.props.history.push(`/eventadmin/${event._id}/agenda`);
      } catch (e) {
        message.destroy(loading.key);
        message.open({
          type: 'error',
          content: handleRequestError(e).message,
        });
      }
    }
  };

  //Función para duplicar la data para traducir, pero esta no funciona actualmente, da error 800
  submit2 = async () => {
    if (this.validForm()) {
      try {
        const info = this.buildInfoLanguage();

        sweetAlert.showLoading('Espera (:', 'Guardando...');
        const {
          event,
          location: { state },
        } = this.props;
        this.setState({ isLoading: true });
        if (state.edit) await AgendaApi.editOne(info, state.edit, event._id);
        else {
          const agenda = await AgendaApi.create(event._id, info);
          this.setState({ activity_id: agenda._id });
          /* this.props.history.push(`/eventadmin/${event._id}/agenda`); */
        }
        sweetAlert.hideLoading();
        sweetAlert.showSuccess('Información guardada');
      } catch (e) {
        sweetAlert.showError(handleRequestError(e));
      }
    }
  };

  buildInfoLanguage = () => {
    const {
      name,
      subtitle,
      bigmaker_meeting_id,
      has_date,
      hour_start,
      hour_end,
      date,
      space_id,
      capacity,
      access_restriction_type,
      selectedCategories,
      requires_registration,
      selectedType,
      selectedRol,
      description,
      registration_message,
      selected_document,
      image,
      length,
      latitude,
      isPublished,
    } = this.state;
    const datetime_start = date + ' ' + Moment(hour_start).format('HH:mm');
    const datetime_end = date + ' ' + Moment(hour_end).format('HH:mm');
    const activity_categories_ids = selectedCategories.length > 0 ? selectedCategories.map(({ value }) => value) : [];
    const access_restriction_rol_ids = access_restriction_type !== 'OPEN' ? selectedRol.map(({ value }) => value) : [];

    const type_id = selectedType.value;
    return {
      name,
      subtitle,
      bigmaker_meeting_id,
      datetime_start,
      datetime_end,
      space_id,
      image,
      description,
      registration_message,
      capacity: parseInt(capacity, 10),
      activity_categories_ids,
      access_restriction_type,
      access_restriction_rol_ids,
      type_id,
      has_date,
      selected_document,
      requires_registration,
      isPublished,
      length,
      latitude,
    };
  };

  //FN para construir la información a enviar al api
  buildInfo = () => {
    const {
      name,
      subtitle,
      bigmaker_meeting_id,
      has_date,
      hour_start,
      hour_end,
      date,
      space_id,
      capacity,
      access_restriction_type,
      selectedCategories,
      selectedHosts,
      selectedType,
      selectedRol,
      description,
      registration_message,
      selected_document,
      image,
      meeting_id,
      video,
      selectedTicket,
      vimeo_id,
      platform,
      start_url,
      join_url,
      name_host,
      key,
      requires_registration,
      isPublished,
      length,
      latitude,
    } = this.state;

    //const registration_message_storage = window.sessionStorage.getItem('registration_message');
    //const description_storage = window.sessionStorage.getItem('description');
    /* console.log(date, '========================== date'); */
    const datetime_start = date + ' ' + Moment(hour_start).format('HH:mm');
    const datetime_end = date + ' ' + Moment(hour_end).format('HH:mm');
    const activity_categories_ids =
      selectedCategories !== undefined
        ? selectedCategories[0] === undefined
          ? []
          : selectedCategories.map(({ value }) => value)
        : [];

    const access_restriction_rol_ids = access_restriction_type !== 'OPEN' ? selectedRol.map(({ value }) => value) : [];
    const host_ids = selectedHosts >= 0 ? [] : selectedHosts?.filter((host) => host != null).map(({ value }) => value);
    const type_id = selectedType === undefined ? '' : selectedType.value;
    return {
      name,
      subtitle,
      bigmaker_meeting_id,
      datetime_start,
      datetime_end,
      space_id,
      image,
      description,
      registration_message,
      capacity: parseInt(capacity, 10),
      activity_categories_ids,
      access_restriction_type,
      access_restriction_rol_ids,
      type_id,
      has_date,
      timeConference: '',
      selected_document,
      meeting_id: meeting_id,
      vimeo_id: vimeo_id,
      video,
      selectedTicket,
      platform,
      start_url,
      join_url,
      name_host,
      key,
      requires_registration,
      isPublished,
      host_ids,
      length,
      latitude,
    };
  };

  //FN para eliminar la actividad
  remove = async () => {
    const loading = message.open({
      key: 'loading',
      type: 'loading',
      content: <> Por favor espere miestras borra la información..</>,
    });
    if (this.state.activity_id) {
      confirm({
        title: `¿Está seguro de eliminar la información?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Una vez eliminado, no lo podrá recuperar',
        okText: 'Borrar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk() {
          const onHandlerRemove = async () => {
            try {
              await AgendaApi.deleteOne(this.state.activity_id, this.props.event._id);
              message.destroy(loading.key);
              message.open({
                type: 'success',
                content: <> Se eliminó la información correctamente!</>,
              });
              this.setState({ redirect: true });
              history.push(`${props.matchUrl}`);
            } catch (e) {
              message.destroy(loading.key);
              message.open({
                type: 'error',
                content: handleRequestError(e).message,
              });
            }
          };
          onHandlerRemove();
        },
      });
    }
  };

  //Validación de campos

  validForm = () => {
    let title = [];
    if (this.state.name.length <= 0) title.push('El nombre es requerido');

    if (this.state.date === '' || this.state.date === 'Invalid date') title.push('Seleccione el día');

    if (this.state.hour_start === '' || this.state.hour_start === 'Invalid date')
      title.push('Seleccione una hora de inicio valida');

    if (this.state.hour_end === '' || this.state.hour_end === 'Invalid date')
      title.push('Seleccione una hora de finalización valida');

    if (this.state.hour_start > this.state.hour_end) title.push('La hora de inicio no puede ser mayor a la hora fin');

    /* if ((this.state.hour_start < new Date()) && (this.state.date <= Moment(new Date()).format('YYYY-MM-DD')))
      title.push('La hora no puede ser menor a la hora actual');*/

    if (title.length > 0) {
      //   sweetAlert.twoButton(title, "warning", false, "OK", () => { });
      title.map((item) => {
        message.warning(item);
      });
    } else return true;
  };

  //FN para ir a una ruta específica (ruedas en los select)
  goSection = (path, state) => {
    this.props.history.push(path, state);
  };

  //FN agrega todos los roles
  addRoles = () => {
    if (this.state.roles.length !== this.state.selectedRol)
      this.setState((prevState) => ({ selectedRol: prevState.roles }));
  };

  goBack = () => this.setState({ redirect: true });

  selectTickets(tickets) {
    this.setState({ selectedTicket: tickets });
  }

  handleChangeReactQuill = (e, label) => {
    if (label === 'description') {
      this.setState({ description: e });
    } else if (label === 'registration_message') {
      this.setState({ registration_message: e });
    }
  };

  handleVideoConference = () => {
    //Verificar si existe el campo si no se crea
  };

  prepareData = () => {
    const {
      roomStatus,
      platform,
      meeting_id,
      chat,
      surveys,
      games,
      attendees,
      host_id,
      host_name,
      avalibleGames,
    } = this.context;

    const { isPublished } = this.state;

    const roomInfo = {
      platform,
      meeting_id,
      isPublished,
      host_id,
      host_name,
      avalibleGames,
      habilitar_ingreso: roomStatus,
    };
    const tabs = { chat, surveys, games, attendees };
    return { roomInfo, tabs };
  };

  // Método para guarda la información de la configuración
  saveConfig = async () => {
    const { roomInfo, tabs } = this.prepareData();
    const { service } = this.state;
    const activity_id=this.context.activityEdit;   
    try {
      const result = await service.createOrUpdateActivity(this.props.event._id, activity_id, roomInfo, tabs);
      if (result) message.success(result.message);
      return result;
    } catch (err) {
      message.error('Error Config', err);
    }
  };

  handleGamesSelected = async (status, itemId, listOfGames) => {
    if (status === 'newOrUpdate') {
      this.setState({ avalibleGames: listOfGames }, async () => await this.saveConfig());
    } else {
      const newData = [];
      listOfGames.forEach((items) => {
        if (items.id === itemId) {
          newData.push({ ...items, showGame: status });
        } else {
          newData.push({ ...items });
        }
      });
      this.context.setAvailableGames(newData);
      this.setState({ avalibleGames: newData }, async () => await this.saveConfig());
    }
  };

  // Encargado de gestionar los tabs de la video conferencia
  handleTabsController = (e, tab) => {
    const valueTab = e;
    const { chat, surveys, games, attendees } = this.context;
    const tabs = { chat, surveys, games, attendees };

    //
    // return true;

    if (tab === 'chat') {
      tabs.chat = valueTab;
      this.context.setChat(valueTab);
      this.setState({ chat: valueTab }, async () => await this.saveConfig());
    } else if (tab === 'surveys') {
      tabs.surveys = valueTab;
      this.context.setSurveys(valueTab);
      this.setState({ surveys: valueTab }, async () => await this.saveConfig());
    } else if (tab === 'games') {
      tabs.games = valueTab;
      this.context.setGames(valueTab);
      this.setState({ games: valueTab }, async () => await this.saveConfig());
    } else if (tab === 'attendees') {
      tabs.attendees = valueTab;
      this.context.setAttendees(valueTab);
      this.setState({ attendees: valueTab }, async () => await this.saveConfig());
    }
  };

  handleRoomState = (e) => {
    this.setState({ roomStatus: e }, async () => await this.saveConfig());
  };

  render() {
    const {
      name,
      nameDocuments,
      selected_document,
      date,
      hour_start,
      hour_end,
      image,
      space_id,
      selectedHosts,
      selectedType,
      selectedCategories,
      video,
      hosts,
      spaces,
      categories,
      types,
      isLoading,
      date_start_zoom,
      date_end_zoom,
      length,
      isPublished,
      latitude,
    } = this.state;
    const { matchUrl } = this.props;
    if (!this.props.location.state || this.state.redirect) return <Redirect to={matchUrl} />;
    return (
      <>
        <Form onFinish={this.submit} {...formLayout}>
          <Header
            title={`Actividad - ${this.state.name}`}
            back
            save
            form
            remove={this.remove}
            edit={this.props.location.state.edit}
            extra={
              <Form.Item label={'Publicar'} labelCol={{ span: 14 }}>
                <Switch
                  checkedChildren='Sí'
                  unCheckedChildren='No'
                  name={'isPublished'}
                  checked={this.context.isPublished}
                  onChange={(e) => this.handleChange(e, 'isPublished')}
                />
              </Form.Item>
            }
          />
          <Tabs defaultActiveKey='1'>
            <TabPane tab='Agenda' key='1'>
              <Row justify='center' wrap gutter={12}>
                <Col span={20}>
                  <Form.Item label={'Nombre'}>
                    <Input
                      ref={this.name}
                      autoFocus
                      type='text'
                      name={'name'}
                      value={name}
                      onChange={(e) => this.handleChange(e)}
                      placeholder={'Nombre de la actividad'}
                    />
                  </Form.Item>
                  <Form.Item label={'Día'}>
                    <SelectAntd
                      name='date'
                      options={this.state.days}
                      defaultValue={date}
                      value={date}
                      onChange={(value) => this.handleChangeDate(value, 'date')}
                    />
                  </Form.Item>
                  <Row wrap justify='space-between' gutter={[8, 8]}>
                    <Col>
                      <Form.Item label={'Hora Inicio'}>
                        <DateTimePicker
                          value={hour_start}
                          dropUp
                          step={15}
                          date={false}
                          onChange={(value) => this.handleChangeDate(value, 'hour_start')}
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item label={'Hora Fin'}>
                        <DateTimePicker
                          value={hour_end}
                          dropUp
                          step={15}
                          date={false}
                          onChange={(value) => this.handleChangeDate(value, 'hour_end')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label={'Conferencista'}>
                    <Row wrap gutter={[8, 8]}>
                      <Col span={23}>
                        <Select
                          id={'hosts'}
                          isClearable
                          isMulti
                          styles={creatableStyles}
                          onChange={this.selectHost}
                          options={hosts}
                          value={selectedHosts}
                        />
                      </Col>
                      <Col span={1}>
                        <Button
                          onClick={() => this.goSection(matchUrl.replace('agenda', 'speakers'), { child: true })}
                          icon={<SettingOutlined />}
                        />
                      </Col>
                    </Row>
                  </Form.Item>
                  <Form.Item label={'Espacio'}>
                    <Row wrap gutter={[8, 8]}>
                      <Col span={23}>
                        <SelectAntd
                          name={'space_id'}
                          value={space_id}
                          onChange={(e) => this.handleChange(e, 'space_id')}>
                          <Option value={''}>Seleccione un lugar/salón ...</Option>
                          {spaces.map((space) => (
                            <Option key={space.value} value={space.value}>
                              {space.label}
                            </Option>
                          ))}
                        </SelectAntd>
                      </Col>
                      <Col span={1}>
                        <Link to={matchUrl.replace('agenda', 'espacios')}>
                          <Button icon={<SettingOutlined />} />
                        </Link>
                      </Col>
                    </Row>
                  </Form.Item>
                  <Form.Item label={'¿Tiene espacio físico?'}>
                    <Switch
                      checked={this.state.isPhysical}
                      checkedChildren='Si'
                      unCheckedChildren='No'
                      onChange={this.handlePhysical}
                    />
                  </Form.Item>
                  {this.state.isPhysical && (
                    <>
                      <Form.Item label={'Longitud'}>
                        <Input
                          ref={this.longitud}
                          autoFocus
                          type='number'
                          name={'length'}
                          value={length}
                          onChange={(e) => this.handleChange(e)}
                          placeholder={'Ej. 4.677027'}
                        />
                      </Form.Item>
                      <Form.Item label={'Latitud'}>
                        <Input
                          ref={this.latitud}
                          autoFocus
                          type='number'
                          name={'latitude'}
                          value={latitude}
                          onChange={(e) => this.handleChange(e)}
                          placeholder={'Ej. -74.094086'}
                        />
                      </Form.Item>
                    </>
                  )}
                  {/* <Form.Item label={'Documentos'}>
                    <Select
                      id={'nameDocuments'}
                      isClearable
                      isMulti
                      styles={creatableStyles}
                      onChange={this.selectDocuments}
                      options={nameDocuments}
                      value={selected_document}
                    />
                  </Form.Item> */}
                  <Form.Item label={'Link del vídeo'}>
                    <Input name='video' type='text' value={video} onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label={'Descripción'}>
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Typography.Text type='secondary'>
                        Esta información no es visible en la Agenda/Actividad en versión Mobile.
                      </Typography.Text>
                    </Space>
                    <EviusReactQuill
                      name='description'
                      data={this.state.description}
                      handleChange={(e) => this.handleChangeReactQuill(e, 'description')}
                    />
                  </Form.Item>
                  <Form.Item label={'Imagen'}>
                    <Card style={{ textAlign: 'center' }}>
                      <Form.Item noStyle>
                        <p>
                          Dimensiones:{' '}
                          <b>
                            <small>600px X 400px, 400px X 600px, 200px X 200px, 400px X 400px ...</small>
                          </b>{' '}
                        </p>
                        <p>
                          <small>
                            Se recomienda que la imagen debe tener dimensiones iguales (cuadradas) para su mejor
                            funcionamiento
                          </small>
                        </p>
                        <p>
                          <small>La imagen tarda unos segundos en cargar</small>
                        </p>
                        <Dropzone
                          style={{ fontSize: '21px', fontWeight: 'bold' }}
                          onDrop={this.changeImg}
                          onChange={this.changeImg}
                          accept='image/*'
                          className='zone'>
                          <Row wrap gutter={[8, 8]} justify='center'>
                            <Col>
                              <Button type='dashed' danger id='btnImg'>
                                {image ? 'Cambiar imagen' : 'Subir imagen'}
                              </Button>
                            </Col>
                            <Col>
                              {image && (
                                <Button danger id='btnRemImg' onClick={() => this.setState({ image: '' })}>
                                  {'Eliminar imagen'}
                                </Button>
                              )}
                            </Col>
                          </Row>
                        </Dropzone>
                        <div style={{ marginTop: '10px' }}>
                          {image ? (
                            <Image src={image} alt={`activity_${name}`} height={300} width={450} />
                          ) : (
                            <Empty image={<UserOutlined style={{ fontSize: '100px' }} />} description='No hay Imagen' />
                          )}
                        </div>
                      </Form.Item>
                    </Card>
                  </Form.Item>
                  <Form.Item label={'Categorías'}>
                    <Row wrap gutter={[8, 8]}>
                      <Col span={23}>
                        <Creatable
                          isClearable
                          styles={catStyles}
                          onChange={this.selectCategory}
                          onCreateOption={(value) => this.handleCreate(value, 'categories')}
                          isDisabled={isLoading.categories}
                          isLoading={isLoading.categories}
                          isMulti
                          options={categories}
                          placeholder={'Sin categoría....'}
                          value={selectedCategories}
                        />
                      </Col>
                      <Col span={1}>
                        <Button onClick={() => this.goSection(`${matchUrl}/categorias`)} icon={<SettingOutlined />} />
                      </Col>
                    </Row>
                  </Form.Item>
                  <Form.Item label={'Tipo de actividad'}>
                    <Row wrap gutter={[8, 8]}>
                      <Col span={23}>
                        <Creatable
                          isClearable
                          styles={creatableStyles}
                          className='basic-multi-select'
                          classNamePrefix='select'
                          isDisabled={isLoading.types}
                          isLoading={isLoading.types}
                          onChange={this.selectType}
                          onCreateOption={(value) => this.handleCreate(value, 'types')}
                          options={types}
                          value={selectedType}
                        />
                      </Col>
                      <Col span={1}>
                        <Link to={`${matchUrl}/tipos`}>
                          <Button icon={<SettingOutlined />} />
                        </Link>
                      </Col>
                      <br />
                      <br />
                      <br />
                      <br />
                      <br />
                      <br />
                      <br />
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab='Transmisión' key='2'>
              <Row justify='center' wrap gutter={12}>
                <Col span={20}>
                  <RoomManager
                    event_id={this.props.event._id}
                    activity_id={this.state.activity_id}
                    activity_name={this.state.name}
                    firestore={firestore}
                    date_start_zoom={date_start_zoom}
                    date_end_zoom={date_end_zoom}
                    date_activity={this.state.date}
                    pendingChangesSave={this.state.pendingChangesSave}
                    updateRoomManager={this.updateRoomManager}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tab='Juegos' key='3'>
              <Row justify='center' wrap gutter={12}>
                <Col span={20}>
                  <RoomController
                    handleGamesSelected={this.handleGamesSelected}
                    handleTabsController={this.handleTabsController}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tab='Encuestas' key='4'>
              <Row justify='center' wrap gutter={12}>
                <Col span={20}>
                  <SurveyManager event_id={this.props.event._id} activity_id={this.state.activity_id} />
                  {this.state.isExternal && (
                    <SurveyExternal
                      isExternal={this.state.isExternal}
                      meeting_id={this.state.externalSurveyID}
                      event_id={this.props.event._id}
                      activity_id={this.state.activity_id}
                      roomStatus={this.state.roomStatus}
                    />
                  )}
                </Col>
              </Row>
            </TabPane>
            <TabPane tab='Documentos' key='5'>
              <Row justify='center' wrap gutter={12}>
                <Col span={20}>
                  <Form.Item label={'Documentos'}>
                    <Select
                      id={'nameDocuments'}
                      isClearable
                      isMulti
                      styles={creatableStyles}
                      onChange={this.selectDocuments}
                      options={nameDocuments}
                      value={selected_document}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
      </>
    );
  }
}

//FN manejo/parseo de fechas
function handleDate(info) {
  console.log(info, 'entro en handleDate');
  let date, hour_start, hour_end;
  hour_start = Moment(info.datetime_start, 'YYYY-MM-DD HH:mm').toDate();
  hour_end = Moment(info.datetime_end, 'YYYY-MM-DD HH:mm').toDate();
  date = Moment(info.datetime_end, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  return { date, hour_start, hour_end };
}

//Estilos de algunos select
const creatableStyles = {
  menu: (styles) => ({ ...styles, maxHeight: 'inherit' }),
};

//Estilos para el tipo
const dot = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',
  ':before': {
    backgroundColor: color,
    content: '" "',
    display: 'block',
    margin: 8,
    height: 10,
    width: 10,
  },
});

//Estilos de algunos otros select
const catStyles = {
  menu: (styles) => ({ ...styles, maxHeight: 'inherit' }),
  multiValue: (styles, { data }) => ({ ...styles, ...dot(data.item.color) }),
};

export default withRouter(AgendaEdit);
