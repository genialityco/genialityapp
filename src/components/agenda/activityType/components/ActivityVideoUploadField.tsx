import * as React from 'react';
import { useState } from 'react';
import { message, Result, Spin, Upload } from 'antd';
import FileVideoOutlineIcon from '@2fd/ant-design-icons/lib/FileVideoOutline';
import { RcFile } from 'antd/lib/upload';
import { deleteVideo } from '@/adaptors/gcoreStreamingApi';

const urlUploadVideoGcore = 'https://webhook.evius.co/upload-video';

const handleBeforeUpload = (file: RcFile) => {
  return file;
};

export interface ActivityVideoUploadFieldProps {
  activityName: string,
};

function ActivityVideoUploadField(props: ActivityVideoUploadFieldProps) {
  // const { selectOption, typeOptions } = useTypeActivity();
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange = async (info: any) => {
    const { status, response } = info.file;
    switch (status) {
      case 'done':
        // selectOption(typeOptions.key, `${response.video.iframe_url}*${response.video.id}`);
        // TODO: upload this stuffs
        alert(`${response.video.iframe_url}*${response.video.id}`);
        setIsLoading(false);
        break;
      case 'error':
        if (response?.message == 'ERROR: Invalid format') {
          message.error('Formato de video inválido');
        } else {
          message.error('Error al cargar el video');
        }
        console.error(info)
        setIsLoading(false);
        break;
      case 'removed':
        // Delete the video from gcore
        if (response?.video) await deleteVideo(response.video.id);
        setIsLoading(false);
        break;
      default:
        setIsLoading(true);
        break;
    }

    if (status == 'error') {
    }
  }

  return (
    <Upload.Dragger
      beforeUpload={handleBeforeUpload}
      action={`${urlUploadVideoGcore}?nameActivity=${props.activityName}`}
      maxCount={1}
      accept='video/*'
      name='video'
      onRemove={() => {}}
      onChange={handleOnChange}>
      <Result
        icon={<FileVideoOutlineIcon />}
        title='Haga clic o arrastre el video a esta área para cargarlo'
        subTitle='Solamente formato ogm, wmv, mpg, webm, ogv, mov, asx, mpeg, mp4, m4v y avi.'
      />
      {isLoading && <Spin />}
    </Upload.Dragger>
  );
};

export default ActivityVideoUploadField;
