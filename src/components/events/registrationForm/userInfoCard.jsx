import React, { useState, useEffect } from "react";

import FormComponent from "./form";

import { Card, Col, Row, Spin, Typography, Button, Modal, Result } from "antd";
const { Text, Title } = Typography;

export default ({ currentUser, extraFields, eventId, userTickets }) => {
  const [infoUser, setInfoUser] = useState({});
  const [eventUserList, setEventUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleModal, setVisibleModal] = useState(false);
  const [eventUserSelected, setEventUserSelected] = useState({});
  const [initialValues, setInitialValues] = useState({});

  //   console.log("currentuser", currentUser.properties, extraFields);
  // Se obtiene las propiedades y se asignan a un array con el valor que contenga
  const parseObjectToArray = (info) => {
    return new Promise(async (resolve, reject) => {
      let userProperties = new Promise((resolve, reject) => {
        let userProperties = [];

        for (const key in info) {
          if (key != "displayName" && key != "pesovoto") {
            let fieldLabel = "";
            fieldLabel = extraFields.filter((item) => key == item.name);
            fieldLabel = fieldLabel && fieldLabel.length && fieldLabel[0].label ? fieldLabel[0].label : key;
            userProperties.push({ key: key, property: fieldLabel, value: info[key] });
          }
        }
        resolve(userProperties);
      });

      let result = await userProperties;
      resolve(result);
      setInfoUser(result);
      setLoading(false);
    });
  };

  const setEventUsers = (list) => {
    let eventUsers = [];
    console.log(eventUsers);
    list.forEach(async (item, index, arr) => {
      let result = await parseObjectToArray(item.properties);
      eventUsers.push({ eventUserId: item._id, data: result, infoTicket: item.ticket });

      if (index == arr.length - 1) setEventUserList(eventUsers);
    });
  };

  const openModal = (ticket) => {
    setEventUserSelected(ticket);
    setVisibleModal(true);

    let eventUserValues = {};
    ticket.data.forEach((item) => {
      if (item.key == "names" || item.key == "email") return;
      eventUserValues = { ...eventUserValues, [item.key]: item.value };
    });
    // console.log("eventUserValues:", eventUserValues);
    setInitialValues(eventUserValues);
  };

  const handleCancel = (e) => {
    setVisibleModal(false);
    if (e && e.status === "sent_transfer") {
      setEventUserList([]);
      console.log("antes:", eventUserList);
      eventUserList.splice(eventUserSelected.index, 1);
      console.log("DESPUES:", eventUserList);

      setEventUserList(eventUserList);
    }
  };

  useEffect(() => {
    console.log("tickets originales:", userTickets);
    if (!userTickets || userTickets.length == 0) return setLoading(false);
    setEventUsers(userTickets);
  }, [currentUser]);

  if (!loading)
    return eventUserList.length > 0 ? (
      <Card>
        <Title level={4}>Aquí puedes ver tus entradas. Y si deseas puedes transferirlas a otras personas.</Title>
        {eventUserList.map((item, indiceArray) => (
          <Card key={`Card_${indiceArray}`} title={item.infoTicket ? `Entrada: ${item.infoTicket.title}` : "Entrada"}>
            {item.data.map((field, key) => (
              <Row key={key} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row" xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Text strong>{field.property}</Text>
                </Col>
                <Col className="gutter-row" xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Text>{field.value}</Text>
                </Col>
              </Row>
            ))}
            <Button onClick={() => openModal({ ...item, index: indiceArray })}>Transferir</Button>
          </Card>
        ))}

        <Modal width={700} title="Transferir Ticket" visible={visibleModal} onCancel={handleCancel} footer={null}>
          <FormComponent
            initialValues={initialValues}
            eventId={eventId}
            extraFields={extraFields}
            eventUserId={eventUserSelected.eventUserId}
            closeModal={handleCancel}
          />
        </Modal>
      </Card>
    ) : (
      <Card>
        <Result title="No se han encontrado tickets" />
      </Card>
    );

  return <Spin></Spin>;
};
