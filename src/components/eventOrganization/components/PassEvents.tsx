import { Badge, Card, Col, Empty, Row, Space, Typography } from 'antd';
import React from 'react';
import { InputSearchEvent } from './InputSearchEvent';
import EventCard from '@/components/shared/eventCard';
import { useSearchList } from '@/hooks/useSearchList';

const { Title } = Typography;

interface Props {
  eventsOld: any[];
  isUserRegisterInEvent: (id: string) => boolean;
  havePaymentEvent: (event: any) => boolean;
}
export const PassEvents = ({ eventsOld, isUserRegisterInEvent, havePaymentEvent }: Props) => {
  const { filteredList, setSearchTerm } = useSearchList(eventsOld, 'name');

  const getTextButtonBuyOrRegistered = (event: any): string => {
    if (isUserRegisterInEvent(event._id)) {
      return 'Ingresar';
    }
    if (havePaymentEvent(event)) {
      if (event.payment.externalPayment) {
        return 'Comprar';
      } else {
        return `Comprar por $ ${event.payment.price} ${event?.payment?.currency}`;
      }
    }

    return 'Inscribirse';
  };

	return (
		<Card
			bodyStyle={{ paddingTop: '0px' }}
			headStyle={{ border: 'none' }}
			title={
				<Badge offset={[60, 22]} count={`${eventsOld.length} Eventos`}>
					<Title level={2}>Eventos disponibles</Title>
				</Badge>
			}
			extra={<Space>{eventsOld.length > 0 && <InputSearchEvent onHandled={setSearchTerm} />}</Space>}
			style={{ width: '100%', borderRadius: 20 }}>
			<Row gutter={[0, 32]}>
				<Col span={24}>
					<Row gutter={[16, 16]}>
						{eventsOld && eventsOld.length > 0 ? (
							<>
								{filteredList.length > 0 ? (
									filteredList.map((event, index) => {
										if (event.hide_event_in_passed) {
											return null;
										}
										return (
											<Col key={index} xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
												<EventCard
													bordered={false}
													key={event._id}
													event={event}
													action={{ name: 'Ver', url: `landing/${event._id}` }}
													buttonBuyOrRegistered
													textButtonBuyOrRegistered={getTextButtonBuyOrRegistered(event)}
												/>
											</Col>
										);
									})
								) : (
									<div
										style={{
											height: '250px',
											width: '100%',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
										}}>
										<Empty description='No hay eventos pasados con ese nombre' />
									</div>
								)}
							</>
						) : (
							<div
								style={{
									height: '250px',
									width: '100%',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}>
								<Empty description='No hay eventos pasados' />
							</div>
						)}
					</Row>
				</Col>
			</Row>
		</Card>
	);
};