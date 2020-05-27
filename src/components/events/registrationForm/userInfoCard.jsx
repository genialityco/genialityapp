import React, { useState, useEffect } from "react";

import Form from "./form";

import { Card, Col, Row, Spin, Typography, Button, Modal } from "antd";
const { Text } = Typography;

const TICKETS = [
  {
    property: "Tickets",
    value: "ticket 1",
  },
  {
    property: "Tickets",
    value: "ticket 2",
  },
  {
    property: "Tickets",
    value: "ticket 3",
  },
  {
    property: "Tickets",
    value: "ticket 4",
  },
];

export default ({ currentUser, extraFields, eventId }) => {
  const [infoUser, setInfoUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [visibleModal, setVisibleModal] = useState(false);

  //   console.log("currentuser", currentUser.properties, extraFields);
  // Se obtiene las propiedades y se asignan a un array con el valor que contenga
  const parseObjectToArray = async (info) => {
    let userProperties = new Promise((resolve, reject) => {
      let userProperties = [];

      for (const key in info) {
        if (key != "displayName") {
          let fieldLabel = "";
          fieldLabel = extraFields.filter((item) => key == item.name);
          fieldLabel = fieldLabel && fieldLabel.length && fieldLabel[0].label ? fieldLabel[0].label : key;
          userProperties.push({ key: key, property: fieldLabel, value: info[key] });
        }
      }
      resolve(userProperties);
    });

    let result = await userProperties;
    setInfoUser(result);
    setLoading(false);
  };

  const openModal = () => {
    setVisibleModal(true);
  };

  const handleOk = (e) => {
    setVisibleModal(false);
  };

  const handleCancel = (e) => {
    setVisibleModal(false);
  };

  useEffect(() => {
    parseObjectToArray(currentUser.properties);
  }, [currentUser]);

  if (!loading)
    return (
      <Card title="El usuario ya se encuentra registrado">
        {infoUser.map((field, key) => (
          <Row key={key} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row" xs={24} sm={12} md={12} lg={12} xl={12}>
              <Text strong>{field.property}</Text>
            </Col>
            <Col className="gutter-row" xs={24} sm={12} md={12} lg={12} xl={12}>
              <Text>{field.value}</Text>
            </Col>
          </Row>
        ))}

        {/* Esto solo es para pruebas */}
        {TICKETS.map((field, key) => (
          <Row key={`T-${key}`} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row" xs={24} sm={12} md={12} lg={12} xl={12}>
              <Text strong>{field.property}</Text>
            </Col>
            <Col className="gutter-row" xs={24} sm={12} md={12} lg={12} xl={12}>
              <Text>
                <Button onClick={openModal}>Transferir</Button>
              </Text>
            </Col>
          </Row>
        ))}

        <Modal
          width={700}
          title="Transferir Ticket"
          visible={visibleModal}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancelar
            </Button>,
          ]}>
          <Form eventId={eventId} extraFields={extraFields} />
        </Modal>
      </Card>
    );

  return <Spin></Spin>;
};
