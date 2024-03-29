import { firestore } from '../../../../helpers/firebase';
import { SurveyPage } from '../services/services';

function RealTimeSurveyListening(idSurvey: string, currentUser: any, startingSurveyComponent: any) {
  let currentPageNo = 0;

  firestore
    .collection('surveys')
    .doc(idSurvey)
    .onSnapshot(async (doc) => {
      let surveyRealTime = doc.data();

      //revisando si estamos retomando la encuesta en alguna página particular
      if (currentUser && currentUser.value._id && surveyRealTime) {
        currentPageNo = await SurveyPage.getCurrentPage(idSurvey, currentUser.value._id);
        surveyRealTime.currentPage = currentPageNo ? currentPageNo : 0;
        startingSurveyComponent(surveyRealTime);
      }
    });
}

export default RealTimeSurveyListening;
