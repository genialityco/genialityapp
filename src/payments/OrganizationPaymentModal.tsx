/* global WidgetCheckout */
import { useEffect, FunctionComponent, useContext, useMemo } from 'react'
import OrganizationPaymentContext from './OrganizationPaymentContext'
import { OrganizationUserType } from '@Utilities/types/OrganizationUserType'
import { StateMessage } from '@context/MessageService'

const publicKey: string = import.meta.env.VITE_WOMPI_DEV_PUB_API_KEY

interface IOrganizationPaymentModalProps {
  organization: any
  organizationUser: OrganizationUserType
}

const calcPrice = (money: number) => Math.round(money) * 100
const lang = 'ES'

const style = `

.waybox-modal.waybox-display-block:before {
  content: "Suscripción 1 año 50.000 COP o 15 USD";
  /* background: blue; */
  display: block;
  /* height: 100px; */
  padding: 0.7em;
  /* position: absolute; */
  font-size: 150%;
  text-align: center;
  font-weight:bold;
}
`

const OrganizationPaymentModal: FunctionComponent<IOrganizationPaymentModalProps> = (
  props,
) => {
  const { organizationUser, organization } = props
  console.log('organizationUser', organizationUser)

  const money = useMemo(
    () => organization?.access_settings?.price || 50000,
    [organization],
  )

  const { paymentStep, dispatch } = useContext(OrganizationPaymentContext)

  const query = useMemo(() => {
    if (!organizationUser) return

    const params = {
      finish: 'true',
      payment_event: 'true',
      user_id: organizationUser.account_id,
      'assigned_to.names': organizationUser.user.names,
      'assigned_to.email': organizationUser.user.email,
      lang,
    }
    return new URLSearchParams(params)
  }, [organizationUser])

  const redirectUrl = useMemo(() => {
    if (!query || !organization) return

    return encodeURI(
      `http://${window.location.host}/paid-organization/${
        organization._id
      }?${query.toString()}`,
    )
  }, [query, organization])

  const checkout = useMemo(() => {
    if (!redirectUrl || !organizationUser) return

    const moreCustomData: any = {}
    organizationUser.properties =
      typeof organizationUser.properties === 'undefined'
        ? {}
        : organizationUser.properties
    if (organizationUser.properties.phone) {
      moreCustomData.phoneNumber = organizationUser.properties.phone
      moreCustomData.phoneNumberPrefix = '+57'
    }
    if (organizationUser.properties.ID) {
      moreCustomData.legalId = organizationUser.properties.ID
      moreCustomData.legalIdType = 'CC'
    }

    console.log('moreCustomData:', moreCustomData)
    /// @ts-ignore
    /// WIDGET de WOMPI viene importado de forma global
    return new WidgetCheckout({
      currency: 'COP',
      amountInCents: calcPrice(money),
      name: 'Monthly rent - Wompi Tower Apartments', // Payment link name
      description: 'Pay here your apartment monthly rent',
      reference: `${new Date().getTime()}-${organization._id}-${
        organizationUser.account_id
      }`,
      publicKey: publicKey,
      redirectUrl,
      customerData: {
        email: organizationUser.user.email,
        fullName: organizationUser.user.names,
        ...moreCustomData,
      },
    })
  }, [redirectUrl, organizationUser, money])

  useEffect(() => {
    if (paymentStep == 'DISPLAYING_PAYMENT') {
      //alert('pago', checkout)
      if (!checkout) return

      dispatch({ type: 'ABORT' })

      checkout.open(async (result: any) => {
        console.debug('payment member', { organizationUser, result })

        if (result.transaction.status == 'APPROVED') {
          console.log('paid')
          dispatch({
            type: 'DISPLAY_SUCCESS',
            result: result.transaction,
          })
        } else {
          dispatch({ type: 'ABORT' })
          StateMessage.show(null, 'error', 'No se pudo realizar el pago')
        }
      })
    }
  }, [paymentStep, checkout])

  return (
    <>
      <style>{style}</style>
    </>
  )
}

export default OrganizationPaymentModal