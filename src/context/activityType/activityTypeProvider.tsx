import { useContext, useEffect, useState, useCallback } from 'react'

import { AgendaApi, TypesAgendaApi } from '@helpers/request'
import AgendaContext from '../AgendaContext'
import { CurrentEventContext } from '../eventContext'

import ActivityTypeContext from './activityTypeContext'
import type { ActivityType } from './types/activityType'
import { MainUI } from './constants/enum'

import { ActivityTypeProviderProps, ActivityTypeContextType } from './types/contextType'
import {
  activityContentValues,
  formWidgetFlow,
  typeToDisplaymentMap,
} from './constants/ui'
// Temporally
import { ExtendedAgendaType } from '@Utilities/types/AgendaType'

const onlyActivityTypes: ActivityType.Name[] = [
  'liveBroadcast',
  'meeting2',
  'video',
  'quizing2',
  'survey2',
  'pdf2',
  'html2',
]
const theseAreLiveToo: ActivityType.ContentValue[] = [
  'RTMP',
  'eviusMeet',
  'vimeo',
  'youTube',
]
const theseAreMeeting: ActivityType.ContentValue[] = ['meeting']
const theseAreVideo: ActivityType.ContentValue[] = ['url', 'cargarvideo']
const externalFileTypes: ActivityType.ContentValue[] = ['pdf']

function ActivityTypeProvider(props: ActivityTypeProviderProps) {
  const {
    saveConfig,
    setMeetingId,
    setPlatform,
    setTypeActivity,
    meeting_id: meetingId,
    activityEdit,
  } = useContext(AgendaContext)
  const cEvent = useContext(CurrentEventContext)
  const [isStoppingStreaming, setIsStoppingStreaming] = useState(false)
  const [isCreatingActivityType] = useState(false)
  const [isSavingActivityType, setIsSavingActivityType] = useState(false)
  const [isDeletingActivityType, setIsDeletingActivityType] = useState(false)
  const [isUpdatingActivityType, setIsUpdatingActivityType] = useState(false)
  const [isUpdatingActivityContent, setIsUpdatingActivityContent] = useState(false)
  const [videoObject, setVideoObject] = useState<any | null>(null)
  const [activityType, setActivityType] = useState<ActivityType.Name | null>(null)
  const [activityContentType, setActivityContentType] =
    useState<ActivityType.ContentValue | null>(null)
  const contentSource: string | null = meetingId
  const setContentSource: (data: string | null) => void = setMeetingId

  const translateActivityType = useCallback((type: string) => {
    const value = typeToDisplaymentMap[type as keyof typeof typeToDisplaymentMap]
    if (!value) {
      console.error(
        `transpilerActivityType cannot find ${type} in ${typeToDisplaymentMap}`,
      )
      return null
    }
    return value
  }, [])

  const humanizeActivityType = useCallback((typeIncoming: string): string => {
    type TypeIncoming = ActivityType.Name
    switch (typeIncoming as TypeIncoming) {
      case MainUI.LIVE:
        return 'transmisión'
      case MainUI.MEETING:
        return 'reunión'
      case MainUI.QUIZ:
        return 'quiz'
      case MainUI.SURVEY:
        return 'encuesta'
      case MainUI.VIDEO:
        return 'vídeo'
      case MainUI.PDF:
        return 'PDF'
      case MainUI.HTML:
        return 'HTML'
      default:
        return typeIncoming
    }
  }, [])

  const editActivityType = async (
    eventId: string,
    activityId: string,
    typeName: string,
  ) => {
    const createTypeActivityBody: any = { name: typeName }
    const activityTypeDocument = await TypesAgendaApi.create(
      cEvent.value._id,
      createTypeActivityBody,
    )
    const agenda: ExtendedAgendaType = await AgendaApi.editOne(
      { type_id: activityTypeDocument._id },
      activityId,
      eventId,
    )
    console.debug('editActivityType returns', agenda)
    return agenda
  }

  const saveActivityType = async () => {
    console.debug('activity type provider is saving...')
    console.debug('activityType is:', activityType)
    if (!activityType) {
      console.error('activityType (from ActivityTypeProvider) is none')
      return
    }

    if (!cEvent?.value?._id) {
      console.error('ActivityTypeProvider.saveActivityType cannot get cEvent.value._id')
      return
    }

    if (!activityEdit) {
      console.error('activityEdit (from AgendaContext) is none')
      return
    }

    setIsSavingActivityType(true)

    try {
      const agenda = await editActivityType(cEvent.value._id, activityEdit, activityType)
      console.debug('activity type changes:', agenda)
      console.debug('AT provider saves successfully')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSavingActivityType(false)
    }
  }

  const deleteActivityType = async () => {
    if (!cEvent?.value?._id) {
      console.error('ActivityTypeProvider.deleteActivityType cannot get cEvent.value._id')
      return
    }

    if (!activityEdit) {
      console.error('activityEdit (from AgendaContext) is none')
      return
    }

    console.debug('AT provider is deleting')

    setIsDeletingActivityType(true)

    setContentSource(null)
    setActivityContentType(null)
    try {
      await TypesAgendaApi.deleteOne(activityEdit, cEvent.value._id)
      console.debug('AT provider delete successfully')
    } catch (err) {
      console.error('no puede eliminar tipo de actividad:', err)
    } finally {
      setIsDeletingActivityType(false)
      setActivityType(null)
    }
  }

  const resetActivityType = async (type: ActivityType.Name) => {
    if (!cEvent?.value?._id) {
      console.error('ActivityTypeProvider.resetActivityType cannot get cEvent.value._id')
      return
    }

    if (!activityEdit) {
      console.error('activityEdit (from AgendaContext) is none')
      return
    }

    console.debug('AT provider is reseting')

    setIsDeletingActivityType(true)
    setActivityContentType(null)
    await editActivityType(cEvent.value._id, activityEdit, type)
    setIsDeletingActivityType(false)
  }

  const saveActivityContent = async (
    type?: ActivityType.ContentValue | null,
    data?: string | null,
  ) => {
    console.debug('saveActivityContent is been calling')
    if (activityType === null) {
      console.error('activityType (from ActivityTypeProvider) is none')
      return
    }

    if (!cEvent?.value?._id) {
      console.error(
        'ActivityTypeProvider.saveActivityContent cannot get cEvent.value._id',
      )
      return
    }

    if (!activityEdit) {
      console.error('activityEdit (from AgendaContext) is none')
      return
    }

    if (type !== undefined) setActivityContentType(type)
    if (data !== undefined) setContentSource(data)
    const contentType = type !== undefined ? type : activityContentType
    const inputContentSource = data !== undefined ? data : contentSource

    console.debug('inputContentSource', inputContentSource)

    if (!contentType) {
      console.error(
        'ActivityTypeProvider.saveActivityContent: content type must not be none',
      )
      return
    }

    console.debug('contentType:', contentType)

    setIsUpdatingActivityContent(true)

    editActivityType(cEvent.value._id, activityEdit, contentType).then(() =>
      console.debug('editActivityType called during saving'),
    )

    switch (contentType) {
      case activityContentValues.url: {
        const respUrl = await AgendaApi.editOne(
          { video: inputContentSource },
          activityEdit,
          cEvent.value._id,
        )
        if (respUrl) {
          await saveConfig({
            platformNew: '',
            type: activityContentValues.url,
            habilitar_ingreso: '',
            data: inputContentSource,
          })
          setTypeActivity(activityContentValues.url)
          setPlatform('')
          setMeetingId(inputContentSource)
        }
        break
      }
      case activityContentValues.vimeo: {
        await saveConfig({
          platformNew: 'vimeo',
          type: 'vimeo',
          data: inputContentSource,
        })
        setTypeActivity(activityContentValues.vimeo)
        setPlatform(activityContentValues.vimeo)
        setMeetingId(inputContentSource)
        break
      }
      case activityContentValues.youtube: {
        if (!inputContentSource) {
          console.error('ActivityTypeProvider: contentSource is none')
          return
        }
        const newData = inputContentSource.includes('https://youtu.be/')
          ? inputContentSource
          : 'https://youtu.be/' + inputContentSource
        await saveConfig({
          platformNew: 'youtube',
          type: activityContentValues.youtube,
          data: newData,
        })
        setTypeActivity('youTube')
        setPlatform('youtube')
        setMeetingId(inputContentSource)
        break
      }
      case activityContentValues.meeting: {
        await saveConfig({
          platformNew: '',
          type: activityContentValues.meeting,
          data: inputContentSource,
          habilitar_ingreso: 'only',
        })
        setTypeActivity(activityContentValues.meeting)
        setPlatform('')
        break
      }
      case activityContentValues.file: {
        if (!inputContentSource) {
          console.error('ActivityTypeProvider: contentSource is none')
          return
        }
        const data = inputContentSource.split('*')
        const urlVideo = data[0]
        const respUrlVideo = await AgendaApi.editOne(
          { video: urlVideo },
          activityEdit,
          cEvent.value._id,
        )
        if (respUrlVideo) {
          await saveConfig({
            platformNew: '',
            type: 'video',
            data: urlVideo,
            habilitar_ingreso: '',
          })
          setTypeActivity('video')
          setPlatform('')
          setMeetingId(urlVideo)
        }
        break
      }
      case activityContentValues.survey: {
        if (!inputContentSource) {
          console.error(
            'ActivityTypeProvider: contentSource is none:',
            inputContentSource,
          )
          return
        }
        await AgendaApi.editOne(
          { meeting_id: inputContentSource },
          activityEdit,
          cEvent.value._id,
        )
        await saveConfig({ platformNew: '', type: contentType, data: inputContentSource })
        setTypeActivity(activityContentValues.survey)
        if (!!inputContentSource) setMeetingId(inputContentSource)
        break
      }
      case activityContentValues.quizing: {
        if (!inputContentSource) {
          console.error(
            'ActivityTypeProvider: contentSource is none:',
            inputContentSource,
          )
          return
        }
        await AgendaApi.editOne(
          { meeting_id: inputContentSource },
          activityEdit,
          cEvent.value._id,
        )
        await saveConfig({ platformNew: '', type: contentType, data: inputContentSource })
        setTypeActivity(activityContentValues.quizing)
        if (!!inputContentSource) setMeetingId(inputContentSource)
        break
      }
      case activityContentValues.pdf: {
        console.debug('saving pdf..', inputContentSource)
        if (inputContentSource === undefined) {
          console.error(
            'ActivityTypeProvider: contentSource is none:',
            inputContentSource,
          )
          return
        }
        await AgendaApi.editOne(
          { meeting_id: inputContentSource },
          activityEdit,
          cEvent.value._id,
        )
        await saveConfig({ platformNew: '', type: contentType, data: inputContentSource })
        setTypeActivity(activityContentValues.pdf)
        setMeetingId(inputContentSource)
        // if (!!inputContentSource) setMeetingId(inputContentSource);
        break
      }
      case activityContentValues.html: {
        console.debug('saving html..')
        if (inputContentSource === undefined) {
          console.error(
            'ActivityTypeProvider: contentSource is none:',
            inputContentSource,
          )
          return
        }
        await AgendaApi.editOne(
          { meeting_id: inputContentSource },
          activityEdit,
          cEvent.value._id,
        )
        await saveConfig({ platformNew: '', type: contentType, data: inputContentSource })
        setTypeActivity(activityContentValues.html)
        setMeetingId(inputContentSource)
        // if (!!inputContentSource) setMeetingId(inputContentSource);
        break
      }
      default:
        // alert(`wtf is ${contentType}`);
        console.warn(`wtf is ${contentType}`)
    }
  }

  const visualizeVideo = (
    url: string | null,
    created_at: string | null,
    name: string | null,
  ) => {
    url !== null ? setVideoObject({ url, created_at, name }) : setVideoObject(null)
  }

  const value: ActivityTypeContextType = {
    // Flags
    is: {
      stoppingStreaming: isStoppingStreaming,
      creating: isCreatingActivityType,
      deleting: isDeletingActivityType,
      saving: isSavingActivityType,
      updatingActivityType: isUpdatingActivityType,
      updatingActivityContent: isUpdatingActivityContent,
    },
    // Objects
    formWidgetFlow: formWidgetFlow,
    videoObject,
    activityType,
    contentSource,
    activityContentType,
    // Functions
    setActivityType,
    saveActivityType,
    deleteActivityType,
    resetActivityType,
    setContentSource,
    saveActivityContent,
    setActivityContentType,
    translateActivityType,
    visualizeVideo,
    humanizeActivityType,
  }

  useEffect(() => {
    console.debug('activityEdit changed, refresh activityTypeProvider data')
    const request = async () => {
      if (!cEvent?.value?._id) {
        console.error('ActivityTypeProvider.saveActivityType cannot get cEvent.value._id')
        return
      }

      try {
        setIsUpdatingActivityType(true)
        const agendaInfo: ExtendedAgendaType = await AgendaApi.getOne(
          activityEdit,
          cEvent.value._id,
        )
        // setDefinedType(agendaInfo.type?.name || null);
        const typeIncoming = agendaInfo.type?.name as ActivityType.Name

        if (typeIncoming) {
          if (onlyActivityTypes.includes(typeIncoming)) {
            console.debug(typeIncoming, 'is in', onlyActivityTypes)
            setActivityType(typeIncoming)
            setActivityContentType(null)
          } else {
            console.debug(typeIncoming, 'is not in', onlyActivityTypes)

            setActivityContentType(typeIncoming as ActivityType.ContentValue)

            // Load the content source from agenda

            if (theseAreLiveToo.includes(typeIncoming as ActivityType.ContentValue)) {
              setActivityType(MainUI.LIVE)
              // setContentSource(meetingId); this is doing by useEffect directly from meetingId
              console.debug('from beginning contentSource is going to be:', meetingId)
            } else if (
              theseAreVideo.includes(typeIncoming as ActivityType.ContentValue)
            ) {
              setActivityType(MainUI.VIDEO)
              // setContentSource(agendaInfo.video || null); this is doing by useEffect directly from meetingId
              console.debug(
                'from beginning contentSource is going to be:',
                agendaInfo.video || null,
              )
            } else if (
              theseAreMeeting.includes(typeIncoming as ActivityType.ContentValue)
            ) {
              setActivityType(MainUI.MEETING)
              // setContentSource(meetingId); this is doing by useEffect directly from meetingId
              console.debug('from beginning contentSource is going to be:', meetingId)
            } else if (
              ['quizing', 'quiz'].includes(typeIncoming as ActivityType.ContentValue)
            ) {
              setActivityType(MainUI.QUIZ)
              // setContentSource(meetingId); this is doing by useEffect directly from meetingId
              console.debug('from beginning contentSource is going to be:', meetingId)
            } else if ((typeIncoming as ActivityType.ContentValue) === 'survey') {
              setActivityType(MainUI.SURVEY)
              // setContentSource(meetingId); this is doing by useEffect directly from meetingId
              console.debug('from beginning contentSource is going to be:', meetingId)
            } else if (
              externalFileTypes.includes(typeIncoming as ActivityType.ContentValue)
            ) {
              setActivityType(MainUI.PDF)
              // setContentSource(meetingId); this is doing by useEffect directly from meetingId
              console.debug('from beginning contentSource is going to be:', meetingId)
            } else if ((typeIncoming as ActivityType.ContentValue) === 'html') {
              setActivityType(MainUI.HTML)
              // setContentSource(meetingId); this is doing by useEffect directly from meetingId
              console.debug(
                'from beginning contentSource is going to be:',
                (meetingId || '').substring(0, 20),
              )
            } else {
              console.warn('set activity type as null because', typeIncoming, 'is weird')
              setActivityType(null)
            }
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsUpdatingActivityType(false)
      }
    }
    if (activityEdit) {
      request().then()
    }
  }, [activityEdit])

  // useEffect(() => {
  //   if (!meetingId) return;

  //   console.debug('reset contentSource to meetingId:', meetingId);
  //   setContentSource(meetingId);
  // }, [meetingId]);

  return (
    <ActivityTypeContext.Provider value={value}>
      {props.children}
    </ActivityTypeContext.Provider>
  )
}

export default ActivityTypeProvider
