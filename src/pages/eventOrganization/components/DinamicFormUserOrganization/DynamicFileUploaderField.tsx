import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { RcFile } from 'antd/lib/upload';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import DynamicFormItem from './DynamicFormItem';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { IDynamicFieldProps } from '../../interface/dinamic-fields';
import useMandatoryRule from '../../hooks/useMandatoryRule';
import useCheckFileSize from '../../hooks/useCheckFileSize';

interface IDynamicFileUploaderFieldProps extends IDynamicFieldProps {
  form?: FormInstance;
}

const DynamicFileUploaderField: React.FunctionComponent<IDynamicFileUploaderFieldProps> = (props) => {
  const { fieldData, form, allInitialValues } = props;

  const { name } = fieldData;

  const { basicRule } = useMandatoryRule(fieldData);

  const getFilenameFromURL = useCallback((url: any) => {
    if (typeof url !== 'string') return null;
    const splittedUrl = url.split('/');
    return splittedUrl[splittedUrl.length - 1];
  }, []);

  const checkFileSize = useCheckFileSize();

  const handleBeforeUpload = useCallback(
    (file: RcFile) => {
      return checkFileSize(file);
    },
    [checkFileSize]
  );

  const initialValue = useMemo(() => {
    const fileList: any[] = [];
    const value = allInitialValues[name];
    if (value) {
      fileList.push(
        ...[
          {
            name: typeof value == 'string' ? getFilenameFromURL(value) : null,
            url: typeof value == 'string' ? value : null,
          },
        ]
      );
    }
    return fileList;
  }, [allInitialValues, name]);

  return (
    <DynamicFormItem fieldData={fieldData} rules={[basicRule]} initialValue={initialValue}>
      <Upload
        accept='application/pdf,image/png, image/jpeg,image/jpg,application/msword,.docx'
        action='https://api.evius.co/api/files/upload/'
        multiple={false}
        listType='text'
        beforeUpload={handleBeforeUpload}
        onChange={(info: UploadChangeParam<UploadFile<unknown>>) => {
          const [file] = info.fileList;
          if (file && file.status === 'done') {
            console.debug('uploaded at', file.response);
            if (form) {
              console.log('form update', fieldData.name, 'to', file.response);
              form.setFieldsValue({
                [fieldData.name]: file.response,
              });
            }
          }
        }}>
        <Button icon={<UploadOutlined />}>
          <FormattedMessage id='form.button.upload-file' defaultMessage='Subir archivo' />
        </Button>
      </Upload>
    </DynamicFormItem>
  );
};

export default DynamicFileUploaderField;
