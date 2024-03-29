import { firestore } from '../../../../helpers/firebase';

export const SurveyPage = {
   // Obtiene la pagina actual de la encuesta
   // eslint-disable-next-line no-unused-vars
   getCurrentPage: (surveyId: string, uid: string) => {
      return new Promise((resolve, reject) => {
         try {
            firestore
               .collection('surveys')
               .doc(surveyId)
               .collection('userProgress')
               .doc(uid)
               .get()
               .then((doc) => {
                  if (doc.exists) {
                     // @ts-ignore
                     let { currentPageNo } = doc.data();
                     resolve(currentPageNo);
                  } else {
                     resolve(0);
                  }
               });
         } catch (e) {
            reject(e);
         }
      });
   },

   // Actualiza la pagina actual de la encuesta
   setCurrentPage: (surveyId: string, uid: string, currentPageNo: string) => {
      return new Promise((resolve, reject) => {
         let metaData = { currentPageNo: currentPageNo};
         firestore
            .collection('surveys')
            .doc(surveyId)
            .collection('userProgress')
            .doc(uid)
            .set(metaData, { merge: true })
            .then(() => {
               resolve(currentPageNo);
            })
            .catch((err) => {
               reject(err);
            });
      });
   },
};

export const Users = {
   getUsers: async (eventId: string) => {
      const snapshot = await firestore.collection(`${eventId}_event_attendees`).get();
      return snapshot.docs.map((doc) => doc.data());
   },
};
