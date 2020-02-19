import React, {Fragment} from 'react';
import {Route, Switch, withRouter} from "react-router-dom";
import Documents from "./documents";
import DocumentsEdit from "./edit";

function DocumentsRoutes({...props}){
    const {event, match} = props;
    return (
        <Fragment>
            <Switch>
                <Route exact path={`${match.url}/`} render={()=><Documents event={event} matchUrl={match.url}/>}/>
                <Route exact path={`${match.url}/upload`} render={()=><DocumentsEdit event={event} matchUrl={match.url}/>}/>
            </Switch>
        </Fragment>
    );
}

export default withRouter(DocumentsRoutes);
