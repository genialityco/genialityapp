import React, {Component} from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from "react-redux";
import Moment from "moment"
import momentLocalizer from 'react-widgets-moment';
import LoadingEvent from "../loaders/loadevent";
import EventCard from "../shared/eventCard";
import { EventsApi } from "../../helpers/request";
import API from "../../helpers/request";
import LogOut from "../shared/logOut";
import ErrorServe from "../modal/serverError";
Moment.locale('es');
momentLocalizer();

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            events:[],
            tabEvt:true,
            tabEvtType:true,
            tabEvtCat: true,
            loadingState: false,
            timeout: false,
            serverError: false,
            errorData: {}
        };
        //this.loadMoreItems = this.loadMoreItems.bind(this);
    }

    async componentDidMount() {
        try{
            const resp = await EventsApi.getPublic('?pageSize=30');
            console.log(resp);
            this.setState({events:resp.data,loading:false,current_page:resp.meta.current_page,total:resp.meta.total});
            /*this.refs.iScroll.addEventListener("scroll", () => {
                if (this.refs.iScroll.scrollTop + this.refs.iScroll.clientHeight >= this.refs.iScroll.scrollHeight - 20){
                    this.loadMoreItems();
                }
            });*/
        }
        catch (error) {
            // Error
            if (error.response) {
                console.log(error.response);
                const {status} = error.response;
                if(status === 401) this.setState({timeout:true,loader:false});
                else this.setState({serverError:true,loader:false})
            } else {
                console.log('Error', error.message);
                if(error.request) console.log(error.request);
                this.setState({serverError:true,loader:false})
            }
            console.log(error.config);
        }
    }

    componentWillReceiveProps(nextProps){
        const search = nextProps.location.search;
        const params = new URLSearchParams(search);
        const type = params.get('type');
        const category = params.get('category');
        let query = '?';
        let queryFilter = [];
        if(type){
            queryFilter.push({"id":"event_type_id","value":type,"comparator":"like"})
        }
        if(category){
            queryFilter.push({"id":"category_ids","value":category,"comparator":"like"})
        }
        queryFilter = JSON.stringify(queryFilter);
        query = query+`filtered=${queryFilter}`;
        this.setState({loading:true});
        API.get(`/api/events${query}`)
            .then(({data})=>{
            console.log(data);
            this.setState({events:data.data,loading:false,type,category});
        })
            .catch(error => {
                if (error.response) {
                    console.log(error.response);
                    const {status,data:{message}} = error.response;
                    console.log('STATUS',status,status === 401);
                    if(status === 401) this.setState({timeout:true,loader:false});
                    else this.setState({serverError:true,loader:false,errorData:{status,message}})
                } else {
                    let errorData = {message:error.message};
                    console.log('Error', error.message);
                    if(error.request) {
                        console.log(error.request);
                        errorData = error.request
                    };
                    errorData.status = 708;
                    this.setState({serverError:true,loader:false,errorData})
                }
                console.log(error.config);
            });
    }

    /*async loadMoreItems() {
        if(!this.state.loadingState && this.state.events.length<this.state.total){
            this.setState({ loadingState: true });
            try{
                const resp = await EventsApi.getPublic(`?pageSize=6&page=${this.state.current_page+1}`);
                let listEvents = [...this.state.events];
                resp.data.map(event => {return listEvents.push(event)});
                this.setState({ events: listEvents, loadingState: false, current_page:resp.meta.current_page });
            }catch (e) {

            }
        }
    }*/

    render() {
        const {category,type,timeout, serverError, errorData} = this.state;
        const {match,categories,types} = this.props;
        return (
            <React.Fragment>
                <div className="filter-bar column is-3 is-offset-9">
                    <div className="buttons is-right has-text-weight-bold">
                        <p className="control">
                            <a className="button is-white has-text-grey-light">
                                <span className="icon is-small"><i className="fas fa-map-marker-alt"></i></span>
                                <span>Ciudad</span>
                            </a>
                        </p>
                        <p className="control">
                            <a className="button is-white has-text-grey-light">
                                <span className="icon is-small"><i className="fas fa-calendar-alt"></i></span>
                                <span>Fecha</span>
                            </a>
                        </p>
                    </div>
                </div>
                <div className="columns">
                    <aside className="column menu aside is-2 has-text-weight-bold is-hidden-mobile">
                        <p className="menu-label has-text-grey-dark has-text-centered-mobile" onClick={(e)=>{this.setState({tabEvt:!this.state.tabEvt})}}>
                            <span>Eventos</span>
                            <span className="icon">
                                <i className={`${this.state.tabEvt?'up':'down'}`}/>
                            </span>
                        </p>
                        {
                            this.state.tabEvt && (
                                <ul className="menu-list">
                                    <li><a className="is-size-6 has-text-grey-light">Lo mas nuevo</a></li>
                                    {/*<li><a className="is-size-6 has-text-grey-light">Destacados</a></li>
                                    <li><a className="is-size-6 has-text-grey-light">Recomendados</a></li>*/}
                                </ul>
                            )
                        }
                        <hr className="navbar-divider"/>
                        <p className="menu-label has-text-grey-dark has-text-centered-mobile" onClick={(e)=>{this.setState({tabEvtType:!this.state.tabEvtType})}}>
                            <span>Tipo de Evento</span>
                            <span className="icon">
                                <i className={`${this.state.tabEvtType?'up':'down'}`}/>
                            </span>
                        </p>
                        {
                            this.state.tabEvtType && (
                                <ul className="menu-list">
                                    {
                                        types.map((item,key)=>{
                                            return <li key={key}>
                                                <Link className={`has-text-grey-light is-size-6 ${type===item.value?'active':''}`}
                                                    to={`${match.url}?type=${item.value}`}>
                                                    {item.label}
                                                </Link>
                                            </li>
                                        })
                                    }
                                </ul>
                            )
                        }
                        <hr className="navbar-divider"/>
                        <p className="menu-label has-text-grey-dark has-text-centered-mobile" onClick={(e)=>{this.setState({tabEvtCat:!this.state.tabEvtCat})}}>
                            <span>Categoría</span>
                            <span className="icon">
                                <i className={`${this.state.tabEvtCat?'up':'down'}`}/>
                            </span>
                        </p>
                        {
                            this.state.tabEvtCat && (
                                <ul className="menu-list">
                                    {
                                        categories.map((item,key)=>{
                                            return <li key={key}>
                                                <Link className={`has-text-grey-light is-size-6 ${category===item.value?'active':''}`}
                                                    to={`${match.url}?category=${item.value}`}>
                                                    {item.label}
                                                </Link>
                                            </li>
                                        })
                                    }
                                </ul>
                            )
                        }
                    </aside>
                    <section className="home column is-10">
                        <div className="dynamic-content">
                            {
                                this.state.events.length<=0 ? <LoadingEvent/> :
                                    <div className="columns home is-multiline">
                                        {
                                            this.state.events.map((event,key)=>{
                                                return <EventCard key={event._id} event={event}
                                                                  action={{name:'Ver',url:`landing/${event._id}`}}
                                                                  size={'column is-one-third'}
                                                                  right={<div className="actions">
                                                                      <p className="is-size-7">
                                                                                    <span className="icon is-small has-text-grey">
                                                                                        <i className="fas fa-share"/>
                                                                                    </span>
                                                                          <span>Compartir</span>
                                                                      </p>
                                                                      <p className="is-size-7">
                                                                                    <span className="icon is-small has-text-grey">
                                                                                        <i className="fas fa-check"/>
                                                                                    </span>
                                                                          <span>Asistiré</span>
                                                                      </p>
                                                                      <p className="is-size-7">
                                                                                    <span className="icon is-small has-text-grey">
                                                                                        <i className="fas fa-heart"/>
                                                                                    </span>
                                                                          <span>Me interesa</span>
                                                                      </p>
                                                                  </div>}
                                                />
                                            })
                                        }
                                    </div>
                            }
                        </div>
                    </section>
                </div>
                {timeout&&(<LogOut/>)}
                {serverError&&(<ErrorServe errorData={errorData}/>)}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    categories: state.categories.items,
    types: state.types.items,
    error: state.categories.error
});

export default connect(mapStateToProps)(withRouter(Home));