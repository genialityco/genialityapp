import { useState, useEffect, useContext } from 'react';
import { firestore } from '../../../helpers/firebase';
import RankingList from './rankingList';
import RankingMyScore from './rankingMyScore';
import { Divider } from 'antd';
import { UseSurveysContext } from '../../../context/surveysContext';
import { UseCurrentUser } from '../../../context/userContext';
import { HelperContext } from '../../../context/HelperContext';
import { UseEventContext } from '../../../context/eventContext';

function RankingTrivia(props) {
  const { setGameRanking, setMyScore } = useContext(HelperContext);
  let cSurveys = UseSurveysContext();
  let cUser = UseCurrentUser();
  let eventContext = UseEventContext();
  let currentSurvey = cSurveys.currentSurvey;
  let currentUser = cUser.value;
  let currentEvent = eventContext.value;

  // useEffect(() => {
  //   let unsubscribe;
  //   if (!currentSurvey) return;
  //   if (!(Object.keys(currentUser).length === 0)) {
  //     const initialValues = {
  //       name: currentUser.names ? currentUser.names : currentUser.name,
  //       score: 0,
  //     };

  //     unsubscribe = firestore
  //       .collection('surveys')
  //       .doc(currentSurvey._id)
  //       .collection('ranking')
  //       .doc(currentUser._id)
  //       .onSnapshot(function(result) {
  //         if (result.exists) {
  //           const data = result.data();
  //           setMyScore({ ...initialValues, score: data.correctAnswers });
  //         } else {
  //           setMyScore(initialValues);
  //         }
  //       });
  //   }
  //   return () => {
  //     unsubscribe();
  //     setMyScore({ name: '', score: 0 });
  //   };
  // }, [currentUser, currentSurvey]);

  useEffect(() => {
    let unsubscribe;
    if (!(Object.keys(currentUser).length === 0)) {
      if (!currentSurvey) return;
      unsubscribe = firestore
        .collection('surveys')
        .doc(currentSurvey._id)
        .collection('ranking')
        .orderBy('correctAnswers', 'desc')
        // .limit(10)
        .onSnapshot(async (querySnapshot) => {
          var puntajes = [];
          puntajes = await Promise.all(
            querySnapshot.docs.map(async (doc, index) => {
              const result = doc.data();
              let picture;
              if (result?.userId) {
                picture = await getDataUser(result?.userId);
              }
              result['score'] = result.correctAnswers;
              result['name'] = result.userName;
              result['imageProfile'] = picture;
              result['index'] = index + 1;
              return result;
            })
          );
          const cUserId = cUser.value?._id;
          const filterForRankingUserId = puntajes.filter((rankingUsers) => rankingUsers.userId === cUserId);

          /** Puntaje individual */
          if (filterForRankingUserId?.length > 0) setMyScore(filterForRankingUserId);

          /** Puntaje de todos los participantes */
          setGameRanking(puntajes.slice(0, 10));
        });
    }
    return () => {
      unsubscribe();
      setMyScore([{ name: '', score: 0 }]);
      setGameRanking([]);
    };
  }, [currentSurvey, currentUser]);

  const getDataUser = async (iduser) => {
    let user = await firestore
      .collection(`${currentEvent._id}_event_attendees`)
      .where('account_id', '==', iduser)
      .get();

    if (user.docs.length > 0 && user.docs[0].data()) {
      const userPicture = user.docs[0].data().user?.picture;
      /** Se filtra para las imagenes que llegan con esta ruta './scripts/img/' en cambio de una Url  https://*/
      const userPictureFiltered = userPicture?.includes('./scripts/img/') ? null : userPicture;
      return userPictureFiltered;
    }
    return undefined;
  };

  return (
    <>
      {!(Object.keys(currentUser).length === 0) && (
        <>
          <RankingMyScore />
          <Divider />
          <RankingList />
        </>
      )}
    </>
  );
}

export default RankingTrivia;
