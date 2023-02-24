import { IDynamicFieldData } from '@components/dynamic-fields/types'

type ExtraSampleType = {
  _id: string,
  index?: number
  order_weight?: number,
  unique?: boolean,
}

type SampleType = {
  [k: number]: IDynamicFieldData & ExtraSampleType,
}

const sample: SampleType = {
  0: {
    _id: 'id',
    index: 0,
    label: 'Nombres Y Apellidos',
    mandatory: false,
    name: 'names',
    order_weight: 1,
    type: 'text',
    unique: false,
  },
  1: {
    _id: 'id',
    index: 1,
    label: 'Correo',
    mandatory: false,
    name: 'email',
    order_weight: 2,
    type: 'email',
    unique: false,
  },
  2: {
    _id: 'id',
    index: 2,
    label: 'Celular',
    mandatory: true,
    name: 'celular',
    order_weight: 3,
    type: 'codearea',
  },
  3: {
    _id: 'id',
    index: 3,
    label: 'Pais',
    mandatory: true,
    name: 'pais',
    order_weight: 4,
    type: 'country',
  },
  4: {
    _id: 'id',
    index: 4,
    label: 'Departamento',
    mandatory: true,
    name: 'departamento',
    order_weight: 5,
    type: 'region',
  },
  5: {
    _id: 'id',
    index: 5,
    label: 'Ciudad',
    mandatory: true,
    name: 'city',
    order_weight: 6,
    type: 'city',
    unique: false,
  },
  6: {
    _id: 'id',
    index: 6,
    label: 'Perfil Profesional',
    mandatory: true,
    name: 'perfilProfesional',
    options: [{ label: 'pro1', value: 'p1' }, { label: 'pro2', value: 'p2' }],
    order_weight: 7,
    type: 'list',
  },
  7: {
    _id: 'id',
    index: 7,
    label: 'Especialidad',
    mandatory: true,
    name: 'especialidad',
    options: [{ label: 'op1', value: '1' }, { label: 'op2', value: '2' }],
    order_weight: 8,
    type: 'list',
  },
  8: {
    _id: 'id',
    index: 8,
    label: 'Terminos y condiciones',
    mandatory: true,
    name: 'terminosYCondiciones',
    order_weight: 9,
    type: 'boolean',
  },
  9: {
    _id: 'id',
    label: 'Esto es un texto largo',
    mandatory: true,
    name: 'estoEsUnTextoLargo',
    type: 'longtext',
  },
  10: {
    _id: 'id',
    index: 10,
    label: 'Campo numérico',
    mandatory: true,
    name: 'campoNumerico',
    order_weight: 11,
    type: 'number',
  },
  11: {
    _id: 'id',
    label: 'Campo de selección múltiple',
    mandatory: true,
    name: 'campoDeSeleccionMultiple',
    type: 'multiplelist',
    options: [{ label: 'op11xx', value: '11x' }, { label: 'op22xx', value: '22x' }],
  },
  12: {
    _id: 'id',
    label: 'Fecha',
    name: 'fecha',
    type: 'date',
  },
  13: {
    _id: 'id',
    label: 'Campo de archivo',
    name: 'campoDeArchivo',
    type: 'file',
  },
  14: {
    _id: 'id',
    label: 'Campo JSON',
    name: 'campoJson',
    type: 'complex',
  },
  15: {
    _id: 'id',
    label: 'Campo titulo para campos relacionados',
    name: 'campoTituloParaCamposRelacionados',
    type: 'tituloseccion',
  },
  16: {
    _id: 'id',
    label: 'Campo password',
    name: 'campoPassword',
    type: 'password',
  },
  17: {
    _id: 'id',
    label: 'Campo Selección mutiple con buscar',
    name: 'campoSeleccionMutipleConBuscar',
    options: [{ label: 'op11', value: '11' }, { label: 'op22', value: '22' }],
    type: 'multiplelisttable',
  },
  18: {
    _id: 'id',
    label: 'Tu foto',
    name: 'tufoto',
    type: 'avatar',
  },
  19: {
    _id: 'id',
    index: 0,
    label: 'Campo dependencia',
    name: 'main-field',
    type: 'list',
    options: [
      { label: 'Activo', value: 'active' },
      { label: 'Temporal', value: 'temporal' },
      { label: 'Desactivado', value: 'deactive' },
    ]
  },
  20: {
    _id: 'id',
    index: 0,
    label: 'Campo que depende',
    name: 'second-field',
    type: 'text',
    dependency: {
      fieldName: 'main-field',
      triggerValues: ['active', 'temporal']
    },
  },
  21: {
    _id: 'id',
    index: 0,
    label: 'Terminos y condiciones - label',
    name: 'tt_cc',
    type: 'TTCC',
    link: 'https://beta.geniality.com.co/tc'
  },
}

export default sample
