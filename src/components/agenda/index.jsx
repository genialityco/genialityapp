import React, {Fragment} from 'react';
import {Route, Switch, withRouter} from "react-router-dom";
import Agenda from "./agenda";
import AgendaEdit from "./edit";

function AgendaRoutes({...props}){
    const {event, match} = props;
    return (
        <Fragment>
            <Switch>
                <Route exact path={`${match.url}/`} render={()=><Agenda event={event} matchUrl={match.url}/>}/>
                <Route exact path={`${match.url}/actividad`} render={()=><AgendaEdit event={event} matchUrl={match.url}/>}/>
            </Switch>
        </Fragment>
    );
}

export default withRouter(AgendaRoutes);
