import { Link, useHistory } from 'react-router-dom';
import { Tooltip, Typography, Row, Col, Button } from 'antd';
import { PlusCircleOutlined, SaveOutlined, LeftOutlined, DeleteOutlined } from '@ant-design/icons';
/* import ExportReport from "../components/networking/exportReport"; */
/* import ExportExcel from '../components/newComponent/ExportExcel'; */

const { Title } = Typography;

const Header = ( props ) => {
  const history = useHistory();
  const { 
    title, //titulo del encabezado
    titleTooltip, //tooltip para el encabezado
    addUrl, //link para ir a la vista de agregar
    addFn, //link para ir a la vista de agregar
    edit, //id del elemento a editar
    remove, //método para eliminar
    save, //boolean, para que aparezca el botón de guardar
    saveMethod, //viene el método para guardar
    back, //boolean, permite aparecer el icono para volver atrás
    form, //si viene, es para poder saber sí el botón de guardar colocarlo como "submit"
    extra, //código adicional de alguna acción fuera de la estructura en el header
    description,
  } = props;

  return (
    <>
      <Title level={4} >
        {
          back && (
            <Tooltip placement='bottomLeft' title={'Atrás'}>
              <LeftOutlined id='goBack' onClick={() => history.goBack()}/>
            </Tooltip>
          )
        }
        <Tooltip placement='bottomLeft' title={titleTooltip} >
          {title}
        </Tooltip>
      </Title>
      {
        description && (
          <small>{description}</small>
        )
      }

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
          {
            addFn && (
              <Button type="primary" icon={<PlusCircleOutlined />} size="middle" onClick={addFn}>
                {'Agregar'}
              </Button>
            )
          }
        </Col>
        <Col>
          {
            save && (
              <Button 
                onClick={saveMethod} 
                type={'primary'} 
                icon={<SaveOutlined /> }
                size="middle"
                htmlType={form ? 'submit' : 'button'}
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
                id='removeHeader'
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