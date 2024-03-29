import { Input } from 'antd'
import * as React from 'react'
import DynamicFormItem from './DynamicFormItem'
import { IDynamicFieldProps } from '../../interface/dinamic-fields'
import useMandatoryRule from '../../hooks/useMandatoryRule'

type IDynamicLongTextFieldProps = IDynamicFieldProps

const DynamicLongTextField: React.FunctionComponent<IDynamicLongTextFieldProps> = (
  props,
) => {
  const { fieldData, allInitialValues } = props

  const { name } = fieldData

  const { basicRule } = useMandatoryRule(fieldData)

  return (
    <DynamicFormItem
      fieldData={fieldData}
      rules={[basicRule]}
      initialValue={allInitialValues[name]}
    >
      <Input.TextArea rows={4} autoSize={{ minRows: 3, maxRows: 25 }} />
    </DynamicFormItem>
  )
}

export default DynamicLongTextField
