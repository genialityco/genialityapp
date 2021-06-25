import React, { Component } from 'react';
import { List, Button, Card, Tag, Result, Spin, Row, Col } from 'antd';
import { MehOutlined } from '@ant-design/icons';
import { firestore } from '../../../helpers/firebase';
import { connect } from 'react-redux';
import { Actions, TicketsApi } from '../../../helpers/request';
import * as Cookie from 'js-cookie';
import * as StageActions from '../../../redux/stage/actions';
import * as SurveyActions from '../../../redux/survey/actions';

const { setMainStage } = StageActions;
const { setCurrentSurvey, setSurveyVisible, unsetCurrentSurvey } = SurveyActions;

const headStyle = {
   fontWeight: 300,
   textTransform: 'uppercase',
   textAlign: 'center',
   color: '#000',
};
const bodyStyle = { borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' };

class SurveyList extends Component {
   constructor(props) {
      super(props);
      this.state = {
         selectedSurvey: {},
         surveysData: [],
         loadingSurveys: true,
         loading: false,
         surveyVisible: false,
         availableSurveysBar: props.availableSurveysBar || false,
         surveyRecentlyChanged: false,
         userVote: false,
         forceCheckVoted: false,
         surveyLabel: {},
         defaultSurveyLabel: {
            name: 'Encuestas',
            section: 'survey',
            icon: 'FileUnknownOutlined',
            checked: false,
            permissions: 'public',
         },

         // luego de cargar el componente este estado permanece escuchando todas las encuestas del evento
         eventSurveys: [], // Todas las encuestas de un evento, este estado va a estar escuchando
         anonymousSurveys: [], // Solo encuestas que permiten usuarios anónimos
         publishedSurveys: [], // Encuestas relacionadas con la actividad + globales para renderizar el listado de encuestas en componente de videoconferencia
      };
   }

   async componentDidMount() {
      let { event } = this.props;

      // Método para escuchar todas las encuestas relacionadas con el evento
      //this.filterEventSurveys();

      // Verifica si el usuario esta inscrito en el evento para obtener su rol en compoente RootPage para saber si es un speaker
      let eventUser = await this.getCurrentEvenUser(event._id);

      this.setState({ eventUser: eventUser });
      // this.userVote();
      this.getItemsMenu();

      this.setState(
         {
            publishedSurveys: this.props.publishedSurveys,
            surveyVisible: this.props.publishedSurveys && this.props.publishedSurveys.length,
            loading: true,
            loadingSurveys: true,
         },
         this.callback
      );
   }

   componentDidUpdate(prevProps) {
      if (prevProps.activity !== this.props.activity || prevProps.publishedSurveys !== this.props.publishedSurveys) {
         this.setState(
            {
               publishedSurveys: this.props.publishedSurveys,
               surveyVisible: this.props.publishedSurveys && this.props.publishedSurveys.length,
               loading: true,
               loadingSurveys: true,
            },
            this.callback
         );
      }
   }

   filterEventSurveys = () => {
      const { activity } = this.props;
      let publishedSurveys = [];
      let surveys = this.props.eventSurveys || [];

      // Listado de encuestas publicadas del evento
      publishedSurveys = surveys.filter(
         (survey) =>
            (survey.isPublished === 'true' || survey.isPublished === true) &&
            ((activity && survey.activity_id === activity._id) || survey.isGlobal === 'true')
      );

      if (Object.keys(this.props.currentUser).length === 0) {
         publishedSurveys = publishedSurveys.filter((item) => {
            return item.allow_anonymous_answers !== 'false';
         });
      }
      this.setState(
         {
            publishedSurveys,
            surveyVisible: publishedSurveys && publishedSurveys.length,
            loading: true,
            loadingSurveys: true,
         },
         this.callback
      );
   };

   queryMyResponses = async (survey) => {
      const { currentUser } = this.props;
      //Agregamos un listener a firestore para detectar cuando cambia alguna propiedad de las encuestas
      let counterDocuments = 0;
      return new Promise((resolve) => {
         firestore
            .collectionGroup('responses')
            .where('id_survey', '==', survey._id)
            .where('id_user', '==', currentUser._id)
            .get()
            .then((result) => {
               result.forEach(function (doc) {
                  if (doc.exists) {
                     counterDocuments++;
                  }
                  console.log('counterDocuments====>>', counterDocuments);
               });

               if (counterDocuments > 0) {
                  resolve({ userHasVoted: true, totalResponses: counterDocuments });
               } else {
                  resolve({ userHasVoted: false, totalResponses: counterDocuments });
               }
            });
      });
   };

   //Verifica si el usuario ya votó en una encuesta cuando se carga el listado de encuestas
   callback = async () => {
      const { publishedSurveys } = this.state;
      const { currentUser } = this.props;
      if (publishedSurveys) {
         const checkMyResponses = new Promise((resolve) => {
            let filteredSurveys = [];

            publishedSurveys.forEach(async (survey, index, arr) => {
               if (!(Object.keys(currentUser).length === 0)) {
                  const result = await this.queryMyResponses(survey);
                  filteredSurveys.push({
                     ...arr[index],
                     userHasVoted: result.userHasVoted,
                     totalResponses: result.totalResponses,
                  });
               } else {
                  // Esto solo se ejecuta si no hay algun usuario logeado
                  const guestUser = new Promise((resolve) => {
                     let surveyId = localStorage.getItem(`userHasVoted_${survey._id}`);
                     surveyId ? resolve(true) : resolve(false);
                  });
                  let guestHasVote = await guestUser;
                  filteredSurveys.push({ ...arr[index], userHasVoted: guestHasVote });
               }

               if (filteredSurveys.length === arr.length) resolve(filteredSurveys);
            });
         });

         let stateSurveys = await checkMyResponses;

         this.setState({
            publishedSurveys: stateSurveys,
            forceCheckVoted: false,
            loading: false,
            loadingSurveys: false,
         });
      }
   };

   getItemsMenu = async () => {
      let { defaultSurveyLabel } = this.state;
      const { event } = this.props;
      const response = await Actions.getAll(`/api/events/${event._id}`);

      let surveyLabel = response.itemsMenu.survey || defaultSurveyLabel;
      this.setState({ surveyLabel });
   };

   getCurrentEvenUser = async (eventId) => {
      let evius_token = Cookie.get('evius_token');
      if (!evius_token) return null;
      let response = await TicketsApi.getByEvent(eventId, evius_token);
      return response && response.data.length ? response.data[0] : null;
   };

   pluralToSingular = (char, t1, t2) => {
      if (t1 !== undefined) return `${t1}${t2}`;
      return '';
   };

   handleClick = (currentSurvey) => {
      const { activity, setMainStage, setCurrentSurvey, setSurveyVisible } = this.props;
      if (activity !== null) {
         setMainStage('surveyDetalle');
      } else {
         setSurveyVisible(true);
      }
      setCurrentSurvey(currentSurvey);
   };

   render() {
      const { surveyLabel, loading, publishedSurveys, loadingSurveys } = this.state;

      return (
         <>
            <Card
               // className='lowerTabs__mobile-visible'
               style={{ borderRadius: '10px', marginTop: '6px' }}
               bodyStyle={bodyStyle}
               title='Listado de Encuestas'
               headStyle={headStyle}>
               {publishedSurveys && publishedSurveys.length === 0 && loading ? (
                  <Result icon={<MehOutlined />} title='Aún no se han publicado encuestas' />
               ) : (
                  <List
                     dataSource={publishedSurveys}
                     loading={loadingSurveys}
                     renderItem={(survey) => (
                        <>
                           {publishedSurveys && publishedSurveys.length > 0 && !loading && (
                              <Card
                                 style={{
                                    borderRadius: '10px',
                                    marginBottom: '5px',
                                    border: '1px solid',
                                    borderColor: '#0000001c',
                                 }}>
                                 <List.Item key={survey._id}>
                                    <List.Item.Meta
                                       title={survey.name}
                                       style={{ textAlign: 'left' }}
                                       description={
                                          !loading && (
                                             <Row>
                                                {survey.userHasVoted ? (
                                                   <Col>
                                                      <Tag color='success'>Contestada</Tag>
                                                   </Col>
                                                ) : (
                                                   <Col>
                                                      <Tag color='warning'>Sin Contestar</Tag>
                                                   </Col>
                                                )}
                                                {survey.isOpened && (
                                                   <Col>
                                                      {' '}
                                                      {survey.isOpened == 'true' || survey.isOpened == true ? (
                                                         <Tag color='green'>Abierta</Tag>
                                                      ) : (
                                                         <Tag color='red'>Cerrada</Tag>
                                                      )}
                                                   </Col>
                                                )}
                                             </Row>
                                          )
                                       }
                                    />
                                    {loading ? (
                                       <Spin />
                                    ) : (
                                       <>
                                          <div>
                                             <Button
                                                type={
                                                   !survey.userHasVoted && survey.isOpened === 'true'
                                                      ? 'primary'
                                                      : 'ghost'
                                                }
                                                className={`${
                                                   !survey.userHasVoted && survey.isOpened === 'true'
                                                      ? 'animate__animated  animate__pulse animate__slower animate__infinite'
                                                      : ''
                                                }`}
                                                onClick={() => this.handleClick(survey)}>
                                                {!survey.userHasVoted && survey.isOpened === 'true'
                                                   ? `Ir a ${
                                                        surveyLabel.name
                                                           ? surveyLabel.name.replace(
                                                                /([^aeiou]{2})?(e)?s\b/gi,
                                                                this.pluralToSingular
                                                             )
                                                           : 'Encuesta'
                                                     }`
                                                   : 'Resultados'}
                                             </Button>
                                          </div>
                                       </>
                                    )}
                                 </List.Item>
                              </Card>
                           )}
                        </>
                     )}
                  />
               )}
            </Card>
         </>
      );
   }
}

const mapStateToProps = (state) => ({
   event: state.event.data,
   activity: state.stage.data.currentActivity,
   currentUser: state.user.data,
});

const mapDispatchToProps = {
   setMainStage,
   setCurrentSurvey,
   setSurveyVisible,
   unsetCurrentSurvey,
};

export default connect(mapStateToProps, mapDispatchToProps)(SurveyList);
