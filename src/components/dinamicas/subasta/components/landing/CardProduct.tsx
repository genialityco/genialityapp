import { Card, Empty, Skeleton, Statistic, Typography, Grid, Row, Col, Button, Modal, Space, Tooltip } from 'antd'
import React, { useState } from 'react'
import { CardProductProps } from '../../interfaces/auction.interface'
import { getCorrectColor } from '@/helpers/utils';
import CardTextOutlineIcon from '@2fd/ant-design-icons/lib/CardTextOutline';
import useBreakpoint from 'use-breakpoint'

/* const {useBreakpoint} = Grid; */
const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1280, largeScreen: 1920 }

export default function CardProduct({auction, currentPrice} : Partial<CardProductProps>) {
/*   const screens = useBreakpoint(); */
  const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop')
  const [openDescription, setOpenDescription] = useState(false);

  return (
    <>
      <Card
        bordered={false}
        hoverable={false}
        style={{ maxHeight: breakpoint === 'mobile' ? 400 : breakpoint === 'largeScreen' ? 900 : 630, borderRadius: 20 , backgroundColor: auction?.styles?.cards?.backgroundColor || ''}}
        headStyle={{ textAlign: 'center' }}

        cover={
          auction?.currentProduct ? (
            <>
              {breakpoint === 'mobile' ? 
                  <img
                    alt='imagen del producto'
                    src={auction?.currentProduct.images[0].url}
                    style={{ 
                      height: '260px',
                      objectFit: 'cover',
                      backgroundColor: '#C4C4C440',
                      borderRadius: '20px 20px 0 0px'
                    }}
                  />
                :
                  <img
                    alt='imagen del producto'
                    src={auction?.currentProduct.images[0].url}
                    style={{ 
                      height: breakpoint === 'largeScreen' ? '600px' : '490px',
                      objectFit: 'fill',
                      backgroundColor: '#C4C4C440', 
                      borderRadius: '20px 20px 0 0px' 
                    }}
                  />
              }
            </>
          ) : (
            <Empty
              image={<Skeleton.Image className='animate__animated animate__flipInX' />}
              style={{ height: breakpoint === 'mobile' ? '260px' : breakpoint === 'largeScreen' ? '600px' : '410px', display: 'grid', justifyContent: 'center', alignItems: 'center' }}
              description={<div style={{color: getCorrectColor(auction?.styles?.cards?.backgroundColor)}}>Sin imagen</div>}
            />
          )
        }>
          <Card.Meta 
            title={
              <Tooltip title={auction?.currentProduct?.name}>
                <Typography.Text style={{ color: getCorrectColor(auction?.styles?.cards?.backgroundColor)}} strong>
                  {auction?.currentProduct ? auction?.currentProduct?.name : 'Sin producto asignado'}
                </Typography.Text>
              </Tooltip>}
            description={
              <Row justify={'space-between'} wrap>
                <Col>
                  <Statistic 
                    valueStyle={{ color: getCorrectColor(auction?.styles?.cards?.backgroundColor)}}
                    title={<Typography.Text style={{ color: getCorrectColor(auction?.styles?.cards?.backgroundColor)}} >Valor del artículo</Typography.Text>}
                    className='animate__animated animate__flipInX' 
                    prefix='$' 
                    value={currentPrice ?? auction?.currentProduct?.price} 
                    suffix={auction?.currency}
                  />
                </Col>
                {auction?.currentProduct?.description && 
                  <Col>
                    <Button 
                      onClick={() => setOpenDescription(true)}
                      style={{
                        backgroundColor: auction?.styles?.cards?.backgroundColor, 
                        color: getCorrectColor(auction?.styles?.cards?.backgroundColor),
                        borderColor: getCorrectColor(auction?.styles?.cards?.backgroundColor)
                      }}
                      icon={<CardTextOutlineIcon />}
                    >
                      {(breakpoint === 'desktop' || breakpoint === 'largeScreen') && 'Ver descripción'}
                    </Button>
                    <Modal
                      visible={openDescription}
                      onCancel={() => setOpenDescription(false)}
                      closable={true}
                      /* style={{backgroundColor: auction?.styles?.cards?.backgroundColor,}} */
                      footer={false}
                    >
                      <Space direction='vertical'>
                        <Typography.Text strong>{auction?.currentProduct?.name}</Typography.Text>
                        <Typography.Paragraph /* style={{color: getCorrectColor(auction?.styles?.cards?.backgroundColor),}} */>
                          {auction?.currentProduct?.description}
                        </Typography.Paragraph>
                      </Space>
                    </Modal>
                  </Col>
                }
              </Row>
            } 
          />
      </Card>
    </>
  )
}
