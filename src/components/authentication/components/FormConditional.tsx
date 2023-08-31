import { MailOutlined, ScheduleOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useIntl } from 'react-intl';
import { FormConditionalInterface } from '../types';

export default function FormConditional({ handleChange, onCancel, onFinish }: FormConditionalInterface) {
  const intl = useIntl();
  const [form] = Form.useForm();
  return (
    <Form
      initialValues={{
        names: '',
        email: '',
        password: '',
      }}
      form={form}
      autoComplete='on'
      layout='vertical'
      onFinish={onFinish}>
      <Form.Item
        label={intl.formatMessage({
          id: 'modal.label.name',
          defaultMessage: 'Nombre',
        })}
        name='names'
        hasFeedback
        style={{ marginBottom: '10px', textAlign: 'left' }}
        rules={[{ required: true, message: 'Ingrese un nombre para su cuenta' }]}>
        <Input
          onChange={(e) => handleChange('names', e.target.value)}
          type='text'
          size='large'
          placeholder={intl.formatMessage({
            id: 'modal.label.name',
            defaultMessage: 'Nombre',
          })}
          prefix={<UserOutlined style={{ fontSize: '24px', color: '#c4c4c4' }} />}
        />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({
          id: 'modal.label.email',
          defaultMessage: 'Correo electrónico',
        })}
        name='email'
        hasFeedback
        style={{ marginBottom: '10px', textAlign: 'left' }}
        rules={[
          {
            type: 'email',
            message: intl.formatMessage({
              id: 'register.rule.email.message',
              defaultMessage: 'Ingrese un email valido',
            }),
          },
          {
            required: true,
            message: intl.formatMessage({
              id: 'register.rule.email.message2',
              defaultMessage: 'Ingrese un email para su cuenta en Evius',
            }),
          },
        ]}>
        <Input
          onChange={(e) => handleChange('email', e.target.value)}
          type='email'
          size='large'
          placeholder={'micorreo@ejemplo.com'}
          prefix={<MailOutlined style={{ fontSize: '24px', color: '#c4c4c4' }} />}
        />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({
          id: 'modal.label.cedula',
          defaultMessage: 'Cedula',
        })}
        name='password'
        hasFeedback
        style={{ marginBottom: '10px', textAlign: 'left' }}
        rules={[{ required: true, message: 'Ingrese una cedula para su cuenta' }]}>
        <Input
          onChange={(e) => handleChange('password', e.target.value)}
          type='number'
          size='large'
          placeholder={intl.formatMessage({
            id: 'modal.label.cedula',
            defaultMessage: 'Cedula',
          })}
          prefix={<ScheduleOutlined style={{ fontSize: '24px', color: '#c4c4c4' }} />}
        />
      </Form.Item>
      <div>
        <Button
          onClick={onCancel}
          size='large'
          style={{ margin: '0 8px' }}>
          Cancelar
        </Button>
        <Button type={'primary'} htmlType='submit'  size='large' style={{ margin: '0 8px' }}>
          Finalizar
        </Button>
      </div>
    </Form>
  );
}
