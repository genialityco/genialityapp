import React, { useState } from 'react';
import { EventsApi } from '../../../helpers/request';
import withContext from '../../../Context/withContext';
import { useHistory } from 'react-router-dom';
import { Card, Col, Row } from 'antd';
import { useEffect } from 'react';
import ProductCard from './productCard';

const ProductList = (props) => {
  const [products, setProducts] = useState([]);
  let history = useHistory();

  useEffect(() => {
    obtenerGaleria();    
  }, []);

  const obtenerGaleria = () => {
    EventsApi.getProducts(props.cEvent.value._id).then((resp) => {
      if (resp && resp.data) {
        setProducts(resp.data);
      }
    });
  };
  return (
    <>
      {/*<Card style={{textAlign:'center', marginLeft:30,marginRight:30,marginTop:60}}>
            <IssuesCloseOutlined  style={{marginRight:20, fontSize:20}} />La subasta se ha cerrado
         </Card>*/}     
      {products.length > 0 && (
        <Row className='site-card-border-less-wrapper' style={{ width: '75vw', margin: 'auto' }}>
          {products.length > 0 && (
            <Row style={{paddingTop:'18px'}} gutter={[16,16]} key={'container'}>
              {products.map((galery) => (
               <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8} key={galery.id}>
                <ProductCard history={history} eventId={props.cEvent.value._id}  galery={galery} />
               </Col>
              ))}
            </Row>
          )}
        </Row>
      )}
      {products.length == 0 && (
        <Row >
          <Card style={{width:'100%',textAlign:'center',marginRight:60,marginLeft:60,marginTop:50}} >Aún no existen artículos en la galería</Card>
        </Row>
      )}
    </>
  );
};

export default withContext(ProductList);