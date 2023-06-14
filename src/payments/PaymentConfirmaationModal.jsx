import { useState } from 'react'
import { Button, Modal } from 'antd'

const PaymentConfirmaationModal = ({ isOpen, handleOk, handleCancel }) => {
  const [isModalOpen, setIsModalOpen] = useState(true)

  const showModal = () => {
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(true)
  }

  //   const handleOkInner = () => {
  //     setIsModalOpen(false)
  //   }

  //   const handleCancelInner = () => {
  //     setIsModalOpen(false)
  //   }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title="Payment confirmation"
        open={isOpen}
        okText={'Pagar'}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Para ingresar a este contenido debes tener una cuenta con un plan pago</p>
        <p>El costo del plan es: $5.000</p>
      </Modal>
    </>
  )
}

export default PaymentConfirmaationModal
