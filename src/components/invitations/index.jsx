import { Fragment, useState } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import InvitedUsers from './eventUsersList';
import CreateMessage from './send';
import ImportUsers from '../import-users/importUser';

// function Tabla(props) {
//   const [guests, setGuests] = useState([]);

//   const columns = [
//     {
//       Header: "Email",
//       accessor: "email" // accessor is the "key" in the data
//     },
//     {
//       Header: "Names",
//       accessor: "names"
//     }
//   ];

//   useEffect(() => {
//

//     async function fetchData(props) {
//       const guestsResult = await UsersApi.getAll(
//         props.event._id,
//         "?pageSize=1000"
//       );
//       setGuests(guestsResult.data);
//
//     }
//     fetchData(props);
//   }, []);

//   return <EviusTable columns={columns} data={guests} />;
// }

function ListaInvitados({ ...props }) {
  const { eventId, event, match } = props;

  const [guestSelected, setGuestSelected] = useState([]);

  return (
    <Fragment>
      {/* <Tabla {...props} /> */}
      {/* <h1 style={{ color: "red" }}> ***TODO Esta sección falta hacerla. los usuarios invitados deben quedar en su propio modelo de personas invitadas.
      Cuando confirmen inscribiendose si es un evento gratis,
      o pagando si es un evento pago pasan a asistentes(eventUsers)
      </h1> */}

      <Switch>
        <Route
          exact
          path={`${match.url}/`}
          render={() => (
            <InvitedUsers event={event} eventID={eventId} matchUrl={match.url} setGuestSelected={setGuestSelected} />
          )}
        />
        <Route
          exact
          path={`${match.url}/createmessage`}
          render={() => (
            <CreateMessage event={event} eventID={eventId} matchUrl={match.url} selection={guestSelected} />
          )}
        />

        <Route
          exact
          path={`${match.url}/importar-excel`}
          render={() => (
            <ImportUsers extraFields={event.user_properties} eventId={eventId} event={event} matchUrl={match.url} />
          )}
        />
      </Switch>
    </Fragment>
  );
}

export default withRouter(ListaInvitados);
