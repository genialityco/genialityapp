import { firestore } from "../../helpers/firebase";
import API, { UsersApi } from "../../helpers/request";

const refUsersRequests = (eventId) => `${eventId}_users_requests`;
const refUsersList = (eventId) => `${eventId}_event_attendees`;

const filterList = (list, currentUser) => list.filter((item) => item.account_id !== currentUser);

// Funcion para consultar la informacion del actual usuario -------------------------------------------
export const getCurrentUser = (token) => {
  return new Promise(async (resolve, reject) => {
    if (!token) {
      resolve("guestUser");
    } else {
      try {
        const resp = await API.get(`/auth/currentUser?evius_token=${token}`);
        if (resp.status === 200) resolve(resp.data);
      } catch (error) {
        const { status } = error.response;
        console.log("STATUS", status, status === 401);
      }
    }
  });
};

export const getCurrentEventUser = (eventId, userId) => {
  return new Promise((resolve, reject) => {
    let refEventUser = refUsersList(eventId);

    firestore
      .collection(refEventUser)
      .where("account_id", "==", userId)
      .get()
      .then((docs) => {
        docs.forEach((infoDoc) => {
          resolve(infoDoc.data());
        });
      })
      .catch((err) => {
        console.log("Hubo un problema: ", err);
      });
  });
};

// User services
export const userRequest = {
  // Obtiene las solicitudes de un usuario
  getUserRequestList: async (eventId, currentUser) => {
    return new Promise((resolve, reject) => {
      let refCollection = refUsersRequests(eventId);

      firestore
        .collection(refCollection)
        .where("id_user_requesting", "==", currentUser)
        .onSnapshot((docs) => {
          console.log(docs, docs.empty);
          let requestList = [];
          if (docs.empty) {
            resolve(false);
          }
          docs.forEach((infoDoc) => {
            console.log("----", infoDoc);
            requestList.push({ _id: infoDoc.id, ...infoDoc.data() });
          });

          resolve(requestList);
        });
    });
  },

  //   Obtiene los contactos de un usuario
  getUserContactList: async () => {
    console.log("Obteniendo la lista de contactos");
  },

  //   Obtiene la lista de los asistentes al evento -------------------------------------------
  getEventUserList: async (eventId, token) => {
    let refEventUser = refUsersList(eventId);

    return new Promise((resolve, reject) => {
      // Se obtiene el id del token recibido
      getCurrentUser(token).then(async (currentUser) => {
        let docs = [];
        const users = await UsersApi.getAll(eventId, "?pageSize=10000");

        if (!users) {
          resolve(docs);
        }

        docs = users.data.filter((user) => user.account_id != currentUser._id);
        resolve(docs);
      });
    });
  },
};
