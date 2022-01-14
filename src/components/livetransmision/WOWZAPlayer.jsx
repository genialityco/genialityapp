import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { getLiveStream, getLiveStreamStatus, getLiveStreamStats } from 'adaptors/wowzaStreamingAPI';
import IconMute from './IconMute';
import { AudioMutedOutlined } from '@ant-design/icons';
import VolumeOff from '@2fd/ant-design-icons/lib/VolumeOff';
import { Button } from 'antd';

function WOWZAPlayer({ meeting_id, thereIsConnection }) {
  const [platformurl, setPlatformurl] = useState(null);
  const [muted, setMuted] = useState(false);
  const [loopBackGround, setLoopBackGround] = useState(false);
  const defaultVideo =
    'https://firebasestorage.googleapis.com/v0/b/eviusauth.appspot.com/o/evius%2FLoading.mp4?alt=media&token=883ec61c-157a-408b-876c-b09f70402d14';
  /* const iconLocation = window.location.pathname.includes('landing'); */

  useEffect(() => {
    setPlatformurl(null);
    if (!meeting_id) return;
    if (thereIsConnection === 'No') {
      setLoopBackGround(true), setPlatformurl(defaultVideo);
    } else if (thereIsConnection === 'Yes') {
      setLoopBackGround(false);
      let asyncfunction = async () => {
        let live_stream = await getLiveStream(meeting_id);
        let url = live_stream.player_hls_playback_url;
        setPlatformurl(url);
        setMuted(true);
      };
      asyncfunction();
    }
    return () => {
      setLoopBackGround(false);
      setPlatformurl(null);
    };
  }, [meeting_id, thereIsConnection]);

  return (
    <>
      <div className='mediaplayer'>
        {muted && thereIsConnection !== 'No' && 
          <Button 
            onClick={() => setMuted(false)}
            shape="circle"
            style={{
              /* fontSize: '25px',  */
              position:'absolute', 
              top: /* !iconLocation ? '4%' : 'auto' */'auto',
              /* color: 'white', */
              left: 'auto' /* '3%' */,
              zIndex: '500'
            }}
            icon={<VolumeOff />}
          />
        }
        <ReactPlayer
          muted={muted}
          playing={true}
          loop={loopBackGround}
          /* style={{ height: '100% !important', objectFit: 'cover' }} */
          height='100%'
          width='100%'
          url={platformurl}
          controls={!loopBackGround}
          config={{
            file: {
              forceHLS: loopBackGround,
            },
          }}
        />
      </div>
      {/* <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {muted && thereIsConnection !== 'No' && <IconMute callback={() => setMuted(false)} />}
        <ReactPlayer
          muted={muted}
          playing={true}
          loop={loopBackGround}
          width={'100%'}
          height={'35vw'}
          style={{
            display: 'block',
            margin: '0 auto',
          }}
          url={platformurl}
          controls={!loopBackGround}
          config={{
            file: {
              forceHLS: loopBackGround,
            },
          }}
        />
      </div> */}
    </>
  );
}

export default React.memo(WOWZAPlayer);
