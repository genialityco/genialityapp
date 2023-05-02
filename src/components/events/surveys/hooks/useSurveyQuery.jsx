import { useState, useEffect } from 'react'
import loadSelectedSurvey from './../functions/loadSelectedSurvey'
import initRealTimeSurveyListening from './../functions/initRealTimeSurveyListening'
import { getCurrentPage } from '../services/surveys'
import { useCurrentUser } from '@context/userContext'

////open, publish, freezeGame
function useSurveyQuery(eventId, idSurvey, isResetingSurvey) {
  const currentUser = useCurrentUser()
  const [query, setQuery] = useState({ loading: true, error: false, data: undefined })
  const [innerQuery, setInnerQuery] = useState(undefined)
  const [innerRealTimeQuery, setInnerRealTimeQuery] = useState(undefined)

  async function getUserCurrentSurveyPage(idSurvey, userId) {
    let currentPageNo = 0
    if (idSurvey && userId) {
      currentPageNo = await getCurrentPage(idSurvey, userId)
    }
    return currentPageNo
  }

  //Mixing realtime and notreal time into one to be exposed
  useEffect(() => {
    if (innerQuery === undefined || innerRealTimeQuery === undefined) return
    console.log('prueba que no carga tanto')
    setQuery((prev) => {
      return { ...prev, loading: false, data: { ...innerQuery, ...innerRealTimeQuery } }
    })
  }, [innerQuery, innerRealTimeQuery])

  //no realtime Query
  useEffect(() => {
    if (!idSurvey) return
    if (!currentUser.value?._id) return
    const innerAsyncCall = async () => {
      const loadedSurvey = await loadSelectedSurvey(
        eventId,
        idSurvey,
        currentUser.value._id,
      )
      //loadedSurvey.currentPage = 0;
      loadedSurvey.currentPage = await getUserCurrentSurveyPage(
        idSurvey,
        currentUser.value._id,
      )
      setInnerQuery(loadedSurvey)
    }
    innerAsyncCall()
  }, [idSurvey, currentUser.value, isResetingSurvey])

  //realtime Query
  useEffect(() => {
    function handleRealTimeCallback(surveyStatus) {
      setInnerRealTimeQuery(surveyStatus)
    }
    const unsuscribe = initRealTimeSurveyListening(idSurvey, handleRealTimeCallback)
    return () => {
      if (unsuscribe) unsuscribe()
    }
  }, [idSurvey])

  return query
}

export default useSurveyQuery
