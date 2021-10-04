import React from 'react';
import EviusReactQuill from '../../shared/eviusReactQuill'; /* Se debe usar este componente para la descripcion */
import { DateTimePicker } from 'react-widgets';
import EventImage from '../../../eventimage.png';
import { Badge, Card, Col, Input, Row, Space, Tooltip, Typography } from 'antd';
import { CalendarOutlined, CheckCircleFilled, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal/Modal';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';

const { Text, Link, Title, Paragraph } = Typography;

const Informacion = () => {
  const [addDescription, setAddDescription] = React.useState(false);
  const [typeTransmission, setTypeTransmission] = React.useState(0);
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  return (
    <div className='step-information'>
      <Space direction='vertical' size='middle'>
        <div>
          <Text>
            Nombre del evento <span className='text-color'>*</span>
          </Text>
          <Input placeholder='Nombre del evento' />
        </div>
        <div>
          {addDescription ? (
            <div>
              <Text>
                Descripción{' '}
                <Link onClick={() => setAddDescription(false)}>
                  |{' '}
                  <Tooltip title='Eliminar descripción'>
                    <DeleteOutlined className='text-color' /> <small className='text-color'>Eliminar descripción</small>
                  </Tooltip>
                </Link>
              </Text>
              <Input.TextArea></Input.TextArea>
            </div>
          ) : (
            <Link onClick={() => setAddDescription(true)}>
              <PlusCircleOutlined /> Agregar descripción
            </Link>
          )}
        </div>
        <div>
          <Text>
            Fecha del evento <span className='text-color'>*</span>
          </Text>
          <Input onClick={showModal} suffix={<CalendarOutlined />} placeholder='Clic para agregar fecha' />
        </div>
        <div>
          <Space direction='vertical'>
            <Text>
              Tipo de transmisión <span className='text-color'>*</span>
            </Text>
            <Row gutter={[16, 16]} justify='center'>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Row justify='center'>
                  <Badge count={typeTransmission == 0 ? <CheckCircleFilled className='icon-checkout' /> : 0}>
                    <div className='cards-type-information' onClick={() => setTypeTransmission(0)}>
                      <Space direction='vertical'>
                        <img src='https://firebasestorage.googleapis.com/v0/b/eviusauth.appspot.com/o/ceStreaming.png?alt=media&token=e36eac64-5d14-4a3a-995f-b7d239b6bbc1' />
                        <Text strong>Streaming</Text>
                        <Text type='secondary'>
                          Tienes hasta 20 invitados que pueden interactuar con cámara y micrófono y los asistentes
                          podrán solamente ver la conferencia. La cantidad de asistentes es ilimitada
                        </Text>
                      </Space>
                    </div>
                  </Badge>
                </Row>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Row justify='center'>
                  <Badge count={typeTransmission == 1 ? <CheckCircleFilled className='icon-checkout' /> : 0}>
                    <div className='cards-type-information' onClick={() => setTypeTransmission(1)}>
                      <Space direction='vertical'>
                        <img src='https://firebasestorage.googleapis.com/v0/b/eviusauth.appspot.com/o/ceConferencia.png?alt=media&token=a1242e00-2d12-41dc-8ced-82d54db447ba' />

                        <Text strong>Conferencia interactiva</Text>

                        <Text type='secondary'>
                          Todos los asistentes podrán interactuar entre sí. Se podrán conectar hasta 50 participantes
                        </Text>
                      </Space>
                    </div>
                  </Badge>
                </Row>
              </Col>
            </Row>
          </Space>
        </div>
      </Space>

      {/* Modal de fecha */}
      <Modal
        className='modal-calendar'
        centered
        visible={isModalVisible}
        okText='Aceptar'
        onOk={handleOk}
        cancelText='Cancelar'
        onCancel={handleCancel}
        width={600}>
        <Row gutter={[16, 16]} justify='center' align='top'>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <DayPicker />
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Title level={4} type='secondary'>
              Asignar hora
            </Title>
            <Card>
              <Space direction='vertical'>
                <div>
                  <Space>
                    <div className='modal-horas'>
                      <span>de</span>
                    </div>
                    <DateTimePicker date={false} />
                  </Space>
                </div>
                <div>
                  <Space>
                    <div className='modal-horas'>
                      <span>a</span>
                    </div>
                    <DateTimePicker date={false} />
                  </Space>
                </div>
              </Space>
            </Card>
            <Paragraph type='secondary' style={{ marginTop: '10px' }}>
              Si tu evento incluye varias actividades las podras crear en la seccion agenda despues de crear el evento.
            </Paragraph>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default Informacion;