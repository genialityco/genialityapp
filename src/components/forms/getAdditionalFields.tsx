import { UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Collapse, Divider, Form, Input, Select, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { useIntl } from 'react-intl';
import { areaCode } from '@/helpers/constants';
import { beforeUpload, getImagename } from '@/Utilities/formUtils';
import { useEffect, useState } from 'react';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const getAdditionalFields = ({ fields, editUser, visibleInCms }: any) => {
  const intl = useIntl();
  let userProperties = editUser?.properties || {};
  const countryField = userProperties['pais'] || '';
  let areacodeselected = userProperties['code'] || 57;

  const [country, setCountry] = useState('');

  useEffect(() => {
    setCountry(countryField);
  }, [countryField]);

  if (fields?.lenght === 0) return [];

  let additionalFormFields = fields.map((field: any, key: any) => {
    // se valida si el campo es visible solo el en cms,
    if (field.visibleByAdmin == true && !visibleInCms) return;

    //Este if es nuevo para poder validar las contraseñas viejos (nuevo flujo para no mostrar esos campos)
    if (field.name !== 'contrasena' && field.name !== 'password') {
      let ImgUrl: any = '';
      let rule = {};
      let type = field.type || 'text';
      let name = field.name;
      let label = field.label;
      let mandatory = field.mandatory;
      let description = field.description;
      let labelPosition = field.labelPosition;
      let target = name;
      let value = userProperties ? userProperties[target] : '';

      //esogemos el tipo de validación para email
      rule = type === 'email' ? { ...rule, type: 'email' } : rule;

      rule =
        type == 'password'
          ? {
              required: true,
              pattern: new RegExp(/^[A-Za-z0-9_-]{8,}$/),
              message: 'Mínimo 8 caracteres con letras y números, no se permiten caracteres especiales',
            }
          : rule;
      rule = name == 'email' || name == 'names' ? { required: true } : { required: mandatory };

      let input = (
        <Form.Item initialValue={value} name={name} noStyle>
          <Input
            addonBefore={
              labelPosition === 'izquierda' && (
                <span>
                  {mandatory && <span style={{ color: 'red' }}>* </span>}
                  <strong>{label}</strong>
                </span>
              )
            }
            type={type}
            key={key}
          />
        </Form.Item>
      );

      if (type === 'codearea') {
        const prefixSelector = (
          <Form.Item initialValue={areacodeselected} name={['code']} noStyle>
            <Select
              showSearch
              optionFilterProp='children'
              style={{ fontSize: '12px', width: 155 }}
              onChange={(val) => {
                areacodeselected = val;
              }}
              placeholder='Código de area del pais'>
              {areaCode.map((code: any, key: any) => {
                return (
                  <Option key={key} value={code.value}>
                    {`${code.label} (+${code.value})`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        );
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <Input
              addonBefore={prefixSelector}
              name={name}
              required={mandatory}
              type='number'
              key={key}
              style={{ width: '100%' }}
              placeholder='Numero de telefono'
            />
          </Form.Item>
        );
      }

      if (type === 'tituloseccion') {
        input = (
          <>
            <div className={`label has-text-grey ${mandatory ? 'required' : ''}`}>
              <div
                dangerouslySetInnerHTML={{
                  __html: label,
                }}></div>
            </div>
            <Divider />
          </>
        );
      }

      if (type === 'multiplelisttable') {
        let defaultValue;
        if (value) {
          defaultValue = JSON.parse(value);
        }
        input = field.options
          ? field.options.map((option: any, key: any) => {
              return (
                <Option key={key} value={option.value}>
                  {option.label}
                </Option>
              );
            })
          : [];

        input = (
          <Form.Item initialValue={defaultValue} name={name} noStyle>
            <Select
              mode='multiple'
              placeholder='Selecciona una o mas opciones'
              defaultValue={defaultValue}
              style={{ width: '100%' }}>
              {input}
            </Select>
          </Form.Item>
        );
      }

      if (type === 'boolean') {
        let textoError = '';
        if (mandatory) {
          textoError = intl.formatMessage({ id: 'form.field.required' });

          rule = {
            validator: (_: any, value: any) => (value == true ? Promise.resolve() : Promise.reject(textoError)),
          };
        } else {
          rule = {
            validator: (_: any, value: any) =>
              value == true || value == false || value == '' || value == undefined
                ? Promise.resolve()
                : Promise.reject(textoError),
          };
        }
        return (
          <div key={'g' + key}>
            {
              <>
                <Form.Item
                  valuePropName={'checked'}
                  name={name}
                  rules={[rule]}
                  key={'l' + key}
                  htmlFor={key}
                  initialValue={value}>
                  <Checkbox key={key} name={name} defaultChecked={Boolean(value ? value : false)}>
                    {mandatory ? (
                      <span>
                        <span style={{ color: 'red' }}>* </span>
                        <strong>{label}</strong>
                      </span>
                    ) : (
                      label
                    )}
                  </Checkbox>
                </Form.Item>

                {description && description.length < 500 && <p>{description}</p>}
                {description && description.length > 500 && (
                  <Collapse
                    defaultActiveKey={['0']}
                    // style={{ margingBotton: '15px' }}
                  >
                    <Panel
                      header={intl.formatMessage({
                        id: 'registration.message.policy',
                      })}
                      key='1'>
                      <pre
                        dangerouslySetInnerHTML={{
                          __html: description,
                        }}
                        style={{ whiteSpace: 'normal' }}></pre>
                    </Panel>
                  </Collapse>
                )}
              </>
            }
          </div>
        );
      }

      if (type === 'longtext') {
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <TextArea rows={4} autoSize={{ minRows: 3, maxRows: 25 }} value={value} defaultValue={value} />
          </Form.Item>
        );
      }

      if (type === 'multiplelist') {
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <Checkbox.Group
              options={field.options}
              defaultValue={value}
              onChange={(checkedValues) => {
                value = JSON.stringify(checkedValues);
              }}
            />
          </Form.Item>
        );
      }

      if (type === 'file') {
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <Upload
              accept='application/pdf,image/png, image/jpeg,image/jpg,application/msword,.docx'
              action='https://api.evius.co/api/files/upload/'
              multiple={false}
              listType='text'
              beforeUpload={beforeUpload}
              defaultFileList={
                value
                  ? [
                      {
                        name: typeof value == 'string' ? getImagename(value) : null,
                        url: typeof value == 'string' ? value : null,
                      },
                    ]
                  : []
              }>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        );
      }

      if (type === 'list') {
        input = field.options
          ? field.options.map((option: any, key: any) => {
              return (
                <Option key={key} value={option.value}>
                  {option.label}
                </Option>
              );
            })
          : [];
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <Select style={{ width: '100%' }}>
              <Option value={''}>Seleccione...</Option>
              {input}
            </Select>
          </Form.Item>
        );
      }

      if (type === 'country') {
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <CountryDropdown
              classes='countryCity-styles'
              priorityOptions={['CO']}
              onChange={(val) => {
                setCountry(val);
              }}
              name={name}
              defaultOptionLabel={label}
            />
          </Form.Item>
        );
      }

      if (type === 'city') {
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <RegionDropdown
              classes='countryCity-styles'
              disableWhenEmpty={true}
              country={country}
              name={name}
              defaultOptionLabel={label}
              blankOptionLabel={label}
            />
          </Form.Item>
        );
      }

      //SE DEBE QUEDAR PARA RENDRIZAR EL CAMPO IMAGEN DENTRO DEL CMS
      if (type === 'avatar') {
        ImgUrl = ImgUrl !== '' ? ImgUrl : value !== '' && value !== null ? [{ url: value }] : undefined;

        input = (
          <div style={{ textAlign: 'center' }}>
            <ImgCrop rotate shape='round'>
              <Upload
                action={'https://api.evius.co/api/files/upload/'}
                accept='image/png,image/jpeg'
                onChange={(file) => {
                  // setImageAvatar(file);
                }}
                multiple={false}
                listType='picture'
                maxCount={1}
                defaultFileList={
                  value
                    ? [
                        {
                          name: typeof value == 'string' ? getImagename(value) : null,
                          url: typeof value == 'string' ? value : null,
                        },
                      ]
                    : []
                }
                beforeUpload={beforeUpload}>
                <Button type='primary' icon={<UploadOutlined />}>
                  {intl.formatMessage({
                    id: 'form.button.avatar',
                    defaultMessage: 'Subir imagen de perfil',
                  })}
                </Button>
              </Upload>
            </ImgCrop>
          </div>
        );
      }

      if (type === 'number') {
        input = (
          <Form.Item initialValue={value} name={name} noStyle>
            <Input type={type} />
          </Form.Item>
        );
      }
      return (
        type !== 'boolean' && (
          <div key={'g' + key}>
            {type === 'tituloseccion' && input}
            {type !== 'tituloseccion' && (
              <>
                <Form.Item
                  // noStyle={visible}
                  // hidden={visible}
                  valuePropName={type === 'boolean' ? 'checked' : 'value'}
                  label={
                    (labelPosition !== 'izquierda' || !labelPosition) && type !== 'tituloseccion'
                      ? label
                      : '' && (labelPosition !== 'arriba' || !labelPosition)
                  }
                  name={name}
                  rules={[rule]}
                  key={'l' + key}
                  htmlFor={key}>
                  {input}
                </Form.Item>

                {description && description.length < 500 && <p>{description}</p>}
                {description && description.length > 500 && (
                  <Collapse
                    defaultActiveKey={['0']}
                    // style={{ margingBotton: '15px' }}
                  >
                    <Panel
                      header={intl.formatMessage({
                        id: 'registration.message.policy',
                      })}
                      key='1'>
                      <pre style={{ whiteSpace: 'normal' }}>{description}</pre>
                    </Panel>
                  </Collapse>
                )}
              </>
            )}
          </div>
        )
      );
    }
  });

  return additionalFormFields;
};

export default getAdditionalFields;
