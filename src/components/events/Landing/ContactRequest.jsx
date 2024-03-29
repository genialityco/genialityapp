import { Button, Space, Tooltip } from 'antd';
import { VideoCameraAddOutlined, UsergroupAddOutlined, CommentOutlined } from '@ant-design/icons';
import { UseCurrentUser } from '../../../context/userContext';

const ContactRequest = (props) => {
  let cUser = UseCurrentUser();

  return (
    <Space size='middle'>
      <Tooltip title='Solicitar contacto'>
        <Button
          size='large'
          shape='circle'
          onClick={async () => {
            props.collapsePerfil();
            var sendResp = await props.SendFriendship({
              eventUserIdReceiver: cUser._id,
              userName: cUser.names || cUser.email,
            });
            if (sendResp._id) {
              let notification = {
                idReceive: cUser.account_id,
                idEmited: sendResp._id,
                emailEmited: cUser.email,
                message: 'Te ha enviado solicitud de amistad',
                name: 'notification.name',
                type: 'amistad',
                state: '0',
              };

              await props.addNotification(notification, cUser._id);
            }
          }}
          icon={<UsergroupAddOutlined />}
        />
      </Tooltip>
      <Tooltip title='Ir al chat privado'>
        <Button
          size='large'
          shape='circle'
          onClick={async () => {
            props.collapsePerfil();
            props.UpdateChat(cUser.uid, cUser.names || cUser.name, cUser._id, cUser.names || cUser.name);
          }}
          icon={<CommentOutlined />}
        />
      </Tooltip>
      <Tooltip title='Solicitar cita'>
        <Button
          size='large'
          shape='circle'
          onClick={async () => {
            if (cUser) {
              props.collapsePerfil();
              props.AgendarCita(cUser._id, cUser);
            }
          }}
          icon={<VideoCameraAddOutlined />}
        />
      </Tooltip>
    </Space>
  );
};

export default ContactRequest;
