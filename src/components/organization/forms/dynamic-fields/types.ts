// This type should be used in the options written in helpers/constants.jsx
export type FieldType = 'text'
  | 'country'
  | 'region'
  | 'city'
  | 'longtext'
  | 'email'
  | 'number'
  | 'list'
  | 'multiplelist'
  | 'date'
  | 'boolean'
  | 'file'
  | 'complex'
  | 'tituloseccion'
  | 'password'
  | 'multiplelisttable'
  | 'codearea'
  | 'onlyCodearea'
  | 'avatar' // Is it new?


export interface IDynamicFieldData {
  type?: FieldType,
  props?: any,
  name: string,
  label: string,
  mandatory: boolean,
  description?: string,
  labelPosition: any, // NOTE: Check this
  visibleByAdmin?: boolean,
  options?: { label: string, value: string }[]
}

export interface IDynamicFieldProps {
  fieldData: IDynamicFieldData,
  allInitialValues?: any,
}
