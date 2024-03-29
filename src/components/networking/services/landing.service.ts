import { firestore } from '@/helpers/firebase';
import { IRequestMeenting } from '../interfaces/Landing.interfaces';
import { IMeetingRequestFirebase, SpaceMeeting, SpaceMeetingFirebase } from '../interfaces/space-requesting.interface';
import firebase from 'firebase/compat';
import event from '@/components/events/event';
import { RequestMeetingState } from '../utils/utils';
import { IMeeting } from '../interfaces/Meetings.interfaces';

export const listenMeetingsRequest = (eventId: string,userID: string, onSet: any) => {
  return firestore
  .collection(`networkingByEventId`)
  .doc(eventId)
  .collection('meeting_request')
  .where('user_to.id', '==', userID)
  .onSnapshot(snapshot => {
    if (!snapshot.empty) {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SpaceMeetingFirebase[];
      data = data.filter((item)=>item.status == RequestMeetingState.pending)
      onSet(data)
    } else {
      onSet([])
    }
  });
}
export const getMeetingRequest = async (
  property: string,
  eventId: string,
  userID: string,
  stateMeeting: string[]
) => {
  try {
    const requestMeetings = await firestore
      .collection('networkingByEventId')
      .doc(eventId)
      .collection('meeting_request')
      .where(property, '==', userID)
      .where('status', 'in', stateMeeting)
      .get();
    const data = requestMeetings.docs.map((item) => ({ id: item.id, ...item.data() }));
    return data;
  } catch (error) {
    return false;
  }
};

export const getMeetingForUsers = async (
  eventId: string,
  usersIds: string[]
) => {
  try {
    const requestMeetings = await firestore
      .collection('networkingByEventId')
      .doc(eventId)
      .collection('meetings')
      .where('participants', 'array-contains-any', usersIds)
      .get();
    const data = requestMeetings.docs.map((item) => ({ id: item.id, ...item.data() })) as IMeeting[];
    return data;
  } catch (error) {
    console.log(error)
  }
};
export const getMeetingForUsersAtDateStart = async (
  eventId: string,
  usersIds: string[],
  dateStart: firebase.firestore.Timestamp
) => {
  try {
    const requestMeetings = await firestore
      .collection('networkingByEventId')
      .doc(eventId)
      .collection('meetings')
      // .where('participants', 'array-contains-any', usersIds)
      .where('startTimestap', '==', dateStart)
      .get();
    const data = requestMeetings.docs.map((item) => ({ id: item.id, ...item.data() })) as IMeeting[];
    return data;
  } catch (error) {
    console.log(error)
  }
};

export const updateRequestMeeting = async (eventId: string, requestId: string, updateRequest: Partial<IRequestMeenting>) => {
  try {
    await firestore
      .collection(`networkingByEventId`)
      .doc(eventId)
      .collection('meeting_request')
      .doc(requestId)
      .update(updateRequest);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
export const deleteRequestMeeting = async (eventId: string, requestId: string) => {
  try {
    await firestore
      .collection(`networkingByEventId`)
      .doc(eventId)
      .collection('meeting_request')
      .doc(requestId)
      .delete();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const listeningSpacesAgendedMeetings = (eventId: string, userID: string, date: string, onSet: (data: SpaceMeetingFirebase[]) => void) => {
  return firestore
    .collection(`networkingByEventId`)
    .doc(eventId)
    .collection('spacesRequestingByUser')
    .where('userId', '==', userID)
    .onSnapshot(snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SpaceMeetingFirebase[];
        onSet(data)
      } else {
        onSet([])
      }
    });
}
export const listeningMeetingRequestByBothParticipants = (eventId: string, user_to_id: string, user_creator_id: string, date: string, onSet: (data: IMeetingRequestFirebase[]) => void) => {
  return firestore
    .collection(`networkingByEventId`)
    .doc(eventId)
    .collection('meeting_request')
    .where('meeting.participantsIds', 'array-contains-any', [user_to_id, user_creator_id])
    .onSnapshot(snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IMeetingRequestFirebase[];

        onSet(data)
      } else {
        onSet([])
      }
    });
}

export const createSpacesAgendedMeetings = async (eventId: string, dateStart: string, dateEnd: string, userId: string) => {
  try {
    const newSpaceAgended: SpaceMeeting = {
      userId,
      dateEnd: firebase.firestore.Timestamp.fromDate(new Date(dateEnd)),
      dateStart: firebase.firestore.Timestamp.fromDate(new Date(dateStart)),
      status: 'not_available'
    }
    await firestore
      .collection(`networkingByEventId`)
      .doc(eventId)
      .collection('spacesRequestingByUser')
      .doc()
      .set(newSpaceAgended);
    return true;
  } catch (error) {
    console.log(error)
    return false;
  }
};