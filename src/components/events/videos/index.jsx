import { Col, Row, PageHeader } from 'antd'
import { useEventContext } from '@context/eventContext'
import { useHelper } from '@context/helperContext/hooks/useHelper'
import { useState, useEffect } from 'react'
import VideoCard from '../../shared/videoCard'
import Feedback from '../ferias/Feedback'

const Videos = () => {
  const cEvent = useEventContext()
  const { activitiesEvent } = useHelper()
  const [existActivity, setExistActivity] = useState(0)

  function ExistvideoInActivity() {
    activitiesEvent &&
      activitiesEvent.map((activity) => {
        if (activity.video != undefined || activity.video != null) {
          {
            setExistActivity(1)
          }
        }
      })
  }

  useEffect(() => {
    ExistvideoInActivity()
  }, [activitiesEvent])

  if (!cEvent.value) {
    return <>Cargando...</>
  }

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader backIcon={false} title="Vídeos grabados" />
      {existActivity === 1 ? (
        <Row gutter={[16, 16]}>
          {activitiesEvent &&
            activitiesEvent
              .sort((a, b) => a.created_at.localeCompare(-b.created_at))
              .map((activity, index) => {
                if (activity.video) {
                  return (
                    <Col key={index} xs={24} sm={24} md={12} lg={8} xl={6} xxl={6}>
                      <VideoCard
                        bordered={false}
                        key={cEvent.value._id}
                        event={cEvent.value}
                        action={{ name: 'Ver', url: `landing/${cEvent.value._id}` }}
                        activity={activity}
                        shape="vertical"
                      />
                    </Col>
                  )
                }
              })}
        </Row>
      ) : (
        <Feedback message="No hay vídeos grabados" />
      )}
    </div>
  )
}

export default Videos
