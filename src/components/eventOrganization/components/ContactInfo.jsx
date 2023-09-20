import { MailOutlined, PhoneOutlined, GlobalOutlined } from '@ant-design/icons';
import { Row, Col, Card, Result, Typography, Descriptions, Space } from 'antd';

const ContactInfo = ({ organization }) => {
  return (
    <Row justify='center' style={{ paddingTop: '32px', paddingBottom: '32px' }}>
      <Col xs={24} sm={24} md={20} lg={12} xl={12} xxl={12}>
        <Card style={{ width: '100%', borderRadius: 20, margin: '0 auto' }}>
          <Result
            style={{ textAlign: 'center', padding: 0 }}
            status='warning'
            title={`Acceso bloqueado a ${organization?.name}.`}
            subTitle={
              <Typography>
                Lamentamos informarte que tu acceso al contenido de {organization?.name} ha sido bloqueado. Entendemos
                que esta situación pueda ser frustrante, y estamos aquí para ayudarte a resolverla. Puedes contactarnos
                a los siguientes medios:
              </Typography>
            }>
            <Descriptions layout='horizontal' bordered column={{ xs: 1, sm: 1, md: 1, lg: 3, xl: 12, xxl: 8 }}>
              {organization.contact?.email && organization.contact?.celular && organization.social_networks?.yourSite && (
                <Space size={16} wrap>
                  <Typography><MailOutlined style={{ marginRight: '8px' }}/>{organization.contact.email}</Typography>
                  <Typography><PhoneOutlined style={{ marginRight: '8px' }}/>{organization.contact.celular}</Typography>
                  <Typography.Link
                    href={organization.social_networks.yourSite}
                    target='_blank'
                    rel='noopener noreferrer'>
                    <GlobalOutlined style={{ marginRight: '8px' }} />Sitio web
                  </Typography.Link>
                </Space>
              )}
            </Descriptions>
          </Result>
        </Card>
      </Col>
    </Row>
  );
};

export default ContactInfo;
