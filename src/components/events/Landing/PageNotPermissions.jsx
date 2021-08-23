import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spin } from 'antd';
import TicketsForm from '../../tickets/formTicket';
import { connect } from 'react-redux';
import { UseUserEvent } from '../../../Context/eventUserContext';
import { UseEventContext } from '../../../Context/eventContext';
import { setSectionPermissions } from '../../../redux/sectionPermissions/actions';
import { Redirect } from 'react-router-dom';
import { EventsApi } from '../../../helpers/request';
import ProductCard from '../producto/productCard';
import { withRouter } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

const PageNotPermissions = (props) => {
  let EventUser = UseUserEvent();
  let EventContext = UseEventContext();
  let redirect;
  let urlsection = `/landing/${EventContext.value._id}/`;
  const [products,setProducts]=useState([])
  const [loading,setLoading]=useState(false)
  let history = useHistory();
  
  const center = {
    margin: '30px auto',
    textAlign:'center'
  };
  console.log(props)

  const obtenerGaleria = () => {
    setLoading(true)
    EventsApi.getProducts(EventContext.value._id).then((resp) => {      
      if (resp && resp.data) {
        let threeList=resp.data.slice(0,3)
        setProducts(threeList);
        setLoading(false)
      }
    });
  };

  useEffect(() => {
    if (EventUser.value == null) {
      props.setSectionPermissions({ view: true, section: props.sectionPermissions.section });
    }

    if (EventUser.value !== null) {
      redirect = 'evento';
    } else {
      obtenerGaleria();      
      redirect = null;
    }

    console.log('redirect', redirect);
   
  }, []);

  return (
    <>
      {' '}
      {redirect !== null || redirect !== undefined && <Redirect to={`${urlsection}${redirect}`} />}

        {/* Sección quemada para evento de subasta sileciosa FTDJ */}
        {EventContext.value._id=='60cb7c70a9e4de51ac7945a2'&&  <Col xs={24} sm={22} md={18} lg={18} xl={18} style={center}>
      {products.length > 0 && !loading && (
            <Row style={{paddingTop:'18px'}} gutter={[16,16]} key={'container'}>
              {products.map((galery) => (
               <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8} key={galery.id}>
                <ProductCard history={history} eventId={EventContext.value._id}  galery={galery} />
               </Col>
              ))}
            </Row>)}
       </Col>}
       {loading && <div style={{textAlign:'center'}}><Spin></Spin></div>}
      
      {!loading && <Col xs={24} sm={22} md={18} lg={18} xl={18} style={center}>
        {props.sectionPermissions.view && (
          <Card><h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>
            {props.sectionPermissions.section ? (
              <>
                Para poder ver la sección <a style={{ color: '#FF3830' }}>{props.sectionPermissions.section}</a> tienes
                que estar registrado en este evento
              </>
            ) : (
              <>Para poder ver esta sección tienes que estar registrado en este evento</>
            )}
          </h1>
          </Card> 
        )}             
      </Col> }   
       {!props.sectionPermissions.ticketview && !loading && <TicketsForm />}
    </>
  );
};

const mapStateToProps = (state) => ({
  sectionPermissions: state.viewSectionPermissions,
});

const mapDispatchToProps = {
  setSectionPermissions,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PageNotPermissions));
