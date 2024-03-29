import React, { useState } from 'react';
import withContext from '@/context/withContext';
import { useHistory } from 'react-router-dom';
import { Card, Col, List, Result, Row } from 'antd';
import { useEffect } from 'react';
import ProductCard from './productCard';
import { EventsApi } from '@/helpers/request';
import { Product, ProductListProps } from '../interfaces/productsLanding';

const ProductList: React.FC<ProductListProps> = (props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [grid, setGrid] = useState<boolean | any>(true);
  let history = useHistory();

  useEffect(() => {
    obtenerGaleria();
  }, []);

  const obtenerGaleria = (): void => {
    EventsApi.getProducts(props.cEvent.value._id).then((resp) => {
      if (resp && resp.data) {
        let listporductOrder = resp.data.sort((a: Product, b: Product) => a?.position - b?.position);
        setProducts(listporductOrder);
      }
    });
  };
  return (
    <>
      {products.length > 0 ? (
        <List
          grid={
            grid && {
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 4,
              xxl: 4,
            }
          }
          style={{ padding: 20 }}
          dataSource={products}
          renderItem={(product: Product) => (
            <List.Item style={{ height: '100%' }} key={product._id}>
              <ProductCard history={history} eventId={props.cEvent.value._id} product={product} />
            </List.Item>
          )}
        />
      ) : (
        <Row justify='center' align='middle'>
          <Col span={23}>
            <Card bordered={false} style={{ borderRadius: 20 }}>
              <Result title={'Aún no existen artículos en la galería'} />
            </Card>
          </Col>
        </Row>
      )}
      {/* <Row gutter={[16, 16]} style={{ padding: '20px' }}> */}
      {/*<Card style={{textAlign:'center', marginLeft:30,marginRight:30,marginTop:60}}>
              <IssuesCloseOutlined  style={{marginRight:20, fontSize:20}} />La subasta se ha cerrado
          </Card>*/}
      {/* </Row> */}
    </>
  );
};

export default withContext(ProductList);
