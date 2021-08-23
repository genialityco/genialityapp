import { Card, Space,Col, Row } from 'antd';
import React, { Fragment, useContext } from 'react';
import VideoCard from './videoCard';
import { UseEventContext } from '../../Context/eventContext';
import { HelperContext } from '../../Context/HelperContext';
import { useState } from 'react';
const ListVideoCard = () => {

  let cEvent = UseEventContext();
  let { activitiesEvent } = useContext(HelperContext);
  const [existActivity, setexistActivity] = useState(0);
  function ExistvideoInActivity() {
    activitiesEvent &&
      activitiesEvent.map((activity) => {
        if (activity.video != undefined || activity.video != null) {
          {
            setexistActivity(1);
          }
        }
      });
  }
  React.useEffect(() => {
    ExistvideoInActivity();
  }, [activitiesEvent]);


  if (!cEvent.value) {
    return <>Cargando...</>;
  }
  return (
    <>
      {existActivity == 1 && (
          <Row>
              {activitiesEvent &&
                activitiesEvent.map((activity, index) => {
                  //Solo los últimos 3
                  if (index > 2)return;
                  if (activity.video) {
                    return <Col key={index} xs={0} sm={0} md={24} lg={8} xl={8}>
                    <VideoCard
                    bordered={false}
                    key={cEvent.value._id}
                    event={cEvent.value}
                    action={{ name: 'Ver', url: `landing/${cEvent.value._id}` }}
                    activity={activity}
                  />
                  </Col>
                    //return <VideoCard key={index} activity={activity} />;
                  }
                })}
                </Row>
      )}
    </>
  );
};

export default ListVideoCard;