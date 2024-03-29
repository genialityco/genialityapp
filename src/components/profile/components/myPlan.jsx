import { useEffect, useState } from 'react';
import { PlansApi, AlertsPlanApi, BillssPlanApi } from '../../../helpers/request';
import PlanCard from './planCard';
import Plan from './plan';
import { Row, Col, Tabs, Space, Table, Tooltip, Button, Tag, Card, Divider, Typography, Modal } from 'antd';
import {
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  RightOutlined,
} from '@ant-design/icons';
import AccountGroupIcon from '@2fd/ant-design-icons/lib/AccountGroup';
import TimerOutlineIcon from '@2fd/ant-design-icons/lib/TimerOutline';
import ViewAgendaIcon from '@2fd/ant-design-icons/lib/ViewAgenda';
import { Link } from 'react-router-dom';
import { GetTokenUserFirebase } from '@/helpers/HelperAuth';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { DispatchMessageService } from '@/context/MessageService';
import { handleRequestError } from '@/helpers/utils';

const MyPlan = ({ cUser }) => {
  const plan = cUser.value?.plan;
  let [plans, setPlans] = useState([]);
  let [notifications, setNotifications] = useState([]);
  let [bills, setBills] = useState([]);
  let [consumption, setConsumption] = useState([]);
  let [totalUsersByPlan, setTotalUsersByPlan] = useState({});
  const [loadingNotification, setLoadingNotification] = useState(true);
  const [loadingBill, setLoadingBill] = useState(true);
  const [loadingConsumption, setLoadingConsumption] = useState(true);
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toShow, setToShow] = useState(0);
  const [toShowModal, setToShowModal] = useState('');
  const [UrlAdditional, setUrlAdditional] = useState('');
  let [token, setToken] = useState('');
  const goBackUrlPayment = window.location.toString().includes('https://staging.evius.co/')
    ? 'https://staging.evius.co/myprofile/events'
    : window.location.toString().includes('https://app.evius.co/myprofile/events')
    ? 'https://app.evius.co/myprofile/events'
    : 'http://localhost:3000/myprofile/events';
  const intl = useIntl();

  const deleteNotification = async (id) => {
    Modal.confirm({
      title: intl.formatMessage({
        id: 'my_plan.delete.notification',
        defaultMessage: '¿Está seguro de eliminar la notificación?',
      }),
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: intl.formatMessage({
        id: 'button.delete',
        defaultMessage: 'Borrar',
      }),
      okType: 'danger',
      cancelText: intl.formatMessage({
        id: 'button.cancel',
        defaultMessage: 'Cancelar',
      }),
      onOk() {
        DispatchMessageService({
          type: 'loading',
          key: 'loading',
          msj: intl.formatMessage({
            id: 'my_plan.delete.loading.notification',
            defaultMessage: 'Por favor espere mientras se borra la notificación...',
          }),
          action: 'show',
        });
        const onHandlerRemove = async () => {
          try {
            await AlertsPlanApi.editOne(id, {
              status: 'INACTIVE',
              user_id: cUser.value?._id,
            });
            DispatchMessageService({
              key: 'loading',
              action: 'destroy',
            });
            DispatchMessageService({
              type: 'success',
              msj: intl.formatMessage({
                id: 'my_plan.delete.notification.success',
                defaultMessage: 'Se eliminó la notificación correctamente!',
              }),
              action: 'show',
            });
            getInfoPlans();
          } catch (e) {
            DispatchMessageService({
              key: 'loading',
              action: 'destroy',
            });
            DispatchMessageService({
              type: 'error',
              msj: handleRequestError(e).message,
              action: 'show',
            });
          }
        };
        onHandlerRemove();
      },
    });
  };

  //Notifications
  const columns = [
    {
      title: intl.formatMessage({
        id: 'my_plan.reason',
        defaultMessage: 'Razón',
      }),
      dataIndex: 'message',
      key: 'message',
    },
    /* {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render(val, item) {
        const color = () => {
          switch (val) {
            case 'ACTIVE':
              return 'green';
            default:
              return 'orange';
          }
        };
        return <Tag color={color()}>{val}</Tag>;
      },
    }, */
    {
      title: intl.formatMessage({
        id: 'my_plan.date',
        defaultMessage: 'Fecha',
      }),
      dataIndex: 'created_at',
      key: 'created_at',
      render(val, item) {
        const date = moment(val).subtract(new Date(val).getTimezoneOffset() / 60, 'hours');

        return <>{date.format('YYYY-MM-DD HH:mm:ss')}</>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.actions',
        defaultMessage: 'Acciones',
      }),
      dataIndex: 'actions',
      key: 'actions',
      render(val, item) {
        return (
          <Space wrap>
            <Tooltip
              placement='topLeft'
              title={intl.formatMessage({
                id: 'button.delete',
                defaultMessage: 'Eliminar',
              })}>
              <Button danger icon={<DeleteOutlined />} onClick={() => deleteNotification(item._id)} />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const columnsBills = [
    {
      title: intl.formatMessage({
        id: 'my_plan.number.billing',
        defaultMessage: 'Ref. factura',
      }),
      dataIndex: 'reference_evius',
      key: 'reference_evius',
      render(val, item) {
        return <>{item.billing.reference_evius}</>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.reason.name',
        defaultMessage: 'Razón social / Nombre completo',
      }),
      dataIndex: 'reason',
      key: 'reason',
      render(val, item) {
        const payment = item.billing.payment_method || item.payment || {};
        return (
          <>
            {payment['address']?.name} {payment['address']?.last_name}
          </>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.acition',
        defaultMessage: 'Acción',
      }),
      dataIndex: 'action',
      key: 'action',
      /* render(val, item) {
        return <>{item.billing.action}</>;
      }, */
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.status',
        defaultMessage: 'Estado',
      }),
      dataIndex: 'status',
      key: 'status',
      render(val, item) {
        //APPROVED VOIDED DECLINED ERROR PENDING
        const color = () => {
          switch (val) {
            case 'APPROVED':
              return 'green';
            case 'VOIDED':
            case 'PENDING':
              return 'orange';
            case 'DECLINED':
            case 'ERROR':
              return 'red';
          }
        };

        return <Tag color={color()}>{item.status}</Tag>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.value',
        defaultMessage: 'Valor',
      }),
      dataIndex: 'value',
      key: 'value',
      render(val, item) {
        const tax = item?.billing?.tax === 0 ? 1 : item?.billing?.tax * 10;
        const total = parseFloat(item?.billing?.base_value * tax).toFixed(2);
        return (
          <div>
            {item?.billing?.currency} ${total}
          </div>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.date',
        defaultMessage: 'Fecha',
      }),
      dataIndex: 'created_at',
      key: 'created_at',
      render(val, item) {
        const date = moment(val).subtract(new Date(val).getTimezoneOffset() / 60, 'hours');

        return <>{date.format('YYYY-MM-DD HH:mm:ss')}</>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.details',
        defaultMessage: 'Detalles',
      }),
      dataIndex: 'details',
      key: 'details',
      render(val, item) {
        const payment = item.billing.payment_method || item.payment || {};
        const tax = item?.billing?.tax === 0 ? 1 : item?.billing?.tax * 10;
        const total = parseFloat(item?.billing?.base_value * tax).toFixed(2);
        return (
          <Space wrap>
            <Tooltip
              placement='topLeft'
              title={intl.formatMessage({
                id: 'my_plan.preview',
                defaultMessage: 'Previsualización',
              })}>
              <Button
                icon={<FileDoneOutlined />}
                onClick={() => {
                  setShowModal(!showModal);
                  setToShowModal(item._id);
                }}
              />
            </Tooltip>
            <Modal
              visible={showModal && toShowModal === item._id}
              footer={null}
              onCancel={() => {
                setShowModal(!showModal);
                setToShowModal('');
              }}
              width={'100%'}>
              <Divider orientation='left'>
                <strong>
                  {intl.formatMessage({
                    id: 'my_plan.voucher',
                    defaultMessage: 'Comprobante',
                  })}
                </strong>
              </Divider>
              <Row gutter={[12, 12]} wrap>
                <Col span={12}>
                  <Space direction='vertical'>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.reason.name',
                          defaultMessage: 'Razón social / Nombre completo',
                        })}
                        :
                      </Typography.Text>{' '}
                      {payment['address']?.name} {payment['address']?.last_name}
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.identification',
                          defaultMessage: 'Identificación',
                        })}
                        :
                      </Typography.Text>{' '}
                      {payment['address']?.identification['type']} {payment['address']?.identification['value']}
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.phone_number',
                          defaultMessage: 'Teléfono',
                        })}
                        :
                      </Typography.Text>{' '}
                      +{payment['address']?.prefix} {payment['address']?.phone_number}
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>E-mail:</Typography.Text> {payment['address']?.email}
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.address',
                          defaultMessage: 'Dirección',
                        })}
                        :
                      </Typography.Text>{' '}
                      ({payment['address']?.country}) {payment['address']?.address_line_1}{' '}
                      {payment['address']?.address_line_2}, {payment['address']?.city} {payment['address']?.postal_code}
                      -{payment['address']?.region}
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.billing.date',
                          defaultMessage: 'Fecha de la venta',
                        })}
                        :
                      </Typography.Text>{' '}
                      {item?.created_at}
                    </Typography.Text>

                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.billing.base',
                          defaultMessage: 'Valor base de la venta',
                        })}
                        :
                      </Typography.Text>{' '}
                      {item?.billing?.currency} ${total} con ({item?.billing?.tax * 100}% de impuesto){' '}
                      {item?.billing?.total_discount && <>y un descuento de ${item?.billing?.total_discount}</>}
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.payment.method',
                          defaultMessage: 'Medio de pago',
                        })}
                        :
                      </Typography.Text>{' '}
                      {payment?.type} - {payment?.method_name} ({payment?.brand})
                    </Typography.Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction='vertical'>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.reference',
                          defaultMessage: 'Referencia del comprobante',
                        })}
                        :
                      </Typography.Text>{' '}
                      {item?.billing?.reference_evius} (evius) / {item?.billing?.reference_wompi} (wompi)
                    </Typography.Text>
                    <Typography.Text>
                      <Space direction='vertical'>
                        <Typography.Text strong>
                          {intl.formatMessage({
                            id: 'my_plan.description',
                            defaultMessage: 'Concepto y/o descripción de la venta',
                          })}
                          :
                        </Typography.Text>

                        {item?.action === 'SUBSCRIPTION' && (
                          <Typography.Text>
                            Plan: {item?.billing?.details['plan'].amount} (${item?.billing?.details['plan'].price})
                          </Typography.Text>
                        )}

                        {item?.action === 'ADDITIONAL' && (
                          <Typography.Text>
                            {intl.formatMessage({
                              id: 'my_plan.additional.users',
                              defaultMessage: 'Usuarios adicionales',
                            })}
                            : {item?.billing?.details['users'].amount} ({item?.billing?.currency} $
                            {item?.billing?.details['users'].price}){' '}
                            <small>
                              (Total: {item?.billing?.currency} $
                              {item?.billing?.details['users'].amount * item?.billing?.details['users'].price})
                            </small>
                          </Typography.Text>
                        )}
                      </Space>
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.billing.state',
                          defaultMessage: 'Estatus de la compra',
                        })}
                        :
                      </Typography.Text>{' '}
                      {item?.status}
                    </Typography.Text>
                    {payment?.status && (
                      <Typography.Text>
                        <Typography.Text strong>
                          {intl.formatMessage({
                            id: 'my_plan.payment.state',
                            defaultMessage: 'Estatus del pago',
                          })}
                          :
                        </Typography.Text>{' '}
                        {payment?.status}
                      </Typography.Text>
                    )}
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.subscription_type',
                          defaultMessage: 'Tipo de subscripción',
                        })}
                        :
                      </Typography.Text>{' '}
                      {item?.billing?.subscription_type}
                    </Typography.Text>
                    <Typography.Text>
                      <Typography.Text strong>
                        {intl.formatMessage({
                          id: 'my_plan.dollarToday',
                          defaultMessage: 'Tasa del dolar',
                        })}
                        :
                      </Typography.Text>{' '}
                      {item?.billing?.dollarToday}
                    </Typography.Text>
                  </Space>
                </Col>
              </Row>
            </Modal>
          </Space>
        );
      },
    },
  ];

  const columnsEvents = [
    {
      title: intl.formatMessage({
        id: 'my_plan.event.name',
        defaultMessage: 'Nombre del evento',
      }),
      dataIndex: 'name',
      key: 'name',
      render(val, item) {
        return (
          <Link to={`/eventadmin/${item.ID}`} style={{ color: '#1890ff' }}>
            {val}
          </Link>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.users',
        defaultMessage: 'Usuarios',
      }),
      dataIndex: 'users',
      key: 'users',
      align: 'center',
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.hours',
        defaultMessage: 'Horas',
      }),
      dataIndex: 'hours',
      key: 'hours',
      align: 'center',
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.status',
        defaultMessage: 'Estado',
      }),
      dataIndex: 'status',
      key: 'status',
      render(val, item) {
        const color = () => {
          switch (val) {
            case 'ACTIVE':
              return 'green';
            default:
              return 'orange';
          }
        };
        return <Tag color={color()}>{val}</Tag>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.created_at',
        defaultMessage: 'Fecha de creación',
      }),
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: intl.formatMessage({
        id: 'my_plan.endDate',
        defaultMessage: 'Fecha final',
      }),
      dataIndex: 'endDate',
      key: 'endDate',
    },
  ];

  useEffect(() => {
    getInfoPlans();

    GetTokenUserFirebase().then((token) => {
      if (token) {
        setToken(token);
        let urlRedirect = new URL(
          `?redirect=additional&additionalUsers=${1}&goBack=${goBackUrlPayment}&goForward=${goBackUrlPayment}&token=${token}`,
          `https://pay.evius.co/`
        );
        setUrlAdditional(urlRedirect.href);
      }
    });
  }, []);

  const getInfoPlans = async () => {
    /* Planes adicionales */
    let plans = await PlansApi.getAll();
    setPlans(plans);
    /* console.log('plans', plans); */

    /* Notificaciones/Alertas */
    let notifications = await AlertsPlanApi.getByUser(cUser.value?._id);
    setNotifications(notifications.data);
    setLoadingNotification(false);
    /* console.log(notifications.data, 'notifications'); */

    /* Facturas/Comprobantes */
    let bills = await BillssPlanApi.getByUser(cUser.value?._id);
    setBills(bills.data);
    setLoadingBill(false);
    /* console.log('bills', bills.data); */
    //dollarToday

    /* Consumos del usuario */
    try {
      let consumption = await PlansApi.getCurrentConsumptionPlanByUsers(cUser.value?._id);
      setConsumption(consumption);
      setLoadingConsumption(false);
      /* console.log('consumption', consumption); */
    } catch (error) {
      /* console.log(error, 'error'); */
      setLoadingConsumption(false);
    }

    /* Total de registros de usuario */
    let totalUsersByPlan = await PlansApi.getTotalRegisterdUsers();
    setTotalUsersByPlan(totalUsersByPlan);
    /* console.log(totalUsersByPlan, 'aqui'); */
  };

  return (
    <Tabs defaultActiveKey={'plan'}>
      <Tabs.TabPane
        tab={intl.formatMessage({
          id: 'my_plan',
          defaultMessage: 'Mi plan',
        })}
        key={'plan'}>
        <Row gutter={[12, 12]} wrap>
          <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
            <PlanCard
              title={`Plan ${plan?.name || 'Personalizado'}`}
              value={plan ? `US $ ${plan?.price}` : 'Personalizado'}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
            <PlanCard
              title={intl.formatMessage({
                id: 'my_plan.streaming_hours',
                defaultMessage: 'Horas de transmisión',
              })}
              value={plan ? `${plan?.availables?.streaming_hours / 60}h` : 'Ilimitadas'}
              icon={<TimerOutlineIcon style={{ fontSize: '24px' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
            <PlanCard
              title={intl.formatMessage({
                id: 'my_plan.users',
                defaultMessage: 'Usuarios',
              })}
              value={
                totalUsersByPlan?.totalAllowedUsers > 0
                  ? totalUsersByPlan?.totalAllowedUsers
                  : plan?.availables?.users || 'Ilimitados'
              }
              icon={<AccountGroupIcon style={{ fontSize: '24px' }} />}
              message={
                (plan?._id !== '6285536ce040156b63d517e5' ||
                  !plan?._id ||
                  plan?._id !== '629e1dd4f8fceb1d688c35d5') && (
                  <a href={UrlAdditional} style={{ color: '#1890ff' }}>
                    {intl.formatMessage({
                      id: 'my_plan.buy.more',
                      defaultMessage: 'Comprar más',
                    })}{' '}
                    {plan?.costAdditionalUsers && <>a (${plan?.costAdditionalUsers})</>}
                  </a>
                )
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
            <PlanCard
              title={intl.formatMessage({
                id: 'my_plan.events',
                defaultMessage: 'Eventos',
              })}
              value={plan?.availables?.events || 'Ilimitados'}
              icon={<ViewAgendaIcon style={{ fontSize: '24px' }} />}
            />
          </Col>
          <Col span={24}>
            <Typography.Text strong style={{ color: 'orange' }}>
              <small>
                <Space direction='vertical'>
                  {consumption?.start_date && consumption?.end_date && (
                    <Typography.Text>
                      Tu plan se encuentra activo desde{' '}
                      {consumption?.start_date && moment(consumption?.start_date).format('DD-MM-YYYY')} hasta el{' '}
                      {consumption?.end_date && moment(consumption?.end_date).format('DD-MM-YYYY')}
                    </Typography.Text>
                  )}
                  {totalUsersByPlan?.totalAllowedUsers - plan?.availables?.users > 0 && (
                    <Typography.Text strong>
                      Has comprado {totalUsersByPlan?.totalAllowedUsers - plan?.availables?.users} usuarios adicionales
                      en tu plan. El plan cuenta inicialmente con {plan?.availables?.users} usuarios en total.
                    </Typography.Text>
                  )}
                  {totalUsersByPlan?.totalRegisteredUsers > 0 && (
                    <Tag icon={<ExclamationCircleOutlined />} color='warning'>
                      {totalUsersByPlan?.totalRegisteredUsers === totalUsersByPlan?.totalAllowedUsers
                        ? 'Has alcanzado el límite de usuarios permitidos en tu plan'
                        : `Has registrado ${totalUsersByPlan?.totalRegisteredUsers} de usuarios en total de tu plan`}
                    </Tag>
                  )}
                </Space>
              </small>
            </Typography.Text>
            <Table
              dataSource={consumption.events}
              columns={columnsEvents}
              scroll={{ x: 'auto' }}
              loading={loadingConsumption}
              pagination={{ pageSize: 2 }}
            />
          </Col>
          <Col span={24}>
            <Plan plan={plan} mine />
          </Col>
        </Row>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={intl.formatMessage({
          id: 'my_plan.billings',
          defaultMessage: 'Facturaciones',
        })}
        key={'bills'}>
        <Table dataSource={bills} columns={columnsBills} scroll={{ x: 'auto' }} loading={loadingBill} />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={intl.formatMessage({
          id: 'my_plan.notifications',
          defaultMessage: 'Notificaciones',
        })}
        key={'notifications'}>
        <Table dataSource={notifications} columns={columns} scroll={{ x: 'auto' }} loading={loadingNotification} />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={intl.formatMessage({
          id: 'my_plan.better.plan',
          defaultMessage: 'Mejorar plan',
        })}
        key={'plan2'}>
        {plans
          .filter((plan1) => plan1?._id !== plan?._id)
          .sort((a, b) => a.index - b.index)
          .map((plan2, index) => (
            <div style={{ paddingBottom: '15px' }}>
              <Card style={{ borderRadius: '15px' }}>
                <Space>
                  <Divider>
                    <strong>
                      {intl.formatMessage({
                        id: 'my_plan.available',
                        defaultMessage: 'Disponible',
                      })}{' '}
                      {plan2?.name}
                    </strong>
                  </Divider>
                  {plan2?._id !== '6285536ce040156b63d517e5' && plan2?.index > plan?.index ? (
                    <a
                      href={
                        plan2?._id !== '629e1dd4f8fceb1d688c35d5'
                          ? new URL(
                              `?redirect=subscription&planType=${plan2?._id}&goBack=${goBackUrlPayment}&goForward=${goBackUrlPayment}&token=${token}`,
                              `https://pay.evius.co/`
                            )
                          : 'https://evius.co/contacto/'
                      }
                      style={{ color: '#1890ff' }}>
                      {intl.formatMessage({
                        id: 'my_plan.buy.plan',
                        defaultMessage: 'Comprar plan',
                      })}
                    </a>
                  ) : (
                    <Typography.Text strong style={{ color: 'red' }}>
                      <small>Ya tuviste este plan, solo puedes seguir ascendiendo.</small>
                    </Typography.Text>
                  )}
                </Space>
                <Row gutter={[12, 12]} wrap>
                  <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <PlanCard
                      title={`Plan ${plan2?.name}`}
                      value={plan2?.price !== 'Personalizado' ? `US $ ${plan2?.price}` : plan2?.price}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <PlanCard
                      title={intl.formatMessage({
                        id: 'my_plan.streaming_hours',
                        defaultMessage: 'Horas de transmisión',
                      })}
                      value={
                        plan2?.availables?.streaming_hours !== 'Personalizado'
                          ? `${plan2?.availables?.streaming_hours / 60}h`
                          : plan2?.availables?.streaming_hours
                      }
                      icon={<TimerOutlineIcon style={{ fontSize: '24px' }} />}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <PlanCard
                      title={intl.formatMessage({
                        id: 'my_plan.users',
                        defaultMessage: 'Usuarios',
                      })}
                      value={plan2?.availables?.users}
                      icon={<AccountGroupIcon style={{ fontSize: '24px' }} />}
                      message={
                        plan2?.costAdditionalUsers && (
                          <>
                            {intl.formatMessage({
                              id: 'my_plan.additional',
                              defaultMessage: 'Adicional',
                            })}{' '}
                            (${plan2?.costAdditionalUsers})
                          </>
                        )
                      }
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <PlanCard
                      title={intl.formatMessage({
                        id: 'my_plan.events',
                        defaultMessage: 'Eventos',
                      })}
                      value={plan2?.availables?.events}
                      icon={<ViewAgendaIcon style={{ fontSize: '24px' }} />}
                    />
                  </Col>
                  <Col span={24}>
                    <Typography.Text
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setShow(!show);
                        setToShow(index);
                      }}>
                      {!show ? <RightOutlined /> : <DownOutlined />} Aquí puedes conocer más información del plan{' '}
                      <strong>{plan2?.name}</strong>.
                    </Typography.Text>
                    {show && toShow === index && (
                      <>
                        <br />
                        <br />
                        <Plan plan={plan2} />
                      </>
                    )}
                  </Col>
                </Row>
              </Card>
            </div>
          ))}
      </Tabs.TabPane>
    </Tabs>
  );
};

export default MyPlan;
