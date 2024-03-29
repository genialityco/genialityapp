import { useEffect, useRef } from 'react';
import { Button, Form, Input, Modal, ModalProps, Switch, Transfer } from 'antd';
import { GroupEvent, GroupEventMongo } from '../../interface/group.interfaces';
import { DispatchMessageService } from '@/context/MessageService';
import { useTransfer } from '@/hooks/useTransfer';
import { useGetEventsByOrgOnlyName } from '@/components/eventOrganization/hooks/useGetEventsByOrgOnlyName';
import { useGetOrganizationUsersOnlyName } from '../../hooks/useGetOrganizationUsersOnlyName';

interface Props extends ModalProps {
  onCancel: () => void;
  selectedGroup?: GroupEventMongo;
  organizationId: string;
  handledUpdate: (groupId: string, newGroupData: Partial<GroupEvent>) => Promise<void>;
  handledAddGroup: (newGrupo: GroupEvent) => Promise<void>;
  handledDelteEvent: (orgId: string, groupId: string, orgUserId: string) => Promise<void>;
  handledDelteOrgUser: (orgId: string, groupId: string, orgUserId: string) => Promise<void>;
}

export const GroupModal = ({
  onCancel,
  selectedGroup,
  organizationId,
  handledUpdate,
  handledAddGroup,
  handledDelteEvent,
  handledDelteOrgUser,
  ...modalProps
}: Props) => {
  const inputRef = useRef<any>();
  const [form] = Form.useForm<GroupEvent>();
  const { eventsByOrg, isLoadingEventsByOrg } = useGetEventsByOrgOnlyName(organizationId);
  const { organizationUsers, isLoadingOrgUsers } = useGetOrganizationUsersOnlyName(organizationId);
  const {
    onChange: onChangeTransferEvents,
    onSelectChange: onSelectChangeEvents,
    selectedKeys: selectedKeysEvents,
    targetKeys: targetKeysEvents,
    setTargetKeys: setTargetKeysEvents,
    filterOption: filterOptionEvents,
  } = useTransfer([]);

  const {
    onChange: onChangeTransferOrgUser,
    onSelectChange: onSelectChangeOrgUser,
    selectedKeys: selectedKeysOrgUser,
    targetKeys: targetKeysOrgUser,
    setTargetKeys: setTargetKeysOrgUser,
    filterOption: filterOptionOrgUser,
  } = useTransfer([]);

  const onAddGroup = async (newGroupData: GroupEvent) => {
    try {
      await handledAddGroup({
        name: newGroupData.name,
        free_access_organization: newGroupData.free_access_organization,
        event_ids: newGroupData.event_ids,
        organization_user_ids: newGroupData.organization_user_ids,
      });

      DispatchMessageService({
        action: 'show',
        type: 'success',
        msj: 'Se agrego el grupo correctamente',
      });
      onCancel();
    } catch (error) {
      DispatchMessageService({
        action: 'show',
        type: 'info',
        msj: 'Ocurrio un error al agregar el grupo',
      });
    }
  };

  const onEditGroup = async (newGroupData: GroupEvent) => {
    try {
      await handledUpdate(selectedGroup?.item._id ?? '', newGroupData);
      onCancel();
      DispatchMessageService({
        action: 'show',
        type: 'success',
        msj: 'Se edito el grupo correctamente',
      });
    } catch (error) {
      DispatchMessageService({ action: 'show', type: 'info', msj: 'No se pudo editar el grupo' });
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      form.setFieldsValue({
        free_access_organization: selectedGroup.item.free_access_organization,
        name: selectedGroup.item.name,
        event_ids: selectedGroup.item.event_ids,
        organization_user_ids: selectedGroup.item.organization_user_ids,
      });
      setTargetKeysEvents(selectedGroup.item.event_ids);
      setTargetKeysOrgUser(selectedGroup.item.organization_user_ids);
    } else {
      form.setFieldsValue({
        free_access_organization: false,
        name: '',
        event_ids: [],
        organization_user_ids: [],
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
      <Form form={form} onFinish={selectedGroup ? onEditGroup : onAddGroup} layout='vertical'>
        <Form.Item
          name={'name'}
          label={<label>Nombre</label>}
          rules={[{ required: true, message: 'El nombre es requerido' }]}>
          <Input ref={inputRef} placeholder={'Ingrese el nombre del grupo'} maxLength={20} />
        </Form.Item>
        {!selectedGroup && (
          <Form.Item label={'Eventos'} name={'event_ids'}>
            <Transfer
              pagination
              disabled={isLoadingEventsByOrg}
              listStyle={{ width: '100%', height: '250px' }}
              oneWay={true}
              showSearch
              filterOption={filterOptionEvents}
              dataSource={eventsByOrg.map((event) => ({ ...event, title: event.name, key: event._id }))}
              titles={['Eventos', 'En el grupo']}
              targetKeys={targetKeysEvents}
              selectedKeys={selectedKeysEvents}
              onChange={onChangeTransferEvents}
              onSelectChange={onSelectChangeEvents}
              render={(item) => item.title}
              showSelectAll={false}
            />
          </Form.Item>
        )}
        {!selectedGroup && (
          <Form.Item label={'Usuarios'} name={'organization_user_ids'}>
            <Transfer
              pagination
              disabled={isLoadingOrgUsers}
              listStyle={{ width: '100%', height: '250px' }}
              oneWay={true}
              filterOption={filterOptionOrgUser}
              showSearch
              dataSource={organizationUsers.map((orgUser) => ({
                ...orgUser,
                name: orgUser.properties.names,
                key: orgUser._id,
              }))}
              titles={['Usuarios', 'En el grupo']}
              targetKeys={targetKeysOrgUser}
              selectedKeys={selectedKeysOrgUser}
              onChange={onChangeTransferOrgUser}
              onSelectChange={onSelectChangeOrgUser}
              render={(item) => item.name}
              showSelectAll={false}
            />
          </Form.Item>
        )}

        <Form.Item
          valuePropName='checked'
          name={'free_access_organization'}
          label={<label>Acceso libre para los miembros de la organización</label>}>
          <Switch />
        </Form.Item>
        <Button htmlType='submit'>{selectedGroup ? 'Guardar' : 'Agregar'}</Button>
      </Form>
    </Modal>
  );
};
