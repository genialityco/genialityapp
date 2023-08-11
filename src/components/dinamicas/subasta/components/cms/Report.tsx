import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Divider, Input, Modal, Result, Row, Space, Statistic, Typography } from 'antd';
import { Bar } from 'react-chartjs-2';
import { useSatistic } from '../../hooks/useStatistic';
import { ReportProps } from '../../interfaces/auction.interface';
import { filterUserID, orgOfferds, priceChartValues } from '../../utils/utils';

import useProducts from '../../hooks/useProducts';
import { CloseCircleOutlined, DeleteOutlined, RollbackOutlined } from '@ant-design/icons';

export default function Report({ eventId, reload }: ReportProps) {
  const { offers } = useSatistic(eventId, reload);
  const { products, refresh } = useProducts(eventId);
  const [modal, setModal] = useState<boolean>(false);
  const [permit, setPermit] = useState<boolean>(true);

  useEffect(() => {
    if (reload) refresh();
  }, [reload]);

  const { labels, values, participants } = orgOfferds(offers);
  const { labelsProducts, increases, startPrices } = priceChartValues(products);
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Pujas',
        data: values,
        backgroundColor: '#6e58b1',
        borderColor: '#6e58b1',
        borderWidth: 2,
      },
      {
        label: 'Participantes unicos',
        data: participants,
        backgroundColor: '#332d62',
        borderColor: '#332d62',
        borderWidth: 2,
      },
    ],
  };
  const dataCre = {
    labels: labelsProducts,
    datasets: [
      {
        label: 'precio inicial',
        data: startPrices,
        backgroundColor: '#6e58b1',
        borderColor: '#6e58b1',
        borderWidth: 2,
      },
      {
        label: 'Ganancias',
        data: increases,
        backgroundColor: '#332d62',
        borderColor: '#332d62',
        borderWidth: 2,
      },
    ],
  };
  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        stepSize: 1,
      },
    },
  };
  const optionsCar = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <>
      <Row justify='end'>
      <Modal
          visible={modal}
          onCancel={() => setModal(false)}
          destroyOnClose={true}
          footer={[
            <Button key={'btnCancelar'} type='default' onClick={() => setModal(false)} icon={<CloseCircleOutlined />}>
              Cancelar
            </Button>,
            <Button
              key={'btnEliminar'}
              type='primary'
              danger
              onClick={() => {
                setModal(false);
                //deleteAuction(auction?._id);
              }}
              disabled={permit}
              icon={<DeleteOutlined />}>
              Reiniciar
            </Button>,
          ]}>
          <Result
            status={'warning'}
            title={
              <Typography.Text strong type='warning' style={{ fontSize: 22 }}>
                ¿Quieres Reiniciar los datos?
              </Typography.Text>
            }
            extra={
              <Input
                placeholder={'Reiniciar'}
                onChange={(e) => {
                  if (e.target.value === 'Reiniciar') {
                    setPermit(false);
                  } else {
                    setPermit(true);
                  }
                }}
              />
            }
            subTitle={
              <Space style={{ textAlign: 'justify' }} direction='vertical'>
                <Typography.Paragraph>
                  Esta acción borrará permanentemente los datos de las pujas asi como el precio de los productos subastados.
                </Typography.Paragraph>

                <Typography.Paragraph>
                  Para confirmar que deseas eliminar los datos de la Subasta, escribe la siguiente palabra: 
                  <Typography.Text strong type='danger'>
                   {' Reiniciar'}
                  </Typography.Text>
                </Typography.Paragraph>
              </Space>
            }
          />
        </Modal>
      {true && (
        <Button icon={<RollbackOutlined />} danger type='primary' onClick={() => setModal(true)}>
          Reiniciar Subasta
        </Button>
      )}
      </Row>
      <Row justify='center' gutter={[16, 16]}>
        <Col xs={24} sm={24} md={16} lg={16} xl={16} xxl={10}>
          <Card style={{ borderRadius: 20 }} title={'Grafica de pujas x producto'}>
            {/*@ts-ignore */}
            <Bar data={data} options={options} />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={10}>
          <Col style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
            <Card style={{ width: 300 }} hoverable>
              <Statistic
                valueStyle={{ textAlign: 'center', fontSize: 30 }}
                title='Articulos Subastados'
                value={labels.length}
              />
            </Card>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
            <Card style={{ width: 300 }} hoverable>
              <Statistic valueStyle={{ textAlign: 'center', fontSize: 30 }} title='Total Pujas' value={offers.length} />
            </Card>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
            <Card style={{ width: 300 }} hoverable>
              <Statistic
                valueStyle={{ textAlign: 'center', fontSize: 30 }}
                title='Total Participantes'
                value={filterUserID(offers).length}
              />
            </Card>
          </Col>
        </Col>
      </Row>
      <Divider />
      <Row justify='center' gutter={[16, 16]} style={{ margin: 10 }}>
        <Col xs={24} sm={24} md={16} lg={16} xl={16} xxl={10}>
          <Card style={{ borderRadius: 20 }} title={'Grafica de ganancias x producto'}>
            <Bar data={dataCre} options={optionsCar} />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={10}>
          {/*       <Card style={{ borderRadius: 20 }}>
          <Pie data={dataCre} options={optionsCar} />
        </Card> */}
          <Result title='Proximamente'></Result>
        </Col>
      </Row>
    </>
  );
}
