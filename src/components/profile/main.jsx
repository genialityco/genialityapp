import React from 'react';
import { useState } from 'react';
import { Avatar, Card, Col, Layout, Menu, Row, Space, Statistic, Tabs, Typography, Grid, Divider } from 'antd';
import { ArrowUpOutlined, LikeOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import OrganizationCard from './organizationCard';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const MainProfile = () => {
  const screens = useBreakpoint();
  console.log('pantallas', screens);
  return (
    <Layout style={{ height: '90.8vh' }}>
      <Sider
        defaultCollapsed={true}
        width={!screens.xs ? 300 : '90vw'}
        style={{ backgroundColor: '#ffffff' }}
        breakpoint='lg'
        collapsedWidth='0'
        zeroWidthTriggerStyle={{ top: '-40px', width: '50px', right: '-40px' }}>
        <Row justify='center'>
          <Space
            size={5}
            direction='vertical'
            style={{ textAlign: 'center', paddingLeft: '15px', paddingRight: '15px' }}>
            <Avatar size={150} src={'https://i.pravatar.cc/300'} />
            <Typography.Text style={{ fontSize: '20px', width: '250px' }}>Nombre del usuario</Typography.Text>
            <Typography.Text type='secondary' style={{ fontSize: '16px', width: '220px', wordBreak: 'break-all' }}>
              usuario@email.com
            </Typography.Text>
          </Space>

          <Col span={24}>
            <Menu style={{ width: '100%', border: 'none' }} mode='inline'>
              <Menu.Item key='m1'>Option 1</Menu.Item>
              <Menu.Item key='m2'>Option 2</Menu.Item>
              <Menu.Item key='m3'>Option 3</Menu.Item>
              <Menu.Item key='m4'>Option 4</Menu.Item>
            </Menu>
          </Col>

          <Col style={{ padding: '30px' }} span={24}>
            <Card style={{ textAlign: 'center', borderRadius: '15px' }}>
              <Statistic
                title='Eventos creados'
                value={5}
                precision={0}
                valueStyle={{ color: '#3f8600', fontSize: '35px' }}
              />
            </Card>
          </Col>
        </Row>
      </Sider>
      <Layout>
        <Content style={{ margin: '0px', padding: '10px' }}>
          <Tabs defaultActiveKey='1'>
            {!screens.xs && (
              <TabPane tab='Todos' key='1'>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Divider orientation='left'>Organizaciones</Divider>{' '}
                    <Row gutter={[16, 16]}>
                      <Col key={'index1'} xs={12} sm={8} md={8} lg={6} xl={4} xxl={4}>
                        <OrganizationCard />
                      </Col>
                    </Row>
                  </Col>
                  <Col span={24}>
                    <Divider orientation='left'>Eventos creado</Divider>{' '}
                    <Row gutter={[16, 16]}>
                      <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                        <Card
                          cover={<img style={{ objectFit: 'cover' }} src='https://picsum.photos/300/200' />}
                          style={{ width: '100%' }}></Card>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={24}>
                    <Divider orientation='left'>Eventos en los que estoy registrado</Divider>
                    <Row gutter={[16, 16]}>
                      <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                        <Card
                          cover={<img style={{ objectFit: 'cover' }} src='https://picsum.photos/300/200' />}
                          style={{ width: '100%' }}></Card>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </TabPane>
            )}
            <TabPane tab='Organiaciones' key='2'>
              <Row gutter={[16, 16]}>
                <Col key={'index'} xs={12} sm={8} md={8} lg={6} xl={4} xxl={4}>
                  <OrganizationCard />
                </Col>
                <Col key={'index'} xs={12} sm={8} md={8} lg={6} xl={4} xxl={4}>
                  <OrganizationCard />
                </Col>
                <Col key={'index'} xs={12} sm={8} md={8} lg={6} xl={4} xxl={4}>
                  <OrganizationCard />
                </Col>
                <Col key={'index'} xs={12} sm={8} md={8} lg={6} xl={4} xxl={4}>
                  <OrganizationCard />
                </Col>
                <Col key={'index'} xs={12} sm={8} md={8} lg={6} xl={4} xxl={4}>
                  <OrganizationCard />
                </Col>
                <Col key={'index'} xs={12} sm={8} md={8} lg={6} xl={4} xxl={4}>
                  <OrganizationCard />
                </Col>
              </Row>
            </TabPane>
            <TabPane tab='Eventos creados' key='3'>
              <Row gutter={[16, 16]}>
                <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                  <Card
                    cover={<img style={{ objectFit: 'cover' }} src='https://picsum.photos/300/200' />}
                    style={{ width: '100%' }}></Card>
                </Col>
                <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                  <Card
                    cover={<img style={{ objectFit: 'cover' }} src='https://random.imagecdn.app/300/200' />}
                    style={{ width: '100%' }}></Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab='Registros a eventos' key='4'>
              <Row gutter={[16, 16]}>
                <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                  <Card
                    cover={<img style={{ objectFit: 'cover' }} src='https://random.imagecdn.app/300/200' />}
                    style={{ width: '100%' }}></Card>
                </Col>
                <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                  <Card
                    cover={<img style={{ objectFit: 'cover' }} src='https://picsum.photos/300/200' />}
                    style={{ width: '100%' }}></Card>
                </Col>
                <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                  <Card
                    cover={<img style={{ objectFit: 'cover' }} src='https://random.imagecdn.app/300/200' />}
                    style={{ width: '100%' }}></Card>
                </Col>
                <Col key={'index'} xs={24} sm={12} md={12} lg={8} xl={6}>
                  <Card
                    cover={<img style={{ objectFit: 'cover' }} src='https://picsum.photos/300/200' />}
                    style={{ width: '100%' }}></Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainProfile;
