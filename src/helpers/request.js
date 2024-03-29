import axios from 'axios';
import { ApiDEVUrl, ApiUrlCountry, KeyCountry, ApiUrl, ApiEviusZoomSurvey } from './constants';
import { handleSelect } from './utils';
import { firestore } from './firebase';
import Moment from 'moment';
import { GetTokenUserFirebase } from './HelperAuth';
import { DispatchMessageService } from '../context/MessageService';
import { async } from 'ramda-adjunct';
import { ROLS_USER_ID } from '@/constants/rols.constants';

export const publicInstance = axios.create({
  url: ApiUrl,
  baseURL: ApiUrl,
  pushURL: 'https://104.248.125.133:6477/pushNotification',
});

export const privateInstance = axios.create({
  url: ApiUrl,
  baseURL: ApiUrl,
  withCredentials: true,
});
const countryInstance = axios.create({
  url: ApiUrlCountry,
  baseURL: ApiUrlCountry,
  headers: {
    'Content-Type': 'application/json',
    'X-CSCAPI-KEY': KeyCountry,
  },
});
/*PROXIMAMENTE DEPRECADO, 
//PREGUNTE A MARIO MONTERO O JUAN LOPEZ DONDE SE PUEDE USAR*/

/*PROXIMAMENTE DEPRECADO, 
//PREGUNTE A MARIO MONTERO O JUAN LOPEZ DONDE SE PUEDE USAR*/

/*PROXIMAMENTE DEPRECADO, 
//PREGUNTE A MARIO MONTERO O JUAN LOPEZ DONDE SE PUEDE USAR*/

/*PROXIMAMENTE DEPRECADO, 
//PREGUNTE A MARIO MONTERO O JUAN LOPEZ DONDE SE PUEDE USAR*/

/*PROXIMAMENTE DEPRECADO, 
//PREGUNTE A MARIO MONTERO O JUAN LOPEZ DONDE SE PUEDE USAR*/

export const fireStoreApi = {
  createOrUpdate: (eventId, activityId, eventUser) => {
    let agendaRef = firestore.collection(`event_activity_attendees/${eventId}/activities/${activityId}/attendees`);
    return agendaRef.add({
      activity_id: activityId,
      attendee_id: eventUser._id,
      created_at: new Date(),
      properties: eventUser.properties,
      updated_at: new Date(),
      checked_in: true,
      checked_at: new Date(),
    });
  },
};

export const Actions = {
  create: async (url, data, unsafe) => {
    if (unsafe) return publicInstance.post(url, data).then(({ data }) => data);
    return privateInstance.post(url, data).then(({ data }) => data);
  },
  delete: async (url, id, unsafe) => {
    if (unsafe) return publicInstance.delete(`${url}${id}`).then(({ data }) => data);
    return privateInstance.delete(`${url}/${id}`).then(({ data }) => data);
  },
  edit: async (url, data, unsafe, id) => {
    if (unsafe) return publicInstance.put(`${url}`, data).then(({ data }) => data);
    return privateInstance.put(`${url}/${id}`, data).then(({ data }) => data);
  },
  post: async (url, data, unsafe) => {
    if (unsafe) return publicInstance.post(url, data).then(({ data }) => data);
    return privateInstance.post(url, data).then(({ data }) => data);
  },
  get: async (url, unsafe) => {
    if (unsafe) return publicInstance.get(url).then(({ data }) => data);
    return privateInstance.get(url).then(({ data }) => data);
  },

  put: async (url, data, unsafe) => {
    if (unsafe) return publicInstance.put(url, data).then(({ data }) => data);
    return privateInstance.put(url, data).then(({ data }) => data);
  },
  getOne: async (url, id, unsafe) => {
    if (unsafe) return publicInstance.get(`${url}${id}`).then(({ data }) => data);
    return privateInstance.get(`${url}${id}`).then(({ data }) => data);
  },
  getAll: async (url, unsafe) => {
    if (unsafe) return publicInstance.get(`${url}`).then(({ data }) => data);
    return privateInstance.get(`${url}`).then(({ data }) => data);
  },
};

export const SearchUserbyEmail = (email) => {
  const url = `${ApiUrl}/api/users/findByEmail/${email}`;
  return Actions.get(url);
};

//BACKLOG --> ajustar a la nueva estructura el setState que se comentó para evitar fallos por no contar con el estado
export const getCurrentUser = async () => {
  let token = await GetTokenUserFirebase();

  return new Promise(async (resolve) => {
    if (!token || token == 'undefined') {
      resolve(null);
    } else {
      try {
        const resp = await privateInstance.get(`/auth/currentUser?token=${token}`);
        if (resp.status === 200) {
          resolve(resp.data);
        }
      } catch (error) {
        if (error.response) {
          // eslint-disable-next-line no-unused-vars
          const { status, data } = error.response;
          if (status === 401) {
            DispatchMessageService({
              type: 'error',
              msj: 'Tu token a caducado, redirigiendo al login!',
              action: 'show',
            });
            /* message.error('🔑 Tu token a caducado, redirigiendo al login!', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }); */
            // YA NO DE REDIRIGIR EL TOKEN CADUCADO
            /* alert('RELOAD ACA');
            setTimeout(() => {
              window.location.reload();
            }, 2000);*/
            //this.setState({ timeout: true, loader: false })
          } else {
            //this.setState({ serverError: true, loader: false, errorData: data })
            DispatchMessageService({
              type: 'error',
              msj: 'Ocurrió un error distinto al token!',
              action: 'show',
            });
          }
        } else {
          let errorData = {};
          console.error('Error', error.message);
          if (error.message) {
            errorData.message = error.message;
            DispatchMessageService({
              type: 'error',
              msj: errorData.message,
              action: 'show',
            });
          } else if (error.request) {
            console.error(error.request);
            errorData.message = JSON.stringify(error.request);
            DispatchMessageService({
              type: 'error',
              msj: errorData.message,
              action: 'show',
            });
          }
          errorData.status = 708;
          //this.setState({ serverError: true, loader: false, errorData });
        }
        console.error(error.config);
      }
    }
  });
};

export const EventsApi = {
  getEventUser: async (user_id, event_id) => {
    const snapshot = await firestore
      .collection(`${event_id}_event_attendees`)
      .where('account_id', '==', user_id)
      .get();
    const eventUser = !snapshot.empty ? snapshot.docs[0].data() : null;
    return eventUser;
  },

  getcurrentUserEventUser: async (event_id) => {
    let token = await GetTokenUserFirebase();
    let response = await Actions.getAll(`/api/me/eventusers/event/${event_id}?token=${token}`, false);
    let eventUser = response.data && response.data[0] ? response.data[0] : null;
    return eventUser;
  },

  /* Según un nuevo modelo de los eventUsers un solo usuario puede tener varios eventUsers para un evento */
  getcurrentUserEventUsers: async (event_id) => {
    let token = await GetTokenUserFirebase();
    let response = await Actions.getAll(`/api/me/eventusers/event/${event_id}?token=${token}`, false);
    let eventUsers = response.data ? response.data : null;
    return eventUsers;
  },

  getPublic: async (query) => {
    return await Actions.getAll(`/api/events${query}`, true);
  },
  getOldEvents: async (query) => {
    return await Actions.getAll(`/api/eventsbeforetoday${query}`, true);
  },
  getNextEvents: async (query) => {
    return await Actions.getAll(`/api/eventsaftertoday${query}`, true);
  },
  landingEvent: async (id) => {
    return await Actions.getOne('/api/events/', id, true);
  },
  hostAvailable: async () => {
    return await Actions.get('api/events/zoomhost');
  },
  invitations: async (id) => {
    return await Actions.getOne(`/api/events/${id}/`, 'invitations');
  },
  sendMeetingRequest: async (eventId, data) => {
    try {
      let token = await GetTokenUserFirebase();
      return await Actions.post(`/api/events/${eventId}/meetingrequest/notify?token=${token}`, data);
    } catch (error) {
      console.log('Ocurrio un error al enviar el email');
    }
  },

  sendInvitation: async (eventId, data) => {
    return await Actions.post(`/api/events/${eventId}/invitation`, data);
  },
  sendRsvp: async (data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/rsvp/sendeventrsvp/${id}?token=${token}`, data, true);
  },
  mine: async () => {
    let token = await GetTokenUserFirebase();
    const events = await Actions.getAll(`/api/me/contributors/events/?token=${token}`, true);
    return events;
  },
  // getOne: async (id) => {
  //   return await Actions.getOne('/api/events/', id);
  // },
   getOne: async (id) => {
    let token = await GetTokenUserFirebase();
    if (token) {
        return await Actions.getOne('/api/events/', `${id}?token=${token}`);
    }
    return await Actions.getOne('/api/events/', `${id}`);
  },
  getOneByNameEvent: async (eventName) => {
    return await Actions.get(`/api/events/?filtered=[{"field":"name","value":[%22${eventName}%22]}]`);
  },
  editOne: async (data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`/api/events/${id}?token=${token}`, data, true);
  },
  deleteOne: async (id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${id}/?token=${token}`, '', true);
  },
  getStyles: async (id) => {
    return await Actions.get(`/api/events/${id}/stylestemp`, true);
  },
  metrics: async (id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getOne(`/api/events/${id}/totalmetricsbyevent/?token=${token}`, '');
  },
  metricsByActivity: async (id) => {
    return await Actions.getOne(`/api/events/${id}/`, 'totalmetricsbyactivity');
  },
  metricsRegisterBydate: async (id, type, fechaInicial, fechaFinal) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(
      `/api/events/${id}/metricsbydate/eventusers/?token=${token}&metrics_type=${type}&datetime_from=${fechaInicial}&datetime_to=${fechaFinal}`
    );
  },

  //obtener products subasta silenciosa
  getProducts: async (eventId) => {
    return await Actions.get(`/api/events/${eventId}/products`);
  },
  storeOfert: async (eventId, productId, data) => {
    return await Actions.post(`/api/events/${eventId}/products/${productId}/silentauctionmail`, data);
  },
  getOneProduct: async (eventId, idproduct) => {
    return await Actions.get(`/api/events/${eventId}/products/${idproduct}`);
  },
  editProduct: async (data, eventId, idproduct) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${eventId}/products/${idproduct}?token=${token}`, data);
  },
  createProducts: async (data, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/events/${eventId}/products?token=${token}`, data);
  },
  deleteProduct: async (galleryId, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${eventId}/products/${galleryId}?token=${token}`, '', true);
  },
  validPrice: async (eventId, productId) => {
    return await Actions.get(`/api/events/${eventId}/products/${productId}/minimumauctionvalue`);
  },
  ofertsProduct: async (eventId, productId) => {
    return await Actions.get(
      `api/events/${eventId}/orders/ordersevent?filtered=[{"field":"items","value":"${productId}"}]`
    );
  },
  acceptOrRejectRequest: async (eventId, requestId, status) => {
    return await Actions.get(`api/event/${eventId}/meeting/${requestId}/${status}`);
  },
  getStatusRegister: async (eventId, email) => {
    let token;
    /** Se agrega el try catch para evitar que si no hay una sesion se detenga el flujo */
    try {
      token = await GetTokenUserFirebase();
    } catch (error) {
      token = false;
    }
    return await Actions.get(
      `api/events/${eventId}/eventusers${
        token ? `/?token=${token}` : '/'
      }&filtered=[{"field":"properties.email","value":"${email}", "comparator":"="}]&${new Date()}`,
      true
    );
  },
  recoveryPassword: async (eventId, url, email) => {
    return await Actions.put(`/api/events/${eventId}/changeUserPassword?destination=${url}`, email);
  },
  //RESTABLECER CONTRASEÑA
  changePassword: async (eventId, email) => {
    //URL DE PRUEBAS
    return await Actions.put(`/api/changeuserpassword`, {
      email: email,
      event_id: eventId,
    });
  },

  changePasswordUser: async (email, hostname) => {
    //URL DE PRUEBAS
    return await Actions.put(`/api/changeuserpassword`, {
      email: email,
      hostName: hostname,
    });
  },
  //ACCEDER POR LINK AL CORREO
  requestLinkEmail: async (eventId, email) => {
    return await Actions.post(`/api/getloginlink`, { email: email, event_id: eventId });
  },
  //ACCEDER POR LINK AL CORREO SIN EVENTO
  requestLinkEmailUSer: async (email) => {
    return await Actions.post(`/api/getloginlink`, { email: email });
  },
  //REFRESH URL LINK DE ACCESSO
  refreshLinkEmailUser: async (email) => {
    return await Actions.post(`/api/getloginlink`, { email: email, refreshlink: true });
  },
  //REFRESH URL LINK DE ACCESSO A EVENTO
  refreshLinkEmailUserEvent: async (email, eventId) => {
    return await Actions.post(`/api/getloginlink`, {
      email: email,
      refreshlink: true,
      event_id: eventId,
    });
  },
  requestUrlEmail: async (eventId, url, email) => {
    return await Actions.put(
      `/api/events/${eventId}/changeUserPassword?destination=${url}&firebase_password_change=true`,
      email
    );
  },
  signInWithEmailAndPassword: async (data) => {
    return await Actions.post(`/api/users/signInWithEmailAndPassword`, data);
  },
  createTemplateEvent: async (eventId, idTemplate) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(
      `/api/events/${eventId}/templateproperties/${idTemplate}/addtemplateporperties?token=${token}`,
      {}
    );
  },
  getPreviews: async (eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/event/${eventId}/previews?token=${token}`);
  },
  addPreviews: async (eventId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/previews?token=${token}`, { ...data, event_id: eventId });
  },

  updatePreviews: async (previewId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/previews/${previewId}?token=${token}`, data);
  },

  getSectionsDescriptions: async (eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/event/${eventId}/descriptions?token=${token}`);
  },
  saveSections: async (section) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/descriptions?token=${token}`, section);
  },
  updateSections: async (eventId, newSections) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/descriptions/${eventId}?token=${token}`, newSections);
  },
  updateSectionOne: async (sectionId, newSection) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/descriptions/${sectionId}?token=${token}`, newSection);
  },

  deleteSections: async (sectionId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/descriptions/${sectionId}?token=${token}`);
  },
};
export const BingoApi = {
  getOne: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/events/${event}/bingos?token=${token}`, true);
  },
  createOne: async (event, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/events/${event}/bingos?token=${token}`, data, true);
  },
  editOne: async (event, data, id) => {
    // console.log(event, data, id);
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/events/${event}/bingos/${id}?token=${token}`, data, true);
  },
  editDimension: async (event, data, id) => {
    // console.log(event, data, id);
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/events/${event}/bingos/${id}?token=${token}&reset_bingo=yes`, data, true);
  },
  deleteOne: async (event, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${event}/bingos/${id}?token=${token}`, id, true);
  },
  getByUser: async (userId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/me/${userId}/bingocard?token=${token}`, true);
  },
  createDataImport: async (event, bingo, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/events/${event}/bingos/${bingo}/import-values?token=${token}`, data, true);
  },
  editValue: async (event, bingo, index, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/events/${event}/bingos/${bingo}/values/${index}?token=${token}`, data, true);
  },
  deleteValue: async (event, bingo, index) => {
    // console.log(event, bingo, index, 'deleteValue');
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${event}/bingos/${bingo}/values/${index}?token=${token}`, true);
  },
  createValue: async (event, bingo, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/events/${event}/bingos/${bingo}/values?token=${token}`, data, true);
  },
  getByCarton: async (carton) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/bingocards/${carton}?token=${token}`, true);
  },
  /* Recrear bingos para todos los usuarios
  Method PUT: API-URL/events/{event}/bingos/{bingo}/reset-bingo-cards

  Crear bingo para usuarios faltantes
  Method POST: API-URL/events/{event}/eventusers/bingocards

  Listar usuarios mostranto si tienen o no bingo
  Method GET: API-URL/events/633d9b3101de36465758db36/eventusers/bingocards */
  generateBingoForAllUsers: async (event, bingo) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/events/${event}/bingos/${bingo}/reset-bingo-cards?token=${token}`, true);
  },
  generateBingoForExclusiveUsers: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/events/${event}/eventusers/bingocards?token=${token}`, true);
  },
  getListUsersWithOrWithoutBingo: async (eventId, numberItems, page) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(
      `api/events/${eventId}/eventusers/bingocards?numberItems=${numberItems}&page=${page}&token=${token}`,
      true
    );
  },

  getTemplates: async (format) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/bingotemplates/format/${format}?token=${token}`, true);
  },
};
export const AuctionApi = {
  getOne: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`/api/events/${event}/subastas?token=${token}`, true);
  },
  createOne: async (event, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/events/${event}/subastas?token=${token}`, data, true);
  },
  editOne: async (event, id, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${event}/subastas/${id}?token=${token}`, data, true);
  },

  deleteOne: async (event, subasta_id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${event}/subastas/${subasta_id}?token=${token}`, '', true);
  },
  resetProducts: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${event}/subastas/reset-products?token=${token}`, '', true);
  },
};
export const AuctionProductApi = {
  getOne: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`/api/events/${event}/products?type=just-auction`, true);
  },
  createOne: async (event, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/events/${event}/products?token=${token}`, data, true);
  },
  editOne: async (event, id, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${event}/products/${id}?token=${token}`, data, true);
  },

  deleteOne: async (event, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${event}/products/${id}?token=${token}`, '', true);
  },
};
export const WhoWantsToBeAMillonaireApi = {
  getOne: async (eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/events/${eventId}/millionaires?token=${token}`, true);
  },
  editOne: async (eventId, millonaireId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/events/${eventId}/millionaires/${millonaireId}?token=${token}`, data, true);
  },
  deleteOne: async (eventId, millonaireId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${eventId}/millionaires/${millonaireId}?token=${token}`, true);
  },
  createOne: async (eventId, body) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/events/${eventId}/millionaires?token=${token}`, body, true);
  },
  createOneQuestion: async (millonaireId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/millionaires/${millonaireId}/questions?token=${token}`, data, true);
  },
  deleteOneQuestion: async (millonaireId, questionId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/millionaires/${millonaireId}/questions/${questionId}?token=${token}`, true);
  },
  editOneQuestion: async (millonaireId, questionId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/millionaires/${millonaireId}/questions/${questionId}?token=${token}`, data, true);
  },
  createOneStage: async (millonaireId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/millionaires/${millonaireId}/stages?token=${token}`, data, true);
  },
  deleteOneStage: async (millonaireId, stageId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/millionaires/${millonaireId}/stages/${stageId}?token=${token}`, true);
  },
  editOneStage: async (millonaireId, stageId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/millionaires/${millonaireId}/stages/${stageId}?token=${token}`, data, true);
  },
  createDataImport: async (millonaire, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/millionaires/${millonaire}/import-questions?token=${token}`, data, true);
  },
};

export const SharePhotoApi = {
  getOne: async (eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/events/${eventId}/sharephotos?token=${token}`, true);
  },
  createOne: async (data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/sharephoto?token=${token}`, data, true);
  },
  updateOne: async (sharePhotoId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/sharephoto/${sharePhotoId}?token=${token}`, data, true);
  },
  deleteOne: async (sharePhotoId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/sharephoto/${sharePhotoId}?token=${token}`, true);
  },
  addOnePost: async (sharePhotoId, postData) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/sharephoto/${sharePhotoId}/addpost?token=${token}`, postData, true);
  },
  deleteOnePost: async (sharePhotoId, postId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/sharephoto/${sharePhotoId}/post/${postId}?token=${token}`, true);
  },
  addOneLike: async (sharePhotoId, postId, likeData) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/sharephoto/${sharePhotoId}/addlike/${postId}?token=${token}`, likeData, true);
  },
  deleteOneLike: async (sharePhotoId, likeId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/sharephoto/${sharePhotoId}/unlike/${likeId}?token=${token}`, true);
  },
};

export const InvitationsApi = {
  getAll: async (id) => {
    return await Actions.getAll(`/api/events/${id}/invitation`);
  },
  byEvent: async (event) => {
    return await Actions.getAll(`api/events/${event}/invitation`, true).then(({ data }) => data);
  },
};

export const UsersApi = {
  getAll: async (id, query) => {
    let token = await GetTokenUserFirebase();
    query = query ? query : '';
    return await Actions.getAll(`/api/events/${id}/eventusers?token=${token}&${query}`);
  },
  getOne: async (event_id, user_id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/events/${event_id}/eventusers/${user_id}?token=${token}`);
  },
  mineTickets: async () => {
    return await Actions.getAll('/api/me/eventUsers/');
  },
  getProfile: async (id) => {
    return await Actions.getOne('/api/users/', id);
  },
  editProfile: async (data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`/api/users/${id}/?token=${token}`, data, true);
  },
  findByEmail: async (email) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getOne(`api/users/findByEmail/${email}?token=${token}`, true);
  },

  validateEmail: async (email) => {
    return await Actions.post(`api/validateEmail`, email, true);
  },
  validateAttendeeData: async (event_id, eventUser_id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(
      `api/events/${event_id}/eventusers/${eventUser_id}/validate-attendee-data?token=${token}`,
      true
    );
  },

  mineOrdes: async (id) => {
    return await Actions.getAll(`/api/users/${id}/orders`);
  },
  createOne: async (data, id, origin = false) => {
    //Este primero es que deberia estar pero no sirve
    //return await Actions.post(`/api/eventUsers/createUserAndAddtoEvent/${id}`, data);
    /** Se envia token para validar si el rol es cambiado por un damin */
    let token;
    /** Se agrega el try catch para evitar que si no hay una sesion se detenga el flujo */
    try {
      token = await GetTokenUserFirebase();
    } catch (error) {
      token = false;
    }

    return await Actions.post(
      `/api/events/${id}/adduserwithemailvalidation${token ? `/?token=${token}&free_access=${origin}` : `/?free_access=${origin}`}`,
      data,
      true
    );
  },
  createOneWithoConfirmEmail: async (data, id) => {
    const token = await GetTokenUserFirebase();
    return await Actions.post(`/api/eventUsers/createUserAndAddtoEvent/${id}?origin=free_access&token=${token}`, data);
  },
  deleteOne: async (user, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/user/events/${id}?token=${token}`, user);
  },

  deleteUsers: async (user) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/users`, `${user}?token=${token}`);
  },
  createUser: async (user) => {
    return await Actions.post(`/api/users`, user);
  },
  editEventUser: async (data, eventId, eventUserId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${eventId}/eventusers/${eventUserId}?token=${token}`, data, true);
  },

  createUserInEventAndAssignToActivity: async (data, activityId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/activities/${activityId}/eventUsers?token=${token}`, data, true);
  },
  deleteAttendeeInActivity: async (activityId, eventUserId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/activities/${activityId}/eventUsers/${eventUserId}?token=${token}`);
  },
};

export const AttendeeApi = {
  getAll: async (eventId) => {
    return await Actions.getAll(`/api/events/${eventId}/eventusers`);
  },
  create: async (eventId, data) => {
    /** Se envia token para validar si el rol es cambiado por un damin */
    let token;
    /** Se agrega el try catch para evitar que si no hay una sesion se detenga el flujo */
    try {
      token = await GetTokenUserFirebase();
    } catch (error) {
      token = false;
    }
    return await Actions.post(`/api/events/${eventId}/eventusers/?token=${token}`, data, true);
  },
  update: async (eventId, data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/events/${eventId}/eventusers/${id}?token=${token}`, data, true);
  },
  delete: async (eventId, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${eventId}/eventusers/`, `${id}?token=${token}`, true);
  },
};

export const eventTicketsApi = {
  byEvent: async (eventId) => {
    return await Actions.getAll(`api/events/${eventId}/tickets`);
  },
  getOne: async (id, eventId) => {
    return await Actions.get(`api/events/${eventId}/tickets/${id}`);
  },
  getAll: async (eventId) => {
    return await Actions.getAll(`/api/events/${eventId}/tickets`);
  },
  create: async (eventId, data) => {
    return await Actions.post(`/api/events/${eventId}/tickets`, data);
  },
  update: async (eventId, data, id) => {
    return await Actions.put(`api/events/${eventId}/tickets/${id}`, data);
  },
  delete: async (eventId, id) => {
    return await Actions.delete(`api/events/${eventId}/tickets`, id);
  },
  deleteOne: async (id, eventId) => {
    return await Actions.delete(`api/events/${eventId}/tickets`, id);
  },
};

export const TicketsApi = {
  getAll: async (id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`/api/me/eventUsers/?token=${token}&limit=20`, true);
  },
  getByEvent: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getOne(`/api/me/eventusers/event/${event}${token ? `/?token=${token}` : '/'}`);
  },
  transferToUser: async (event, event_user, data) => {
    return await Actions.post(`/api/eventusers/${event}/tranfereventuser/${event_user}`, data);
  },

  addCheckIn: async (eventUser_id, checkInType) => {
    let token = await GetTokenUserFirebase();
    const checkedin_type = checkInType;
    return await Actions.put(`/api/eventUsers/${eventUser_id}/checkin/?token=${token}`, { checkedin_type }, true);
  },

  deleteCheckIn: async (eventUser_id) => {
    let token = await GetTokenUserFirebase();

    return await Actions.put(`/api/eventUsers/${eventUser_id}/uncheck/?token=${token}`, {}, true);
  },
};

export const EventFieldsApi = {
  getAll: async (event) => {
    return await Actions.getAll(`/api/events/${event}/userproperties`);
  },
  byEvent: async (event) => {
    return await Actions.getAll(`/api/events/${event}/userproperties`);
  },
  getOne: async (event, id) => {
    return await Actions.getOne(`/api/events/${event}/userproperties/${id}`);
  },
  createOne: async (data, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/events/${event}/userproperties?token=${token}`, data);
  },
  editOne: async (data, id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`/api/events/${event}/userproperties/${id}?token=${token}`, data, true);
  },
  registerListFieldOptionTaken: async (data, id, event) => {
    return await Actions.put(`/api/events/${event}/userproperties/${id}/RegisterListFieldOptionTaken`, data);
  },
  deleteOne: async (id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${event}/userproperties`, `${id}?token=${token}`);
  },
};

export const SurveysApi = {
  getAll: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`/api/events/${event}/surveys/?token=${token}`);
  },
  byEvent: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/events/${event}/surveys/?token=${token}`, true).then(({ data }) => data);
  },
  getByActivity: async (event, activity_id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(
      `/api/events/${event}/surveys/?token=${token}&indexby=activity_id&value=${activity_id}`
    );
  },
  getOne: async (event, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getOne(`/api/events/${event}/surveys/${id}/?token=${token}`, true);
  },
  createOne: async (event, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`/api/events/${event}/surveys/?token=${token}`, data, true);
  },
  editOne: async (data, id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`/api/events/${event}/surveys/${id}/?token=${token}`, data, true);
  },
  deleteOne: async (id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${event}/surveys/${id}/?token=${token}`, '', true);
  },
  createQuestion: async (event, id, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${event}/surveys/${id}/?token=${token}&newquestion=1`, data, true);
  },
  deleteQuestion: async (event, surveyId, index) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${event}/surveys/${surveyId}/?token=${token}&delete=${index}`, '', true);
  },
  editQuestion: async (event, id, index, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${event}/questionedit/${id}/?token=${token}&questionNo=${index}`, data, true);
  },
  sendCommunicationUser: async (surveyId, eventUserId) => {
    return await Actions.get(`/api/surveys/${surveyId}/eventusers/${eventUserId}/sendcode`);
  },
  sendCommunicationOpen: async (surveyId) => {
    return await Actions.get(`/api/surveys/${surveyId}/open`);
  },
};

export const DocumentsApi = {
  getAll: async (event) => {
    return await Actions.getAll(`api/events/${event}/documents`, true);
  },
  byEvent: async (event) => {
    return await Actions.getAll(`api/events/${event}/documents`, true).then(({ data }) => data);
  },
  getFiles: async (id, event) => {
    return await Actions.getAll(`api/events/${event}/documents?father_id=${id}`);
  },
  getOne: async (id, event) => {
    return await Actions.getOne(`api/events/${event}/documents/`, id);
  },
  editOne: async (data, id, event) => {
    return await Actions.edit(`api/events/${event}/documents/${id}`, data, true);
  },
  deleteOne: async (id, event) => {
    return await Actions.delete(`api/events/${event}/documents`, id);
  },
  create: async (data, event) => {
    return await Actions.create(`api/events/${event}/documents`, data);
  },
};

export const CategoriesApi = {
  getAll: async (orgId) => {
    const resp = await Actions.getAll(`api/organizations/${orgId}/categories`, true);
    return handleSelect(resp.data);
  },
  create: async (organizationId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/organizations/${organizationId}/categories?token=${token}`, data);
  },
  createOne: async (organizationId, id_category, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/oneorganizations/${organizationId}/categories/${id_category}?token=${token}`, data);
  },
  update: async (organizationId, id_category, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/organizations/${organizationId}/categories/${id_category}?token=${token}`, data);
  },
  delete: async (organizationId, id_category) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/organizations/${organizationId}/categories/${id_category}?token=${token}`, '', true);
  },
};
export const GroupsApi = {
  getGroupsByOrg: async (orgId) => {
    const resp = await Actions.getAll(`api/organizations/${orgId}/groups`, true);
    return handleSelect(resp);
  },
  create: async (orgId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/organizations/${orgId}/groups?token=${token}`, data);
  },
  update: async (orgId, groupId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/organizations/${orgId}/groups/${groupId}?token=${token}`, data);
  },
  deleteOne: async (orgId, groupId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/organizations/${orgId}/groups/${groupId}?token=${token}`, '', true);
  },
  deleteOrgUserFromGroup: async (orgId, groupId, OrgUserId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/organizations/${orgId}/groups/${groupId}/organizationUsers/${OrgUserId}?token=${token}`, '', true);
  },
  deleteEventFromGroup: async (orgId, groupId, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/organizations/${orgId}/groups/${groupId}/events/${eventId}?token=${token}`, '', true);
  },
};

export const TypesApi = {
  getAll: async () => {
    const resp = await Actions.getAll('api/eventTypes', true);
    return handleSelect(resp.data);
  },
};
export const OrganizationApi = {
  mine: async () => {
    let token = await GetTokenUserFirebase();

    const resp = await Actions.getAll(`api/me/organizations?token=${token}`);
    let data = resp.data.map((item) => {
      return {
        _id: item._id,
        id: item.organization?._id,
        name: item.organization?.name,
        user_properties: item.organization?.user_properties,
        styles: item.organization?.styles,
        created_at: item.organization?.created_at,
        itemsMenu: item.organization?.itemsMenu,
        rolInOrganization: { _id: item.rol._id, name: item.rol.name },
      };
    });
    return data;
  },
  getEventsWithUserOrg: async (organizationId, organizarionUserId, event_user = false, order = 'desc') => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(
      `/api/organizations/${organizationId}/user/${organizarionUserId}/events?event_user=${event_user}&order=${order}&token=${token}`,
      true
    );
  },
  getEventsInGroups: async (organizationId, freeAcces = false) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(
      `/api/organizations/${organizationId}/me/events-by-groups?free=${freeAcces}&token=${token}`,
      true
    );
  },
  getOne: async (id) => {
    return await Actions.getOne('/api/organizations/', id);
  },
  createOrganization: async (data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/organizations?token=${token}`, data, true);
  },
  editOne: async (data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`/api/organizations/${id}?token=${token}`, data, true);
  },
  events: async (id) => {
    return await Actions.getOne(`/api/organizations/${id}/`, 'events');
  },
  getUsers: async (id, page = -1) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/organizations/${id}/organizationusers?${page !== -1 ? `page=${page}&`:''}token=${token}`);
  },
  getUsersOnlyName: async (organizationId, page = -1) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/organizations/${organizationId}/organizationusers/get-names?token=${token}`);
  },
  getUsersWithStatusInEvent: async (id, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(
      `/api/organizations/${id}/event/${eventId}/validate-existence-members-by-events?token=${token}`
    );
  },
  getEpecificUser: async (orgId, memberId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getOne(`/api/organizations/${orgId}/organizationusers/${memberId}?token=${token}`, '', true);
  },
  getMeUser: async (orgId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getOne(`/api/me/organizations/${orgId}/?token=${token}`, '', true);
  },
  existeUserByEmail: async (organizationId, email) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/organizations/${organizationId}/validate-user-exists?email=${email}&token=${token}`, true);
  },
  saveUser: async (org, data, addUserInEvents = false) => {
    return await Actions.post(
      `/api/organizations/${org}/addorganizationuser?createIntoEvents=${addUserInEvents}`,
      data
    );
  },
  editUser: async (org, member, data, validate_change_rol = false) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`/api/organizations/${org}/organizationusers/${member}?validate_change_rol=${validate_change_rol}&token=${token}`, data, true);
  },
  deleteUser: async (org, member, deleteFromAllOrganizationEvents = false) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/organizations/${org}/organizationusers`, `/${member}?delete_attendees=${deleteFromAllOrganizationEvents}token=${token}`, true);
  },
  getEventsStatistics: async (org, order = 'oldest') => {
    return await Actions.get(`/api/organizations/${org}/eventsstadistics?order=${order}`);
  },
  getEventsStatisticsExport: async (org, order = 'oldest') => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/organizations/${org}/eventsstadistics/export?order=${order}&token=${token}`);
  },
  editAllUserProperties: async (org, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`api/organizations/${org}?token=${token}`, data);
  },
  editOneUserProperties: async (org, fieldId, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`api/organizations/${org}/userproperties/${fieldId}?token=${token}`, data, true);
  },
  createOneUserProperties: async (org, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/organizations/${org}/userproperties?token=${token}`, data, true);
  },
  getUserProperties: async (org) => {
    return await Actions.get(`/api/organizations/${org}/userproperties`);
  },
  deleteUserProperties: async (org, fieldId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/organizations/${org}/userproperties/${fieldId}?token=${token}`, '', true);
  },
  getTemplateOrganization: async (org) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/organizations/${org}/templateproperties?token=${token}`);
  },
  updateTemplateOrganization: async (orgId, idTemplate, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/organizations/${orgId}/templateproperties/${idTemplate}?token=${token}`, data);
  },
  editMenu: async (data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/organizations/${id}?update_events_itemsMenu=false&token=${token}`, data);
  },
};
export const BadgeApi = {
  create: async (data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`/api/escarapelas?token=${token}`, data);
  },
  edit: async (data, id) => {
    return await Actions.edit('/api/escarapelas/', data, id);
  },
  get: async (id) => {
    return await Actions.getOne('/api/escarapelas/', id);
  },
};
export const HelperApi = {
  listHelper: async (id) => {
    return await Actions.getOne(`api/contributors/events/`, id);
  },
  rolesOne: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/contributors/events/${event}/me?token=${token}`);
  },
  saveHelper: async (event, data) => {
    return await Actions.post(`api/events/${event}/contributors`, data);
  },
  editHelper: async (event, id, data) => {
    return await Actions.put(`api/events/${event}/contributors/${id}`, data);
  },
  removeHelper: async (id, event) => {
    return await Actions.delete(`api/events/${event}/contributors`, id);
  },
};

export const discountCodesApi = {
  exchangeCode: async (template_id, data) => {
    let url = `api/code/exchangeCode`;
    return await publicInstance.put(url, data).then(({ data }) => data);
  },
};

export const CertsApi = {
  byEvent: async (event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/events/${event}/certificates?token=${token}`).then(({ data }) => data);
  },
  getOne: async (id) => {
    return await Actions.getOne(`api/certificate/`, id);
  },

  getByOrganizationUser: async (organizationuser_id) => {
    return await Actions.getAll(`api/certificates/byOrganizationUser/`+organizationuser_id);
  },

  generate: async (content, image) => {
    return await Actions.get(`api/pdfcertificate?content=` + content + '&image=' + image + '&download=1');
  },
  editOne: async (data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/certificates/${id}?token=${token}`, data);
  },
  deleteOne: async (id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/certificates/${id}?token=${token}`, '', true);
  },
  create: async (data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`/api/certificates?token=${token}`, data);
  },
  generateCert: async (body) => {
    // eslint-disable-next-line no-unused-vars
    return new Promise(async (resolve, reject) => {
      let token = await GetTokenUserFirebase();
      publicInstance
        .post(`/api/generatecertificate?token=${token}&download=1`, body, {
          responseType: 'blob',
        })
        .then((response) => {
          resolve({
            type: response.headers['content-type'],
            blob: response.data,
          });
        });
    });
  },
  generateCertList: async (body) => {
    // eslint-disable-next-line no-unused-vars
    return new Promise(async (resolve, reject) => {
      let token = await GetTokenUserFirebase();
      publicInstance
        .post(`/api/generatecertificates?token=${token}&download=1`, body, {
          responseType: 'blob',
        })
        .then((response) => {
          resolve({
            type: response.headers['content-type'],
            blob: response.data,
          });
        });
    });
  },
};

export const NewsFeed = {
  byEvent: async (eventId) => {
    //let token = await GetTokenUserFirebase();
    //ESTE ENDPOINT ES PÚBLICO
    return await Actions.getAll(`api/events/${eventId}/newsfeed`).then(({ data }) => data);
  },
  getOne: async (eventId, idnew) => {
    //let token = await GetTokenUserFirebase();
    //ESTE ENDPOINT ES PÚBLICO
    return await Actions.get(`api/events/${eventId}/newsfeed/${idnew}`);
  },
  editOne: async (data, id, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`api/events/${eventId}/newsfeed/${id}?token=${token}`, data, true);
  },
  deleteOne: async (id, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${eventId}/newsfeed`, `${id}?token=${token}`);
  },
  create: async (data, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`api/events/${eventId}/newsfeed?token=${token}`, data);
  },
};

export const PushFeed = {
  byEvent: async (id) => {
    return await Actions.getAll(`api/events/${id}/sendpush`).then(({ data }) => data);
  },
  getOne: async (id) => {
    return await Actions.get(`api/events/${id}/sendpush/`, id);
  },
  editOne: async (data, id) => {
    return await Actions.edit(`api/events/${id}/sendpush`, data, id);
  },
  deleteOne: async (id) => {
    return await Actions.delete(`api/events/${id}/sendpush`, id);
  },
  create: async (data, id) => {
    return await Actions.create(`api/events/${id}/sendpush`, data);
  },
};

export const FaqsApi = {
  byEvent: async (id) => {
    return await Actions.getAll(`api/events/${id}/faqs`).then(({ data }) => data);
  },
  getOne: async (id, eventId) => {
    return await Actions.get(`api/events/${eventId}/faqs/`, id);
  },
  editOne: async (data, id, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`api/events/${eventId}/faqs/${id}/?token=${token}`, data, true);
  },
  deleteOne: async (id, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${eventId}/faqs/${id}/?token=${token}`, '', true);
  },
  create: async (data, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`api/events/${id}/faqs/?token=${token}`, data, true);
  },
};

export const RolAttApi = {
  byEvent: async (event) => {
    let token = await GetTokenUserFirebase();
    const rollsByEvent = await Actions.getAll(`api/events/${event}/rolesattendees?token=${token}`, true);

    /** Se discriminan estos dos rol id debido a que no se deben editar ni eliminar y aunque el back tiene dicha validacion en el componente CMS es dificil validar dicha accion ya que es un componente que se reutiliza varias veces y puede alterar la logica de otras funcionalidades, este arreglo es temporal mientras se estructura la logica para roles */

    const rollsByEventFiltered = rollsByEvent.filter(
      (rol) =>
        rol._id !== ROLS_USER_ID.ADMINISTRATOR_ID /* '5c1a59b2f33bd40bb67f2322' */ &&
        rol._id !== ROLS_USER_ID.ATTENDEE_ID /* '60e8a7e74f9fb74ccd00dc22' */
    );
    return rollsByEventFiltered;
  },
  byEventRolsGeneral: async () => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/rols?token=${token}`);
  },
  getOne: async (event, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/events/${event}/rolesattendees/${id}/?token=${token}`, true);
  },
  editOne: async (data, id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`/api/events/${event}/rolesattendees/${id}?token=${token}`, data, true);
  },
  deleteOne: async (id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`/api/events/${event}/rolesattendees/${id}?token=${token}`, '', true);
  },
  create: async (data, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`api/events/${event}/rolesattendees?token=${token}`, data);
  },
  getRoleHasPermissionsinThisEvent: async (rolId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/rolespermissionsevents/findbyrol/${rolId}/?token=${token}`, true);
  },
  ifTheRoleExists: async (rolId) => {
    let token = await GetTokenUserFirebase();
    try {
      return await Actions.get(`api/rols/${rolId}/rolseventspublic/?token=${token}`, true);
    } catch (error) {
      if (error?.response?.status === 404) return { type: 'the role does not exist' };
    }
  },
};

export const MessageApi = {
  byEvent: async (eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/events/${eventId}/messages/?token=${token}`, true);
  },
  getOne: async (id, eventId) => {
    /* return await Actions.get(`api/events/${eventId}/messages/`, id); */
    let token = await GetTokenUserFirebase();
    return await Actions.get(`/api/events/${eventId}/message/${id}/messageUser/?token=${token}`, true);
  },
  updateOne: async (eventId, id) => {
    /* return await Actions.get(`api/events/${eventId}/messages/`, id); */
    let token = await GetTokenUserFirebase();
    return await Actions.put(`/api/events/${eventId}/updateStatusMessageUser/${id}?token=${token}`, true);
  },
  /* editOne: async (data, id, eventId) => {
    return await Actions.edit(`/api/events/${eventId}/messages`, data, id);
  },
  deleteOne: async (id, eventId) => {
    return await Actions.delete(`/api/events/${eventId}/messages`, id);
  },
  create: async (data, eventId) => {
    return await Actions.create(`api/events/${eventId}/messages`, data);
  }, */
};

export const SpacesApi = {
  byEvent: async (event) => {
    return await Actions.getAll(`api/events/${event}/spaces`).then(({ data }) => data);
  },
  getOne: async (id, event) => {
    return await Actions.get(`api/events/${event}/spaces/`, id);
  },
  editOne: async (data, id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`api/events/${event}/spaces/${id}?token=${token}`, data, true);
  },
  deleteOne: async (id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${event}/spaces/${id}?token=${token}`, '', true);
  },
  create: async (data, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`api/events/${event}/spaces?token=${token}`, data, true);
  },
};
export const CategoriesAgendaApi = {
  byEvent: async (event) => {
    return await Actions.getAll(`api/events/${event}/categoryactivities`).then(({ data }) => data);
  },
  getOne: async (id, event) => {
    return await Actions.getOne(`api/events/${event}/categoryactivities/`, id);
  },
  editOne: async (data, id, event) => {
    return await Actions.edit(`api/events/${event}/categoryactivities/${id}`, data, true);
  },
  deleteOne: async (id, event) => {
    return await Actions.delete(`api/events/${event}/categoryactivities`, id);
  },
  create: async (event, data) => {
    return await Actions.create(`api/events/${event}/categoryactivities`, data);
  },
};
export const TypesAgendaApi = {
  byEvent: async (event) => {
    return await Actions.getAll(`api/events/${event}/type`).then(({ data }) => data);
  },
  getOne: async (id, event) => {
    return await Actions.getOne(`api/events/${event}/type/`, id);
  },
  editOne: async (data, id, event) => {
    return await Actions.edit(`api/events/${event}/type/${id}`, data, true);
  },
  deleteOne: async (id, event) => {
    return await Actions.delete(`api/events/${event}/type/`, id, true);
  },
  create: async (event, data) => {
    return await Actions.create(`api/events/${event}/type`, data);
  },
};

export const AgendaApi = {
  byEvent: async (event, query) => {
    return await Actions.getAll(`api/events/${event}/activities${query ? query : ''}`, true);
  },
  usersByActivities: async (event) => {
    return await Actions.getAll(`api/events/${event}/activities_attendees`);
  },
  getOne: async (id, event) => {
    return await Actions.getOne(`api/events/${event}/activities/`, id);
  },
  editOne: async (data, id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`api/events/${event}/activities/${id}?token=${token}`, data, true);
  },
  deleteOne: async (id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${event}/activities`, `${id}?token=${token}`);
  },
  create: async (event, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`api/events/${event}/activities?token=${token}`, data);
  },
  duplicate: async (event, data, id) => {
    return await Actions.create(`api/events/${event}/duplicateactivitie/${id}`, data);
  },
  zoomConference: async (event, id, data) => {
    return await Actions.create(`api/events/${event}/createmeeting/${id}`, data);
  },
  getStatusVideoVimeo: async (videoId) => {
    return await Actions.get(`api/vimeo/videos/${videoId}`);
  },
  deleteVideoVimeo: async (videoId) => {
    return await Actions.delete(`api/vimeo/videos/${videoId}`, '');
  },
};
export const SpeakersApi = {
  byEvent: async (event) => {
    return await Actions.getAll(`api/events/${event}/host`).then(({ data }) => data);
  },
  getOne: async (id, event) => {
    return await Actions.getOne(`api/events/${event}/host/`, id);
  },
  editOne: async (data, id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.edit(`api/events/${event}/host/${id}?token=${token}`, data, true);
  },
  deleteOne: async (id, event) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${event}/host`, `${id}?token=${token}`);
  },
  create: async (event, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.create(`api/events/${event}/host?token=${token}`, data, true);
  },
};

export const PlansApi = {
  getAll: async () => {
    return await Actions.getAll(`api/plans`, true);
  },
  getOne: async (id) => {
    return await Actions.getOne(`api/plans/`, id);
  },
  getTotalRegisterdUsers: async () => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/users/me/totaluser?token=${token}`, true);
  },
  getCurrentConsumptionPlanByUsers: async (userId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/users/${userId}/currentPlan?token=${token}`, true);
  },
};

export const AlertsPlanApi = {
  getAll: async () => {
    return await Actions.getAll(`api/notfitications`, true);
  },
  getByUser: async (userId) => {
    //1ra objeto es el ultimo que se creo
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/users/${userId}/notifications?token=${token}`, true);
  },
  getOne: async (id) => {
    return await Actions.getOne(`api/notifications/`, id);
  },

  createOne: async (data) => {
    return await Actions.post(`api/notifications/`, data, true);
  },

  editOne: async (id, data) => {
    return await Actions.put(`api/notifications/${id}`, data, true);
  },

  deleteOne: async (userId, eventId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/users/${userId}/notifications/${eventId}`, `${userId}?token=${token}`);
  },
};

export const BillssPlanApi = {
  getByUser: async (userId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.getAll(`api/users/${userId}/billings?token=${token}`, true);
  },
  getAddonByUser: async (userId) => {
    return await Actions.get(`api/users/${userId}/addons`);
  },
};

export const OrganizationPlantillaApi = {
  createTemplate: async (organization, data) => {
    let token = await GetTokenUserFirebase();
    return await Actions.post(`api/organizations/${organization}/templateproperties?token=${token}`, data);
  },

  byEvent: async (organization) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/organizations/${organization}/templateproperties?token=${token}`);
  },
  putOne: async (event, templatepropertie) => {
    let token = await GetTokenUserFirebase();
    return await Actions.put(
      `api/events/${event}/templateproperties/${templatepropertie}/addtemplateporperties?token=${token}`
    );
  },
  deleteOne: async (template, organization) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/organizations/${organization}/templateproperties`, `${template}?token=${token}`);
  },
};

export const ExternalSurvey = async (meeting_id) => {
  return await Actions.get(`${ApiEviusZoomSurvey}/?meeting_id=${meeting_id}`);
};

export const Activity = {
  Register: async (event, user_id, activity_id) => {
    let token = await GetTokenUserFirebase();
    var info = {
      event_id: event,
      user_id,
      activity_id,
    };
    return await Actions.create(`api/events/${event}/activities_attendees/?token=${token}`, info);
  },
  GetUserActivity: async (event, user_id) => {
    return await Actions.get(`api/events/${event}/activities_attendees?user_id=${user_id}`);
  },

  getActivyAssitants: async (event, activity_id) => {
    return await Actions.get(`api/events/${event}/activities_attendees?activity_id=` + activity_id);
  },
  getActivyAssitantsAdmin: async (event, activity_id) => {
    return await Actions.get(`api/events/${event}/activities_attendeesAdmin?activity_id=` + activity_id);
  },

  checkInAttendeeActivity: async (event_id, activity_id, user_id) => {
    let token = await GetTokenUserFirebase();
    //let data = { checkedin_at: new Date().toISOString() };
    let data = {
      user_id,
      activity_id,
      checkedin_at: Moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    let result = await Actions.put(`api/events/${event_id}/activities_attendees/checkin?token=${token}`, data);
    return result;
  },

  DeleteRegister: async (event, id) => {
    let token = await GetTokenUserFirebase();
    return await Actions.delete(`api/events/${event}/activities_attendees`, `${id}?token=${token}`);
  },

  Update: async (event, user_id, data) => {
    let token = await GetTokenUserFirebase();
    var info = {
      event_id: event,
      user_id,
      // activity_id,
    };
    return await Actions.put(`api/events/${event}/activities_attendees/${user_id}?token=${token}`, data);
  },
  addCheckIn: async (eventUser_id, checkInType, activityId) => {
    let token = await GetTokenUserFirebase();
    const checkedin_type = checkInType;
    return await Actions.put(
      `/api/eventUsers/${eventUser_id}/checkinactivity/${activityId}?token=${token}`,
      { checkedin_type },
      true
    );
  },
  deleteCheckIn: async (eventUser_id, activityId) => {
    let token = await GetTokenUserFirebase();

    return await Actions.put(`api/eventUsers/${eventUser_id}/uncheckinactivity/${activityId}?token=${token}`, {}, true);
  },
};

export const Networking = {
  getInvitationsReceived: async (eventId, userId) => {
    let token = await GetTokenUserFirebase();
    /* console.log('OBTENINENDO INVITACIONES===>'); */
    return await Actions.get(`api/events/${eventId}/indexinvitationsrecieved/${userId}?token=${token}`);
  },
  getInvitationsSent: async (eventId, userId) => {
    let token = await GetTokenUserFirebase();
    return await Actions.get(`api/events/${eventId}/indexinvitations/${userId}?token=${token}`);
  },
  acceptOrDeclineInvitation: async (eventId, userId, data) => {
    return await Actions.put(`/api/events/${eventId}/acceptordecline/${userId}`, data);
  },
  getContactList: async (eventId, userId) => {
    return await Actions.getOne(`/api/events/${eventId}/contactlist/`, userId);
  },
};

export const countryApi = {
  getCountries: async () => {
    return countryInstance.get('/countries').then(({ data }) => data);
  },
  getCountry: async (id) => {
    return countryInstance.get(`/countries/${id}`).then(({ data }) => data);
  },
  getStates: async () => {
    return countryInstance.get(`/states`).then(({ data }) => data);
  },
  getStatesByCountry: async (id) => {
    return countryInstance.get(`/countries/${id}/states`).then(({ data }) => data);
  },

  getCitiesByCountry: async (id) => {
    return countryInstance.get(`/countries/${id}/cities`).then(({ data }) => data);
  },

  getCities: async (country, state) => {
    return countryInstance.get(`/countries/${country}/states/${state}/cities`).then(({ data }) => data);
  },
};

export const ActivityBySpeaker = {
  byEvent: async (event, idSpeaker) => {
    return await Actions.getOne(`api/events/${event}/activitiesbyhost/`, idSpeaker);
  },
};

export const OrganizationFuction = {
  // OBTENER EVENTOS PROXIMOS POR ORGANIZACION
  getEventsByOrg: async (orgId, order = 'asc', date = '', type = '') => {
    const events = await Actions.getAll(`api/organizations/${orgId}/events?order=${order}&date=${date}&type=${type}`);
    return events;
  },
  getEventsByOrgOnlyName: async (orgId, order = 'asc', date = '', type = '') => {
    const events = await Actions.getAll(`api/organizations/${orgId}/events/get-names?order=${order}&date=${date}&type=${type}`);
    return events;
  },

  // OBTENER DATOS DE LA ORGANIZACION
  obtenerDatosOrganizacion: async (orgId) => {
    const organization = await OrganizationApi.getOne(orgId);
    return organization;
  },
};
//ENDPOINT PARA CREAR ORDENES
export const OrderFunctions = {
  createOrder: async (data) => {
    return await Actions.post(`/api/orders`, data);
  },
};

export default privateInstance;
