import { useHistory } from 'react-router';
import { Tooltip, Button, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export const columns = (editModalPosition, orgEventsData) => {
  const history = useHistory();
  return [
    {
      title: 'Cargo',
      dataIndex: 'position_name',
      width: 300,
      ellipsis: true,
      sorter: (a, b) => a.position_name.localeCompare(b.position_name),
    },
    {
      title: 'Cursos asignados',
      width: 800,
      ellipsis: true,
      render(position) {
        return (
          <>
            {orgEventsData &&
              orgEventsData
                .filter((orgEvent) => position.event_ids.includes(orgEvent._id))
                .map((event) => <Tag>{event.name}</Tag>)}
          </>
        );
      },
    },
    {
      title: 'Opción',
      dataIndex: 'index',
      fixed: 'right',
      width: 80,
      render(val, item, index) {
        return (
          <>
            <Tooltip title='Editar'>
              <Button
                id={`editAction${index}`}
                type='primary'
                size='small'
                onClick={(e) => {
                  editModalPosition(item);
                }}
                icon={<EditOutlined />}
              ></Button>
            </Tooltip>
          </>
        );
      },
    },
  ];
};
