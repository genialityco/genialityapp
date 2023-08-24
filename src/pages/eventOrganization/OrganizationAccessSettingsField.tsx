import { FunctionComponent, useEffect, useState } from 'react'
import { Form, Input, InputNumber, Switch } from 'antd'

interface IOrganizationAccessSettingsFieldProps {
  value?: any
  onChange?: (value: any) => void
}

const formLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

const OrganizationAccessSettingsField: FunctionComponent<
  IOrganizationAccessSettingsFieldProps
> = (props) => {
  const { value = {}, onChange = () => {} } = props

  const [isFieldEnabled, setIsFieldEnabled] = useState<boolean>(value?.type === 'payment')
  const [priceValue, setPriceValue] = useState<number>(value?.price ?? 0)
  const [availableDays, setAvailableDays] = useState<number>(value?.days)
  const [customPasswordLabel, setCustomPasswordLabel] = useState<undefined | string>(
    value?.custom_password_label,
  )

  useEffect(() => {
    if (typeof priceValue !== 'number') {
      console.error('price can not be', priceValue)
      return
    }

    const type = isFieldEnabled ? 'payment' : 'free'
    const price = isFieldEnabled ? priceValue ?? 0 : 0

    onChange({
      days: availableDays,
      price,
      type,
      custom_password_label: customPasswordLabel,
    })
  }, [isFieldEnabled, priceValue, availableDays, customPasswordLabel])

  return (
    <>
      <Form.Item {...formLayout} label="Habilitar modo pago">
        <Form.Item label="Etiqueta en campo contraseña">
          <Input
            placeholder="(Opcional) Contraseña"
            value={customPasswordLabel}
            onChange={(e) => setCustomPasswordLabel(e.target.value)}
          />
        </Form.Item>
        <Switch
          checked={isFieldEnabled}
          checkedChildren="Modalidad paga"
          unCheckedChildren="Gratuito"
          onChange={(checked) => setIsFieldEnabled(checked)}
        />
      </Form.Item>
      {isFieldEnabled && (
        <>
          <Form.Item
            {...formLayout}
            label="Precio"
            rules={[
              {
                required: true,
                message: 'Valor precio es requerido',
              },
            ]}
            validateStatus={priceValue < 1500 ? 'error' : 'success'}
            help={priceValue < 1500 ? 'Valor mínimo es 1500' : undefined}
          >
            <InputNumber
              value={priceValue}
              formatter={(value) => `$${value}`}
              parser={(value) => {
                if (value === undefined) return 0
                return parseInt(value.replace('$', ''))
              }}
              onChange={(value) => setPriceValue(value ?? 0)}
            />
          </Form.Item>
          <Form.Item
            {...formLayout}
            label="Días de inscripción"
            validateStatus={availableDays < 0 ? 'error' : 'validating'}
            help={
              !availableDays
                ? 'Valor por defecto es 30 días'
                : availableDays < 0
                ? 'No se puede días negativos'
                : undefined
            }
          >
            <InputNumber
              value={availableDays}
              placeholder="Días"
              onChange={(value) => setAvailableDays(value ?? 30)}
            />
          </Form.Item>
        </>
      )}
    </>
  )
}

export default OrganizationAccessSettingsField
