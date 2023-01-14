import { useHistory } from 'react-router';
import { Tooltip, Button, Row, Col, Popover, Image, Avatar, Empty } from 'antd';
import { ClockCircleOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { membersGetColumnSearchProps } from '../searchFunctions/membersGetColumnSearchProps';

export const columns = (columnsData, editModalUser, extraFields) => {
  const history = useHistory();
  let columns = [];

  if (!extraFields) return [];

  const dynamicColumns = extraFields.map((extraField) => {
    return {
      title: extraField.label,
      dataIndex: extraField.name,
      ellipsis: true,
      sorter: (a, b) => a[extraField.name]?.length - b[extraField.name]?.length,
      ...membersGetColumnSearchProps(extraField.name, columnsData),
    };
  });

  const picture = {
    title: 'Avatar',
    dataIndex: 'picture',
    width: 70,
    /* align: 'center', */
    render(val, item, index) {
      return (
        <Row gutter={8}>
          <Col>
            <Popover
              placement='top'
              content={() => (
                <>
                  {console.log('item', item)}
                  {item.picture ? (
                    <Image key={'img' + item._id} width={200} height={200} src={item.picture} />
                  ) : (
                    <Empty description='Imagen no encontrada' />
                  )}
                </>
              )}
            >
              {item.picture ? <Avatar key={'img' + item._id} src={item.picture} /> : <Avatar icon={<UserOutlined />} />}
            </Popover>
          </Col>
        </Row>
      );
    },
  };

  const role = {
    title: 'Rol',
    dataIndex: 'role',
    /* align: 'center', */
    ellipsis: true,
    /* sorter: (a, b) => a.role?.localeCompare(b.role), */
    ...membersGetColumnSearchProps('role', columnsData),
  };

  const position = {
    title: 'Cargo',
    dataIndex: 'position',
    width: 350,
    /* align: 'center', */
    ellipsis: true,
    /* sorter: (a, b) => a.position?.localeCompare(b.position), */
    ...membersGetColumnSearchProps('position', columnsData),
  };

  const progressing = {
    title: 'Progreso',
    dataIndex: 'progress',
    ellipsis: true,
    render: (text, item) => <div>{item.stats}</div>,
  };

  const created_at = {
    title: 'Creado',
    dataIndex: 'created_at',
    /* align: 'center', */
    ellipsis: true,
    sorter: (a, b) => a.created_at.localeCompare(b.created_at),
    ...membersGetColumnSearchProps('created_at', columnsData),
    render(val, item) {
      return item.created_at;
    },
  };

  const updated_at = {
    title: 'Actualizado',
    dataIndex: 'updated_at',
    /* align: 'center', */
    ellipsis: true,
    sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
    ...membersGetColumnSearchProps('updated_at', columnsData),
    render(val, item) {
      return item.updated_at;
    },
  };

  const editOption = {
    title: 'Opción',
    dataIndex: 'index',
    /* align: 'center', */
    fixed: 'right',
    width: 80,
    render(val, item, index) {
      return (
        <>
          <Tooltip title='Time tracking'>
            <Button
              style={{ marginRight: 10 }}
              type='primary'
              size='small'
              onClick={() => {
                history.push(`./members/timetracking/${item._id}`);
              }}
              icon={<ClockCircleOutlined />}
            ></Button>
          </Tooltip>
          <Tooltip title='Editar'>
            <Button
              id={`editAction${index}`}
              type='primary'
              size='small'
              onClick={(e) => {
                editModalUser(item);
              }}
              icon={<EditOutlined />}
            ></Button>
          </Tooltip>
        </>
      );
    },
  };

  columns = [picture, ...dynamicColumns];

  columns.push(role);
  columns.push(position);
  columns.push(progressing);
  columns.push(created_at);
  columns.push(updated_at);
  columns.push(editOption);

  return columns;
};
