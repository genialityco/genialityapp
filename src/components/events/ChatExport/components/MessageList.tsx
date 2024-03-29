import { Button, Image, Space, Table, Tag, Tooltip } from 'antd';
import React, { ReactNode } from 'react';
import useListeningMessage from '../hooks/useListeningMessage';
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { approveMessages, deleteMessages } from '@/components/games/bingo/services';
import { DispatchMessageService } from '@/context/MessageService';

interface IMessageListProps {
  eventId: string;
}

interface DataType {
  name: string;
  text: string;
  type: string;
  hora: string;
  key: string;
  action?: React.ReactNode;
}

const renderMensaje = (text: string, record: any) => {
  if (record.type === 'image') return <Image src={record.text} height={100} width={100} />;
  return (
    <Tooltip title={record.text} placement='topLeft'>
      <Tag color='#3895FA'>{record.text}</Tag>
    </Tooltip>
  );
};

const columns = [
  {
    title: 'Usuario',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },

  {
    title: 'Mensaje',
    key: 'text',
    dataIndex: 'text',
    ellipsis: true,
    render: renderMensaje,
  },
  {
    title: 'Fecha',
    dataIndex: 'hora',
    key: 'hora',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Acciones',
    key: 'action',
    dataIndex: 'action',
  },
];

const MessageList = ({ eventId }: IMessageListProps) => {
  const { messages, isLoading } = useListeningMessage(eventId);
  const onDeleteMessage = async (messageEventId: string) => {
    const epa = await deleteMessages(eventId, messageEventId);
    if (epa) return DispatchMessageService({ type: 'success', action: 'show', msj: 'Se elimino el mensaje con exito' });
    DispatchMessageService({ type: 'info', action: 'show', msj: 'No se pudo eliminar el mensaje con exito' });
  };

  const onApproveMessage = async (messageEventId: string) => {
    const epa = await approveMessages(eventId, messageEventId);
    if (epa) return DispatchMessageService({ type: 'success', action: 'show', msj: 'Se aprobo el mensaje con exito' });
    DispatchMessageService({ type: 'info', action: 'show', msj: 'No se pudo aprobar el mensaje' });
  };

  return (
    <>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={messages.map((message, index) => {
          const newRow: DataType = {
            name: message.name,
            text: message.text,
            type: message.type,
            hora: message.timestamp,
            key: message.id,
          };
          if (index === 0) {
            newRow.action = (
              <Space size='middle'>
                <Button onClick={() => onApproveMessage(message.id)} type='primary' icon={<CheckCircleOutlined />}>
                  Aprobar
                </Button>
                <Button onClick={() => onDeleteMessage(message.id)} icon={<DeleteOutlined />}>
                  Desaprobar
                </Button>
              </Space>
            );
          }
          return newRow;
        })}
      />
    </>
  );
};

export default MessageList;
