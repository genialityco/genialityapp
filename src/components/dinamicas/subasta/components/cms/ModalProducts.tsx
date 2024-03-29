import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Row, Upload } from 'antd';
import React, { Fragment } from 'react';
import { uploadImagedummyRequest } from '../../utils/utils';
import { ModalProps } from '../../interfaces/auction.interface';
import TextArea from 'antd/lib/input/TextArea';

export default function ModalProducts({ product, onChange, onCancel, onSave, loading }: ModalProps) {
  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };


  return (
    <Fragment>
      <Form layout='vertical' autoComplete='off' onFinish={onSave}>
        <Form.Item hidden name={'_id'} initialValue={product._id || ''} key={'id'}>
          <Input name='id' type='text' />
        </Form.Item>
        <Form.Item
          label={'Nombre'}
          name={'name'}
          initialValue={product.name || ''}
          rules={[{ required: true, message: 'Es necesario el nombre del producto' }]}>
          <Input type='text' placeholder={'Ej: Pintura'} />
        </Form.Item>

        <Form.Item
          rules={[{ required: true, message: 'Es necesario el precio del producto' }]}
          label={'Precio inicial'}
          name={'start_price'}
          initialValue={product.start_price|| 0}>
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>
        <Form.Item  label={'Descripción'} name={'description'} initialValue={product.description || ''}>
          <TextArea maxLength={100} showCount autoSize={{minRows: 2, maxRows: 4}} placeholder={'Ej: Hecha por el artista..'} />
        </Form.Item>

        <Form.Item
          label={'Imagenes'}
          name='imgs'
          initialValue={''}>
          <Upload
            disabled={loading}
            listType='picture-card'
            fileList={product.images}
            onChange={onChange}
            onPreview={onPreview}
            multiple
            customRequest={uploadImagedummyRequest}
            name='file'
            accept='image/png,image/jpeg,image/jpg,image/gif'
            maxCount={5}
            type='select'>
            {product?.images?.length < 5 && '+ Upload'}
          </Upload>
        </Form.Item>

        <Row justify='end'>
          <Button loading={loading} onClick={()=> onCancel(product.images)} /* type='primary' */ style={{ marginRight: 10 }}  /* icon={<CloseCircleOutlined />} */>
            Cancelar
          </Button>
          <Button loading={loading} type='primary' style={{ marginRight: 10 }} htmlType='submit' icon={<SaveOutlined />}>
            Guardar
          </Button>
        </Row>
      </Form>
    </Fragment>
  );
}
