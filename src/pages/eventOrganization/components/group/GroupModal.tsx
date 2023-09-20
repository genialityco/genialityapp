import { useEffect, useRef } from 'react';
import { Button, Form, Input, Modal, ModalProps, Switch } from 'antd';
import { GroupEvent, GroupEventMongo } from '../../interface/group.interfaces';
import { DispatchMessageService } from '@/context/MessageService';

interface Props extends ModalProps {
  onCancel: () => void;
  selectedGroup?: GroupEventMongo;
  organizationId: string;
  handledUpdate: (groupId: string, newGroupData: GroupEvent) => Promise<void>;
  handledAddGroup: (newGrupo: GroupEvent) => Promise<void>;
}

export const GroupModal = ({
  onCancel,
  selectedGroup,
  organizationId,
  handledUpdate,
  handledAddGroup,
  ...modalProps
}: Props) => {
  const inputRef = useRef<any>();
  const [form] = Form.useForm<GroupEvent>();
  console.log('selectedGroup', selectedGroup);
  const onAddGroup = async (newGroupData: GroupEvent) => {
    try {
      await handledAddGroup({
        name: newGroupData.name,
        accest_to_all_organization: newGroupData.accest_to_all_organization,
      });
      DispatchMessageService({ action: 'show', type: 'success', msj: 'Se agrego el grupo correctamente' });
      onCancel();
    } catch (error) {
      DispatchMessageService({ action: 'show', type: 'info', msj: 'Ocurrio un error al agregar el grupo' });
    }
  };

  const onEditGroup = async (newGroupData: GroupEvent) => {
    try {
      await handledUpdate(selectedGroup?.item._id ?? '', newGroupData);
      onCancel();
      DispatchMessageService({ action: 'show', type: 'success', msj: 'Se edito el grupo correctamente' });
    } catch (error) {
      DispatchMessageService({ action: 'show', type: 'info', msj: 'No se pudo editar el grupo' });
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      form.setFieldsValue({
        accest_to_all_organization: selectedGroup.item.accest_to_all_organization,
        name: selectedGroup.item.name,
      });
    } else {
      form.setFieldsValue({
        accest_to_all_organization: false,
        name: '',
      });
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Modal {...modalProps} onCancel={onCancel} title={selectedGroup ? 'Editar grupo' : 'Agregar grupo'} footer={null}>
      <Form form={form} onFinish={selectedGroup ? onEditGroup : onAddGroup}>
        <Form.Item name={'name'}>
          <Input ref={inputRef} placeholder={'Ingrese el nombre del grupo'} maxLength={20} />
        </Form.Item>
        <Form.Item name={'accest_to_all_organization'}>
          <Switch />
        </Form.Item>
        <Button htmlType='submit'>{selectedGroup ? 'Editar' : 'Agregar'}</Button>
      </Form>
    </Modal>
  );
};
