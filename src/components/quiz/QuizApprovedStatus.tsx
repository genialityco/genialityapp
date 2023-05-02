import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Badge, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { SurveysApi } from '@helpers/request'
import { SurveyData } from '@components/events/surveys/types'

import { useCurrentUser } from '@context/userContext'
import useAsyncPrepareQuizStats from './useAsyncPrepareQuizStats'

export interface QuizApprovedStatusProps {
  eventId: string
  approvedLink?: string
  thereAreExam: (a: boolean) => void
}

function QuizApprovedStatus(props: QuizApprovedStatusProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [status, setStatus] = useState('estimando...')
  const [backgroundColor, setBackgroundColor] = useState('#9C835F')
  const [isApproved, setIsApproved] = useState(false)

  const cUser = useCurrentUser()

  // NOTE: if you want to add colors, create a state and check the logic that says if the quiz was passed or not completed.

  useEffect(() => {
    if (!cUser?.value?._id) return
    ;(async () => {
      const surveys: SurveyData[] = await SurveysApi.byEvent(props.eventId)

      let passed = 0
      let notPassed = 0

      for (let i = 0; i < surveys.length; i++) {
        const survey: SurveyData = surveys[i] as never
        const stats = await useAsyncPrepareQuizStats(
          props.eventId,
          survey._id!,
          cUser?.value?._id,
          survey,
        )

        if (stats.minimum > 0) {
          if (stats.right >= stats.minimum) {
            passed = passed + 1
          } else {
            notPassed = notPassed + 1
          }
        }
      }

      if (surveys.length > 0) {
        props.thereAreExam(true)
        if (passed === surveys.length) {
          setStatus('Aprobado')
          setIsApproved(true)
          setBackgroundColor('#5EB841')
        } else {
          setStatus('No aprobado')
          setBackgroundColor('#E86710')
        }
      } else {
        setStatus('Curso sin exámenes')
        props.thereAreExam(false)
        setBackgroundColor('#2C3647')
      }

      setIsLoaded(true)
    })()
  }, [cUser?.value])

  return (
    <>
      {isLoaded && <Badge count={status} style={{ backgroundColor }} />}
      {isLoaded && isApproved && props.approvedLink && (
        <Link to={props.approvedLink}>
          <Button
            style={{
              background: '#356785',
              color: '#fff',
              border: 'none',
              fontSize: '12px',
              height: '20px',
              lineHeight: '20px',
              borderRadius: '10px',
              marginLeft: '2px',
            }}
            size="small"
            icon={<DownloadOutlined />}
          >
            Certificado
          </Button>
        </Link>
      )}
    </>
  )
}

export default QuizApprovedStatus
