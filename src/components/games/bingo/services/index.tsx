import { BingoApi } from '@/helpers/request';
import { DispatchMessageService } from '@/context/MessageService';
import { SaveCurrentStateOfBingoInterface } from '../interfaces/bingo';
import { firestore } from '@/helpers/firebase';
import firebase from 'firebase/compat';

export const CreateBingo = async (event: string, data: { name: string }) => {
  try {
    const response = await BingoApi.createOne(event, data);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al crear bingo', action: 'show' });
    return null;
  }
};

export const GetBingo = async (id: string) => {
  try {
    const response = await BingoApi.getOne(id);

    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al obtener bingo', action: 'show' });
    return null;
  }
};

export const UpdateBingo = async (event: string, data: any, id: string) => {
  try {
    const response = await BingoApi.editOne(event, data, id);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al actualizar bingo', action: 'show' });
    return null;
  }
};

export const UpdateBingoDimension = async (event: string, data: any, id: string) => {
  try {
    const response = await BingoApi.editDimension(event, data, id);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al actualizar bingo', action: 'show' });
    return null;
  }
};

export const DeleteBingo = async (event: string, id: string) => {
  try {
    const response = await BingoApi.deleteOne(event, id);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al eliminar bingo', action: 'show' });
    return null;
  }
};
export const getUserBingo = async (user: string) => {
  try {
    const response = await BingoApi.getByUser(user);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al obtener bingo', action: 'show' });
    return null;
  }
};

export const getCartonBingo = async (carton: string) => {
  try {
    const response = await BingoApi.getByCarton(carton);
    return response;
  } catch (error) {
    return null;
  }
};

export const saveCurrentStateOfBingo = async ({
  event,
  newList,
  currentValue,
  demonstratedBallots,
  startGame,
}: SaveCurrentStateOfBingoInterface) => {
  await firestore
    .collection('bingosByEvent')
    .doc(event?._id)
    .set({ bingoData: newList, currentValue, demonstratedBallots, startGame }, { merge: true });
};
export const deleteStateOfBingo = async ({ event }: { event: { _id?: string | undefined } }) => {
  await firestore
    .collection('bingosByEvent')
    .doc(event._id)
    .delete();
};
export const deleteBingoNotifications = async ({ event }: { event: { _id?: string | undefined } }) => {
  await firestore
    .collection('bingosByEvent')
    .doc(event._id)
    .collection('notifications')
    .get()
    .then((querySnapshot) => {
      querySnapshot.docs.forEach((snapshot) => {
        snapshot.ref.delete();
      });
    });
};

export const saveBingoByUser = async ({ event, user, data }: { event: string; user: string; data: object }) => {
  await firestore
    .collection('bingosByEvent')
    .doc(event)
    .collection('notifications')
    .doc(user)
    .set({ ...data, time: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
};

export const listenBingoNotifications = (
  eventId: string,

  setData: any
) => {
  const unSuscribe = firestore
    .collection('bingosByEvent')
    .doc(eventId)
    .collection('notifications')

    .onSnapshot((snapshot) => {
      let data: {
        _id: string;
        cardId: string;
        names: string;
        values_bingo_card: string[];
        time: Date;
        values_ballot: string[];
        hasWon: boolean;
      }[] = [];
      if (snapshot) {
        // ordenar el array por el campo time y hacer push a data
        snapshot.docs.forEach((doc) => {
          data.push({
            _id: doc.id,
            cardId: doc.data().cardId,
            names: doc.data().names,
            values_bingo_card: doc.data().values_bingo_card,
            time: new Date(doc.data().time.seconds * 1000),
            values_ballot: doc.data().values_ballot,
            hasWon: doc.data()?.hasWon ? doc.data()?.hasWon : false,
          });
        });
        // ordenar por fecha y hora de manera descendente
        data
          .sort((a, b) => {
            if (a.time > b.time) {
              return -1;
            }
            if (a.time < b.time) {
              return 1;
            }
            return 0;
          })
          .reverse();

        setData(data);
      }
      setData(data);
    });

  return unSuscribe;
};

export const listenBingoData = (eventID: string | undefined, setData: any, clearCarton?: any) => {
  const unSuscribe = firestore
    .collection('bingosByEvent')
    .doc(eventID)
    .onSnapshot((doc) => {
      let data: any = {
        currentValue: { type: '', value: '¡BINGO!' },
        bingoData: [],
        _id: '',
        demonstratedBallots: [],
        startGame: false,
      };

      if (doc.exists) {
        data = {
          bingoData: doc?.data()?.bingoData || [],
          currentValue: doc?.data()?.currentValue || { type: '', value: '¡BINGO!' },
          _id: doc?.id || '',
          demonstratedBallots: doc?.data()?.demonstratedBallots || [],
          startGame: doc?.data()?.startGame || false,
        };
        setData(data);
        if (data.demonstratedBallots.length === 0) {
          clearCarton();
        }
      }
      setData(data);
    });
  return unSuscribe;
};

export const importValuesBingo = async (event: string, bingo: string, data: any) => {
  try {
    const response = await BingoApi.createDataImport(event, bingo, data);
    return response;
  } catch (error) {
    console.error(error);
    DispatchMessageService({ type: 'error', msj: 'Error al importar datos,' + error, action: 'show' });
    return null;
  }
};

export const updateValueBingo = async (event: string, bingo: string, id: string, data: any) => {
  try {
    const response = await BingoApi.editValue(event, bingo, id, data);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al actualizar los datos', action: 'show' });
    return null;
  }
};
export const deleteValueBingo = async (event: string, bingo: string, id: string) => {
  try {
    const response = await BingoApi.deleteValue(event, bingo, id);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al eliminar el dato', action: 'show' });
    return null;
  }
};
export const createValueBingo = async (event: string, bingo: string, data: any) => {
  try {
    const response = await BingoApi.createValue(event, bingo, data);
    return response;
  } catch (error) {
    DispatchMessageService({ type: 'error', msj: 'Error al crear el dato', action: 'show' });
    return null;
  }
};

export const deleteSpecificBingoNotification = async ({
  event,
  notificationId,
}: {
  event: { _id?: string | undefined };
  notificationId: string;
}) => {
  await firestore
    .collection('bingosByEvent')
    .doc(event._id)
    .collection('notifications')
    .doc(notificationId)
    .delete();
};

export const addWinnerBadgeToBingoNotification = async ({
  event,
  notificationId,
}: {
  event: { _id?: string | undefined };
  notificationId: string;
}) => {
  await firestore
    .collection('bingosByEvent')
    .doc(event._id)
    .collection('notifications')
    .doc(notificationId)
    .set({ hasWon: true }, { merge: true });
};
