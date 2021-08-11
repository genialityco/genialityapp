import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { SurveyPage } from './services/services';
import UserGamification from './services/userGamificationService';
import getCurrentEvenUser from './services/getCurrentEventUserService';
import setUserPointsPerSurvey from './services/setUserPointsPerSurveyService';
import Graphics from './graphics';
import { UseEventContext } from '../../../Context/eventContext';
import * as Survey from 'survey-react';
import InternarlSurveyStyles from './components/internarlSurveyStyles';
import LoadSelectedSurvey from './functions/loadSelectedSurvey';
import RegisterVote from './functions/registerVote';
import TimerAndMessageForTheNextQuestion from './functions/timerAndMessageForTheNextQuestion';
import HelpFiftyFifty from './functions/helpFiftyFifty';
import MessageWhenCompletingSurvey from './functions/messageWhenCompletingSurvey';
import RealTimeSurveyListening from './functions/realTimeSurveyListening';
import TimeLimitPerQuestion from './functions/timeLimitPerQuestion';
import SetCurrentUserSurveyStatus from './functions/setCurrentUserSurveyStatus';
// import { firestore, fireRealtime } from '../../../helpers/firebase';

function SurveyComponent(props) {
   const { eventId, idSurvey, surveyLabel, operation, showListSurvey, currentUser } = props;

   const cEvent = UseEventContext();
   const eventStyles = cEvent.value.styles;
   const loaderIcon = <LoadingOutlined style={{ color: '#2bf4d5' }} />;
   const [surveyData, setSurveyData] = useState({});
   const [rankingList, setRankingList] = useState([]); // Este estado se usa para gamification
   const [feedbackMessage, setFeedbackMessage] = useState();
   const [eventUsers, setEventUsers] = useState([]);
   const [voteWeight, setVoteWeight] = useState(0);
   const [freezeGame, setFreezeGame] = useState(false);
   const [showMessageOnComplete, setShowMessageOnComplete] = useState(false);
   const [timerPausa, setTimerPausa] = useState(null);
   const [initialSurveyModel, setInitialSurveyModel] = useState(null);
   const [rankingPoints, setRankingPoints] = useState(null);
   const [fiftyfitfyused, setFiftyfitfyused] = useState(false);
   let [totalPoints, setTotalPoints] = useState(0);
   let [onCurrentPageChanged, setOnCurrentPageChanged] = useState(0);
   let [showOrHideSurvey, setShowOrHideSurvey] = useState(true); // nos permite ocultar la siguiente pregunta antes de que pueda ser mostrada

   useEffect(() => {
      // asigna los colores del evento para la UI de la encuesta
      InternarlSurveyStyles(eventStyles);

      //listener que nos permite saber los cambios de la encuesta en tiempo real
      RealTimeSurveyListening(idSurvey, currentUser, startingSurveyComponent);
   }, [idSurvey]);

   useEffect(() => {
      /**
       * Timers para controlar el tiempo por pregunta, estos se deben detener o el quiz seguira avanzando errando la logica ya que cambia la pregunta que se esta respondiendo
       */
      if (initialSurveyModel) {console.log("10. HOLA IF 1")
         initialSurveyModel.stopTimer();
      }
      console.log("10. timer", timerPausa)
      if (timerPausa) {console.log("10. HOLA IF 2")
         clearInterval(timerPausa);
      }
   }, [initialSurveyModel, idSurvey]);

   async function startingSurveyComponent(surveyRealTime) {
      setFreezeGame(surveyRealTime.freezeGame);
      console.log("10. startingSurveyComponent ", surveyRealTime.freezeGame)
      let loadSurveyData = await LoadSelectedSurvey(eventId, idSurvey, surveyRealTime);
      if (loadSurveyData) {         
         loadSurveyData.open = surveyRealTime.isOpened;
         loadSurveyData.publish = surveyRealTime.isPublished;
         loadSurveyData.freezeGame = surveyRealTime.freezeGame;
      }

      let surveyModelData = new Survey.Model(loadSurveyData);
      surveyModelData.currentPageNo = surveyRealTime.currentPage;

      setSurveyData(loadSurveyData);
      setInitialSurveyModel(surveyModelData);

      // Esto permite obtener datos para la grafica de gamificacion
      UserGamification.getListPoints(eventId, setRankingList);

      //Se obtiene el EventUser para los casos que se necesite saber el peso voto
      await getCurrentEvenUser(eventId, setEventUsers, setVoteWeight);
   }

   // Funcion para enviar la informacion de las respuestas
   async function sendData(surveyModel) {
      setRankingPoints(null);
      const status = surveyModel.state;

      SetCurrentUserSurveyStatus(surveyData, currentUser, status);

      const question = surveyModel.currentPage.questions[0];

      const pointsForCorrectAnswer = RegisterVote(surveyData, question, currentUser, eventUsers, voteWeight);

      setRankingPoints(pointsForCorrectAnswer);
      await registerRankingPoints(pointsForCorrectAnswer, surveyModel, surveyData, currentUser.value, eventId);
      if (!(Object.keys(currentUser).length === 0)) {
         //Actualizamos la página actúal, sobretodo por si se cae la conexión regresar a la última pregunta
         SurveyPage.setCurrentPage(surveyData._id, currentUser.value._id, surveyModel.currentPageNo);
      }

      let isLastPage = surveyModel.isLastPage;

      if (surveyData.allow_gradable_survey === 'true') {
         if (isLastPage) {
            setShowMessageOnComplete(false);
         }
      }
   }

   async function registerRankingPoints(rankingPoints, surveyModel, surveyData, currentUser, eventId) {
      if (rankingPoints === undefined || rankingPoints === 0) return;
      if (surveyData.allow_gradable_survey !== 'true') return;

      /** Obtenemos el puntaje por si se retomo la encuesta */
      let userScore = await UserGamification.getUserPoints(eventId, currentUser._id);
      let userPointsData = userScore.data ? userScore.data.pointspoints : 0;

      //para guardar el score en el ranking
      userPointsData += rankingPoints;
      setTotalPoints(userPointsData);

      // Ejecuta serivicio para registrar puntos
      await UserGamification.registerPoints(eventId, {
         user_id: currentUser._id,
         user_name: currentUser.names,
         user_email: currentUser.email,
         points: rankingPoints,
      });

      setUserPointsPerSurvey(surveyData._id, currentUser, userPointsData, surveyModel.getAllQuestions().length - 1);
      // message.success({ content: responseMessage });
   }

   /* handler cuando la encuesta inicia, este sirve para retomar la encuesta donde vayan todos los demas usuarios */
   function onStartedSurvey(initialSurveyModel) {
      if (surveyData.allow_gradable_survey === 'true') {
         if (freezeGame === 'true') {
            initialSurveyModel.stopTimer();
            TimerAndMessageForTheNextQuestion(
               initialSurveyModel,
               0,
               setTimerPausa,
               setFeedbackMessage,
               setShowMessageOnComplete,
               rankingPoints,
               freezeGame,
               'info'
            );
         }
      }
   }

   /* handler cuando la encuesta cambio de pregunta */
   function onCurrentSurveyPageChanged() {
      if (!onCurrentPageChanged?.options?.oldCurrentPage) return;
      let secondsToGo =
         onCurrentPageChanged.surveyModel.maxTimeToFinishPage - onCurrentPageChanged.options.oldCurrentPage.timeSpent;
      const status = onCurrentPageChanged.surveyModel.state;

      if (surveyData.allow_gradable_survey === 'true') {
         setShowOrHideSurvey(false);
         setFeedbackMessage({ icon: loaderIcon });
         if (status === 'running') {
            onCurrentPageChanged.surveyModel.stopTimer();
            TimerAndMessageForTheNextQuestion(
               onCurrentPageChanged.surveyModel,
               secondsToGo,
               setTimerPausa,
               setFeedbackMessage,
               setShowMessageOnComplete,
               rankingPoints,
               freezeGame,
               setShowOrHideSurvey
            );
         } else if (status === 'completed') {
            setShowOrHideSurvey(true);
         }
      }
   }

   useEffect(() => {
      onCurrentSurveyPageChanged();
   }, [onCurrentPageChanged]);

   if (!surveyData) return 'Cargando...';
   return (
      <div>
         {initialSurveyModel && initialSurveyModel.state === 'completed' && (
            <>
               {surveyData &&
                  (surveyData.allow_gradable_survey === 'false' || surveyData.allow_gradable_survey === false) && (
                     <Graphics
                        idSurvey={idSurvey}
                        eventId={eventId}
                        surveyLabel={surveyLabel}
                        showListSurvey={showListSurvey}
                        operation={operation}
                     />
                  )}
            </>
         )}

         {!showOrHideSurvey && surveyData.allow_gradable_survey === 'true' && (
            <Result className='animate__animated animate__fadeIn' {...feedbackMessage} extra={null} />
         )}

         {//Se realiza la validacion si la variable allow_anonymous_answers es verdadera para responder la encuesta
         surveyData &&
            (surveyData.allow_anonymous_answers === 'true' ||
               surveyData.allow_anonymous_answers === true ||
               surveyData.publish === 'true' ||
               surveyData.publish === true) && (
               <div style={{ display: showOrHideSurvey ? 'block' : 'none' }}>
                  {initialSurveyModel && (
                     <div className='animate__animated animate__bounceInDown'>
                        {/* {surveyData.allow_gradable_survey === 'true' && !fiftyfitfyused && (
                           <div
                              className='survy-comodin'
                              onClick={() => HelpFiftyFifty(setFiftyfitfyused, initialSurveyModel)}>
                              <Button>
                                 {' '}
                                 50 / 50 <BulbOutlined />
                              </Button>
                           </div>
                        )} */}

                        <Survey.Survey
                           model={initialSurveyModel}
                           onComplete={(surveyModel) => sendData(surveyModel, 'completed')}
                           onPartialSend={(surveyModel) => sendData(surveyModel, 'partial')}
                           onCompleting={(surveyModel) =>
                              MessageWhenCompletingSurvey(surveyModel, surveyData, totalPoints)
                           }
                           onTimerPanelInfoText={TimeLimitPerQuestion}
                           onStarted={onStartedSurvey}
                           onCurrentPageChanged={(surveyModel, options) =>
                              setOnCurrentPageChanged({ surveyModel, options }, setShowOrHideSurvey(true))
                           }
                        />
                     </div>
                  )}
               </div>
            )}
      </div>
   );
}
const mapDispatchToProps = {};

const mapStateToProps = (state) => ({
   currentSurveyStatus: state.survey.data.currentSurveyStatus,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyComponent);
