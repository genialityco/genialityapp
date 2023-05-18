import { FunctionComponent, useContext, useMemo } from 'react'
import { List, Button, Spin, Badge, Space, Collapse } from 'antd'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import AccessPointIcon from '@2fd/ant-design-icons/lib/AccessPoint'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AgendaApi } from '@helpers/request'
import dayjs from 'dayjs'
import { ExtendedAgendaType } from '@Utilities/types/AgendaType'
import { ActivityType } from '@context/activityType/types/activityType'
import { firestore } from '@helpers/firebase'
import { ActivityCustomIcon } from './ActivityCustomIcon'
import { activityContentValues } from '@context/activityType/constants/ui'
import QuizProgress from '@components/quiz/QuizProgress'
import { useCurrentUser } from '@context/userContext'
import Service from '@components/agenda/roomManager/service'
import { DeleteActivitiesTakenButton } from './DeleteActivitiesTakenButton'
import { getRef as getSurveyStatusRef } from '@components/events/surveys/services/surveyStatus'
import {
  getAnswersRef,
  getUserProgressRef,
  getQuestionsRef,
} from '@components/events/surveys/services/surveys'
import { CurrentEventUserContext } from '@context/eventUserContext'
import ReactQuill from 'react-quill'

type TruncatedAgenda = {
  title: string
  isInfoOnly?: boolean
  module_name?: string
  module_order?: number
  type?: ActivityType.ContentValue
  timeString: string
  link: string
  host_picture: string
  name_host: string
  ViewedStatusComponent?: FunctionComponent<{}>
  QuizProgressComponent?: FunctionComponent<{ userId: string; isAnswersDeleted: boolean }>
  DeleteSurveyAnswersButton?: FunctionComponent<{
    userId: string
    onAnswersDeleted: (x: boolean) => void
  }>
  RibbonComponent: FunctionComponent<{ children: any }>
  short_description?: any
  categories?: any
}

interface ActivitiesListProps {
  eventId: string
  eventUserId?: string
  agendaList?: ExtendedAgendaType[] // If parent has this, why have we to re-do?
}

const ActivitiesList = (props: ActivitiesListProps) => {
  const {
    eventId, // The event ID
    eventUserId, // The event user ID
  } = props

  const service = new Service(firestore)

  const [isLoading, setIsLoading] = useState(true)
  const [truncatedAgendaList, setTruncatedAgendaList] = useState<TruncatedAgenda[]>([])
  const [isAnswersDeleted, setAnswersIsDeleted] = useState(false)

  const currentUser = useCurrentUser()
  const currentEventUser = useContext(CurrentEventUserContext)

  const location = useLocation()

  useEffect(() => {
    if (!eventId) return

    if (
      `/landing/${eventId}/evento` !== location.pathname &&
      `/landing/${eventId}/agenda` !== location.pathname
    ) {
      // This was added because the event context keeps the last event data
      // before the component notices that the pathname was changed. After the
      // event context sees that thhe pathname has changed and updates the
      // event data, but for some seconds the web shows the wrong activities
      console.warn('!!! the event cached is different of the pathname event ID')
      return
    }

    ;(async () => {
      setIsLoading(true)
      setTruncatedAgendaList([])

      let agendaList: ExtendedAgendaType[] = []
      if (props.agendaList === undefined) {
        const { data } = (await AgendaApi.byEvent(eventId)) as {
          data: ExtendedAgendaType[]
        }
        agendaList = data
      } else {
        agendaList = props.agendaList
      }

      setTruncatedAgendaList([
        ...agendaList.map((agenda) => {
          // Logic here
          let diff = Math.floor(Math.random() * 60 * 60)

          try {
            diff = dayjs(agenda.datetime_end).diff(dayjs(agenda.datetime_start))
          } catch (err) {
            console.error(err)
          }

          const result: TruncatedAgenda = {
            title: agenda.name,
            isInfoOnly: agenda.is_info_only,
            module_name: agenda.module?.module_name,
            module_order: agenda.module?.order || 0,
            type: agenda.type?.name as ActivityType.ContentValue,
            timeString: dayjs(diff).format('h:mm').concat(' min'),
            link: `/landing/${eventId}/activity/${agenda._id}`,
            host_picture: agenda.hosts[0]?.image,
            name_host: agenda.hosts[0]?.name,
            short_description: agenda.short_description,
            //categories: agenda.activity_categories.map((category: any) => category.name),
            categories: agenda.activity_categories.map((category: any) => {
              return { category_name: category.name, category_color: category.color }
            }),
            ViewedStatusComponent: () => {
              const [isTaken, setIsTaken] = useState(false)
              useEffect(() => {
                if (!eventUserId) return
                ;(async () => {
                  const activity_attendee = await firestore
                    .collection(`${agenda._id}_event_attendees`)
                    .doc(eventUserId)
                    .get() //checkedin_at
                  if (activity_attendee && activity_attendee.exists) {
                    // If this activity existes, then it means the lesson was taken
                    setIsTaken(activity_attendee.data()?.checked_in)
                  }
                })()
              }, [eventUserId])
              if (isTaken)
                return (
                  <Badge
                    style={{ backgroundColor: '#339D25', marginRight: '3px' }}
                    count="Visto"
                  />
                )
              return <></>
            },
            QuizProgressComponent: ({ userId, isAnswersDeleted }) => {
              if (
                ![activityContentValues.quizing, activityContentValues.survey].includes(
                  agenda.type?.name as any,
                )
              )
                return <></>

              const [surveyId, setSurveyId] = useState<string | undefined>()

              useEffect(() => {
                ;(async () => {
                  const document = await firestore
                    .collection('events')
                    .doc(eventId)
                    .collection('activities')
                    .doc(agenda._id)
                    .get()
                  const activity = document.data()
                  console.log('This activity is', activity)
                  if (!activity) return
                  const meetingId = activity?.meeting_id
                  if (!meetingId) {
                    console.warn(
                      'without meetingId eventId',
                      eventId,
                      ', agendaId',
                      agenda._id,
                      ', activity',
                      activity,
                      ', meetingId',
                      meetingId,
                    )
                    return
                  }
                  setSurveyId(meetingId)
                })()
              }, [isAnswersDeleted])
              if (eventUserId && surveyId) {
                return (
                  <QuizProgress
                    short
                    eventId={eventId}
                    userId={userId}
                    surveyId={surveyId}
                    isAnswersDeleted={isAnswersDeleted}
                  />
                )
              }
              return <></>
            },
            DeleteSurveyAnswersButton: ({ userId, onAnswersDeleted }) => {
              if (
                ![activityContentValues.quizing, activityContentValues.survey].includes(
                  agenda.type?.name as any,
                )
              )
                return <></>

              const [surveyId, setSurveyId] = useState<string | undefined>()
              const [isDeleted, setIsDeleted] = useState(false)
              const [isDeleting, setIsDeleting] = useState(false)

              useEffect(() => {
                ;(async () => {
                  const document = await firestore
                    .collection('events')
                    .doc(eventId)
                    .collection('activities')
                    .doc(agenda._id)
                    .get()
                  const activity = document.data()
                  console.log('This activity is', activity)
                  if (!activity) return
                  const meetingId = activity?.meeting_id
                  if (!meetingId) {
                    console.warn(
                      'without meetingId eventId',
                      eventId,
                      ', agendaId',
                      agenda._id,
                      ', activity',
                      activity,
                      ', meetingId',
                      meetingId,
                    )
                    return
                  }
                  setSurveyId(meetingId)
                })()
              }, [])

              async function deleteSurveyAnswers(surveyId: any, userId: any) {
                // No se eliminan las respuestas, con solo eliminar el userProgress y surveyStatus el usuario puede volver a contestar la encuesta, sobreescribiendo las anteriores respuestas.

                await getUserProgressRef(surveyId, userId).delete()
                await getSurveyStatusRef(surveyId, userId).delete()
                await getAnswersRef(surveyId, userId).delete()
                await getQuestionsRef(surveyId, userId).delete()
              }

              if (userId && surveyId) {
                return (
                  <Button
                    style={{
                      background: isDeleted ? '#947A7A' : '#B8415A',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      height: '20px',
                      lineHeight: '20px',
                      borderRadius: '10px',
                      marginLeft: '2px',
                    }}
                    disabled={isDeleted}
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDeleting(true)
                      deleteSurveyAnswers(surveyId, userId).then(() => {
                        setIsDeleted(true)
                        onAnswersDeleted(true)
                        setIsDeleting(false)
                      })
                    }}
                  >
                    {isDeleted ? 'Respuestas eliminadas' : 'Eliminar respuestas'}
                    {isDeleting && (
                      <>
                        <LoadingOutlined
                          style={{ fontSize: '12px', color: '#FFF', marginLeft: '10px' }}
                        />
                      </>
                    )}
                  </Button>
                )
              }
              return <></>
            },
            RibbonComponent: ({ children }) => {
              const [isLive, setIsLive] = useState(false)
              useEffect(() => {
                service.getConfiguration(eventId, agenda._id).then((config) => {
                  const is = config?.habilitar_ingreso === 'open_meeting_room'
                  setIsLive(is)
                })
              }, [agenda._id])

              return (
                <Badge.Ribbon
                  className="animate__animated animate__bounceIn animate__delay-2s"
                  placement="end"
                  style={{ height: 'auto', padding: '3px', top: -5, lineHeight: '10px' }}
                  color={isLive ? 'red' : 'transparent'}
                  text={
                    isLive ? (
                      <Space direction="horizontal" style={{ padding: 0 }}>
                        <AccessPointIcon
                          className="animate__animated animate__heartBeat animate__infinite animate__slower"
                          style={{ fontSize: '12px' }}
                        />
                        <span style={{ textAlign: 'center', fontSize: '12px' }}>
                          {/* {<FormattedMessage id="live" defaultMessage="En vivo" />} */}
                          En Vivo
                        </span>
                      </Space>
                    ) : (
                      ''
                    )
                  }
                >
                  {children}
                </Badge.Ribbon>
              )
            },
          }
          return result
        }),
      ])

      setIsLoading(false)
    })()
  }, [eventId, eventUserId])

  if (isLoading) return <Spin />

  const ListThisActivities = (props: { dataSource: any[] }) => (
    <List
      size="small"
      dataSource={props.dataSource}
      renderItem={(item: TruncatedAgenda) => (
        <item.RibbonComponent>
          <List.Item className="shadow-box">
            {item.host_picture && (
              <img
                style={{
                  width: '6rem',
                  height: '6rem',
                  borderRadius: '50%',
                  marginRight: '1rem',
                }}
                src={item.host_picture}
              ></img>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                flexFlow: 'row wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  flexFlow: 'column wrap',
                  marginRight: '1rem',
                  //paddingLeft: '25px',
                }}
              >
                <div
                  style={{ display: 'flex', flexFlow: 'row wrap', margin: '0.5rem 0' }}
                >
                  {item.categories &&
                    item.categories.map((category: any, index) => {
                      return (
                        <Badge
                          key={index}
                          style={{
                            backgroundColor: category.category_color,
                            fontSize: '1rem',
                            marginRight: '0.5rem',
                          }}
                          count={category.category_name}
                        />
                      )
                    })}
                </div>
                <Link to={item.link}>
                  <div style={{ fontSize: '1.6rem' }}>
                    <ActivityCustomIcon
                      type={item.type!}
                      className="list-icon"
                      style={{ marginRight: '1em' }}
                    />
                    <span>{item.title}</span>
                  </div>
                </Link>
                <span style={{ fontSize: '1.6rem' }}>{item.name_host}</span>
                {item.short_description !== '<p><br></p>' && (
                  <ReactQuill
                    style={{ color: '#777' }}
                    value={item.short_description}
                    readOnly
                    className="hide-toolbar ql-toolbar"
                    theme="bubble"
                  />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <span style={{ marginRight: '.5em' }}>
                  {item.ViewedStatusComponent && <item.ViewedStatusComponent />}
                  {item.QuizProgressComponent && currentUser.value?._id && (
                    <item.QuizProgressComponent
                      userId={currentUser.value._id}
                      isAnswersDeleted={isAnswersDeleted}
                    />
                  )}
                  {item.isInfoOnly && (
                    <Badge style={{ backgroundColor: '#999' }} count="Info" />
                  )}
                  {item.DeleteSurveyAnswersButton && currentUser.value?._id && (
                    <item.DeleteSurveyAnswersButton
                      userId={currentUser.value._id}
                      onAnswersDeleted={(x: boolean) => setAnswersIsDeleted(x)}
                    />
                  )}
                </span>
                <Link to={item.link}>
                  {/* <span style={{ fontWeight: '100', fontSize: '1.2rem' }}>{item.timeString}</span> */}
                </Link>
              </div>
            </div>
          </List.Item>
        </item.RibbonComponent>
      )}
    />
  )

  const ModuledActivityHOC: FunctionComponent<{
    list: TruncatedAgenda[]
    render: (nameToFilter: string) => any
  }> = (props) => {
    const moduleNames = useMemo(() => {
      const uniqueNames = Array.from(
        new Set(props.list.map((item) => item.module_name)),
      ).filter((item) => item !== undefined) as string[]

      const sorttedNames = uniqueNames
        .map((name) => {
          const data = props.list.find((item) => item.module_name == name)
          if (!data) return { name, order: 0 }
          return {
            name,
            order: data.module_order,
          }
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((item) => item.name)
      return sorttedNames
    }, [props.list])

    return (
      <Collapse>
        {moduleNames.map((name: string, index: number) => (
          <Collapse.Panel
            header={`Módulo: ${name}`}
            key={index}
            extra={`${
              props.list.filter((item) => item.module_name === name).length
            } elemento(s)`}
          >
            {props.render(name)}
          </Collapse.Panel>
        ))}
      </Collapse>
    )
  }

  return (
    <>
      {currentEventUser.value?.rol.type === 'admin' ? (
        <></>
      ) : // <DeleteActivitiesTakenButton
      //   eventId={eventId}
      //   cEventUserId={eventUserId}
      //   setActivitiesAttendeeIsDeleted={setActivitiesAttendeeIsDeleted}
      //   setActivitiesAttendee={setActivitiesAttendee}
      // />
      undefined}
      <ModuledActivityHOC
        list={truncatedAgendaList}
        render={(nameToFilter) => (
          <ListThisActivities
            dataSource={truncatedAgendaList.filter(
              (item) => item.module_name === nameToFilter,
            )}
          />
        )}
      />

      {/* Without modules: */}
      <ListThisActivities
        dataSource={truncatedAgendaList.filter((item) => item.module_name === undefined)}
      />
    </>
  )
}

export default ActivitiesList
