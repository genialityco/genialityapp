import { Col, Grid, Row, Space, Typography } from 'antd';
import { useState } from 'react';
import Countdown from 'react-countdown';

const { useBreakpoint } = Grid;

const CountdownBlock = () => {
  const screens = useBreakpoint();

  const stylesSubtitle = {
    fontSize: '12px',
    textTransform: 'uppercase',
  };

  const stylesNumeric = {
    width: '120px',
    textAlign: 'center',
    backgroundColor: '#F9FAFE',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: '10px',
    paddingBottom: '10px',
  };

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return (
        <Row gutter={[0, 16]} justify='center' align='middle' style={{ height: '100%' }}>
          <Col span={24}>
            <Row justify='center' align='middle'>
              <Typography.Text strong style={{ textAlign: 'center' }}>
                Ya finalizo el contador
              </Typography.Text>
            </Row>
          </Col>
        </Row>
      );
    } else {
      // Render a countdown
      return (
        <Row gutter={[0, 16]} justify='center' align='middle' style={{ height: '100%' }}>
          <Col span={24}>
            <Row justify='center' align='middle'>
              <Typography.Text style={{ textAlign: 'center' }}>
                LOREM IPSUM IS SIMPLY DUMMY TEXT OF THE PRINTING
              </Typography.Text>
            </Row>
          </Col>
          <Col span={24}>
            <Typography.Text strong style={{ fontSize: '38px' }}>
              <Row gutter={[16, 16]} justify='center' align='middle'>
                <Col>
                  <Space direction='vertical' size={0} style={stylesNumeric}>
                    <Typography.Text type='secondary' style={stylesSubtitle}>
                      Dias
                    </Typography.Text>
                    <Typography.Text style={{ fontVariantNumeric: 'tabular-nums' }}>{days}</Typography.Text>
                  </Space>
                </Col>

                <Col>
                  <Space direction='vertical' size={0} style={stylesNumeric}>
                    <Typography.Text type='secondary' style={stylesSubtitle}>
                      Horas
                    </Typography.Text>
                    <Typography.Text style={{ fontVariantNumeric: 'tabular-nums' }}>{hours}</Typography.Text>
                  </Space>
                </Col>
                <Col>
                  <Space direction='vertical' size={0} style={stylesNumeric}>
                    <Typography.Text type='secondary' style={stylesSubtitle}>
                      Minutos
                    </Typography.Text>
                    <Typography.Text style={{ fontVariantNumeric: 'tabular-nums' }}>{minutes}</Typography.Text>
                  </Space>
                </Col>
                <Col>
                  <Space direction='vertical' size={0} style={stylesNumeric}>
                    <Typography.Text type='secondary' style={stylesSubtitle}>
                      Segundos
                    </Typography.Text>
                    <Typography.Text style={{ fontVariantNumeric: 'tabular-nums' }}>{seconds}</Typography.Text>
                  </Space>
                </Col>
              </Row>
            </Typography.Text>
          </Col>
        </Row>
      );
    }
  };

  return <Countdown date={'2022-07-13T14:43:03'} renderer={renderer} />;
};

export default CountdownBlock;