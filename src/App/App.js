import React, { Component } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import * as Cookie from "js-cookie";
import { parseUrl } from "../helpers/constants";

import Header from "../containers/header";
import ContentContainer from "../containers/content";
import Footer from "../containers/footer";
import privateInstance, {Actions} from "../helpers/request";


class App extends Component {
    componentWillMount() {
        let dataUrl = parseUrl(document.URL);
        if (dataUrl && dataUrl.token) {
            console.log(dataUrl);
            if (dataUrl.token){
                Cookie.set("evius_token", dataUrl.token);
                privateInstance.defaults.params = {};
                privateInstance.defaults.params['evius_token'] = dataUrl.token;
            }
            if(dataUrl.refresh_token){
                Actions.put('/api/me/storeRefreshToken',{refresh_token:dataUrl.refresh_token})
                    .then(resp=>{
                        console.log(resp);
                    })
            }
        }
    }
    render() {
        return (
        <Router>
            <div>
                <Header/>
                <ContentContainer/>
                <Footer/>
            </div>
        </Router>
        );
    }
}

export default App;
