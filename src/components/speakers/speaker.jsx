import React, { useEffect, useState } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import EviusReactQuill from '../shared/eviusReactQuill';
import { fieldsSelect, handleRequestError, sweetAlert, uploadImage, handleSelect } from '../../helpers/utils';
import { CategoriesAgendaApi, SpeakersApi } from '../../helpers/request';
import Creatable from 'react-select';
import { Button, Typography, Row, Col, Form, Input, Image, Empty, Card, Switch, Modal, message, Tooltip } from 'antd';
import { LeftOutlined, UserOutlined , SettingOutlined, DeleteOutlined, SaveOutlined, ExclamationCircleOutlined, PlusCircleOutlined, UpOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const formLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

function Speaker (props) {
  const {
    eventID,
    location: { state },
    history,
    matchUrl
  } = props;
  const newCategoryUrl = '/event/' + eventID; // Ruta creada para el boton de nueva categoria /event/[eventID]

const [data, setData] = useState(
  {
    name :'',
    description:'',
    description_activity :false,
    profession:'',
    published :true,
    image:'',
    order: 0,
    category_id:'',
    index:0,
    newItem: true
  }
)
const [showDescription_activity, setShowDescription_activity] = useState(false)
const [redirect, setRedirect] = useState(false)
const [errorImage, setErrorImage] = useState('')
const [categories, setCategories] = useState([])
const [selectedCategories, setSelectedCategories] = useState([])
const [isloadingSelect, setIsloadingSelect] = useState({ types: true, categories: true })

useEffect(() => {
  dataTheLoaded()
  
}, [])

async function dataTheLoaded() {
  let categoriesData = await CategoriesAgendaApi.byEvent(eventID);

  //Filtrado de categorias
  categoriesData = handleSelect(categoriesData);

  if (state.edit) {
    const info = await SpeakersApi.getOne(state.edit, eventID);

    info ? setData({...info, newItem: false}) : ''

    setShowDescription_activity(info?.description_activity)
    const field = fieldsSelect(info.category_id, categoriesData);

    setSelectedCategories(field)

    if(info.description === '<p><br></p>')
    {
      setDescription('')
    }
  }
  const isloadingSelectChanged = { types: '', categories: '' };

  setCategories(categoriesData)
  setIsloadingSelect(isloadingSelectChanged)
}

 function handleChange (e) {
   const { name } = e.target;
   const { value } = e.target;
   setData({
    ...data,
    [name] : value
  })
  };

  async function handleImage(files) {
    try {
      const file = files[0];
      if (file) {
        const imageData = await uploadImage(file);
        setData({
          ...data,
          image: imageData
        })
      } else {
        setErrorImage('Solo se permiten archivos de imágenes. Inténtalo de nuevo :)')
      }
    } catch (e) {
      sweetAlert.showError(handleRequestError(e));
    }
  };

  function chgTxt (content) {
    let description = content;
    if(description === '<p><br></p>'){
      description = '';
    }
    setData({
      ...data,
      description
    })
  };

  async function submit (values){
    const loading = message.open({
      key: 'loading',
      type: 'loading',
      content: <> Por favor espere miestras guarda la información..</>,
    });
    const { name, profession, description, image, order, published } = values;

    const body = {
      name,
      image,
      description_activity: showDescription_activity,
      description,
      profession,
      published,
      category_id: selectedCategories?.value,
      order: parseInt(order),
      index: parseInt(order)
    };
    try {
      if (state.edit) await SpeakersApi.editOne(body, state.edit, eventID);
      else await SpeakersApi.create(eventID, body);
      message.destroy(loading.key);
      message.open({
        type: 'success',
        content: <> Conferencista guardado correctamente!</>,
      });
      history.push(`/event/${eventID}/speakers`)
    } catch (e) {
      message.destroy(loading.key);
      message.open({
        type: 'error',
        content: handleRequestError(e).message,
      });
    }
  };

  function remove() {
    const loading = message.open({
      key: 'loading',
      type: 'loading',
      content: <> Por favor espere miestras borra la información..</>,
    });
    if (state.edit) {
      confirm({
        title: `¿Está seguro de eliminar al conferencista?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Una vez eliminado, no lo podrá recuperar',
        okText: 'Borrar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk() {
          const onHandlerRemoveSpeaker = async () => {
            try {
              await SpeakersApi.deleteOne(state.edit, eventID);
              setRedirect(true)
              message.destroy(loading.key);
              message.open({
                type: 'success',
                content: <> Se eliminó al conferencista correctamente!</>,
              });
            } catch (e) {
              message.destroy(loading.key);
              message.open({
                type: 'error',
                content: handleRequestError(e).message,
              });
            }
          }
          onHandlerRemoveSpeaker();
        }
      });
    } else setRedirect(true);
  };

  //FN para guardar en el estado la opcion seleccionada
  function selectCategory(selectedCategories) {
    setSelectedCategories(selectedCategories)
  };

  //FN para ir a una ruta específica (ruedas en los select)
  function goSection (path, state) {
    history.push(path, state);
  };

    if (!props.location.state || redirect) return <Redirect to={matchUrl} />;
    return (
      <Form
        onFinish={() => submit(data)}
        {...formLayout}
      >
        <Title level={4} >
          <Link to={matchUrl}><LeftOutlined /></Link> 
          {'Conferencistas'}
        </Title>

        <Row justify='end' gutter={8}>
          <Col>
            <Form.Item label={'Visible'} labelCol={{span: 13}}>
              <Switch 
                checkedChildren="Sí"
                unCheckedChildren="No" 
                name={'published'}
                checked={data.published}
                onChange={(checked) =>
                  setData({
                    ...data,
                    published: checked
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item >
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {'Guardar'}
              </Button>
            </Form.Item>
          </Col>
          <Col>
            {
              state.edit && (
                <Form.Item>
                  <Button onClick={remove} type="link" danger icon={<DeleteOutlined />}>
                    {'Eliminar'}
                  </Button>
                </Form.Item>
              ) 
            }
          </Col>
        </Row>

        <Row justify='center' wrap gutter={12}>
          <Col span={12}>
            <Form.Item label={'Nombre'} >
              <Input
                value={data.name}
                placeholder='Nombre del conferencista'
                name={'name'}
                onChange={(e) => handleChange(e)}
              />
            </Form.Item>
            
            <Form.Item label={'Ocupación'} >
              <Input
                value={data.profession}
                placeholder='Ocupación del conferencista'
                name={'profession'}
                onChange={(e) => handleChange(e)}
              />
            </Form.Item>
            <Form.Item label={'Carga de imagen'}>
              <Card style={{'textAlign': 'center'}}>
                <Form.Item noStyle>
                  <p>Dimensiones: 1080px x 1080px</p>
                  <Dropzone
                    style={{ fontSize: '21px', fontWeight: 'bold' }}
                    onDrop={handleImage}
                    accept='image/*'
                    className='zone'>
                    <Button type='dashed' danger>
                      {data.image ? 'Cambiar imagen' : 'Subir imagen'}
                    </Button>
                  </Dropzone>
                  <div style={{'marginTop': '10px'}}>
                    {
                      data.image ? (
                      <Image src={data.image} height={250} width={300} />
                      ) : (
                        <Empty 
                          image={<UserOutlined style={{'fontSize': '100px'}} />}
                          description="No hay Imagen"
                        />
                    )}
                  </div>
                </Form.Item>
              </Card>
            </Form.Item>
            
            <Form.Item label={'Descripción'} >
              <>
                {
                  !showDescription_activity ? (
                    <Button type="link" onClick={()=>setShowDescription_activity(true)} style={{'color': 'blue'}}>
                      { !showDescription_activity && !data.newItem ? (
                        <div> <EditOutlined style={{'marginRight': '5px'}} /> Editar/mostrar descripción </div>
                      ) : (
                        <div> <PlusCircleOutlined style={{'marginRight': '5px'}} /> Agregar/mostrar descripción </div>
                        
                      )}
                    </Button>
                  ) : (<Tooltip placement="top" text={'Si oculta la infomación da a entender que no desea mostrar el contenido de la misma'}>
                    <Button type="link" onClick={()=>setShowDescription_activity(false)} style={{'color': 'blue'}}>
                    <div><UpOutlined style={{'marginRight': '5px'}}/>
                      Ocultar descripción </div>
                    </Button>
                    </Tooltip>
                  )
                }
              </>
              {
                showDescription_activity && (
                  <EviusReactQuill 
                    name={'description'} 
                    data={data.description} 
                    handleChange={chgTxt}
                    style={{'marginTop': '5px'}}
                  />
                )
              }
            </Form.Item>
            
            <Form.Item label='Categoría'>
              <Row wrap gutter={16}>
                <Col span={22}>
                  <Creatable
                    isClearable
                    styles={catStyles}
                    onChange={selectCategory}
                    isDisabled={isloadingSelect.categories}
                    isLoading={isloadingSelect.categories}
                    options={categories}
                    placeholder={'Sin categoría....'}
                    value={selectedCategories}
                  />
                </Col>
                <Col span={2}>
                  <Form.Item>
                    <Button onClick={() => goSection(`${newCategoryUrl}/agenda/categorias`)} icon={<SettingOutlined />}>
                    </Button> 
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
            
          </Col>
        </Row>
      </Form>
    );
  
}

//Estilos para el tipo
const dot = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',
  ':before': {
    backgroundColor: color,
    content: '" "',
    display: 'block',
    margin: 8,
    height: 10,
    width: 10,
  },
});

const catStyles = {
  menu: (styles) => ({ ...styles, maxHeight: 'inherit' }),
  multiValue: (styles, { data }) => ({ ...styles, ...dot(data.item.color) }),
};

export default withRouter(Speaker);