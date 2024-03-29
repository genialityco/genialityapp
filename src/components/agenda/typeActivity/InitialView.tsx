import { Card, Result, Button, Spin } from 'antd';
import ModalStepByStep from './ModalStepByStep';
import ManagerView from './ManagerView';
import { useTypeActivity } from '../../../context/typeactivity/hooks/useTypeActivity';
import { useContext, useEffect, useState } from 'react';
import AgendaContext from '../../../context/AgendaContext';

import InitialSVG from './components/svg/InitialSVG';
import { AgendaApi } from '../../../helpers/request';
import { CurrentEventContext } from '../../../context/eventContext';
import ModalPreviewVideo from './ModalPreviewVideo';

const objecKeys: object = {
  url: 'Video',
  meeting: 'reunión',
  vimeo: 'vimeo',
  youTube: 'Youtube',
  eviusMeet: 'EviusMeet',
  RTMP: 'Transmisión',
  cargarvideo: 'Video',
  video: 'Video',
};

const InitialView = (props: any) => {
  const { toggleActivitySteps, selectedKey, previewKey } = useTypeActivity();
  const [loading, setLoading] = useState(true);
  const { typeActivity, meeting_id, setActivityName, activityEdit, roomStatus, saveConfig } = useContext(AgendaContext);
  const cEvent = useContext(CurrentEventContext);

  useEffect(() => {
    if (props.tab !== '2') return;
    //OBTENER DETALLE DE ACTIVIDAD
    setActivityName(props.activityName);
    if (typeActivity === null) {
      setLoading(false);
    } else {
      setLoading(true);
      obtainDataInitial();
      //MIENTRAS CARGA LOS COMPONENTES
    }
  }, [props.tab]);
  //PERMITE GUARDAR LA DATA EN FIREBASE Y ACTIVAR EL SNAPSHOT CUANDO SE CAMBIA EL ESTADO DE LA ACTIVIDAD
  useEffect(() => {
    saveConfig(null, 1);
  }, [roomStatus]);
  //OBTENER DATOS INICIALES Y SETEARLOS EN EL REDUCER
  const obtainDataInitial = async () => {
    let urlVideo;
    if (typeActivity === 'url') {
      const dataActivity = await obtainUrlVideo();
      urlVideo = dataActivity.video || meeting_id;
    }
    toggleActivitySteps('initial', {
      openModal: false,
      disableNextButton: false,
      typeOptions: undefined,
      selectedKey: 'finish',
      previewKey: typeActivity,
      data: typeActivity !== 'url' ? meeting_id : urlVideo,
      buttonsTextNextOrCreate: '',
      buttonTextPreviousOrCancel: '',
    });
    setTimeout(() => setLoading(false), 500);
  };
  // (SE PUEDE OPTIMIZAR) X AHORA EL VIDEO SE ESTA GUARDANDO EN MONGO
  const obtainUrlVideo = async () => {
    const resp = await AgendaApi.getOne(activityEdit, cEvent?.value._id);
    return resp;
  };

  const renderComponet = () => {
    switch (selectedKey) {
      case 'finish':
        return (
          <ManagerView type={objecKeys[previewKey]} activityName={props.activityName} activityId={props.activityId} />
        );
      default:
        return (
          <Card>
            <Result
              icon={<InitialSVG style={{ width: '255px', height: '277px' }} />}
              status='info'
              title='Todavía no has definido el tipo de actividad'
              extra={
                <Button onClick={() => toggleActivitySteps('type')} type='primary'>
                  Escoge un tipo de actividad
                </Button>
              }
            />
          </Card>
        );
    }
  };

  return (
    <>
      <ModalPreviewVideo />
      <ModalStepByStep activityName={props.activityName} />
      {!loading ? renderComponet() : <Spin />}
    </>
  );
};

export default InitialView;
