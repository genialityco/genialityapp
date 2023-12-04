import { Button, Col, Modal, Row, Table, Tooltip } from 'antd';
import { Fragment } from 'react';
import { columnsConditionalFields } from '../utils/conditional-fields.colums';
import { useModalLogic } from '@/hooks/useModalLogic';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ConditionalFieldForm } from './ConditionalFieldForm';
import { UseEventContext } from '@/context/eventContext';
import { IConditionalField } from '../types/conditional-form.types';
import { useGetConditionalFields } from '../hooks/useGetConditionalFields';

export const ConditionalFields = () => {
  const { isOpenModal, closeModal, openModal, handledSelectedItem, selectedItem } = useModalLogic<IConditionalField>();
  const cEvent = UseEventContext();
  const eventId = cEvent.value._id;
  const { conditionalFieldsTable, isLoadingConditionalFields } = useGetConditionalFields({ eventId });
  const onOpenModal = (selectedItem?: any) => {
    handledSelectedItem(selectedItem);
    openModal();
  };
  const onCloseModal = () => {
    closeModal();
    handledSelectedItem(undefined);
  };
  const onDeleteConditionalField = (conditionalFieldId: string) => {};

  return (
    <Fragment>
      <Table
        loading={isLoadingConditionalFields}
        columns={[
          ...columnsConditionalFields,
          {
            title: 'Opciones',
            dataIndex: '',
            render: (key, item) => {
              return (
                <Row wrap gutter={[8, 8]}>
                  <Col>
                    <Tooltip placement='topLeft' title='Editar'>
                      <Button
                        key={``}
                        id={`edit`}
                        onClick={() => onOpenModal(item)}
                        icon={<EditOutlined />}
                        type='primary'
                        size='small'
                      />
                    </Tooltip>
                  </Col>
                  <Col>
                    <Tooltip placement='topLeft' title='Eliminar'>
                      <Button
                        key={``}
                        id={`delete`}
                        onClick={() => onDeleteConditionalField(item.fieldToValidate)}
                        icon={<DeleteOutlined />}
                        danger
                        size='small'
                      />
                    </Tooltip>
                  </Col>
                </Row>
              );
            },
          },
        ]}
        dataSource={conditionalFieldsTable}
        pagination={false}
        rowKey='index'
        size='small'
        title={() => (
          <Row justify='end' wrap gutter={[8, 8]}>
            <Col>
              <Button type='primary' icon={<PlusCircleOutlined />} size='middle' onClick={() => onOpenModal()}>
                {'Nuevo campo condicional'}
              </Button>
            </Col>
          </Row>
        )}
      />
      {isOpenModal && (
        <Modal
          destroyOnClose
          visible={isOpenModal}
          title={selectedItem ? 'Editar Dato' : 'Agregar Dato'}
          footer={false}
          onCancel={onCloseModal}>
          <ConditionalFieldForm selectedConditionalField={selectedItem} eventId={eventId} />
        </Modal>
      )}
    </Fragment>
  );
};
