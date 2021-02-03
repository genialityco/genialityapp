import React, { Component } from 'react';
import Moment from 'moment';
import { Link, withRouter } from 'react-router-dom';
import EventImage from '../../eventimage.png';
import { Badge, Card, Space } from 'antd';

class EventCard extends Component {
  render() {
    const { event, action, bordered, right, loading } = this.props;
    const { Meta } = Card;
    console.log('Marlon aqui', event);
    return (
      <div>
        <Badge.Ribbon
          text={
            <span style={{ fontSize: '12px' }}>
              <div>
                <Space>
                  <span>
                    <i className='fas fa-map-marker-alt' />
                  </span>
                  <span>{event.venue ? event.venue : 'Virtual'}</span>
                </Space>
              </div>
            </span>
          }>
          <Link to={{ pathname: `/landing/${event._id}`, state: { event: event } }}>
            <Card
              bordered={bordered}
              loading={loading}
              style={{ width: '100%' }}
              cover={
                event.picture ? (
                  <img
                    loading='lazy'
                    style={{ objectFit: 'cover', height: 180 }}
                    src={typeof event.picture === 'object' ? event.picture[0] : event.picture}
                    alt='Evius.co'
                  />
                ) : (
                  <img
                    loading='lazy'
                    style={{ objectFit: 'cover', height: 180 }}
                    src={
                      event.styles
                        ? event.styles.banner_image && event.styles.banner_image !== undefined
                          ? event.styles.banner_image
                          : EventImage
                        : EventImage
                    }
                    alt='Evius.co'
                  />
                )
              }
              actions={right}>
              <Meta
                description={
                  <div>
                    <span style={{ fontSize: '12px' }}>
                      <Space>
                        <time dateTime={event.datetime_from}>{Moment(event.datetime_from).format('DD MMM YYYY')}</time>
                        {'-'}
                        <time dateTime={event.datetime_from}>{Moment(event.datetime_from).format('DD MMM YYYY')}</time>
                      </Space>
                    </span>
                    <h3 style={{ fontWeight: 'bold' }}>{event.name}</h3>
                    <span>
                      {event.organizer.name
                        ? event.organizer.name
                        : event.author.displayName
                        ? event.author.displayName
                        : event.author.names}
                    </span>
                  </div>
                }
              />
            </Card>
          </Link>
        </Badge.Ribbon>
      </div>
    );
  }
}

export default withRouter(EventCard);
