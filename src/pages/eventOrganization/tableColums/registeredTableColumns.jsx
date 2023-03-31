import { useHistory } from 'react-router';
import { Tooltip, Button, Row, Col, Popover, Image, Avatar, Empty, Spin, Tag } from 'antd';
import { ClockCircleOutlined, EditOutlined, FileAddOutlined, UserOutlined } from '@ant-design/icons';
import { membersGetColumnSearchProps } from '../searchFunctions/membersGetColumnSearchProps';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const columns = (columnsData, extraFields = [], addNewCertificationModal) => {
  const columns = [];

  const checkedin_at = {
    key: 'checkedin_at',
    title: 'Inscrito',
    dataIndex: 'checkedin_at',
    /* align: 'center', */
    ellipsis: true,
    sorter: (a, b) => a.checkedin_at.localeCompare(b.checkedin_at),
    ...membersGetColumnSearchProps('created_at', columnsData),
    render(val, item) {
      return item.checkedin_at;
    },
  };

  const name = {
    key: 'eventUser_name',
    title: 'Nombres y apellidos',
    dataIndex: 'eventUser_name',
    ellipsis: true,
    sorter: (a, b) => a.eventUser_name.localeCompare(b.eventUser_name),
    ...membersGetColumnSearchProps('eventUser_name', columnsData),
    render: (val, item) => {
      return item.eventUser_name;
    },
  };

  const email = {
    key: 'eventUser_email',
    title: 'Email',
    dataIndex: 'eventUser_email',
    ellipsis: true,
    sorter: (a, b) => a.eventUser_email.localeCompare(b.eventUser_email),
    ...membersGetColumnSearchProps('eventUser_email', columnsData),
    render: (val, item) => {
      return item.eventUser_email;
    },
  };

  const position = {
    key: 'position',
    title: 'Cargo',
    dataIndex: 'position',
    ellipsis: true,
    sorter: (a, b) => a.eventUser_email.localeCompare(b.eventUser_email),
    ...membersGetColumnSearchProps('positon', columnsData),
    render: (record) => {
      if (record === undefined) {
        return <span style={{ color: '#999' }}>Sin cargo</span>;
      }
      return record;
    },
  };

  const course = {
    key: 'event_name',
    title: 'Curso',
    dataIndex: 'event_name',
    ellipsis: true,
    sorter: (a, b) => a.event_name.localeCompare(b.event_name),
    ...membersGetColumnSearchProps('event_name', columnsData),
    /* render(val, item) {
      return item.event_name;
    }, */
  };

  const approved_from_date = {
    key: 'approved_from_date',
    title: 'Fecha de emisión',
    dataIndex: 'approved_from_date',
    align: 'center',
    //width: 150,
    ellipsis: true,
    sorter: (a, b) => {
      if (a.approved_from_date === null) return -1;
      if (b.approved_from_date === null) return 1;
      return a.approved_from_date - b.approved_from_date || 1;
    },
    ...membersGetColumnSearchProps('approved_from_date', columnsData),
    render: (val, item) => (
      <>{item?.approved_from_date ? dayjs(item?.approved_from_date).format('DD/MM/YYYY') : 'Sin fecha'}</>
    ),
  };

  const approved_until_date = {
    key: 'approved_until_date',
    title: 'Fecha de vencimiento',
    dataIndex: 'approved_until_date',
    align: 'center',
    //width: 150,
    ellipsis: true,
    sorter: (a, b) => {
      if (a.approved_until_date === null) return -1;
      if (b.approved_until_date === null) return 1;
      return a.approved_until_date - b.approved_until_date || 1;
    },
    ...membersGetColumnSearchProps('approved_until_date', columnsData),
    render: (val, item) => (
      <>{item?.approved_until_date ? dayjs(item?.approved_until_date).format('DD/MM/YYYY') : 'Sin fecha'}</>
    ),
  };

  const validity_date = {
    key: 'validity_date',
    title: 'Estado de vigencia',
    dataIndex: 'validity_date',
    align: 'center',
    ellipsis: true,
    sorter: (a, b) => {
      if (a.validity_date === null) return -1;
      if (b.validity_date === null) return 1;
      return a.validity_date - b.validity_date || 1;
    },
    ...membersGetColumnSearchProps('validity_date', columnsData),
    render(val, item) {
      if (item.validity_date === null) {
        return <Tag color="blue">{`Sin certificado`}</Tag>; //TODO: Utilizar la función traductora.
      } else {
        const actualDate = dayjs(new Date());
        const finishDate = dayjs(item.validity_date);
        const vigencia = finishDate.diff(actualDate, 'day');

        return (
          <Tag color={vigencia > 10 ? 'green' : vigencia < 10 && vigencia > 0 ? 'orange' : 'red'}>
            {`${vigencia} días`}
          </Tag>
        );
      }
    },
  };

  const created_at = {
    key: 'created_at',
    title: 'Creado',
    dataIndex: 'created_at',
    /* align: 'center', */
    ellipsis: true,
    sorter: (a, b) => a.created_at.localeCompare(b.created_at),
    ...membersGetColumnSearchProps('created_at', columnsData),
    /* render(val, item) {
      return item.created_at;
    }, */
  };

  const editOption = {
    title: 'Agregar',
    dataIndex: 'index',
    align: 'center',
    fixed: 'right',
    width: 80,
    render(val, item, index) {
      return (
        <>
          <Tooltip title="Editar">
            <Button
              id={`editAction${index}`}
              type="primary"
              size="small"
              onClick={(e) => {
                addNewCertificationModal(item);
              }}
              icon={<FileAddOutlined />}
            ></Button>
          </Tooltip>
        </>
      );
    },
  };
  // This ColumnData is used for all the extra fields
  const timeToThink = (field, defaultKey) => {
    return {
      key: field.id ?? field._id ?? field.name ?? defaultKey,
      title: field.label,
      dataIndex: field.name,
      ellipsis: true,
      //filterSearch: true,
      // This sorter is generic and it can crash when you are in a selling
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      render: (record, item) => {
        // TODO: parse each dynamic field type like boolean, string, etc.
        if (field.type === 'boolean') {
          return record === undefined ? 'N/A' : record ? 'Sí' : 'No';
        }
        if (field.type === 'TTCC') {
          return record === undefined ? 'N/A' : record ? 'Aceptado' : 'No aceptado';
        }
        return (record || '').toString();
      },
    };
  };

  columns.push(name);
  columns.push(position);
  columns.push(approved_from_date);
  columns.push(approved_until_date);
  columns.push(validity_date);
  columns.push(course);
  columns.push(...extraFields.map(timeToThink));
  console.log('extraFields', extraFields);
  columns.push(email);
  columns.push(checkedin_at);
  columns.push(created_at);
  columns.push(editOption);

  return columns;
};