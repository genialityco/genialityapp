import { FrownOutlined, SmileOutlined, MehOutlined } from '@ant-design/icons';

// Componente que nos muesta mensajes correspondientes segun el estado
function StateMessages(state: string, questionPoints: any) {
  const objMessage = {
    title: '',
    subTitle: '',
    status: state,
  };

  switch (state) {
    case 'success':
      return {
        ...objMessage,
        title: (
          <div>
            Has ganado <span style={{ fontWeight: 'bold', fontSize: '130%' }}>{questionPoints} punto(s)</span>,
            respondiendo correctamente.
          </div>
        ),
        subTitle: '',
        icon: <SmileOutlined />,
      };

    case 'error':
      return {
        ...objMessage,
        title: <div>Debido a que no respondiste correctamente no has ganado puntos.</div>,
        subTitle: '',
        icon: <FrownOutlined />,
      };

    case 'warning':
      return {
        ...objMessage,
        title: 'No has escogido ninguna opción',
        subTitle: `No has ganado ningun punto debido a que no marcaste ninguna opción.`,
        icon: <MehOutlined />,
      };

    case 'info':
      return {
        ...objMessage,
        title: 'Estamos en una pausa',
        subTitle: `El juego se encuentra en pausa. Espera hasta el moderador reanude el juego`,
        icon: <MehOutlined />,
      };

    default:
      return { type: state };
  }
}

export default StateMessages;
