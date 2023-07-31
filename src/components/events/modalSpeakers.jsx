import { useState, useEffect } from 'react'

import { Modal, Row, Col, Avatar, Button } from 'antd'
import { SpeakersApi } from '@helpers/request'
import { UserOutlined } from '@ant-design/icons'

const ModalSpeakers = (props) => {
  const [speakers, setSpeakers] = useState({})
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    ;(async () => {
      const speakers = await SpeakersApi.getOne(props.speakerId, props.eventId)
      setSpeakers(speakers)
      setModalVisible(true)
    })()
  }, [props.speakerId])

  function clearStates() {
    setSpeakers({})
    setModalVisible(false)
    props.setIdSpeaker(null)
  }

  return (
    <>
      <Modal
        title="Conferencista"
        centered
        width={1000}
        open={modalVisible}
        onCancel={() => clearStates()}
        onOk={() => clearStates()}
        footer={[
          <Button key="cerrar" type="primary" onClick={() => clearStates()}>
            Cerrar
          </Button>,
        ]}
      >
        <Row>
          {/* Imagen del conferencista */}

          <Col flex="1 1 auto">
            {speakers.image ? (
              <Avatar
                style={{ display: 'block', margin: '0 auto' }}
                size={130}
                src={speakers.image}
              />
            ) : (
              <Avatar
                style={{ display: 'block', margin: '0 auto' }}
                size={130}
                icon={<UserOutlined />}
              />
            )}
          </Col>

          {/* Descripción del conferencista */}
          <Col flex="1 1 600px">
            <span>
              <b>{speakers.name}</b>
            </span>
            <p>
              <span>
                <b>{speakers.profession}</b>
              </span>
              <br />
              <br />
              <div
                style={{ width: '90%' }}
                dangerouslySetInnerHTML={{ __html: speakers.description }}
              />
            </p>
          </Col>
        </Row>
      </Modal>
    </>
  )
}

export default ModalSpeakers
