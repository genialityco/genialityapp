import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { Alert } from 'antd';
import { FormInstance, Rule } from 'antd/lib/form';


import DynamicFormItem from './DynamicFormItem';
import { IDynamicFieldProps } from '../../interface/dinamic-fields';
import useMandatoryRule from '../../hooks/useMandatoryRule';

interface IDynamicPhoneInputFieldProps extends IDynamicFieldProps {
  form?: FormInstance;
  amountMin?: number;
  placeholder?: string;
  defaultCountry?: string;
}

const DynamicPhoneInputField: React.FunctionComponent<IDynamicPhoneInputFieldProps> = (props) => {
  const { form, fieldData, allInitialValues, placeholder = 'Phone number', defaultCountry = 'CO', amountMin } = props;

  const { name } = fieldData;
  const intl = useIntl();
  const { basicRule } = useMandatoryRule(fieldData);

  const [valuePhone, setValuePhone] = useState(false);

  const validatePhoneNumber = (value: any) => {
    const isValid = isPossiblePhoneNumber(form?.getFieldValue(name)) ? true : false;
    setValuePhone(isValid);
  };

  const rules: Rule[] = useMemo(() => {
    return [
      basicRule,
      {
        //@ts-ignore
        validator: (rule, value) => {
          if (!amountMin) return Promise.resolve();
          if (value.toString().length < amountMin) {
            return Promise.reject(`Min ${amountMin} digits`);
          }
          return Promise.resolve();
        },
      },
    ];
  }, [basicRule]);

  return (
    <DynamicFormItem rules={rules} fieldData={fieldData} initialValue={allInitialValues[name]}>
      <PhoneInput
        placeholder={intl.formatMessage({
          id: 'form.phone',
          defaultMessage: placeholder,
        })}
        //@ts-ignore
        onChange={(phone) => {
          if (phone && form) {
            form.setFieldsValue({
              [name]: phone,
            });
            validatePhoneNumber(form?.getFieldValue(name));
          }
        }}
        defaultCountry={(defaultCountry as unknown) as any}
        international
      />
      {!valuePhone && <Alert style={{ marginTop: '1rem' }} message='Debe ser un numero valido' type='error' />}
    </DynamicFormItem>
  );
};

export default DynamicPhoneInputField;
