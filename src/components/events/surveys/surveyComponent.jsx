import React, { Component } from "react";
import Moment from "moment";
import { toast } from "react-toastify";
import { PageHeader, message } from "antd";
import graphicsImage from "../../../graficas.png"


import { SurveysApi, AgendaApi } from "../../../helpers/request";
import { firestore } from "../../../helpers/firebase";
import { SurveyAnswers, UserGamification } from "./services";
import { validateSurveyCreated } from "../../trivia/services";

import * as Survey from "survey-react";
import "survey-react/modern.css";
Survey.StylesManager.applyTheme("modern");

const surveyStyle = {
  overFlowX: "hidden",
  overFlowY: "scroll"
}


const imageGraphics = {
  display: "block",
  margin: "0 auto",
  maxWidth: "100%"
}

class SurveyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      surveyData: {},
      rankingList: [],
    };
  }

  componentDidMount() {
    const { eventId } = this.props;
    console.log("AQUI");
    this.loadData();
    UserGamification.getListPoints(eventId, this.getRankingList);
  }

  getRankingList = (list) => {
    this.setState({ rankingList: list });
  };

  // Funcion para cargar datos de la encuesta seleccionada
  loadData = async () => {
    const { idSurvey, eventId, singlePage } = this.props;
    let { surveyData } = this.state;

    // Esto permite que el json pueda asignar el id a cada pregunta
    Survey.JsonObject.metaData.addProperty("question", "id");

    let dataSurvey = await SurveysApi.getOne(eventId, idSurvey);
    console.log("surveyDat", dataSurvey);
    // Se crea una propiedad para paginar las preguntas
    dataSurvey.pages = [];

    // Se igual title al valor de survey
    dataSurvey.title = dataSurvey.survey;

    // El {page, ...rest} es temporal
    // Debido a que se puede setear la pagina de la pregunta
    // Si la pregunta tiene la propiedad 'page'

    if (!singlePage) {
      // Aqui se itera cada pregunta y se asigna a una pagina
      dataSurvey["questions"].forEach(({ page, ...rest }, index) => {
        dataSurvey.pages[index] = {
          name: `page${index + 1}`,
          questions: [{ ...rest, isRequired: true }],
        };
      });
    } else {
      dataSurvey.pages[0] = dataSurvey.pages[0] = { name: `page0`, questions: [] };
      dataSurvey["questions"].forEach(({ page, ...rest }, index) => {
        dataSurvey.pages[0].questions.push({ ...rest });
      });
    }

    // Se excluyen las propiedades
    const exclude = ({ survey, id, questions, ...rest }) => rest;

    surveyData = exclude(dataSurvey);

    console.log("pages", surveyData);

    this.setState({ surveyData, idSurvey });
  };

  // Funcion para enviar la informacion de las respuestas
  sendDataToServer = (survey) => {
    const { showListSurvey, eventId, currentUser, singlePage } = this.props;
    let { surveyData } = this.state;

    validateSurveyCreated(surveyData._id).then((existSurvey) => {
      if (!existSurvey) {
        firestore
          .collection("surveys")
          .doc(surveyData._id)
          .set({
            eventId: eventId,
            name: surveyData.title,
            category: "none",
          });
      }
    });

    // Se obtiene las preguntas de la encuesta con la funcion 'getAllQuestions' que provee la libreria
    let questions = survey.getAllQuestions().filter((surveyInfo) => surveyInfo.id);

    const executeService = (surveyData, questions, infoUser) => {
      let sendAnswers = 0;
      let sucessMessage = null;
      let errorMessage = null;
      console.log(questions);
      return new Promise((resolve, reject) => {
        questions.forEach(async (question) => {
          // Se obtiene el index de la opcion escogida, y la cantidad de opciones de la pregunta
          let optionIndex = [];
          let optionQuantity = 0;
          let correctAnswer = false;

          //Hack rápido para permitir preguntas tipo texto (abiertas)
          if (question.inputType == "text") {
          } else {
            // se valida si question value posee un arreglo 'Respuesta de opcion multiple' o un texto 'Respuesta de opcion unica'
            if (typeof question.value == "object") {
              correctAnswer = question.correctAnswer !== undefined ? question.isAnswerCorrect() : undefined;

              question.value.forEach((value) => {
                optionIndex = [...optionIndex, question.choices.findIndex((item) => item.itemValue == value)];
              });
            } else {
              // Funcion que retorna si la opcion escogida es la respuesta correcta
              correctAnswer = question.correctAnswer !== undefined ? question.isAnswerCorrect() : undefined;

              // Busca el index de la opcion escogida
              optionIndex = question.choices.findIndex((item) => item.itemValue == question.value);
            }
            optionQuantity = question.choices.length;
          }

          let infoOptionQuestion =
            surveyData.allow_gradable_survey == "true"
              ? { optionQuantity, optionIndex, correctAnswer }
              : { optionQuantity, optionIndex };

          // Se envia al servicio el id de la encuesta, de la pregunta y los datos
          // El ultimo parametro es para ejecutar el servicio de conteo de respuestas
          if (question.value)
            if (infoUser) {
              await SurveyAnswers.registerWithUID(
                surveyData._id,
                question.id,
                {
                  responseData: question.value,
                  date: new Date(),
                  uid: infoUser._id,
                  email: infoUser.email,
                  names: infoUser.names || infoUser.displayName,
                  voteValue: infoUser.pesovoto,
                },
                infoOptionQuestion
              )
                .then((result) => {
                  sendAnswers++;
                  sucessMessage = result;
                })
                .catch((err) => {
                  sendAnswers++;
                  errorMessage = err;
                });
            } else {
              // Sirve para controlar si un usuario anonimo ha votado
              localStorage.setItem(`userHasVoted_${surveyData._id}`, true);

              await SurveyAnswers.registerLikeGuest(
                surveyData._id,
                question.id,
                {
                  responseData: question.value,
                  date: new Date(),
                  uid: "guest",
                },
                infoOptionQuestion
              )
                .then((result) => {
                  sendAnswers++;
                  sucessMessage = result;
                })
                .catch((err) => {
                  sendAnswers++;
                  errorMessage = err;
                });
            }

          if (sucessMessage && sendAnswers == questions.length) {
            await resolve({ responseMessage: sucessMessage, correctAnswer });
          } else if (errorMessage) {
            await reject({ responseMessage: errorMessage });
          }
        });
      });
    };

    executeService(surveyData, questions, currentUser).then(({ responseMessage, correctAnswer }) => {
      message.success({ content: responseMessage });

      // Redirecciona a la lista de las encuestas
      if (this.props.showListSurvey) showListSurvey(null, "reload");

      // Actualiza si la respuesta es correcta
      if (correctAnswer === true)
        UserGamification.registerPoints(eventId, {
          user_id: currentUser._id,
          user_name: currentUser.names,
          user_email: currentUser.email,
          points: 5,
        });
    });
  };

  render() {
    let { surveyData } = this.state;
    const { showListSurvey } = this.props;

    return (
      <div style={surveyStyle}>
        <PageHeader
          className="site-page-header"
          onBack={() => showListSurvey()}
          title=""
          subTitle="Regresar a las encuestas"
        />
        {/* Imagen provisional */}
        <img src={graphicsImage} style={imageGraphics} alt="" />
        {/* ************* */}
        <Survey.Survey json={surveyData} onComplete={this.sendDataToServer} />
      </div>
    );
  }
}

export default SurveyComponent;
