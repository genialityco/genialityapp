import { useState, useEffect } from 'react';
import { Result, Spin, Button, Col, Card, Space } from 'antd';
import SurveyAnswers from './services/surveyAnswersService';
import { LoadingOutlined } from '@ant-design/icons';
import useSurveyQuery from './hooks/useSurveyQuery';

function ResultsPanel(props) {
  const { eventId, idSurvey, currentUser } = props;

  const query = useSurveyQuery(eventId, idSurvey);

  const [userAnswers, setUserAnswers] = useState(undefined);

  async function getUserAnswers(questionId) {
    const userAnswer = await SurveyAnswers.getAnswersQuestionV2(
      idSurvey, // survey ID
      questionId, // current question
      currentUser.value._id, // who
    );
    return userAnswer.data();
  }

  useEffect(() => {
    if (!query.data) return;
    if (!idSurvey || !currentUser.value._id) return;

    const userAnswersLocal = [];

    (async () => {
      // For each question, search thhe user's answer and save all in userAnswersLocal
      for (let index = 0; index < query.data.questions.length; index++) {
        const question = query.data.questions[index];
        // The first question is not a real question!!
        if (!question.id) continue;
        // Search the answer
        const userAnswer = await getUserAnswers(question.id);

        // Save the current question, and the correct answer
        if (userAnswer !== undefined) {
          userAnswersLocal.push({
            id: question.id,
            answer: userAnswer.response,
            correctAnswer: question.correctAnswer,
            title: question.title,
            isCorrectAnswer: userAnswer.correctAnswer,
          });
        } else {
          console.debug('no answer found for question.id:', question.id);
        }
      }
      // Save all user's answers
      setUserAnswers(userAnswersLocal);
    })();
  }, [currentUser.value._id, idSurvey, query.data]);

  return (
    <div>
      {userAnswers === undefined && (
        <Space direction="vertical" size="middle" align="center">
          <p style={{ fontWeight: '700' }}>Cargando resultados...</p>
          <LoadingOutlined style={{ fontSize: '50px', color: '#808080' }} />
        </Space>
      )}
      {userAnswers !== undefined && (
        <>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            {userAnswers.map((answer, index) => {

              return (
                <Card>
                  <p style={{ fontWeight: '700' }}>{`${index + 1}. ${answer.title}`}</p>
                  <p style={{ fontWeight: '700' }}>{`Respuesta correcta: ${answer.correctAnswer}`}</p>
                  <p
                    style={{
                      fontWeight: '700',
                      color: answer.isCorrectAnswer ? 'green' : 'red',
                    }}
                  >{`Tu respuesta: ${answer.answer}`}</p>
                </Card>
              );
            })}
          </Space>
        </>
      )}
    </div>
  );
}

export default ResultsPanel;