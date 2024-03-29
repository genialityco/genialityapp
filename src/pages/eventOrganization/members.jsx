/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import { Table, Button, Row, Col, Tag } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { columns } from './tableColums/membersTableColumns';
import withContext from '../../context/withContext';
import Header from '../../antdComponents/Header';
import { ModalAddAndEditUsers } from './components/ModalAddAndEditUsersOrganization';
import { useGetEventsStatisticsData } from './tableColums/utils/useGetEventsStatisticsData';
import { parseMembersColumsExcel, parseDataMembersToExcel } from './tableColums/utils/parseData.utils';
import { ExportExcel } from '@/components/export-excel/ExportExcel';

const OrgMembers = (props) => {
  const [lastUpdate, setLastUpdate] = useState();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [addOrEditUser, setAddOrEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  let { _id: organizationId, user_properties: userPropertiesOrg } = props.org;

  const { getDataOrgUser, isLoadingMembersParsed, membersParsed, pagination } = useGetEventsStatisticsData(
    organizationId
  );

  function startingComponent() {
    getDataOrgUser();
    setLastUpdate(new Date());
  }
  useEffect(() => {
    startingComponent();
  }, [props.org.user_properties]);

  const closeOrOpenModalMembers = () => {
    setAddOrEditUser((prevState) => {
      return !prevState;
    });
  };

  const addUser = () => {
    setSelectedUser(undefined);
    closeOrOpenModalMembers();
  };
  const editModalUser = (item) => {
    setSelectedUser(item);
    closeOrOpenModalMembers();
  };

  const columnsData = {
    searchedColumn,
    setSearchedColumn,
    searchText,
    setSearchText,
  };

  const columsMembersView = columns(membersParsed, columnsData, editModalUser, organizationId, getDataOrgUser);
  const columsMembersExcel = parseMembersColumsExcel(userPropertiesOrg);

  return (
    <>
      <Header title={'Miembros'} />

      <p>
        <small>
          Última Sincronización : <FormattedDate value={lastUpdate} /> <FormattedTime value={lastUpdate} />
        </small>
      </p>

      <p>
        <Tag>Inscritos: {membersParsed.length || 0}</Tag>
      </p>
      <Table
        columns={columsMembersView}
        dataSource={membersParsed}
        size='small'
        rowKey='index'
        pagination={pagination}
        loading={isLoadingMembersParsed}
        scroll={{ x: 'auto' }}
        title={() => (
          <Row wrap justify='end' gutter={[8, 8]}>
            <Col>
              {/* {membersParsed.length > 0 && (
                <Button type='primary' icon={<DownloadOutlined />} onClick={exportFile}>
                  Exportar
                </Button>
              )} */}
              <ExportExcel
                list={parseDataMembersToExcel(membersParsed, columsMembersExcel)}
                fileName={'memberReport'}
                columns={columsMembersExcel}
              />
            </Col>
            <Col>
              <Button type='primary' icon={<PlusCircleOutlined />} onClick={addUser}>
                {'Agregar'}
              </Button>
            </Col>
          </Row>
        )}
      />
      {addOrEditUser && (
        <ModalAddAndEditUsers
          visible={addOrEditUser}
          onCancel={() => {
            setAddOrEditUser(false);
            setSelectedUser(undefined);
          }}
          organizationId={organizationId}
          selectedUser={selectedUser}
          getEventsStatisticsData={getDataOrgUser}
        />
      )}
    </>
  );
};
export default withContext(OrgMembers);
