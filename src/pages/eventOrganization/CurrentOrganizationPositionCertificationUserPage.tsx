/** React's libraries */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

/** Antd imports */
import {
  Typography,
  Table,
  Spin,
  Row,
  Col,
  Button,
  Tooltip,
  Tag,
  Modal,
  Form,
  Select,
  Switch,
  InputNumber,
  Input,
  DatePicker,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';

/** Helpers and utils */
import { EventsApi, PositionsApi, UsersApi, CerticationsApi } from '@helpers/request';

/** Components */
import Header from '@antdComponents/Header';
import PositionCertificationFileUploader from './PositionCertificationFileUploader';

const { TextArea } = Input;

export interface CurrentOrganizationPositionCertificationUserPageProps {
  org: any;
  match: {
    params: {
      positionId: string;
      userId: string;
    };
    url: string;
  };
}

function CurrentOrganizationPositionCertificationUserPage(
  props: CurrentOrganizationPositionCertificationUserPageProps,
) {
  const organizationId: string = props.org._id;
  const positionId = props.match.params.positionId;
  const userId = props.match.params.userId;

  const [columns, setColumns] = useState<ColumnsType<any>>([]);
  const [allPositionEvents, setAllPositionEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentPosition, setCurrentPosition] = useState<any | null>(null);

  const [isModalOpened, setIsModalOpened] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [form] = Form.useForm();

  const openModal = () => setIsModalOpened(true);
  const closeModal = () => setIsModalOpened(false);

  const loadData = async () => {
    const user = await UsersApi.getProfile(userId);
    setCurrentUser(user);

    const position = await PositionsApi.getOne(positionId);
    setCurrentPosition(position);
    console.debug('CurrentOrganizationPositionPage: loadPositionData', { position });

    const certifications = await CerticationsApi.getByPositionAndMaybeUser(position._id, user._id);

    const allEventIds = position.event_ids || [];
    const events = await Promise.all(allEventIds.map(async (eventId: string) => await EventsApi.getOne(eventId)));
    setAllEvents(events.filter((event) => event.is_certification));
    setAllPositionEvents(
      events.map((event) => {
        const filteredCertification = certifications.find((certification: any) => certification.event_id === event._id);
        return {
          ...event,
          certification: filteredCertification,
        };
      }),
    );
  };

  const onFormFinish = (values: any) => {
    if (!currentUser) {
      alert('No se ha cargado el usuario con anterioridad');
      return;
    }
    values['user_id'] = currentUser._id;
    console.debug('form submit', { values });

    setIsSubmiting(true);
    CerticationsApi.create(values).finally(() => {
      setIsSubmiting(false);
      setIsLoading(true);
      loadData().finally(() => setIsLoading(false));
    });
  };

  // Load all users for this position
  useEffect(() => {
    setIsLoading(true);

    loadData().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const newColumns: ColumnsType = [
      {
        title: 'Certificación de',
        render: (event: any) => {
          return <span>{event.name}</span>;
        },
      },
      {
        title: 'Certificación',
        align: 'center',
        width: 100,
        render: (event: any) => {
          if (event.certification?.file_url) {
            return (
              <a href={event.certification.file_url} target="_blank">
                Ver certificado
              </a>
            );
          } else return <em>Sin certificado</em>;
        },
      },
      {
        title: 'Historial',
        dataIndex: 'certification',
        align: 'center',
        width: 100,
        render: (certification: any) => (
          <>
            {(certification?.certification_logs || []).length === 0 ? (
              <em>Sin registros</em>
            ) : (
              <Link to={`${props.match.url}/logs/${certification._id}`}>
                <Tag color="#88f">{(certification?.certification_logs || []).length} registros</Tag>
              </Link>
            )}
          </>
        ),
      },
      /* {
        title: 'Estado de aprobación',
        align: 'center',
        width: 100,
        dataIndex: 'certification',
        render: (certification: any) => (
          <Tag color={certification?.success ? 'green' : 'red'}>
            {certification?.success ? 'Aprobado' : 'No aprobado'}
          </Tag>
        ),
      }, */
      {
        title: 'Fecha de emisión',
        align: 'center',
        width: 100,
        dataIndex: 'certification',
        render: (certification: any) => (
          <>
            {certification?.approved_from_date ? (
              dayjs(certification?.approved_from_date).format('DD/MM/YYYY')
            ) : (
              <em>Sin fecha</em>
            )}
          </>
        ),
      },
      {
        title: 'Fecha de vencimiento',
        align: 'center',
        width: 100,
        dataIndex: 'certification',
        render: (certification: any) => (
          <>
            {certification?.approved_until_date ? (
              dayjs(certification?.approved_until_date).format('DD/MM/YYYY')
            ) : (
              <em>Sin fecha</em>
            )}
          </>
        ),
      },
      {
        title: 'Estado de vigencia',
        align: 'center',
        width: 100,
        dataIndex: 'certification',
        render: (certification: any) => {
          let lema = 'Inactivo';
          if (certification?.approved_until_date) {
            if (dayjs(certification?.approved_until_date) > dayjs(Date.now())) {
              lema = 'Activo';
            }
          }
          return (
            <>
              <Tag color={lema === 'Inactivo' ? 'red' : 'green'}>{lema}</Tag>
            </>
          );
        },
      },
      {
        title: 'Opciones',
        width: 80,
        render: (event: any) => (
          <Row wrap gutter={[8, 8]}>
            <Col>
              <Tooltip title="Editar">
                <Button
                  id={`editAction${event._id}`}
                  type="primary"
                  size="small"
                  onClick={(e) => {
                    alert('No implementado aún');
                  }}
                  icon={<EditOutlined />}
                />
              </Tooltip>
            </Col>
            <Col>
              <Tooltip title="Borrar">
                <Button
                  id={`deleteAction${event._id}`}
                  type="primary"
                  size="small"
                  onClick={(e) => {
                    alert('No implementado aún');
                    // Little future people, please implement the deleting of FireStorage too.
                    // You SHOULD check if the last url pathname element stars with "documents/" and try to
                    // decode it and use this path (that stats with "documents/") to request a deleting
                    // process with the FireStorage API. Dont say that my intrustion are bad, if you don't
                    // believe in me, then ask to ChatGPT tho
                  }}
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Col>
          </Row>
        ),
      },
    ];

    setColumns(newColumns);
  }, [allPositionEvents]);

  return (
    <>
      <Header
        title={
          <>
            {`Certificados de `}
            {currentUser ? <>{currentUser.names}</> : <Spin />}
            {` en el cargo de `}
            {currentPosition ? <>{currentPosition.position_name}</> : <Spin />}
          </>
        }
      />
      <Typography.Paragraph>Estos son los certificados de dicho usuario.</Typography.Paragraph>

      <Typography.Paragraph>Este cargo requiere {allPositionEvents.length} certificaciones.</Typography.Paragraph>

      <Table
        columns={columns}
        dataSource={allPositionEvents}
        size="small"
        rowKey="index"
        pagination={false}
        loading={isLoading}
        scroll={{ x: 'auto' }}
        title={() => (
          <Row wrap justify="end" gutter={[8, 8]}>
            <Col>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  form.resetFields();
                  openModal();
                }}>
                Agregar certificación
              </Button>
              {isSubmiting && <Spin />}
            </Col>
          </Row>
        )}
      />

      <Modal
        visible={isModalOpened}
        title={`Agrega una certificación a usuario: ${currentUser?.names}`}
        onOk={() => {
          form.submit();
          closeModal();
        }}
        onCancel={() => closeModal()}>
        <Form form={form} onFinish={onFormFinish} layout="vertical">
          <Form.Item name="event_id" label="Curso a dar certificación" rules={[{ required: true, message: 'Esto' }]}>
            <Select
              onChange={(value) => {
                /**
                 * When the user change the event to create the certificaciton,
                 * then this code will update the default value for description,
                 * entity and hours.
                 */
                const event = allEvents.find((event) => event._id == value);
                console.log('value changed to:', value, event);
                if (event) {
                  form.setFieldsValue({
                    description: event.default_certification_description,
                    entity: event.default_certification_entity,
                    hours: event.default_certification_hours ?? 1,
                  });
                }
              }}
              options={allEvents.map((event) => ({ label: event.name, value: event._id }))}
            />
          </Form.Item>
          <Form.Item name="success" label="Exitoso" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Agrega la descripción' }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="hours" label="Horas" rules={[{ required: true, message: 'Agrega el número de horas' }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="entity" label="Entidad" rules={[{ required: true, message: 'Agrega la entidad' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="approved_from_date"
            label="Fecha de aprobación"
            rules={[{ required: true, message: 'Agrega la fecha' }]}
            initialValue={dayjs(Date.now())}>
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="approved_until_date"
            label="Fecha de vencimiento"
            rules={[{ required: true, message: 'Agrega la fecha' }]}
            initialValue={dayjs(Date.now())}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="file_url" label="Archivo externo">
            <PositionCertificationFileUploader
              path="positions"
              onFirebasePathChange={(value) => {
                // If the file is from FireStorage...
                console.debug('firestorage_path changes to', value)
                form.setFieldsValue({firestorage_path: value})
              }}
            />
          </Form.Item>
          {/** Please, keep the next line */}
          <Form.Item name="firestorage_path"/>
        </Form>
      </Modal>
    </>
  );
}

export default CurrentOrganizationPositionCertificationUserPage;
