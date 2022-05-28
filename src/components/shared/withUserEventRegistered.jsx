import { useEffect, useState } from 'react';
import { Alert } from 'antd';

function WithUserEventRegistered(Component) {
  return function WihLoadingComponent(props) {
    let [currentUser, setCurrentUser] = useState(null);
    let [usuarioRegistrado, setUsuarioRegistrado] = useState(null);
    let [event, setEvent] = useState(null);

    useEffect(() => {
      (async () => {
        try {
          setCurrentUser(props.currentUser);
          setUsuarioRegistrado(props.usuarioRegistrado);
          setEvent(props.event);
        } catch (e) {
          e;
        }
      })();
    }, [props.usuarioRegistrado]);

    return (
      <div>
        {!currentUser && !usuarioRegistrado && (
          <div>
            {/* <Tag color="geekblue">{event && event.allow_register ? "El Curso permite registro" : "Es Curso Privado"}</Tag>
                        <Tag color="geekblue">{currentUser ? "Usuario Autenticado" : "Usuario Anónimo"}</Tag>
                <Tag color="geekblue">{usuarioRegistrado ? "Usuario Registrado" : "Usuario sin Registrar"}</Tag> */}

            {!currentUser && event && !event.allow_register && (
              <Alert
                //onClick={() => (window.location.href = "https://eviusauth.netlify.com")}
                message='Curso restringido. requiere usuario'
                description={
                  <p>
                    <b>Curso Restringido:</b>
                    debes estar previamente registrado al curso para acceder al espacio en vivo, si estas registrado en
                    el curso ingresa al sistema con tu usuario para poder acceder al curso, &nbsp;&nbsp;
                    {/* <Button type="primary">
                                            <a href={AuthUrl}>Ir a Ingreso</a>
                                        </Button> */}
                  </p>
                }
                type='info'
                showIcon
              />
            )}

            {currentUser && !usuarioRegistrado && event && !event.allow_register && (
              <Alert
                message='Curso restringido. requiere registro previo'
                description={
                  <p>
                    <b>Curso Restringido:</b>
                    debes estar previamente registrado al curso para acceder al espacio en vivo, si estas registrado y
                    no tienes acceso comunicate con el organizador &nbsp;&nbsp;
                  </p>
                }
                type='warning'
                showIcon
              />
            )}
          </div>
        )}

        <Component {...props} event={event} currentUser={currentUser} usuarioRegistrado={usuarioRegistrado} />
      </div>
    );
  };
}
export default WithUserEventRegistered;
