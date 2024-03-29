import { ReactNode, createContext, useState, useEffect } from 'react';
import { UseUserEvent } from '@/context/eventUserContext';
import * as service from '../services/meenting.service';
import * as serviceConfig from '../services/configuration.service';
import { IMeeting } from '../interfaces/Meetings.interfaces';
import { DispatchMessageService } from '@/context/MessageService';
import { meetingSelectedInitial } from '../utils/utils';
import { CreateObservers, IObserver, ITypeMeenting } from '../interfaces/configurations.interfaces';
import { BadgeApi, EventsApi, RolAttApi } from '@/helpers/request';
import { fieldNameEmailFirst } from '@/helpers/utils';
import { addDefaultLabels, orderFieldsByWeight } from '../components/modal-create-user/utils/KioskRegistration.utils';
import { FieldsForm } from '../components/modal-create-user/interface/KioskRegistrationApp.interface';
import { ISpaces, ISpacesForm } from '../interfaces/spaces-interfaces';
import firebase from 'firebase/compat';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteRequestMeeting } from '../services/landing.service';

interface NetworkingContextType {
  eventId: string;
  modal: boolean;
  createModalVisible: boolean;
  edicion: boolean;
  attendees: any;
  typeMeetings : ITypeMeenting[];
  observers: IObserver[];
  meentingSelect: IMeeting;
  setMeentingSelect: React.Dispatch<React.SetStateAction<IMeeting>>;
  setCreateModalVisible : React.Dispatch<React.SetStateAction<boolean>>
  editMeenting: (MeentingUptade: IMeeting) => void;
  closeModal: () => void;
  onClickAgregarUsuario: () => void;
  onCancelModalAgregarUsuario: () => void;
  attendeesList: () => Omit<IObserver, 'id'>[];
  openModal: (mode?: string) => void;
  createMeeting: (meeting: Omit<IMeeting, 'id'| 'startTimestap'>) => void;
  updateMeeting: (meetingId: string, meeting: Omit<IMeeting, 'startTimestap'>) => Promise<boolean>;
  deleteMeeting: (meetingId: string, id_request_meetings? : string) => void;
  createObserver: (data: CreateObservers) => Promise<void>;
  deleteObserver: (id: string) => Promise<void>;
  createType: (type: Omit<ITypeMeenting, 'id'>) => Promise<void>;
  deleteType: (typeId: string) => Promise<void>;
  updateType: (typeId: string, type:  Omit<ITypeMeenting, 'id'>) => Promise<void>;
  fieldsForm: FieldsForm[];
  deleteSpaces: (SpaceId: string)=>Promise<void>;
  createSpaces: (nameSpace: ISpacesForm) => Promise<void> 
}

export const NetworkingContext = createContext<NetworkingContextType>({} as NetworkingContextType);

interface Props {
  children: ReactNode;
}

export default function NetworkingProvider(props: Props) {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [typeMeetings, setTypeMeetings] = useState<ITypeMeenting[]>([]);
  const [observers, setObservers] = useState<IObserver[]>([]);
  const [meentingSelect, setMeentingSelect] = useState<IMeeting>(meetingSelectedInitial);
  const [modal, setModal] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [edicion, setEdicion] = useState(false);
  const cUser = UseUserEvent();
  const eventId = cUser?.value?.event_id;
  const [fieldsForm, setFieldsForm] = useState<any[]>([] as any[]);
  useEffect(() => {
    if (!!eventId) {
      const unsubscribeAttendees = service.listenAttendees(eventId, setAttendees);
      const unsubscribeObservers = serviceConfig.listenObervers(eventId, setObservers);
      const unsubscribeTypes = serviceConfig.listenTypesMeentings(eventId, setTypeMeetings);
      getFields();
      return () => {
        unsubscribeAttendees();
        unsubscribeObservers();
        unsubscribeTypes();
      };
    }
  }, []);
  const onClickAgregarUsuario = () => {
    setCreateModalVisible(true);
  };

  const onCancelModalAgregarUsuario = () => {
    setCreateModalVisible(false);
  };

  const editMeenting = (meentign: IMeeting) => {
    setMeentingSelect(meentign);
    openModal('edit');
  };

  const attendeesList = (): Omit<IObserver, 'id'>[] => {
    const observersId = observers.map((item) => item.value);
    const participants: Omit<IObserver, 'id'>[] = attendees.map((asistente: any) => ({
      value: asistente._id,
      label: asistente.user.names,
    }));
    return participants.filter((item) => !observersId.includes(item.value));
  };

  const openModal = (modo?: string) => {
    if (modo === 'edit') setEdicion(true);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setEdicion(false);
    setMeentingSelect(meetingSelectedInitial);
  };

  /* funciones crud para las reuniones */
  const createMeeting = async (meeting: Omit<IMeeting, 'id' |'startTimestap'>) => {
    const newMeenting: Omit<IMeeting, 'id'> = {
      name: meeting.name,
      dateUpdated: meeting.dateUpdated,
      participants: meeting.participants,
      place: meeting.place,
      start: meeting.start,
      startTimestap :  firebase.firestore.Timestamp.fromDate(new Date(meeting.start)),
      end: meeting.end,
      type : meeting.type,
      participantsIds : meeting.participantsIds
    };
    const response = await service.createMeeting(eventId, newMeenting);
    DispatchMessageService({
      type: response ? 'success' : 'warning',
      msj: response ? '¡Información guardada correctamente!' : 'No se logro guardar la información',
      action: 'show',
    });
  };
  const updateMeeting = async (meetingId: string, meeting: Omit<IMeeting,'startTimestap'>) => {
    const newMeenting: Omit<IMeeting, 'id'> = {
      name: meeting.name,
      dateUpdated: meeting.dateUpdated,
      participants: meeting.participants,
      place: meeting.place,
      start: meeting.start,
      startTimestap :  firebase.firestore.Timestamp.fromDate(new Date(meeting.start)),
      end: meeting.end,
      type : meeting.type,
      participantsIds : meeting.participantsIds
    };
    const response = await service.updateMeeting(eventId, meetingId, newMeenting);
    return response
  };
  const deleteMeeting = async (meetingId: string, id_request_meetings? : string) => {
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere mientras se borra la información...',
      action: 'show',
    });

    const response = await service.deleteMeeting(eventId, meetingId);

    if(response && id_request_meetings){
      await deleteRequestMeeting(eventId, id_request_meetings);
    }
    DispatchMessageService({
      key: 'loading',
      action: 'destroy',
    });
    DispatchMessageService({
      type: response ? 'success' : 'warning',
      msj: response ? '¡Información eliminada correctamente!' : 'No ha sido posible eliminar el campo',
      action: 'show',
      duration: 1
    });
  };

  /* --------------------------------- */

  const createObserver = async ({ data }: CreateObservers) => {
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere...',
      action: 'show',
    });
    const observers = attendeesList().filter((attendee) => data.includes(attendee.value));
    const responses = [];
    for (const item of observers) {
      const response = await serviceConfig.creatObserver(eventId, item);
      responses.push(response);
    }
    DispatchMessageService({
      key: 'loading',
      action: 'destroy',
    });
    DispatchMessageService({
      type: !responses.includes(false) ? 'success' : 'warning',
      msj: !responses.includes(false)
        ? '¡Información guardada correctamente!'
        : 'No se logro guardar la informacion completa',
      action: 'show',
    });
  };

  const deleteObserver = async (observerID: string) => {
    const response = await serviceConfig.deleteObserver(eventId, observerID);
    DispatchMessageService({
      type: response ? 'success' : 'warning',
      msj: response ? '¡Información guardada correctamente!' : 'No se logro guardar la información',
      action: 'show',
    });
  };

  /* --------------------------------- */
  const createType = async (type: Omit<ITypeMeenting, 'id'>) => {
    const response = await serviceConfig.creatType(eventId, type);
    DispatchMessageService({
      type: response ? 'success' : 'warning',
      msj: response ? '¡Información guardada correctamente!' : 'No se logro guardar la información completa',
      action: 'show',
    });
  };

  const deleteType = async (typeId: string) => {
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: 'Por favor espere...',
      action: 'show',
    });
    Modal.confirm({
      title: `¿Está seguro de eliminar la información?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Una vez eliminado, no lo podrá recuperar',
      okText: 'Borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        const onHandlerRemove = async () => {
          try {
            await serviceConfig.deleteType(eventId, typeId);
            DispatchMessageService({
              key: 'loading',
              action: 'destroy',
            });
            DispatchMessageService({
              type: 'success',
              msj: 'Se eliminó la información correctamente!',
              action: 'show',
            });
          } catch (e) {
            DispatchMessageService({
              key: 'loading',
              action: 'destroy',
            });
            DispatchMessageService({
              type: 'error',
              msj: 'Ha ocurrido un error',
              action: 'show',
            });
          }
        };
        onHandlerRemove();
      },
    });
  };
  const updateType = async (typeId: string, type: Omit<ITypeMeenting,'id'>) => {
    const response = await serviceConfig.updateType(eventId, typeId, type);
    DispatchMessageService({
      type: response ? 'success' : 'warning',
      msj: response ? '¡Información guardada correctamente!' : 'No se logro guardar la informacion',
      action: 'show',
    });
  };

  const getFields = async () => {
    try {
      const event = await EventsApi.getOne(eventId);
      const rolesList = await RolAttApi.byEventRolsGeneral();
      const properties = event.user_properties;


      let extraFields = fieldNameEmailFirst(properties);

      extraFields = addDefaultLabels(extraFields);
      extraFields = orderFieldsByWeight(extraFields);
      let fieldsForm = Array.from(extraFields);
      let rolesOptions = rolesList.map((rol: any) => {
        return {
          label: rol.name,
          value: rol._id,
        };
      });
      fieldsForm.push({
        author: null,
        categories: [],
        label: 'Rol',
        mandatory: true,
        name: 'rol_id',
        organizer: null,
        tickets: [],
        type: 'list',
        fields_conditions: [],
        unique: false,
        options: rolesOptions,
        visibleByAdmin: false,
        visibleByContacts: 'public',
        _id: { $oid: '614260d226e7862220497eac1' },
      });

      fieldsForm.push({
        author: null,
        categories: [],
        label: 'Checkin',
        mandatory: false,
        name: 'checked_in',
        organizer: null,
        tickets: [],
        type: 'boolean',
        fields_conditions: [],
        unique: false,
        visibleByAdmin: false,
        visibleByContacts: 'public',
        _id: { $oid: '614260d226e7862220497eac2' },
      });
      setFieldsForm(fieldsForm);
      return fieldsForm;
    } catch (error) {
      console.log(error);
    }
  };

  const deleteSpaces = async (SpaceId: string) => {
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere mientras se borra la información...',
      action: 'show',
    });
    Modal.confirm({
      title: `¿Está seguro de eliminar la información?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Una vez eliminado, no lo podrá recuperar',
      okText: 'Borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        const onHandlerRemove = async () => {
          try {
            await service.deleteSpacesByEventId(eventId, SpaceId);
            DispatchMessageService({
              key: 'loading',
              action: 'destroy',
            });
            DispatchMessageService({
              type: 'success',
              msj: 'Se eliminó la información correctamente!',
              action: 'show',
            });
          } catch (e) {
            DispatchMessageService({
              key: 'loading',
              action: 'destroy',
            });
            DispatchMessageService({
              type: 'error',
              msj: 'Ha ocurrido un error',
              action: 'show',
            });
          }
        };
        onHandlerRemove();
      },
    });
  };

  const createSpaces = async (nameSpace: ISpacesForm) => {
    const space: ISpaces = {
      label: nameSpace.nameSpace,
      value: nameSpace.nameSpace,
    };
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere...',
      action: 'show',
    });
    const responses = await service.createSpacesByEventId(eventId, space);
    DispatchMessageService({
      key: 'loading',
      action: 'destroy',
    });
    DispatchMessageService({
      type: responses ? 'success' : 'warning',
      msj: responses ? '¡Información guardada correctamente!' : 'No se logro guardar la informacion completa',
      action: 'show',
    });
  };


  const values = {
    modal,
    createModalVisible,
    openModal,
    onClickAgregarUsuario,
    onCancelModalAgregarUsuario,
    setCreateModalVisible,
    closeModal,
    edicion,
    typeMeetings,
    editMeenting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    meentingSelect,
    setMeentingSelect,
    attendees,
    setAttendees,
    attendeesList,
    eventId,
    observers,
    createObserver,
    deleteObserver,
    fieldsForm,
    createType,
    deleteType,
    updateType,
    deleteSpaces,
    createSpaces
  };

  return <NetworkingContext.Provider value={values}>{props.children}</NetworkingContext.Provider>;
}
