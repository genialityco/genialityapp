import { getUserByEmail } from "../components/networking/services";
import * as Cookie from 'js-cookie';
import { EventsApi } from "./request";

export const  SendFriendship= async({ eventUserIdReceiver, userName },userActual,event)=> {
    console.log( eventUserIdReceiver, userName ,userActual,event)
    let eventUserId=userActual._id
    console.log(userActual)  
    console.log(event)
      
    let currentUserName = userActual.names || userActual.email;
    let currentUser = Cookie.get('evius_token');

    if (currentUser) {
      // Se valida si el usuario esta suscrito al evento
      if (eventUserId) {
        // Se usan los EventUserId
        const data = {
          id_user_requested: eventUserId,
          id_user_requesting: eventUserIdReceiver,
          user_name_requested: currentUserName,
          user_name_requesting: userName,
          event_id: event._id,
          state: 'send',
        };

        // Se ejecuta el servicio del api de evius
        try {
          var respInvitation = await EventsApi.sendInvitation(event._id, data);         
          return respInvitation;
        } catch (err) {
          let { data } = err.response;
         return null;
        }
      } else {
       return null;
      }
    } else {
        return null;
    }
  }

  export const  loadDataUser = async (user,event) => {
    const resp = await getUserByEmail(user, event._id);
    return resp;
  };

/* SUCCESS
 notification.open({
    message: 'Solicitud enviada',
    description:
      'Le llegará un correo a la persona notificandole la solicitud, quién la aceptara o recharaza. Una vez la haya aceptado te llegará un correo confirmando y podrás regresar a esta misma sección en mis contactos a ver la información completa del nuevo contacto.',
    icon: <SmileOutlined style={{ color: '#108ee9' }} />,
    duration: 30,
  });

   message.warning('Para enviar la solicitud es necesario iniciar sesión');*/