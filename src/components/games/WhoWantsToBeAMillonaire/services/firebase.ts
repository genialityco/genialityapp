import { IStages, IVisibility, IParticipant } from './../interfaces/Millonaire';
import { firestore } from '@/helpers/firebase';
import firebase from 'firebase/compat';
import { Score } from '../../common/Ranking/types';

export const saveVisibilityControl = async (idEvent: string, visibilityControl: IVisibility) => {
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('visibilityControl')
    .doc('visibilityControl')
    .set(visibilityControl, { merge: true });
};

export const saveScoreUser = async (idEvent: string, idUser: string, user: Score) => {
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('scores')
    .doc(idUser)
    .set({ ...user, time: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
};

export const getScoreUser = async (idEvent: string, idUser: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('scores')
    .doc(idUser)
    .get();
  return snapshot.data();
};

export const getVisibilityControl = async (idEvent: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('visibilityControl')
    .doc('visibilityControl')
    .get();
  return snapshot.data();
};

export const getScore = async (idEvent: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('scores')
    .orderBy('score', 'desc')
    .get();

  return snapshot.docs.map((doc) => doc.data());
};

export const saveStageUser = async (idEvent: string, idUser: string, stage: IStages) => {
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('stages')
    .doc(idUser)
    .set(stage, { merge: true });
};

export const getStageUser = async (idEvent: string, idUser: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('stages')
    .doc(idUser)
    .get();
  return snapshot.data();
};

//listener of the visibility control
export const listenerVisibilityControl = (idEvent: string, callback: (visibilityControl: IVisibility) => void) => {
  firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('visibilityControl')
    .doc('visibilityControl')
    .onSnapshot((doc) => {
      callback(doc.data() as IVisibility);
    });
};

export const saveStatusGameByUser = async (idEvent: string, idUser: string, status: string) => {
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('statusGame')
    .doc(idUser)
    .set({ status }, { merge: true });
};

export const saveTimePerStage = async (idEvent: string, idUser: string, idStage: string, timePerStage: any) => {
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('users')
    .doc(idUser)
    .collection('stages')
    .doc(idStage)
    .set({ ...timePerStage }, { merge: true });
};

export const getTimePerStage = async (idEvent: string, idUser: string, idStage: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('users')
    .doc(idUser)
    .collection('stages')
    .doc(idStage)
    .get();
  return snapshot.data();
};


export const getStatusGameByUser = async (idEvent: string, idUser: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('statusGame')
    .doc(idUser)
    .get();
  return snapshot.data();
};
//listener of the stage

export const listenRanking = (idEvent: string, callback: (ranking: Score[]) => void) => {
  firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('scores')
    .orderBy('score', 'desc')
    .onSnapshot((snapshot) => {
      const ranking = snapshot.docs.map((doc) => doc.data()) as Score[];
      callback(ranking);
    });
};

export const deleteStatusStagesAndScoreAll = async (idEvent: string) => {
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('statusGame')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('stages')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('scores')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('participants')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });
};

export const saveParticipant = async (idEvent: string, idUser: string, participant: IParticipant) => {
  await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('participants')
    .doc(idUser)
    .set({...participant,
      time: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

export const getParticipant = async (idEvent: string, idUser: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('participants')
    .doc(idUser)
    .get();
  return snapshot.data();
}
export const getParticipants = async (idEvent: string) => {
  const snapshot = await firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('participants')
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

export const listenParticipants = (idEvent: string, callback: (participants: IParticipant[]) => void) => {
  firestore
    .collection('dinamicas')
    .doc('WhoWantsToBeAMillonaire')
    .collection('events')
    .doc(idEvent)
    .collection('participants')
    .orderBy('time', 'desc')
    .onSnapshot((snapshot) => {
      const participants = snapshot.docs.map((doc) => doc.data()) as IParticipant[];
      callback(participants);
    });
}