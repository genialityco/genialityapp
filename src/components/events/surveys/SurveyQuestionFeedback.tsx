import { Button, Result, Typography } from 'antd'
import { useMemo } from 'react'
import stateMessages from './functions/stateMessagesV2'
import useIsDevOrStage from '@/hooks/useIsDevOrStage'
import calcRightAnswers from './calcRightAnswers'

export interface SurveyQuestionFeedbackProps {
  questions: any[]
  onNextClick: () => void
  showAsFinished?: boolean
  finishText?: string
}

function SurveyQuestionFeedback(props: SurveyQuestionFeedbackProps) {
  const { isDev } = useIsDevOrStage()
  // const points = useMemo(
  //   () =>
  //     props.questions
  //       .map((question) =>
  //         question.correctAnswerCount ? question.correctAnswerCount : 0,
  //       )
  //       .reduce((a, b) => a + b, 0),
  //   [props.questions],
  // )
  const points = useMemo(() => {
    const { rightCount } = calcRightAnswers(
      props.questions,
      /**
       * This question types need calc the answers with the restrict mode on
       */ ['ranking'],
    )
    return rightCount
  }, [props.questions])

  const newProps = useMemo(() => stateMessages(points ? 'success' : 'error'), [points])

  const debugQuestionData = useMemo(
    () =>
      props.questions.map((question) => ({
        answer: question.questionValue,
        correct: question.correctAnswer,
        points: question.points,
      })),
    [props.questions],
  )

  return (
    <Result
      className="animate__animated animate__fadeIn"
      {...newProps}
      extra={[
        <Button
          key="0"
          type="primary"
          danger={props.showAsFinished}
          onClick={props.onNextClick}
        >
          {props.showAsFinished ? props.finishText ?? 'Finalizar' : 'Siguiente'}
        </Button>,
      ]}
      subTitle={
        isDev && (
          <Typography.Text type="secondary">
            {debugQuestionData.map((info) => (
              <small>
                <small>
                  <code>{JSON.stringify(info)}</code>
                </small>
              </small>
            ))}
          </Typography.Text>
        )
      }
    />
  )
}

export default SurveyQuestionFeedback