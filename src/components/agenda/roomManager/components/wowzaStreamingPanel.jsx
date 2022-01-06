import { useState, useEffect } from 'react';
import { Button, Spin, Alert, Typography, Space, Input, Tooltip, message } from 'antd';
import { CopyFilled, CheckCircleFilled } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import WOWZAPlayer from 'components/livetransmision/WOWZAPlayer';
import {
  createLiveStream,
  getLiveStream,
  stopLiveStream,
  startLiveStream,
  getLiveStreamStatus,
  getLiveStreamStats,
} from 'adaptors/wowzaStreamingAPI';
import { realTimeviuschat } from '../../../../helpers/firebase';
import { UseCurrentUser } from '../../../../Context/userContext';

const WowzaStreamingPanel = ({ meeting_id, created_action, stopped_action, activityDispatch, activityEdit }) => {
  //Link para eviusmeet dónde se origina el video
  const eviusmeets = `https://eviusmeets.netlify.app/prepare`;
  let cUser = UseCurrentUser();

  const [livestreamStatus, setLivestreamStatus] = useState(null);
  const [livestreamStats, setLivestreamStats] = useState(null);
  const [linkRolAdmin, setLinkRolAdmin] = useState(null);
  const [linkRolProductor, setLinkRolProductor] = useState(null);
  const [linkRolAsistente, setLinkRolAsistente] = useState(null);
  const [webHookStreamStatus, setWebHookStreamStatus] = useState(null);
  const [copySuccessProductor, setCopySuccessProductor] = useState(false);
  const [copySuccessAsistente, setCopySuccessAsistente] = useState(false);

  const queryClient = useQueryClient();
  // console.log('innerRender', meeting_id);
  const livestreamQuery = useQuery(['livestream', meeting_id], () => getLiveStream(meeting_id));

  useEffect(() => {
    if (livestreamQuery && livestreamQuery.data) {
      const { names, email, picture } = cUser.value;
      let rtmplink = livestreamQuery.data.source_connection_information;
      let linkAdmin =
        eviusmeets +
        `?meetingId=${activityEdit}&rtmp=${rtmplink.primary_server}/${
          rtmplink.stream_name
        }&rol=1&username=${names}&email=${email}&photo=${picture ? picture : ''}`;
      let linkProductor =
        eviusmeets + `?meetingId=${activityEdit}&rtmp=${rtmplink.primary_server}/${rtmplink.stream_name}&rol=1`;
      let linkAsistente = eviusmeets + `?meetingId=${activityEdit}`;
      setLinkRolAdmin(linkAdmin);
      setLinkRolProductor(linkProductor);
      setLinkRolAsistente(linkAsistente);
    }
  }, [livestreamQuery.data]);

  useEffect(() => {
    const realTimeRef = realTimeviuschat.ref('meets/' + activityEdit + '/streamingStatus');

    const unsubscribe = realTimeRef.on('value', (snapshot) => {
      const data = snapshot?.val();
      setWebHookStreamStatus(data?.status);
    });

    return () => {
      realTimeRef.off('value', unsubscribe);
    };
  }, []);

  // console.log('linkeviusmeets', linkRolProductor);
  useEffect(() => {
    if (meeting_id) executer_startMonitorStatus(meeting_id);
  }, [meeting_id]);

  const executer_createStream = useMutation(createLiveStream, {
    onSuccess: (data) => {
      // console.log('sucks', data);
      queryClient.setQueryData('livestream', data);
      activityDispatch({ type: 'meeting_created', meeting_id: data.id });
      // Invalidate and refetch
      //queryClient.invalidateQueries('todos')
    },
  });

  const executer_startMonitorStatus = async () => {
    let live_stream_status = null;
    let live_stream_stats = null;
    try {
      live_stream_status = await getLiveStreamStatus(meeting_id);
      // console.log('live_stream_status', live_stream_status);
      setLivestreamStatus(live_stream_status);

      live_stream_stats = await getLiveStreamStats(meeting_id);
      setLivestreamStats(live_stream_stats);
    } catch (e) {}
    const timer_id = setTimeout(executer_startMonitorStatus, 5000);
    if (live_stream_status && live_stream_status.state == 'stopped') {
      clearTimeout(timer_id);
    }
  };

  const executer_startStream = async () => {
    const liveStreamresponse = await startLiveStream(meeting_id);
    executer_startMonitorStatus();
    //inicia el monitoreo
  };

  const executer_stopStream = async () => {
    const liveStreamresponse = await stopLiveStream(meeting_id);
    queryClient.setQueryData('livestream', null);
  };

  function success() {
    message.success('URL copiada satisfactoriamente!');
  }

  function copyToClipboard(type) {
    if (type === 'Productor') {
      navigator.clipboard.writeText(linkRolProductor);
      success();
      setCopySuccessProductor(true);
    } else if (type === 'Asistente') {
      navigator.clipboard.writeText(linkRolAsistente);
      success();
      setCopySuccessAsistente(true);
    }
    setTimeout(() => {
      setCopySuccessProductor(false);
      setCopySuccessAsistente(false);
    }, 5000);
  }

  if (!livestreamQuery.data)
    return (
      <>
        <Spin tip='Loading...' spinning={executer_createStream.isLoading}>
          <Button onClick={() => executer_createStream.mutate()}>Crear</Button>
        </Spin>

        {executer_createStream.isError && (
          <>
            {/* {console.log('executer_createStream', executer_createStream)} */}
            <Alert
              message={
                'An error occurred:' +
                executer_createStream.error.message +
                ' ' +
                executer_createStream.error?.response?.data?.meta?.message
              }
              type='error'
              showIcon
              closable
            />
          </>
        )}
      </>
    );

  return (
    <>
      <br />
      <br />
      <p>
        Queda pendiente revisar el estado inicial de la reunión, agregar estados de error a los botones de start, stop,
      </p>

      {livestreamStatus?.state === 'stopped' ? (
        <Button
          onClick={() => {
            executer_startStream();
          }}>
          Iniciar
        </Button>
      ) : (
        <>
          <Button
            onClick={() => {
              executer_stopStream();
            }}>
            Detener
          </Button>
          <Button onClick={() => {}}>Reiniciar</Button>
        </>
      )}

      <br />
      <br />

      <br />
      {webHookStreamStatus && (
        <>
          <b>Evius Meets Status: </b>
          {webHookStreamStatus}
          <br />
        </>
      )}
      {livestreamStatus && (
        <>
          <b>Streaming Status: </b>
          <Space>
            {livestreamStatus.state !== 'started' && livestreamStatus.state != 'stopped' && <Spin />}
            {livestreamStatus.state}
          </Space>
          <br />
        </>
      )}
      {livestreamStats && livestreamStats.connected && (
        <>
          <b>Origin Connected:</b> {livestreamStats?.connected.value}
          <br />
        </>
      )}
      {livestreamStats && livestreamStats.connected && (
        <>
          <b>Origin Status:</b> {livestreamStats?.connected.status}
          <br />
        </>
      )}
      {livestreamStats && livestreamStats.connected && (
        <>
          <b>Origin Problem reason: </b>
          {livestreamStats?.connected.text}
          <br />
        </>
      )}

      <br />

      {livestreamStatus?.state === 'started' && (
        <>
          <Space direction='vertical'>
            {linkRolAdmin && (
              <Button type='primary' href={linkRolAdmin} target='_blank'>
                Ingresar a EviusMeets para transmitir
              </Button>
            )}
            <b>Ir a EviusMeets: </b>

            {linkRolProductor && (
              <Input.Group compact>
                <Input style={{ width: 'calc(100% - 31px)' }} disabled value={linkRolProductor} />
                <Tooltip title='Copiar productor url'>
                  <Button
                    onClick={() => copyToClipboard('Productor')}
                    icon={
                      copySuccessProductor ? (
                        <CheckCircleFilled style={{ color: '#52C41A' }} />
                      ) : (
                        <CopyFilled style={{ color: '#0089FF' }} />
                      )
                    }
                  />
                </Tooltip>
              </Input.Group>
            )}
            {linkRolAsistente && (
              <Input.Group compact>
                <Input style={{ width: 'calc(100% - 31px)' }} disabled value={linkRolAsistente} />
                <Tooltip title='Copiar asistente url'>
                  <Button
                    onClick={() => copyToClipboard('Asistente')}
                    icon={
                      copySuccessAsistente ? (
                        <CheckCircleFilled style={{ color: '#52C41A' }} />
                      ) : (
                        <CopyFilled style={{ color: '#0089FF' }} />
                      )
                    }
                  />
                </Tooltip>
              </Input.Group>
            )}
          </Space>
          <br />
          <br />
          {livestreamStats?.connected.value === 'Yes' ? (
            <WOWZAPlayer meeting_id={meeting_id} thereIsConnection={livestreamStats?.connected.value} />
          ) : (
            <WOWZAPlayer meeting_id={meeting_id} thereIsConnection={livestreamStats?.connected.value} />
          )}
          <br />
        </>
      )}

      <p>Coloca estos datos en tu plataforma de captura de video para transmitirlo:</p>
      <ul>
        {/* Algunos datos adicionales que se podrían mostrar
            <li>
              <b>player_embed_code: </b>
              {streamconfig.player_embed_code}
            </li>
            <li>
              <b>player_hls_playback_url: </b>
              {streamconfig.player_hls_playback_url}
            </li> */}

        <li>
          <b>RTMP url:</b> {livestreamQuery.data.source_connection_information.primary_server}
        </li>
        <li>
          <b>RTMP clave:</b> {livestreamQuery.data.source_connection_information.stream_name}
        </li>
      </ul>
    </>
  );
};
export default WowzaStreamingPanel;
