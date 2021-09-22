import { Link, useHistory } from 'react-router-dom';
import { Tooltip, Typography, Row, Col, Button } from 'antd';
import { PlusCircleOutlined, SaveOutlined, LeftOutlined, DeleteOutlined, ExclamationOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Header = ( props ) => {
  const history = useHistory();
  const { title, titleTooltip, addUrl, edit, remove, save, saveMethod, back, pendingChanges, form, extra } = props;

  return (
    <>
      <Title level={4} >
        {
          back && (
            <Tooltip placement='bottomLeft' title={'Atrás'}>
              <LeftOutlined onClick={() => history.goBack()}/>
            </Tooltip>
          )
        }
        <Tooltip placement='bottomLeft' title={titleTooltip} >
          {title}
        </Tooltip>
      </Title>

      <Row wrap justify='end' gutter={[8, 8]}>
        <Col>
          {
            extra && (
              <div>
                {extra}
              </div>
            )
          }
        </Col>
        <Col>
          {
            addUrl && (
              <Link to={addUrl} >
                <Button type="primary" icon={<PlusCircleOutlined />} size="middle" >
                  {'Agregar'}
                </Button>
              </Link>
            )
          }
        </Col>
        <Col>
          {
            save && (
              <Button 
                onClick={saveMethod} 
                type={!pendingChanges ? 'primary' : 'ghost'} 
                icon={!pendingChanges ? <SaveOutlined /> : <ExclamationOutlined />}
                size="middle"
                htmlType={form ? 'submit' : 'button'}
                className={pendingChanges ? 'animate__animated animate__pulse animate__infinite' : ''}
              >
                {'Guardar'}
              </Button>
            )
          }
        </Col>
        <Col>
          {
            edit && (
              <Button 
                onClick={remove} 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              >
                {'Eliminar'}
              </Button>
            ) 
          }
        </Col>
      </Row>
    </>
  )
}

export default Header;