import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import Moment from "moment"
import momentLocalizer from 'react-widgets-moment';
import { EventsApi } from "../../helpers/request";
import Loading from "../loaders/loading";
Moment.locale('es');
momentLocalizer();

class Landing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true
        }
    }

    async componentDidMount() {
        const queryParamsString = this.props.location.search.substring(1), // remove the "?" at the start
            searchParams = new URLSearchParams( queryParamsString ),
            attendee = searchParams.get("attendee"),
            status = searchParams.get("status");
        if(status === '5b859ed02039276ce2b996f0'){
            this.setState({showConfirm:true})
        }
        const id = this.props.match.params.event;
        const event = await EventsApi.landingEvent(id);
        console.log(event);
        const dateFrom = event.datetime_from.split(' ');
        const dateTo = event.datetime_to.split(' ');
        event.hour_start = Moment(dateFrom[1], 'HH:mm').toDate();
        event.hour_end = Moment(dateTo[1], 'HH:mm').toDate();
        event.date_start = dateFrom[0];
        event.date_end = dateTo[0];
        this.setState({event,loading:false});
    }

    render() {
        const { event } = this.state;
        return (
            <section className="section hero landing">
                {
                    this.state.showConfirm && (
                        <div className="notification is-success">
                            <button className="delete" onClick={(e)=>{this.setState({showConfirm:false})}}/>
                            Tu asistencia ha sido confirmada
                        </div>
                    )
                }
                <div className="hero-head">
                    <div className="columns is-gapless">
                        <div className="column is-4 info">
                            {
                                this.state.loading?<Loading/>:
                                    <React.Fragment>
                                        <div className="item columns fecha">
                                            <div className="column fecha-uno">
                                                <span className="title is-size-4">{Moment(event.date_start).format('DD MMM,YY')}</span>
                                                <br/>
                                                <span>Desde {Moment(event.hour_start).format('HH:mm')}</span>
                                            </div>
                                            <div className="column">
                                                <span className="title is-size-4">{Moment(event.date_end).format('DD MMM,YY')}</span>
                                                <br/>
                                                <span>Hasta {Moment(event.hour_end).format('HH:mm')}</span>
                                            </div>
                                        </div>
                                        <div className="columns item">
                                            <div className="columns">
                                                <div className="column is-one-fifth">
                                       <span className="icon is-large has-text-grey">
                                           <i className="fas fa-map-marker-alt fa-2x"/>
                                       </span>
                                                </div>
                                                <div className="column">
                                                    <p className="subtitle is-pulled-left has-text-grey-darker has-text-weight-bold">{event.location.FormattedAddress}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <p className="title has-text-grey-darker has-text-weight-bold">{event.name}</p>
                                            Por: <Link to={`/page/${event.organizer_id}?type=${event.organizer_type}`}>{event.organizer.name?event.organizer.name:event.organizer.email}</Link>
                                        </div>
                                        <div className="item is-italic">
                                            {
                                                event.description.length >= 80 ?
                                                event.description.substring(0,80)+'...':
                                                event.description
                                            }
                                        </div>
                                        <div className="item">
                                            <p className="subtitle has-text-grey-darker has-text-weight-bold">150/400</p>
                                            Aforo
                                        </div>
                                        {
                                            (event.description.length >= 80 && !this.state.showFull) && (
                                                <div className="item">
                                                    <div className="columns is-mobile">
                                                        <div className="column is-4 is-offset-8">
                                                            <div className="fab-button has-text-weight-bold"
                                                                 onClick={(e)=>{this.setState({showFull:true})}}>
                                                                <span className="is-size-3">+</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </React.Fragment>
                            }
                        </div>
                        <div className="column">
                            <figure className="image is-3by2">
                                <img src={this.state.loading?"https://bulma.io/images/placeholders/1280x960.png":event.picture} alt="Evius.co"/>
                            </figure>
                        </div>
                    </div>
                    {
                        this.state.showFull && (
                            <div className="info show-full is-hidden-mobile">
                                <div className="item is-italic">
                                    <p>{event.description}</p>
                                </div>
                                <div className="item">
                                    <div className="columns is-mobile">
                                        <div className="column is-4 is-offset-8">
                                            <div className="fab-button has-text-weight-bold"
                                                 onClick={(e)=>{this.setState({showFull:false})}}>
                                                <span className="is-size-3">-</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <div className="columns">
                            <div className="column is-7">
                                <div className="has-shadow">
                                    <p>Acciones</p>
                                    <div className="field is-grouped">
                                        <div className="control">
                                            <button className="button is-primary is-small">
                                                <span className="icon">
                                                    <i className="fas fa-share"/>
                                                </span>
                                                <span>Compartir</span>
                                            </button>
                                        </div>
                                        <div className="control">
                                            <button className="button is-text is-small">
                                                <span className="icon">
                                                    <i className="fas fa-check"/>
                                                </span>
                                                <span>Asistiré</span>
                                            </button>
                                        </div>
                                        <div className="control">
                                            <button className="button is-text is-small">
                                                <span className="icon">
                                                    <i className="fas fa-hearth"/>
                                                </span>
                                                <span>Me gusta</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                Mapa
                                {
                                    !this.state.loading&&(
                                        <MyMapComponent
                                            lat={event.location.Latitude} long={event.location.Longitude}
                                            googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                                            loadingElement={<div style={{height: `100%`}}/>}
                                            containerElement={<div style={{height: `400px`}}/>}
                                            mapElement={<div style={{height: `100%`}}/>}
                                        />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const MyMapComponent = withGoogleMap((props) =>
    <GoogleMap
        defaultZoom={12}
        defaultCenter={{ lat: props.lat, lng: props.long }}
    >
        <Marker position={{ lat: props.lat, lng: props.long }} />
    </GoogleMap>
)

export default Landing;