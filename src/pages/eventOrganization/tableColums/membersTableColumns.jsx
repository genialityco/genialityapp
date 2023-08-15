/** React's libraries */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

/** Antd imports */
import { Tooltip, Button, Row, Col, Popover, Image, Avatar, Empty, Spin } from 'antd'
import {
  ClockCircleOutlined,
  EditOutlined,
  RiseOutlined,
  UserOutlined,
} from '@ant-design/icons'

/** Helpers and utils */
import { membersGetColumnSearchProps } from '../searchFunctions/membersGetColumnSearchProps'

export const columns = (
  columnsData,
  editModalUser,
  extraFields,
  togglePaymentPlan,
  organization,
) => {
  const navigate = useNavigate()
  const [columns, setColumns] = useState([])

  if (!extraFields) return []

  const dynamicColumns = extraFields
    .map((extraField) => {
      const dataIndex = () => {
        switch (extraField.name) {
          case 'position_id':
            return 'position'
          case 'rol_id':
            return 'role'
          default:
            return extraField.name
        }
      }

      return {
        title: extraField.label,
        dataIndex: dataIndex(),
        ellipsis: true,
        sorter: (a, b) => a[extraField.name]?.length - b[extraField.name]?.length,
        ...membersGetColumnSearchProps(extraField.name, columnsData),
      }
    })
    .filter((x) => x !== null)

  const picture = {
    title: 'Avatar',
    dataIndex: 'picture',
    width: 70,
    /* align: 'center', */
    render(val, item) {
      return (
        <Row gutter={8}>
          <Col>
            <Popover
              placement="top"
              content={() => (
                <>
                  {item.picture ? (
                    <Image
                      key={'img' + item._id}
                      width={200}
                      height={200}
                      src={item.picture}
                    />
                  ) : (
                    <Empty description="Imagen no encontrada" />
                  )}
                </>
              )}
            >
              {item.picture ? (
                <Avatar key={'img' + item._id} src={item.picture} />
              ) : (
                <Avatar icon={<UserOutlined />} />
              )}
            </Popover>
          </Col>
        </Row>
      )
    },
  }

  const payment_plan = {
    title: 'Plan de pago',
    dataIndex: 'payment_plan',
    key: 'payment_plan',
    width: '140px',
    ellipsis: true,
    sorter: (a, b) => (a.payment_plan?.price ?? 0) - (b.payment_plan?.price ?? 0),
    ...membersGetColumnSearchProps('payment_plan'),
    render(payment_plan) {
      console.log('payment_plan', payment_plan)
      return payment_plan?.price ? 'Premium' : 'Free'
    },
  }

  const created_at = {
    title: 'Creado',
    dataIndex: 'created_at',
    /* align: 'center', */
    ellipsis: true,
    sorter: (a, b) => a.created_at.localeCompare(b.created_at),
    ...membersGetColumnSearchProps('created_at', columnsData),
    render(val, item) {
      return item.created_at
    },
  }

  const updated_at = {
    title: 'Actualizado',
    dataIndex: 'updated_at',
    /* align: 'center', */
    ellipsis: true,
    sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
    ...membersGetColumnSearchProps('updated_at', columnsData),
    render(val, item) {
      return item.updated_at
    },
  }

  const editOption = {
    title: 'Opción',
    dataIndex: 'index',
    /* align: 'center', */
    fixed: 'right',
    width: 80,
    render(val, item, index) {
      return (
        <>
          <Tooltip title="Time tracking">
            <Button
              style={{ marginRight: 10 }}
              type="primary"
              size="small"
              onClick={() => {
                navigate(`./members/timetracking/${item._id}`)
              }}
              icon={<ClockCircleOutlined />}
            ></Button>
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              id={`editAction${index}`}
              type="primary"
              size="small"
              onClick={() => {
                editModalUser(item)
              }}
              icon={<EditOutlined />}
            ></Button>
          </Tooltip>
          {organization.access_settings?.type === 'payment' && (
            <Tooltip title={item.payment_plan ? 'Quitar premium' : 'Hace premium'}>
              <Button
                type={item.payment_plan ? 'ghost' : 'primary'}
                size="small"
                onClick={() => {
                  togglePaymentPlan(item)
                }}
                icon={<RiseOutlined />}
              ></Button>
            </Tooltip>
          )}
        </>
      )
    },
  }

  useEffect(() => {
    const newColumns = [picture, ...dynamicColumns]

    organization.access_settings?.type === 'payment' && newColumns.push(payment_plan)
    newColumns.push(created_at)
    newColumns.push(updated_at)
    newColumns.push(editOption)

    setColumns(newColumns)
  }, [columnsData])

  return columns
}
