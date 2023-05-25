import { useEffect, useState } from 'react'
import { Tag, Button, Modal, Row, Col, Tooltip, Tabs, Badge } from 'antd'
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { utils, writeFileXLSX } from 'xlsx'
import dayjs from 'dayjs'
import { getColumnSearchProps } from '@components/speakers/getColumnSearch'
import Table from '@antdComponents/Table'
import { handleRequestError } from '@helpers/utils'
import { firestoreeviuschat, firestore } from '@helpers/firebase'
import AccountCancel from '@2fd/ant-design-icons/lib/AccountCancel'
import Account from '@2fd/ant-design-icons/lib/Account'
import { StateMessage } from '@context/MessageService'
import { useHelper } from '@context/helperContext/hooks/useHelper'
import { useEventContext } from '@context/eventContext'

const { TabPane } = Tabs

function formatAMPM(hours, minutes) {
  // var hours = date.getHours();
  // var minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  const strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

const ChatExport = ({ eventId, event }) => {
  // eslint-disable-next-line prefer-const
  let [datamsjevent, setdatamsjevent] = useState([])
  const [loading, setLoading] = useState(true)
  const [columnsData, setColumnsData] = useState({})
  const [listUsersBlocked, setlistUsersBlocked] = useState([])
  const cEvent = useEventContext()
  const { eventIsActive } = useHelper()

  const renderMensaje = (text, record) => (
    <Tooltip title={record.text} placement="topLeft">
      <Tag color="#3895FA">{record.text}</Tag>
    </Tooltip>
  )
  const renderFecha = (val) => <p>{dayjs(val).format('DD/MM/YYYY HH:mm')}</p>
  const columns = [
    {
      title: 'Usuario',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name', columnsData),
    },

    {
      title: 'Mensaje',
      key: 'text',
      dataIndex: 'text',
      ellipsis: true,
      sorter: (a, b) => a.text.localeCompare(b.text),
      ...getColumnSearchProps('text', columnsData),
      render: renderMensaje,
    },
    {
      title: 'Fecha',
      dataIndex: 'hora',
      key: 'hora',
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.hora.localeCompare(b.hora),
      ...getColumnSearchProps('hora', columnsData),
      render: renderFecha,
    },
  ]

  const columnsUserBlocked = [
    {
      title: 'Usuario',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name', columnsData),
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      ellipsis: true,
      sorter: (a, b) => a.email.localeCompare(b.email),
      ...getColumnSearchProps('email', columnsData),
    },
    /* {
      title: 'Estatus',
      key: 'blocked',
      dataIndex: 'blocked',
      ellipsis: true,
      width: 100,
      render(val, item) {
        return (
          <p>Bloqueado</p>
        )
      }
    }, */
  ]

  const exportFile = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    datamsjevent = datamsjevent.filter(
      (item) => item.text.toLowerCase().indexOf('spam') === -1,
    )
    const ws = utils.json_to_sheet(datamsjevent)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Chat')
    writeFileXLSX(wb, `chatCURSO ${event.name}.xls`)
  }

  useEffect(() => {
    getChat()
    getBlocketdUsers()
  }, [])

  function getChat() {
    const datamessagesthisevent = []

    firestoreeviuschat
      .collection('messagesevent_' + eventId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const conversion = dayjs(doc.data().sortByDateAndTime).format(
            'YYYY-MM-DD HH:mm:ss',
          )
          const msjnew = {
            chatId: doc.id,
            name: doc.data().name,
            text: doc.data().text,
            hora: conversion,
            idparticipant: doc.data().idparticipant,
          }
          datamessagesthisevent.push(msjnew)
        })
        setdatamsjevent(datamessagesthisevent)
        setLoading(false)
      })
      .catch()
  }

  function getBlocketdUsers() {
    const list = []
    const path = cEvent.value._id + '_event_attendees/'

    setLoading(true)
    firestore
      .collection(path)
      .where('blocked', '==', true)
      .get()
      .then((res) => {
        res.forEach((user) => {
          const newUser = {
            name: user.data().user.names,
            email: user.data().user.email,
            idparticipant: user.data()._id,
            blocked: user.data().blocked,
          }
          list.push(newUser)
        })
        setlistUsersBlocked(list)
        setLoading(false)
      }).catch
  }

  function deleteAllChat() {
    StateMessage.show(
      'loading',
      'loading',
      ' Por favor espere mientras se borra la información...',
    )
    Modal.confirm({
      title: `¿Está seguro de eliminar la información?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Una vez eliminado, no lo podrá recuperar',
      okText: 'Borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        const onHandlerRemove = async () => {
          try {
            setLoading(true)
            datamsjevent.forEach(async (item) => {
              await deleteSingleChat(eventId, item.chatId)
            })
            setdatamsjevent([])
            setLoading(false)
            StateMessage.destroy('loading')
            StateMessage.show(null, 'success', 'Se eliminó la información correctamente!')
          } catch (e) {
            StateMessage.destroy('loading')
            StateMessage.show(null, 'error', handleRequestError(e).message)
          }
        }
        onHandlerRemove()
      },
    })
  }

  function deleteSingleChat(eventId, chatId) {
    return new Promise((resolve, reject) => {
      firestoreeviuschat
        .collection('messagesevent_' + eventId)
        .doc(chatId)
        .delete()
        .then(() => {
          resolve('Delete chat', chatId)
        })
        .catch((error) => {
          reject('Error deleting chat: ', error)
        })
    })
  }

  function remove(id) {
    StateMessage.show(
      'loading',
      'loading',
      ' Por favor espere mientras se borra la información...',
    )
    Modal.confirm({
      title: `¿Está seguro de eliminar la información?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Una vez eliminado, no lo podrá recuperar',
      okText: 'Borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        const onHandlerRemove = async () => {
          try {
            setLoading(true)
            await deleteSingleChat(eventId, id)
            getChat()
            setLoading(false)
            StateMessage.destroy('loading')
            StateMessage.show(null, 'success', 'Se eliminó la información correctamente!')
          } catch (e) {
            StateMessage.destroy('loading')
            StateMessage.show(null, 'error', handleRequestError(e).message)
          }
        }
        onHandlerRemove()
      },
    })
  }

  function blockUser(item) {
    const path = cEvent.value._id + '_event_attendees/' + item.idparticipant

    const searchDataUser = new Promise((resolve) => {
      firestore
        .doc(path)
        .get()
        .then((res) => {
          resolve({ status: 200, data: res.data().blocked })
        })
    })

    searchDataUser.then((res) => {
      const userBlocked = res.data
      StateMessage.show(
        'loading',
        'loading',
        `Por favor espere mientras ${
          userBlocked ? 'desbloquea' : 'bloquea'
        } el usuario del chat...`,
      )
      Modal.confirm({
        title: `¿Está seguro de ${
          userBlocked ? 'desbloquear' : 'bloquear'
        } usuario para el chat?`,
        icon: <ExclamationCircleOutlined />,
        content: `${
          userBlocked
            ? 'Una vez desbloqueado puede bloquearlo'
            : 'Una vez bloqueado puede desbloquearlo'
        }`,
        okText: `${userBlocked ? 'Desbloquear' : 'Bloquear'}`,
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk() {
          const onHandlerBlock = async () => {
            try {
              setLoading(true)
              //Código de bloqueo
              await firestore
                .doc(path)
                .update({
                  blocked: !userBlocked,
                })
                .then(() => {
                  StateMessage.destroy('loading')
                  StateMessage.show(
                    null,
                    'success',
                    `${userBlocked ? 'Usuario desbloqueado' : 'Usuario bloqueado'}`,
                  )
                })
              getChat()
              getBlocketdUsers()
              setLoading(false)
            } catch (e) {
              StateMessage.destroy('loading')
              StateMessage.show(null, 'error', handleRequestError(e).message)
            }
          }
          onHandlerBlock()
        },
      })
    })
  }

  return (
    <Tabs defaultActiveKey="1" onChange={(getChat, getBlocketdUsers)}>
      <TabPane tab="Gestión de chats del curso" key="1">
        <Table
          header={columns}
          list={datamsjevent}
          loading={loading}
          actions
          remove={remove}
          extraFn={blockUser}
          extraFnTitle="Bloquear usuarios"
          extraFnType="ghost"
          extraFnIcon={<AccountCancel />}
          titleTable={
            <Row gutter={[8, 8]} wrap>
              <Col>
                <Button onClick={getChat} type="primary" icon={<ReloadOutlined />}>
                  Recargar
                </Button>
              </Col>
              <Col>
                {datamsjevent && datamsjevent.length > 0 && (
                  <Button onClick={exportFile} type="primary" icon={<DownloadOutlined />}>
                    Exportar
                  </Button>
                )}
              </Col>
              <Col>
                {datamsjevent && datamsjevent.length > 0 && (
                  <Button
                    onClick={deleteAllChat}
                    type="danger"
                    icon={<DeleteOutlined />}
                    disabled={
                      !eventIsActive && window.location.toString().includes('eventadmin')
                    }
                  >
                    Eliminar chat
                  </Button>
                )}
              </Col>
            </Row>
          }
          search
          setColumnsData={setColumnsData}
        />
      </TabPane>
      <TabPane
        tab={
          <Badge count={listUsersBlocked.length} offset={[8, 0]}>
            Usuarios bloqueados
          </Badge>
        }
        key="2"
      >
        <Table
          header={columnsUserBlocked}
          list={listUsersBlocked}
          loading={loading}
          actions
          extraFn={blockUser}
          extraFnTitle="Desbloquear usuario"
          extraFnType="ghost"
          extraFnIcon={<Account />}
          exportData
          fileName="Usuarios bloqueados"
          titleTable={
            <Row gutter={[8, 8]} wrap>
              <Col>
                <Button
                  onClick={getBlocketdUsers}
                  type="primary"
                  icon={<ReloadOutlined />}
                >
                  Recargar
                </Button>
              </Col>
            </Row>
          }
          search
          setColumnsData={setColumnsData}
        />
      </TabPane>
    </Tabs>
  )
}

export default ChatExport
