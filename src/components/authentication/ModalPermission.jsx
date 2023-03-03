import { CloseCircleFilled } from '@ant-design/icons';
import { Modal, PageHeader, Space, Grid, Typography, Button } from 'antd';
import FormComponent from '../events/registrationForm/form';
import withContext from '@context/withContext';
import { useHelper } from '@context/helperContext/hooks/useHelper';

import { useIntl } from 'react-intl';
import { DispatchMessageService } from '@context/MessageService';
import { useEventContext } from '@context/eventContext';
import { useUserEvent } from '@context/eventUserContext';
import { useState } from 'react';
import { UsersApi } from '@helpers/request';
const { useBreakpoint } = Grid;

const stylePaddingDesktop = {
  paddingLeft: '25px',
  paddingRight: '25px',
};
const stylePaddingMobile = {
  paddingLeft: '10px',
  paddingRight: '10px',
};

const ModalPermission = (props) => {
  const { handleChangeTypeModal, typeModal } = useHelper();
  const screens = useBreakpoint();
  const intl = useIntl();
  const cEvent = useEventContext();
  const cEventUser = useUserEvent();

  const [openModal, setOpenModal] = useState(false);

  async function saveEventUser(values) {
    const eventUserBody = {
      properties: { ...values },
    };

    //const resp = await UsersApi.editEventUser(eventUserBody, cEvent.value?._id, cEventUser.value._id);
    const resp = await UsersApi.createOne(eventUserBody, cEvent.value?._id);

    if (resp._id) {
      DispatchMessageService({
        type: 'success',
        msj: `Usuario editado correctamente`,
        action: 'show',
      });
      cEventUser.setUpdateUser(true);
      handleChangeTypeModal(null);
    } else {
      DispatchMessageService({
        type: 'error',
        msj: `No fue posible editar el Usuario`,
        action: 'show',
      });
    }
  }

  return (
    <Modal
      bodyStyle={{ textAlign: 'center', paddingRight: '10px', paddingLeft: '10px' }}
      centered
      footer={null}
      zIndex={1000}
      closable
      onCancel={() => handleChangeTypeModal(null)}
      visible={typeModal == 'register' || typeModal == 'update' || typeModal === 'registerForTheEvent'}
    >
      <div
        // className="asistente-list"
        style={{
          // height: '70vh',
          overflowY: 'hidden',
          paddingLeft: '5px',
          paddingRight: '5px',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}>
        <FormComponent callback={saveEventUser}/>
      </div>
    </Modal>
  );
};

export default withContext(ModalPermission);
