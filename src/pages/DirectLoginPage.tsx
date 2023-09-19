import { LoadingOutlined, WarningOutlined } from '@ant-design/icons'
import { useCurrentUser } from '@context/userContext'
import { app } from '@helpers/firebase'
import { Alert, Grid, Image, Result } from 'antd'
import { FunctionComponent, useEffect, useReducer } from 'react'

type DLState = {
  text?: string
  email?: string
  failed?: boolean
}

type DLAction =
  | { type: 'VERIFY' }
  | { type: 'LOGIN' }
  | { type: 'LOGGED_IN' }
  | { type: 'REDIRECT' }
  | { type: 'BAB_LOGGING' }
  | { type: 'ERROR'; errorMessage?: string }

const { useBreakpoint } = Grid

const reducerDL = (state: DLState, action: DLAction): DLState => {
  const queryString = window.location.search
  const params = new URLSearchParams(queryString)

  switch (action.type) {
    case 'VERIFY':
      return { ...state, text: 'Verificando sesión de usuario...' }
    case 'LOGGED_IN':
      return { ...state, text: 'Sesión iniciada' }
    case 'LOGIN':
      let email = params.get('email')

      if (email) {
        email = email.replace('%40', '@')

        return { ...state, text: 'Iniciando sesión...', email }
      } else {
        return { ...state, text: 'La URL no proporciona un email', failed: true }
      }

    case 'REDIRECT':
      const redirect = params.get('redirect')
      if (redirect) {
        setTimeout(() => {
          window.location.href = redirect
        }, 5000)
        return { ...state, text: 'Rediridiendo...' }
      } else {
        return { ...state, text: 'No se ha podido hacer la redirección', failed: true }
      }
    case 'BAB_LOGGING':
      return { ...state, text: 'No se ha podido iniciar sesión', failed: true }
    case 'ERROR':
      return {
        ...state,
        text: action.errorMessage ?? 'Error al procesar el link de un sólo uso',
        failed: true,
      }
    default:
      return state
  }
}

const DirectLoginPage: FunctionComponent = () => {
  const screens = useBreakpoint()
  const [state, dispatch] = useReducer(reducerDL, { text: 'Cargando...' })

  const cUser = useCurrentUser()

  useEffect(() => {
    dispatch({ type: 'VERIFY' })
  }, [])

  useEffect(() => {
    if (cUser.status === 'LOADED' && cUser.value) {
      // Logged in
      dispatch({ type: 'LOGGED_IN' })
      dispatch({ type: 'REDIRECT' })
    } else if (cUser.status === 'LOADED' && !cUser.value) {
      // Not logged in
      dispatch({ type: 'LOGIN' })
    }
  }, [cUser.status, cUser.value])

  useEffect(() => {
    if (state.email) {
      app
        .auth()
        .signInWithEmailLink(state.email, window.location.href)
        .then((result) => {
          console.debug('result', { result })
          if (result) {
            // dispatch({ type: 'REDIRECT' })
          } else {
            dispatch({ type: 'BAB_LOGGING' })
          }
        })
        .catch((err) => {
          console.error(err)
          dispatch({ type: 'ERROR', errorMessage: err.toString() })
        })
    }
  }, [state.email])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#ECF2F7',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          width: `${screens.xs ? '90%' : '60%'}`,
          height: `${screens.xs ? '80%' : '70%'}`,
          borderRadius: '15px',
          border: '1px solid #888',
        }}
      >
        <Result
          icon={state.failed ? <WarningOutlined /> : <LoadingOutlined />}
          status={state.failed ? 'error' : 'info'}
          title={state.failed ? 'Proceso fallido' : 'Procesando...'}
          subTitle={state.text}
        />
        <Image preview={false} width={110} src={import.meta.env.VITE_LOGO_SVG} />
        {state.failed && (
          <Alert
            style={{ marginTop: 32 }}
            type="info"
            message="Si el enlace ha expirado, por favor solicite otro e intente nuevamente"
          />
        )}
      </div>
    </div>
  )
}

export default DirectLoginPage
