import { Component, Fragment, useState } from 'react';
import { Actions, EventFieldsApi, OrganizationApi, OrganizationPlantillaApi } from '../../../helpers/request';
/* import { toast } from 'react-toastify'; */
import { FormattedMessage, useIntl } from 'react-intl';
import DatosModal from './modal';
import { Tabs, Table, Checkbox, Button, Select, Row, Col, Tooltip, Modal } from 'antd';
import RelationField from './relationshipFields';
import {
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  SaveOutlined,
  PlusCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import CMS from '../../newComponent/CMS';
import { firestore } from '../../../helpers/firebase';
import ModalCreateTemplate from '../../shared/modalCreateTemplate';
import Header from '../../../antdComponents/Header';
import { GetTokenUserFirebase } from '../../../helpers/HelperAuth';
import { DispatchMessageService } from '../../../context/MessageService';
import { createFieldForAssembly, createFieldForCheckInPerDocument } from './utils';
import { useHelper } from '@/context/helperContext/hooks/useHelper';

const DragHandle = sortableHandle(() => <DragOutlined style={{ cursor: 'grab', color: '#999' }} />);
const SortableItem = sortableElement((props) => <tr {...props} />);
const SortableContainer = sortableContainer((props) => <tbody {...props} />);
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;
class Datos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: {},
      newField: false,
      loading: true,
      deleteModal: false,
      edit: false,
      fields: [],
      properties: null,
      value: '',
      visibleModal: false,
      isEditTemplate: { status: false, datafields: [], template: null },
      checkInByAssembly: false,
      checkInByAssemblyFields: [],
    };
    this.eventId = this.props.eventId;
    this.html = document.querySelector('html');
    this.submitOrder = this.submitOrder.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.handlevisibleModal = this.handlevisibleModal.bind(this);
    this.organization = this.props?.sendprops ? this.props?.sendprops?.org : this.props?.org;
  }

  async componentDidMount() {
    await this.fetchFields();
  }
  updateTable(fields) {
    let fieldsorder = this.orderFieldsByWeight(fields);
    fieldsorder = this.updateIndex(fieldsorder);
    this.setState({ isEditTemplate: { ...this.state.isEditTemplate, datafields: fieldsorder } });
    //alert('EDITTEMPLATE==>', this.props.edittemplate);
  }

  orderFieldsByWeight = (extraFields) => {
    extraFields = extraFields.sort((a, b) =>
      (a.order_weight && !b.order_weight) || (a.order_weight && b.order_weight && a.order_weight < b.order_weight)
        ? -1
        : 1
    );
    return extraFields;
  };
  // Funcion para traer la información
  fetchFields = async () => {
    try {
      const organizationId = this?.organization?._id;
      let fields = [];
      let fieldsReplace = [];
      let checkInFieldsIds = [];
      const checkInByAssemblyFields = []
      if (
        (organizationId && !this.props.eventId && this.props.edittemplate) ||
        (organizationId && !this.props.eventId && !this.props.edittemplate)
      ) {
        fields = await this.props.getFields();
        //Realizado con la finalidad de no mostrar la contraseña ni el avatar
        //Comentado la parte de password y contrasena para dejar habilitado solo en el administrador
        fields.map((field) => {
          if (/* field.name !== 'password' && field.name !== 'contrasena' &&  */ field.name !== 'avatar') {
            fieldsReplace.push(field);
          }
        });
        fields = this.orderFieldsByWeight(fieldsReplace);
        fields = this.updateIndex(fieldsReplace);
      } else if (!this.props.edittemplate) {
        this.setState({ checkInExists: false, checkInFieldsIds: [] });
        this.setState({ checkInByAssembly: false, checkInByAssemblyFields: [] });
        fields = await EventFieldsApi.getAll(this.props.eventId);
        //Realizado con la finalidad de no mostrar la contraseña ni el avatar
        //Comentado la parte de password y contrasena para dejar habilitado solo en el administrador
        fields.map((field) => {
          if (/* field.name !== 'password' && field.name !== 'contrasena' &&  */ field.name !== 'avatar') {
            fieldsReplace.push(field);
          }
          if (
            field.type === 'checkInField' ||
            field.name === 'birthdate' ||
            field.name === 'bloodtype' ||
            field.name === 'gender'
          ) {
            checkInFieldsIds.push(field._id);
            this.setState({ checkInExists: true, checkInFieldsIds: checkInFieldsIds });
          }
          if (field.type === 'voteWeight') {
            checkInByAssemblyFields.push(field._id)
            this.setState({
              checkInByAssembly: true,
              checkInByAssemblyFields,
            })
          }
        });
        fields = this.orderFieldsByWeight(fieldsReplace);
        fields = this.updateIndex(fieldsReplace);
      }
      //console.log('FIELDS==>', fields);
      this.setState({ fields, loading: false });
    } catch (e) {
      this.showError(e, 'ERROR');
    }
  };
  //Permite asignarle un index a los elementos
  updateIndex = (fields) => {
    for (var i = 0; i < fields.length; i++) {
      fields[i].index = i;
      fields[i].order_weight = i + 1;
    }
    return fields;
  };

  //Agregar nuevo campo
  addField = () => {
    this.setState({ edit: false, modal: true });
  };
  //Guardar campo en el evento
  saveField = async (field) => {
    /* console.log('FIELD==>', field); */
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere mientras se guarda la información...',
      action: 'show',
    });
    try {
      let totaluser = {};
      const organizationId = this?.organization?._id;
      if (organizationId) {
        if (this.state.edit)
          await this.props.editField(field._id || field.id, field, this.state.isEditTemplate, this.updateTable);
        else await this.props.createNewField(field, this.state.isEditTemplate, this.updateTable);
      } else {
        if (this.state.edit) await EventFieldsApi.editOne(field, field._id || field.id, this.eventId);
        else await EventFieldsApi.createOne(field, this.eventId);
        totaluser = await firestore.collection(`${this.eventId}_event_attendees`).get();
      }
      if (totaluser?.docs?.length > 0 && field?.name == 'pesovoto') {
        firestore
          .collection(`${this.eventId}_event_attendees`)
          .get()
          .then((resp) => {
            if (resp.docs.length > 0) {
              resp.docs.map((doc) => {
                var datos = doc.data();
                var objectP = datos.properties;
                var properties = objectP;
                objectP = { ...objectP, pesovoto: properties && properties.pesovoto ? properties.pesovoto : 1 };
                datos.properties = objectP;
                firestore
                  .collection(`${this.eventId}_event_attendees`)
                  .doc(doc.id)
                  .set(datos);
              });
            }
          });
      }
      await this.fetchFields();
      this.setState({ modal: false, edit: false, newField: false });
      DispatchMessageService({
        key: 'loading',
        action: 'destroy',
      });
      DispatchMessageService({
        type: 'success',
        msj: 'Información guardada correctamente!',
        action: 'show',
      });
    } catch (e) {
      this.showError(e.response.data.message || e.response.status);
      DispatchMessageService({
        key: 'loading',
        action: 'destroy',
      });
      DispatchMessageService({
        type: 'error',
        msj: e.response.data.message || e.response.status,
        action: 'show',
      });
    }
  };

  //Funcion para guardar el orden de los datos
  async submitOrder() {
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere mientras se guarda la información...',
      action: 'show',
    });
    const organizationId = this?.organization?._id;
    try {
      if (organizationId && !this.eventId) {
        await this.props.orderFields(this.state.properties);
      } else if (this.eventId && !organizationId) {
        // && this.props.byEvent condición que no esta llegando
        let token = await GetTokenUserFirebase();
        await Actions.put(`api/events/${this.props.eventId}?token=${token}`, this.state.properties);
      } else {
        await this.props.orderFields(this.state.isEditTemplate.datafields, this.state.isEditTemplate, this.updateTable);
      }
      DispatchMessageService({
        key: 'loading',
        action: 'destroy',
      });
      DispatchMessageService({
        type: 'success',
        msj: 'El orden de la recopilación de datos se ha guardado',
        action: 'show',
      });
    } catch (e) {
      DispatchMessageService({
        key: 'loading',
        action: 'destroy',
      });
      DispatchMessageService({
        type: 'error',
        msj: e,
        action: 'show',
      });
    }
    this.fetchFields();
  }

  //Abrir modal para editar dato
  editField = (info) => {
    this.setState({ info, modal: true, edit: true });
  };

  /* onHandlerRemove = async (loading, item) => {
    try {
      const organizationId = this.organization?._id;
      if (organizationId) {
        await this.props.deleteField(item, this.state.isEditTemplate, this.updateTable);
      } else {
        await EventFieldsApi.deleteOne(item, this.eventId);
      }
      DispatchMessageService({
        key: 'loading',
        action: 'destroy',
      });
      DispatchMessageService({
        type: 'success',
        msj: 'Se eliminó la información correctamente!',
        action: 'show',
      });
      await this.fetchFields();
    } catch (e) {
      DispatchMessageService({
        key: 'loading',
        action: 'destroy',
      });
      DispatchMessageService({
        type: 'error',
        msj: `No ha sido posible eliminar el campo error: ${e?.response?.data?.message || e.response?.status}`,
        action: 'show',
      });
    }
  }; */

  closeModal2 = () => {
    this.setState({ info: {}, modal: false, edit: false });
  };
  //Borrar dato de la lista
  removeField = async (item, checkInFieldsDelete) => {
    let self = this;

    const onHandlerRemove = async () => {
      try {
        const organizationId = self.organization?._id;
        if (organizationId) {
          await self.props.deleteField(item, self.state.isEditTemplate, self.updateTable);
        } else {
          await EventFieldsApi.deleteOne(item, self.eventId);
        }
        DispatchMessageService({
          key: 'loading',
          action: 'destroy',
        });
        DispatchMessageService({
          type: 'success',
          msj: 'Se eliminó la información correctamente!',
          action: 'show',
        });
        await self.fetchFields();
      } catch (e) {
        DispatchMessageService({
          key: 'loading',
          action: 'destroy',
        });
        DispatchMessageService({
          type: 'error',
          msj: `No ha sido posible eliminar el campo error: ${e?.response?.data?.message || e.response?.status}`,
          action: 'show',
        });
      }
    };

    if (checkInFieldsDelete) {
      onHandlerRemove();
      return;
    }

    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere mientras se borra la información...',
      action: 'show',
    });
    confirm({
      title: `¿Está seguro de eliminar la información?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Una vez eliminado, no lo podrá recuperar',
      okText: 'Borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        //self.onHandlerRemove(loading, item);
        onHandlerRemove();
      },
    });
    /* try {
      const organizationId = this?.organization?._id;
      if (organizationId) {
        await this.props.deleteField(this.state.deleteModal, this.state.isEditTemplate, this.updateTable);
        this.setState({ message: { ...this.state.message, class: 'msg_success', content: 'FIELD DELETED' } });
      } else {
        await EventFieldsApi.deleteOne(this.state.deleteModal, this.eventId);
        this.setState({ message: { ...this.state.message, class: 'msg_success', content: 'FIELD DELETED' } });
      }
      await this.fetchFields();
      setTimeout(() => {
        this.setState({ message: {}, deleteModal: false });
      }, 800);
    } catch (e) {
      this.showError(e);
    } */
  };

  closeDelete = () => {
    this.setState({ deleteModal: false });
  };

  closeModal = () => {
    this.setState({ inputValue: '', modal: false, info: {}, edit: false });
  };

  showError = (error) => {
    DispatchMessageService({
      type: 'success',
      msj: this.props.intl.formatMessage({ id: 'toast.error', defaultMessage: 'Sry :(' }),
      action: 'show',
    });
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) this.setState({ timeout: true, loader: false });
      else this.setState({ serverError: true, loader: false, errorData: data });
    } else {
      let errorData = error.message;
      if (error.request) {
        errorData = error.request;
      }
      errorData.status = 708;
      this.setState({ serverError: true, loader: false, errorData });
    }
  };
  //Funcion para cambiar el valor de los checkboxes
  async changeCheckBox(field, key, key2 = null) {
    DispatchMessageService({
      type: 'loading',
      key: 'loading',
      msj: ' Por favor espere mientras se guarda la información...',
      action: 'show',
    });
    try {
      this.setState({ edit: true }, () => {
        field[key] = !field[key];
        if (key2 != null) {
          field[key2] = field[key2] == true ? false : field[key2];
        }

        this.saveField(field).then((resp) => {
          DispatchMessageService({
            key: 'loading',
            action: 'destroy',
          });
          DispatchMessageService({
            type: 'success',
            msj: 'Se ha editado correctamente el campo!',
            action: 'show',
          });
        });
      });
    } catch (e) {
      DispatchMessageService({
        key: 'loading',
        action: 'destroy',
      });
      DispatchMessageService({
        type: 'error',
        msj: 'El Campo no ha sido posible actualizarlo, intenta mas tarde',
        action: 'show',
      });
    }
  }
  //Contenedor draggable
  DraggableContainer = (props) => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass='row-dragging'
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );
  //Función para hacer que el row sea draggable
  DraggableBodyRow = ({ className, style, ...restProps }) => {
    const fields =
      this.state.fields.length > 0
        ? this.state.fields
        : this.state.isEditTemplate?.datafields.length > 0
        ? this.state.isEditTemplate?.datafields
        : [];
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = fields.findIndex((x) => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  //Función que se ejecuta cuando se termina de hacer drag
  onSortEnd = ({ oldIndex, newIndex }) => {
    let user_properties = this.state.user_properties;
    /* console.log('FIELDSSTATE==>', this.state.fields); */
    const fields =
      this.state.fields.length > 0
        ? this.state.fields
        : this.state.isEditTemplate?.datafields?.length > 0
        ? this.state.isEditTemplate?.datafields
        : [];

    if (oldIndex !== newIndex) {
      let newData = arrayMove([].concat(fields), oldIndex, newIndex).filter((el) => !!el);
      newData = this.updateIndex(newData);
      user_properties = newData;
      this.setState({
        fields: newData,
        user_properties,
        isEditTemplate: { ...this.state.isEditTemplate, datafields: newData },
        available: false,
        properties: { user_properties: user_properties },
      });
    }
  };

  onChange1 = async (e, plantId) => {
    /* console.log('e, radio checked', plantId); */
    this.setState({ value: '' });
    await OrganizationPlantillaApi.putOne(this.props.eventId, plantId);
  };

  handlevisibleModal = () => {
    this.setState({ visibleModal: !this.state.visibleModal });
  };

  render() {
    const { fields, modal, edit, info, value, checkInExists, checkInFieldsIds, checkInByAssembly, checkInByAssemblyFields } = this.state;
    const columns = [
      {
        title: '',
        dataIndex: 'sort',
        width: 30,
        className: 'drag-visible',
        render: () => <DragHandle />,
      },
      {
        title: 'Dato',
        dataIndex: 'label',
        width: 180,
        ellipsis: true,
        sorter: (a, b) => a.label.localeCompare(b.label),
        /* render (val, item) {
          return (
            <>
              {
                item.name !== 'contraseña' || item.name !== 'password' || item.name !== 'avatar' && (
                  <>{item.name}</>
                )
              }
            </>
          )
        } */
      },
      {
        title: 'Tipo de dato',
        dataIndex: 'type',
        ellipsis: true,
        width: 120,
        sorter: (a, b) => a.type.localeCompare(b.type),
      },
      {
        title: 'Obligatorio',
        dataIndex: 'mandatory',
        align: 'center',
        render: (record, key) =>
          key.name !== 'email' && key.name !== 'names' ? (
            <Checkbox
              name='mandatory'
              onChange={() => this.changeCheckBox(key, 'mandatory')}
              checked={record}
              disabled={key.type === 'checkInField'}
            />
          ) : (
            <Checkbox checked />
          ),
      },
      {
        title: 'Visible solo contactos',
        dataIndex: 'visibleByContacts',
        align: 'center',
        render: (record, key) => (
          <Checkbox
            name='visibleByContacts'
            onChange={() => this.changeCheckBox(key, 'visibleByContacts', 'visibleByAdmin')}
            checked={record}
            disabled={
              key.type === 'checkInField' ||
              key.name === 'birthdate' ||
              key.name === 'bloodtype' ||
              key.name === 'gender'
            }
          />
        ),
      },
      {
        title: 'Sensible (Networking)',
        dataIndex: 'sensibility',
        align: 'center',
        render: (record, key) => (
          <Checkbox
            name='sensibility'
            onChange={() => this.changeCheckBox(key, 'sensibility')}
            checked={record}
            disabled={
              key.type === 'checkInField' ||
              key.name === 'birthdate' ||
              key.name === 'bloodtype' ||
              key.name === 'gender'
            }
          />
        ),
      },
      {
        title: 'Visible solo admin',
        dataIndex: 'visibleByAdmin',
        align: 'center',
        render: (record, key) =>
          key.name !== 'email' && key.name !== 'names' ? (
            <Checkbox
              name='visibleByAdmin'
              onChange={() => this.changeCheckBox(key, 'visibleByAdmin', 'visibleByContacts')}
              checked={record}
              /* disabled={key.name === 'contrasena' || key.type === 'password'} */
            />
          ) : (
            <Checkbox checked />
          ),
      },
      {
        title: 'Opciones',
        dataIndex: '',
        render: (key) => {
          const { eventIsActive } = useHelper();

          return (
            <Row wrap gutter={[8, 8]}>
              <Col>
                {key.name !== 'email' /* && key.name !== 'contrasena' */ && (
                  <Tooltip placement='topLeft' title='Editar'>
                    <Button
                      key={`editAction${key.index}`}
                      id={`editAction${key.index}`}
                      onClick={() => this.editField(key)}
                      icon={<EditOutlined />}
                      type='primary'
                      size='small'
                      disabled={!eventIsActive && window.location.toString().includes('eventadmin')}
                    />
                  </Tooltip>
                )}
              </Col>
              <Col>
                {key.name !== 'email' && key.name !== 'names' /* && key.name !== 'contrasena' */ && (
                  <Tooltip placement='topLeft' title='Eliminar'>
                    <Button
                      key={`removeAction${key.index}`}
                      id={`removeAction${key.index}`}
                      onClick={() => this.removeField(key._id || key.name)}
                      icon={<DeleteOutlined />}
                      type='danger'
                      size='small'
                      disabled={!eventIsActive && window.location.toString().includes('eventadmin')}
                    />
                  </Tooltip>
                )}
              </Col>
              {/* {key.name !== 'email' && key.name !== 'contrasena' && (
                <EditOutlined style={{ float: 'left' }} onClick={() => this.editField(key)} />
              )}
            </Col>
            <Col>
              {key.name !== 'email' &&
                key.name !== 'names' &&
                key.type !== 'checkInField' &&
                key.name !== 'birthdate' &&
                key.name !== 'bloodtype' &&
                key.name !== 'gender' && (
                  <Tooltip placement='topLeft' title='Eliminar'>
                    <Button
                      key={`removeAction${key.index}`}
                      id={`removeAction${key.index}`}
                      onClick={() => this.removeField(key._id || key.name)}
                      icon={<DeleteOutlined />}
                      type='danger'
                      size='small'
                    />
                  </Tooltip>
                )}
            </Col>
            {/* {key.name !== 'email' && key.name !== 'contrasena' && (
              <EditOutlined style={{ float: 'left' }} onClick={() => this.editField(key)} />
            )}
            {key.name !== 'email' && key.name !== 'names' && key.name !== 'contrasena' && (
              <DeleteOutlined
                style={{ float: 'right' }}
                onClick={() => this.setState({ deleteModal: key._id || key.name })}
              />
            )} */}
            </Row>
          );
        },
      },
    ];

    const colsPlant = [
      /*  {
        title: 'Plantilla',
        dataIndex: '',
        width: '50px',
        render: (record, key) => <Radio onClick={(e) => this.onChange1(e, record._id)} value={value} />,
      },*/
      {
        title: 'Nombre',
        dataIndex: 'name',
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
    ];

    return (
      <div>
        <Tabs defaultActiveKey='1'>
          {this.state.visibleModal && (
            <ModalCreateTemplate
              visible={this.state.visibleModal}
              handlevisibleModal={this.handlevisibleModal}
              organizationid={this.props.eventId}
            />
          )}

          {this.props.type !== 'organization' && (
            <TabPane tab='Configuración General' key='1'>
              <Fragment>
                <Header title={'Recopilación de datos'} />
                <small>
                  {`Configure los datos que desea recolectar de los asistentes ${
                    this.organization ? 'de la organización' : 'del evento'
                  }`}
                </small>

                <Table
                  columns={columns}
                  dataSource={fields}
                  pagination={false}
                  rowKey='index'
                  size='small'
                  components={{
                    body: {
                      wrapper: this.DraggableContainer,
                      row: this.DraggableBodyRow,
                    },
                  }}
                  title={() => (
                    <Row justify='end' wrap gutter={[8, 8]}>
                      <Col>
                        <Checkbox
                          name='checkInByAssembly'
                          onChange={(value) =>
                            createFieldForAssembly({
                              value,
                              checkInByAssemblyFields,
                              save: this.saveField,
                              remove: this.removeField,
                            })
                          }
                          checked={checkInByAssembly}
                          >
                          CheckIn por asamblea
                        </Checkbox>
                      </Col>
                      <Col>
                        <Checkbox
                          name='checkInByDocument'
                          onChange={(value) =>
                            createFieldForCheckInPerDocument({
                              value,
                              checkInFieldsIds,
                              save: this.saveField,
                              remove: this.removeField,
                            })
                          }
                          checked={checkInExists}>
                          CheckIn por documento
                        </Checkbox>
                      </Col>
                      <Col>
                        <Button
                          disabled={this.state.available}
                          onClick={this.submitOrder}
                          type='primary'
                          icon={<SaveOutlined />}>
                          {'Guardar orden'}
                        </Button>
                      </Col>
                      <Col>
                        <Button type='primary' icon={<PlusCircleOutlined />} size='middle' onClick={this.addField}>
                          {'Agregar'}
                        </Button>
                      </Col>
                    </Row>
                  )}
                />
                {modal && (
                  <Modal
                    visible={modal}
                    title={edit ? 'Editar Dato' : 'Agregar Dato'}
                    footer={false}
                    onCancel={this.closeModal2}
                    okText={'Guardar'}>
                    <DatosModal cancel={this.closeModal2} edit={edit} info={info} action={this.saveField} />
                  </Modal>
                )}
              </Fragment>
            </TabPane>
          )}

          {/* {this.props.eventId && this.props.type != 'organization' && (
            <TabPane tab='Campos Relacionados' key='2'>
              <RelationField eventId={this.props.eventId} fields={fields} />
            </TabPane>
          )} */}

          {this.props.type == 'organization' && (
            <TabPane tab={this.props.type === 'configMembers' ? 'Configuración Miembros' : 'Plantillas'} key='3'>
              {this.state.isEditTemplate.status || this.props.type === 'configMembers' ? (
                <Fragment>
                  <Header
                    title={
                      <div>
                        Recopilación de datos de plantillas
                        {this.props.type !== 'configMembers' && (
                          <Button
                            type='link'
                            style={{ color: 'blue' }}
                            onClick={() =>
                              this.setState({
                                isEditTemplate: { ...this.state.isEditTemplate, status: false, datafields: [] },
                              })
                            }>
                            Volver a plantillas
                          </Button>
                        )}
                      </div>
                    }
                  />
                  <small>
                    {`Configure los datos que desea recolectar de los asistentes ${
                      this.organization ? 'de la organización' : 'del evento'
                    }`}
                  </small>

                  <Table
                    columns={columns}
                    dataSource={this.props.type === 'configMembers' ? fields : this.state.isEditTemplate.datafields}
                    pagination={false}
                    rowKey='index'
                    size='small'
                    components={{
                      body: {
                        wrapper: this.DraggableContainer,
                        row: this.DraggableBodyRow,
                      },
                    }}
                    title={() => (
                      <Row justify='end' wrap gutter={[8, 8]}>
                        <Col>
                          <Button
                            disabled={this.state.available}
                            onClick={this.submitOrder}
                            type='primary'
                            icon={<SaveOutlined />}>
                            {'Guardar orden'}
                          </Button>
                        </Col>
                        <Col>
                          <Button type='primary' icon={<PlusCircleOutlined />} size='middle' onClick={this.addField}>
                            {'Agregar'}
                          </Button>
                        </Col>
                      </Row>
                    )}
                  />
                  {modal && (
                    <Modal
                      visible={modal}
                      title={edit ? 'Editar Dato' : 'Agregar Dato'}
                      footer={false}
                      onCancel={this.closeModal2}
                      cancelText={'Cancelar'}>
                      <DatosModal cancel={this.closeModal2} edit={edit} info={info} action={this.saveField} />
                    </Modal>
                  )}
                </Fragment>
              ) : (
                <CMS
                  API={OrganizationPlantillaApi}
                  eventId={this.props.event?.organizer_id ? this.props.event?.organizer_id : this.props.eventId}
                  title={'Plantillas de recoleccion de datos'}
                  addFn={() => this.setState({ visibleModal: true })}
                  columns={colsPlant}
                  editFn={(values) => {
                    let fields = this.orderFieldsByWeight(values.user_properties);
                    fields = this.updateIndex(fields);
                    this.setState({
                      isEditTemplate: {
                        ...this.state.isEditTemplate,
                        status: true,
                        datafields: fields,
                        template: values,
                      },
                    });
                  }}
                  pagination={false}
                  actions
                />
              )}
            </TabPane>
          )}
        </Tabs>
      </div>
    );
  }
}

export default Datos;
