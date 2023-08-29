/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import { Col, Row } from 'antd';
import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { OrganizationFuction } from '../../helpers/request';
import moment from 'moment';
import ModalLoginHelpers from '../authentication/ModalLoginHelpers';
import Loading from '../profile/loading';
import { DataOrganizations, Organization, OrganizationProps } from './types';
import { UseCurrentUser } from '@/context/userContext';
import { useGetEventsWithUser } from './hooks/useGetEventsWithUser';
import { ModalCertificatesByOrganizacionAndUser } from './components/ModalCertificatesByOrganizacionAndUser';
import { SocialNetworks } from './components/SocialNetworks';
import { MyEvents } from './components/MyEvents';
import { NextEvents } from './components/NextEvents';
import { PassEvents } from './components/PassEvents';

function EventOrganization({ match }: OrganizationProps) {
  const cUser = UseCurrentUser();
  const [state, setstate] = useState<DataOrganizations>({
    orgId: '',
    view: false,
  });
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsOld, setEventsOld] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalCertificatesOpen, setIsModalCertificatesOpen] = useState(false);

  const { eventsWithEventUser, isLoading: isLoadingOtherEvents } = useGetEventsWithUser(
    match.params.id,
    cUser.value?._id
  );
  useEffect(() => {
    let orgId = match.params.id;
    if (orgId) {
      fetchItem(orgId).then((respuesta) =>
        setstate({
          ...state,
          orgId,
        })
      );
      setLoading(false);
    }
  }, []);

  const fetchItem = async (orgId: string) => {
    const events = await OrganizationFuction.getEventsNextByOrg(orgId);
    let proximos: any = [];
    let pasados: any = [];
    let fechaActual = moment();
    events.map((event: any) => {
      if (moment(event.datetime_from).isAfter(fechaActual)) {
        proximos.push(event);
      } else {
        pasados.push(event);
      }
    });

    const orga = await OrganizationFuction.obtenerDatosOrganizacion(orgId);
    if (events) {
      setEvents(proximos);
      setEventsOld(pasados);
      setOrganization(orga);
    }
    setLoading(false);
  };

  //toDo: Se debe realizar esta validacion desde el backedn para mejor optimizacion
  const isUserRegisterInEvent = (eventId: string): boolean => {
    if (eventsWithEventUser.filter((event) => event._id === eventId).length > 0) {
      return true;
    }
    return false;
  };

  const havePaymentEvent = (event: any): boolean => {
    return event.payment ? (event.payment.active as boolean) : false;
  };

  return (
    <div
      style={{
        backgroundImage: `url(${organization?.styles?.BackgroundImage})`,
        backgroundColor: `${organization?.styles?.containerBgColor || '#FFFFFF'}`,
      }}>
      <SocialNetworks organization={organization} />
      <ModalLoginHelpers />
      {!loading && state.orgId ? (
        <>
          {organization !== null && (
            <div style={{ width: '100%' }}>
              {organization.styles?.banner_image !== null || '' ? (
                <img
                  style={{ objectFit: 'cover', width: '100%', maxHeight: '400px' }}
                  src={organization.styles?.banner_image}
                />
              ) : (
                ''
              )}
            </div>
          )}

          <Row justify='center' style={{ paddingTop: '32px', paddingBottom: '32px' }}>
            <Col span={23}>
              <Row gutter={[0, 32]}>
                {cUser.value && (
                  <Col style={{ width: '100%' }}>
                    <MyEvents
                      eventsWithEventUser={eventsWithEventUser}
                      isLoadingOtherEvents={isLoadingOtherEvents}
                      organization={organization}
                      setIsModalCertificatesOpen={setIsModalCertificatesOpen}
                    />
                    {isModalCertificatesOpen && (
                      <ModalCertificatesByOrganizacionAndUser
                        destroyOnClose
                        visible={isModalCertificatesOpen}
                        onCloseDrawer={() => setIsModalCertificatesOpen(false)}
                        eventUserId={cUser.value?._id}
                        organizationId={match.params.id}
                        orgContainerBg={organization?.styles?.containerBgColor}
                        orgTextColor={organization?.styles?.textMenu}
                      />
                    )}
                  </Col>
                )}

                <Col style={{ width: '100%' }}>
                  {/* Lista de eventos próximos */}
                  <NextEvents events={events} />
                </Col>

                <Col style={{ width: '100%' }}>
                  <PassEvents
                    eventsOld={eventsOld}
                    havePaymentEvent={havePaymentEvent}
                    isUserRegisterInEvent={isUserRegisterInEvent}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {/* FOOTER */}
          {organization !== null && (
            <div style={{ width: '100%', maxHeight: '350px' }}>
              {organization.styles?.banner_footer || '' ? (
                <img
                  style={{ objectFit: 'cover', width: '100%', maxHeight: '250px' }}
                  src={organization.styles?.banner_footer}
                />
              ) : (
                ''
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ width: '100vw', height: '100vh', textAlign: 'center' }}>
          <Loading />
        </div>
      )}
    </div>
  );
}
export default withRouter(EventOrganization);
