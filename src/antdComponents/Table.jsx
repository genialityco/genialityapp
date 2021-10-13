import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import arrayMove from 'array-move';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { Table as TableAnt, Row, Col, Tooltip, Button } from 'antd';
import { EditOutlined, DeleteOutlined, DragOutlined, DownloadOutlined } from '@ant-design/icons';
import { sortableHandle } from 'react-sortable-hoc';
import ExportExcel from '../components/newComponent/ExportExcel';

const SortableItem = sortableElement((props) => <tr {...props} />);
const SortableContainer = sortableContainer((props) => <tbody {...props} />);

const Table = (props) => {
  const {
    header,
    list,
    key,
    loading,
    pagination,
    draggable,
    actions,
    editPath,
    remove,
    search,
    setColumnsData,
    setList,
    downloadFile,
    exportData,
    fileName,
    editFn,
  } = props;
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [components, setComponents] = useState('');

  const options = {
    title: 'Opciones',
    dataIndex: 'options',
    render(val, item) {
      return (
        <Row wrap gutter={[8, 8]}>
          <Col>
            {downloadFile && (
              <Tooltip placement='topLeft' title='Descargar'>
                <a href={item.file} target='_blank'>
                  <Button
                    key={`downloadAction${item.index}`}
                    id={`downloadAction${item.index}`}
                    icon={<DownloadOutlined />}
                    size='small'
                    type='primary'
                  />
                </a>
              </Tooltip>
            )}
          </Col>
          <Col>
            {editPath && (
              <Tooltip placement='topLeft' title='Editar'>
                <Link
                  key={`editAction${item.index}`}
                  id={`editAction${item.index}`}
                  to={{ pathname: editPath, state: { edit: item._id } }}>
                  <Button icon={<EditOutlined />} type='primary' size='small' />
                </Link>
              </Tooltip>
            )}
            {editFn && (
              <>
                <Tooltip placement='topLeft' title='Editar'>
                  <Button
                    key={`editAction${item.index}`}
                    id={`editAction${item.index}`}
                    onClick={() => editFn(item)}
                    icon={<EditOutlined />}
                    type='primary'
                    size='small'
                  />
                </Tooltip>
              </>
            )}
          </Col>
          <Col>
            {remove && (
              <Tooltip placement='topLeft' title='Eliminar'>
                <Button
                  key={`removeAction${item.index}`}
                  id={`removeAction${item.index}`}
                  onClick={() => remove(item._id)}
                  icon={<DeleteOutlined />}
                  type='danger'
                  size='small'
                />
              </Tooltip>
            )}
          </Col>
        </Row>
      );
    },
  };

  if (actions) {
    header.push(options);
  }

  useEffect(() => {
    if (draggable) {
      draggableFn();
    }

    if (search) {
      searchFn();
    }
  }, []);

  const draggableFn = () => {
    header.unshift(
      {
        title: '',
        dataIndex: 'move',
        width: '50px',
        render(val, item) {
          const DragHandle = sortableHandle(() => (
            <DragOutlined id={`drag${item.index}`} style={{ cursor: 'grab', color: '#999', visibility: 'visible' }} />
          ));
          return <DragHandle />;
        },
      },
      {
        title: 'Orden',
        dataIndex: 'index',
        render(val, item) {
          return <div>{val + 1}</div>;
        },
      }
    );

    const componentFunctions = {
      body: {
        wrapper: DraggableContainer,
        row: DraggableBodyRow,
      },
    };

    setComponents(draggable ? componentFunctions : '');
  };

  const searchFn = () => {
    setColumnsData({
      data: props,
      searchedColumn: searchedColumn,
      handleSearch,
      handleReset,
      searchText: searchText,
      list: list,
    });
  };

  //FN para búsqueda en la tabla 2/3
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  //FN para búsqueda en la tabla 3/3
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  //FN para el draggable 1/3
  function onSortEnd({ oldIndex, newIndex }) {
    console.log(oldIndex, newIndex, 'aa');
    if (oldIndex !== newIndex) {
      console.log(oldIndex, newIndex, 'ab');
      let newData = arrayMove([].concat(list), oldIndex, newIndex).filter((el) => !!el);
      if (newData) {
        newData = newData.map((data, key) => {
          return { ...data, index: key };
        });
      }
      list = newData;
    }
  }

  //FN para el draggable 2/3
  const DraggableContainer = (props) => (
    <SortableContainer useDragHandle disableAutoscroll helperClass='row-dragging' onSortEnd={onSortEnd} {...props} />
  );

  //FN para el draggable 3/3
  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const index = list.findIndex((x) => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  return (
    <div>
      <TableAnt
        columns={header}
        dataSource={list}
        /* hasData={list} */
        size='small'
        hasData={list && list.length}
        rowKey={(record) => record.index}
        loading={loading}
        pagination={pagination}
        components={components}
        title={() => (
          <Row wrap justify='end' gutter={[8, 8]}>
            <Col>{exportData && <ExportExcel columns={header} list={list} fileName={fileName} />}</Col>
          </Row>
        )}
      />
    </div>
  );
};

export default Table;
