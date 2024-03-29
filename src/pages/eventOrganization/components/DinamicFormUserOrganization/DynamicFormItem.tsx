import * as React from 'react';
import { Form } from 'antd';
import { Rule } from 'antd/lib/form';
import DynamicFormDescription from './DynamicFormDescription';
import { IDynamicFieldProps } from '../../interface/dinamic-fields';

export interface IDynamicFormItemProps extends Omit<IDynamicFieldProps, 'allInitialValues'> {
  rules: Rule[];
  noStyle?: boolean;
  hidden?: boolean;
  valuePropName?: string;
  initialValue?: any;
}

const DynamicFormItem: React.FunctionComponent<IDynamicFormItemProps> = (props) => {
  const { noStyle, hidden, valuePropName = 'value', rules, initialValue, fieldData, children } = props;

  return (
    <>
      <Form.Item
        noStyle={noStyle}
        hidden={hidden}
        valuePropName={valuePropName}
        label={fieldData.label}
        name={fieldData.name}
        rules={rules}
        initialValue={initialValue}>
        {children}
      </Form.Item>

      <DynamicFormDescription description={fieldData.description} />
    </>
  );
};

export default DynamicFormItem;
