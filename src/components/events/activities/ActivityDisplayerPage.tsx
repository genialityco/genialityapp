import { useState, useEffect, useMemo, type FunctionComponent } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import Moment from 'moment-timezone'
import { FormattedMessage } from 'react-intl'
import { Card, Col, Button, Row, Result } from 'antd'
import { setTopBanner } from '../../../redux/topBanner/actions'
import { AgendaApi } from '@helpers/request'
import { setVirtualConference } from '../../../redux/virtualconference/actions'
import { useHelper } from '@context/helperContext/hooks/useHelper'

import * as SurveyActions from '../../../redux/survey/actions'
import ActivityDisplayer from './ActivityDisplayer'
import AditionalInformation from './AditionalInformation'
import { checkinAttendeeInActivity } from '@helpers/HelperAuth'
import { useUserEvent } from '@context/eventUserContext'
import { useEventContext } from '@context/eventContext'
import { useCurrentUser } from '@context/userContext'
import { PreloaderApp } from '@/PreloaderApp/PreloaderApp'
import Presence from '@components/presence/Presence'
import { fireRealtime } from '@helpers/firebase'
import Logger from '@Utilities/logger'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useEventProgress } from '@context/eventProgressContext'
import { StateMessage } from '@context/MessageService'

const { setHasOpenSurveys } = SurveyActions

const { LOG, ERROR } = Logger('studentlanding-activity')

Moment.locale(window.navigator.language)

const ActivityDisplayerPage: FunctionComponent = (props) => {
  const { HandleOpenCloseMenuRigth, currentActivity, helperDispatch } = useHelper()
  const [orderedHost, setOrderedHost] = useState<any[]>([])
  // const [videoStyles, setVideoStyles] = useState<any>(null)
  // const [videoButtonStyles, setVideoButtonStyles] = useState<any>(null)
  // const [blockActivity, setBlockActivity] = useState(false)
  const [activity, setActivity] = useState<any>(null)
  const [nextActivityID, setNextActivityID] = useState<any>(null)
  const [previousActivityID, setPreviousctivityID] = useState<any>(null)

  const [wasNotifiedForProgress, setWasNotifiedForProgress] = useState(false)

  const cUser = useCurrentUser()
  const cEventUser = useUserEvent()
  const cEvent = useEventContext()
  // const cSurveys = useSurveysContext()
  const history = useHistory()

  const params = useParams<any>()

  const cEventProgress = useEventProgress()

  const activityProgressCallback = (progress: any) => {
    const percentajeRequired =
      cEvent.value?.progress_settings?.lesson_percent_to_completed ?? 0

    console.debug('percentajeRequired:', percentajeRequired, 'current:', progress)

    if (progress >= percentajeRequired) {
      checkinAttendeeInActivity(cEventUser.value, params?.activity_id).then((info) => {
        console.log('attendee creating/updating:', info)
        if (!wasNotifiedForProgress) {
          StateMessage.show(null, 'success', 'Actividad marcada como vista', 3)
        }
        setWasNotifiedForProgress(true)

        // Request to update the attendees
        cEventProgress.updateAttendees()
      })
    }
  }

  useEffect(() => {
    AgendaApi.getOne(params.activity_id, cEvent.value._id).then((result) => {
      helperDispatch({ type: 'currentActivity', currentActivity: result })
      setActivity(result)
      setOrderedHost((result.hosts as any[]).sort((a, b) => a.order - b.order))
    })

    props.setTopBanner(false)
    props.setVirtualConference(false)

    if (cEvent?.value?.is_socialzone_opened) {
      HandleOpenCloseMenuRigth(false)
    } else {
      HandleOpenCloseMenuRigth(true)
    }

    // Get the next activity ID to able creating the next activity link
    AgendaApi.byEvent(cEvent?.value._id).then(({ data: allEventActivities }) => {
      const currentActivityId = params.activity_id
      const currentActivityObject = (allEventActivities as any[]).find(
        (eventActivity) => eventActivity._id === currentActivityId,
      )
      const currentIndex = allEventActivities.indexOf(currentActivityObject)

      const nextIndex = currentIndex + 1
      const nextActivityObject = allEventActivities[nextIndex]
      if (nextActivityObject) {
        setNextActivityID(nextActivityObject._id)
      }

      const previousIndex = currentIndex - 1
      const previousActivityObject = allEventActivities[previousIndex]
      if (previousActivityObject) {
        setPreviousctivityID(previousActivityObject._id)
      }
    })

    return () => {
      props.setTopBanner(true)
      props.setVirtualConference(true)
      HandleOpenCloseMenuRigth(true)
      helperDispatch({ type: 'currentActivity', currentActivity: null })
      setActivity(null)
    }
  }, [params.activity_id])

  useEffect(() => {
    if (!currentActivity) return
    if (cEventUser.status == 'LOADED' && cEventUser.value != null) {
      if (!['url', 'vimeo'].includes(currentActivity.type?.name)) {
        activityProgressCallback(100)
      }
    }
  }, [currentActivity, cEventUser.status])

  useEffect(() => {
    cEventProgress.saveProgressReport()
  }, [cEventProgress.checkedInActivities])

  const goToActivityIdPage = async (activityId: string) => {
    history.push(`/landing/${cEvent?.value._id}/activity/${activityId}`)
  }

  const thisActivityRequiresCompletion = useMemo(() => {
    if (!activity) return false
    if (cEventProgress.progressFilteredActivities === undefined) return false
    if (activity.require_completion === undefined) return false

    if (activity.require_completion >= cEventProgress.progressFilteredActivities)
      return true
    return false
  }, [activity, cEventProgress.progressFilteredActivities])

  const thisActivityRequiresAttendeeType = useMemo(() => {
    if (!activity) return false
    if (activity.type?.name !== 'url') return false
    if (cEventUser.value?.properties?.tipoDeAsistente === 'En vivo') return true
    else return false
  }, [activity])

  return (
    <div>
      {cUser.value?._id && cEvent.value?._id && activity?._id && (
        <Presence
          data={{ eventId: cEvent.value._id, activityId: activity._id, type: 'activity' }}
          debuglog={LOG}
          errorlog={ERROR}
          realtimeDB={fireRealtime}
          collectionId={cUser.value._id}
        />
      )}
      <div className=" container_agenda-information container-calendar2">
        <Card style={{ padding: '1 !important' }} className="agenda_information">
          {activity?.type === undefined ? (
            <PreloaderApp />
          ) : thisActivityRequiresCompletion ? (
            <Result
              status="403"
              title="Esta sección está bloqueado"
              subTitle="Se requiere avanzar más en el curso para habilitar esta sección"
            />
          ) : thisActivityRequiresAttendeeType ? (
            <Result
              //status="403"
              title="Esta sección está deshabilitado por que estuviste en la sesión 'En vivo'"
              subTitle="Comunicate con el administrador del curso"
            />
          ) : (
            <ActivityDisplayer
              activity={activity}
              onActivityProgress={activityProgressCallback}
            />
          )}
          <Row gutter={[8, 8]} justify="end">
            {previousActivityID && (
              <Col>
                <Button
                  style={{ marginTop: '1rem' }}
                  type="primary"
                  size="large"
                  onClick={() => goToActivityIdPage(previousActivityID)}
                >
                  <ArrowLeftOutlined />
                  <FormattedMessage
                    id="activity.button.previous"
                    defaultMessage="Anterior"
                  />
                </Button>
              </Col>
            )}
            {nextActivityID && (
              <Col>
                <Button
                  style={{ marginTop: '1rem' }}
                  type="primary"
                  size="large"
                  onClick={() => goToActivityIdPage(nextActivityID)}
                >
                  <FormattedMessage
                    id="activity.button.next"
                    defaultMessage="Siguiente"
                  />
                  <ArrowRightOutlined />
                </Button>
              </Col>
            )}
          </Row>

          <AditionalInformation orderedHost={orderedHost} />
        </Card>
      </div>
    </div>
  )
}

const mapStateToProps = (state: any) => ({
  mainStageContent: state.stage.data.mainStage,
  userInfo: state.user.data,
  currentActivity: state.stage.data.currentActivity,
  currentSurvey: state.survey.data.currentSurvey,
  hasOpenSurveys: state.survey.data.hasOpenSurveys,
  tabs: state.stage.data.tabs,
  generalTabs: state.tabs.generalTabs,
  permissions: state.permissions,
  isVisible: state.survey.data.surveyVisible,
  viewSocialZoneNetworking: state.spaceNetworkingReducer.view,
})

const mapDispatchToProps = {
  setTopBanner,
  setVirtualConference,
  setHasOpenSurveys,
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityDisplayerPage)
