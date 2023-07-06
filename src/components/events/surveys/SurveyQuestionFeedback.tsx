import { Button, Result } from 'antd'
import { useMemo } from 'react'
import stateMessages from './functions/stateMessagesV2'

export interface SurveyQuestionFeedbackProps {
  questions: any[]
  onNextClick: () => void
}

function SurveyQuestionFeedback(props: SurveyQuestionFeedbackProps) {
  const points = useMemo(
    () =>
      props.questions
        .map((question) =>
          question.correctAnswerCount ? question.correctAnswerCount : 0,
        )
        .reduce((a, b) => a + b, 0),
    [props.questions],
  )

  const newProps = useMemo(() => stateMessages(points ? 'success' : 'error'), [points])

  return (
    <Result
      className="animate__animated animate__fadeIn"
      {...newProps}
      extra={[
        <Button key="0" type="primary" onClick={props.onNextClick}>
          Siguiente
        </Button>,
      ]}
    />
  )
}

export default SurveyQuestionFeedback
