import { useState, useEffect } from 'react';
import { Card, Col, Empty, Result, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { EventsApi } from '@/helpers/request';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
// import { Carousel } from 'react-responsive-carousel';
import { firestore } from '@/helpers/firebase';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper-bundle.css';
import { Swiper as SwiperType } from 'swiper/types';

// import required modules
import { Navigation, Thumbs } from 'swiper';
import { FormattedMessage } from 'react-intl';
import { FirestoreConfigData, MatchParams, Product } from '../interfaces/productsLanding';

function DetailsProduct(props: RouteComponentProps<MatchParams>) {
  const { Title, Text } = Typography;
  const [product, setProduct] = useState<Product>({} as Product);
  const [loading, setLoading] = useState<boolean>(true);
  const [habilty, setHability] = useState<boolean>();
  const [messageF, setMessage] = useState<string>('');
  const [eventId, setEventId] = useState<string>('');
  const [updateValue, setUpdateValue] = useState<boolean>();
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  //costantes
  /*validacion con un valor maximo que en este caso seria 1 */
  const MAXIMUM_VALUE: number = 1;

  /*Se usa para hacer comparaciones con valor minimo que seria 0*/
  const MINIMUM_VALUE: number = 0;

  const calculateDiscountedPrice = (): number => {
    if (product && product.price) {
      if (product.discount && product.discount > MINIMUM_VALUE) {
        const discountedPrice = product.price - (product.price * product.discount) / 100;
        // const formattedPrice = discountedPrice.toFixed(2); // redondear a dos decimales
        // const priceWithoutDecimal = formattedPrice.replace(/\.00$/, ''); // para quitar decimales
        return discountedPrice;
      }
      return product.price;
    }
    return 0;
  };

  const priceWithDiscount = calculateDiscountedPrice();
  // const priceWithoutDiscount = product && product.price;

  //currency
  useEffect(() => {
    let idProduct = props.match.params.id;
    let eventId = props.match.params.event_id;

    firestore
      .collection('config')
      .doc(eventId)
      .onSnapshot((onSnapshot: any) => {
        if (onSnapshot.exists) {
          let doc = onSnapshot.data() as FirestoreConfigData;
          setHability(doc.data.habilitar_subasta);
          setMessage(doc.data.message);
        } else {
          setHability(false);
        }
      });

    if (idProduct && eventId && (!updateValue || updateValue)) {
      setEventId(eventId);
      obtenerDetalleProduct();
    }
    async function obtenerDetalleProduct() {
      let detalleProduct = await EventsApi.getOneProduct(eventId, idProduct);
      if (Object.keys(detalleProduct).length > MINIMUM_VALUE) {
        setProduct(detalleProduct);
      }
      setLoading(false);
    }
  }, [updateValue]);

  return (
    <>
      {product && !loading && (
        <Row gutter={[16, 16]} style={{ padding: 20 }}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
            <Card
              style={{
                height: '100%',
                display: 'grid',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 20,
              }}>
              {product &&
              product.images &&
              product.images.filter((img) => img != null).length > MINIMUM_VALUE ? (
                // Acción a realizar si se cumplen todas las condiciones
                <>
                  <Swiper
                    style={{
                      width: '400px',
                      height: '280px',
                      margin: '4px',
                    }}
                    loop={true}
                    spaceBetween={1}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[Navigation, Thumbs]}
                    freeMode={true}>
                    {product.images
                      .filter((img) => img != null)
                      .map((image, index) => (
                        <SwiperSlide key={'image' + index}>
                          <img

                            style={{ borderRadius: '10px', objectFit: 'contain', width: '100%', height: '280px' }}
                            src={image}
                            alt='producto'
                          />
                        </SwiperSlide>
                      ))}
                  </Swiper>
                  {product.images.filter((img) => img != null).length > MAXIMUM_VALUE && (
                    <Swiper
                      style={{ width: '250px', height: '120px' }}
                      onSwiper={setThumbsSwiper}
                      loop={true}
                      spaceBetween={1}
                      slidesPerView={2}
                      freeMode={true}
                      watchSlidesProgress={true}
                      modules={[Navigation, Thumbs]}>
                      {product.images
                        .filter((img) => img != null)
                        .map((image, index) => (
                          <SwiperSlide
                            key={'thumb' + index}
                            style={{ objectFit: 'contain', width: '100px', height: '100px' }}>
                            <img
                              style={{ objectFit: 'cover', width: '100px', height: '100px' }}
                              src={product.images[index]}
                              alt='thumbnail'
                            />
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  )}
                </>
              ) : (
                // Acción a realizar si la condición no se cumple
                <Empty
                  style={{ display: 'grid', justifyContent: 'center', alignItems: 'center' }}
                  description={'Sin imagen'}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
            <Card style={{ height: '100%', borderRadius: 20 }}>
              <Space direction='vertical' /* style={{ width: '100%' }} */>
                <Typography.Title level={5}>
                  {product && product.name ? product.name : 'Nombre del producto'}
                </Typography.Title>
                {product && product.by && product.by !== '' && (
                  <Typography.Text strong type='secondary'>
                    Por: {product.by}
                  </Typography.Text>
                )}
                {product &&
                  product.description &&
                  product.description !== '<p><br></p>' &&
                  product.description !== null &&
                  product.description !== `<p class="ql-align-center"><br></p>` &&
                  product.description !== `<p class="ql-align-right"><br></p>` &&
                  product.description !== `<p class="ql-align-justify"><br></p>` && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.description,
                      }}></div>
                  )}
                {product.discount ? (
                  <Statistic
                    title={<Typography.Text delete>$ {new Intl.NumberFormat().format(product.price)}</Typography.Text>}
                    value={priceWithDiscount}
                    valueStyle={{ color: '#52c41a' }}
                    prefix='$'
                    suffix={
                      <Typography.Text>
                        <small>
                          <Tag color='red'>-{product.discount}%</Tag>
                        </small>
                      </Typography.Text>
                    }
                  />
                ) : (
                  <Statistic
                    title={<Typography.Text style={{ color: 'transparent' }}>Valor del producto</Typography.Text>}
                    value={product.price}
                    valueStyle={{ color: '#52c41a' }}
                    prefix='$'
                  />
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      )}
      {!product && !loading && (
        <Row justify='center' align='middle' style={{ padding: 20 }}>
          <Col span={23}>
            <Card bordered={false}>
              <Result title={'No existe detalle de este producto'} />
            </Card>
          </Col>
        </Row>
      )}
      {loading && (
        <Row justify='center' align='middle'>
          <Col>
            <Spin
              size='large'
              tip={
                <Typography.Text strong>
                  <FormattedMessage id='loading' defaultMessage={'Cargando...'} />
                </Typography.Text>
              }
            />
          </Col>
        </Row>
      )}
    </>
  );
}

export default withRouter(DetailsProduct);
{/* OfertaProduct "No tienes permisos para pujar sobre esta obra." Precio Inicial:
                  $ 2000 */}
                {/* <div style={{ display: 'flex' }}>
                  {product && (product.price || product.start_price) && (
                    <div>
                      <h3 style={{ marginLeft: '5px', fontWeight: 'bold' }}>Ahora</h3>
                      <OfertaProduct
                        updateValues={setUpdateValue}
                        hability={habilty}
                        messageF={messageF}
                        product={product}
                        eventId={eventId}
                        priceWithDiscount={priceWithDiscount}
                      />
                    </div>
                  )}
                  {product && (product.price || product.start_price) && product.discount && (
                    <div>
                      <h3 style={{ marginLeft: '5px', fontWeight: 'bold' }}>Antes</h3>
                      <OfertaProduct
                        updateValues={setUpdateValue}
                        hability={habilty}
                        messageF={messageF}
                        product={product}
                        eventId={eventId}
                        priceWithoutDiscount={priceWithoutDiscount}
                      />
                    </div>
                  )}
                  {product && product.discount && product.discount > 0 && (
                    <Text>
                      <div style={{ textAlign: 'center' }}>
                        <h4 style={{ marginLeft: '5px', fontWeight: 'bold' }}>Descuento</h4>
                        {product.discount}
                        <PercentageOutlined style={{ fontSize: '16px', marginRight: '5px' }} />
                      </div>
                    </Text>
                  )}
                </div> */}

                {/* <Row gutter={[12,12]}> 
                     <Col span={8}>
                     <span><strong>Oferta actual</strong></span>
                     <Alert style={{padding:'4px 15px'}} type="success" message={product && product.price? product.price:"Sin precio"}/>  
                     </Col>
                     <Col span={8}> 
                       <span ><strong>Valor a ofrecer</strong></span>
                       <Input type='number' style={{width:'100%'}} min='1000' max={99999999} value=''  />
                      <span style={{color:'red',fontSize:8}}>Valor a ofrecer incorrecto</span>
                     </Col>            
                   </Row> 
                    <Button type='primary' size='middle'>
                        Pujar
                    </Button> */}