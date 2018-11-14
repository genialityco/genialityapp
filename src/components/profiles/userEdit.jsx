import React, {Component} from 'react';
import { withRouter, Link } from "react-router-dom";
import {Actions, CategoriesApi, EventsApi, UsersApi} from "../../helpers/request";
import Loading from "../loaders/loading";
import EventCard from "../shared/eventCard";
import LogOut from "../shared/logOut";
import ImageInput from "../shared/imageInput";
import {TiArrowLoopOutline} from "react-icons/ti";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from "../modal/twoAction";

class UserEditProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: [],
            events: [],
            user: {},
            loading: true,
            message:{
                class:'',
                content:''
            }
        };
        this.saveForm = this.saveForm.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
    }

    async componentDidMount() {
        let userId = this.props.match.params.id;
        try {
            const categories = await CategoriesApi.getAll();
            const resp = await EventsApi.mine();
            const user = await UsersApi.getProfile(userId,true);
            const tickets = await UsersApi.mineTickets();
            console.log(tickets);
            user.name = (user.name) ? user.name: user.displayName? user.displayName: user.email;
            user.picture = (user.picture) ? user.picture : user.photoUrl ? user.photoUrl : 'https://bulma.io/images/placeholders/128x128.png';
            this.setState({loading:false,user,events:resp.data,categories},this.scrollEvent);
        }catch (e) {
            console.log(e.response);
            this.setState({timeout:true,loading:false});
        }
    }

    scrollEvent = () => {
        const hash = this.props.location.hash;
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                let topOfElement = element.offsetTop + 60;
                window.scrollTo({ top: topOfElement, behavior: "smooth" })
            }
        }
    };

    changeImg = (files) => {
        const file = files[0];
        if(file){
            this.setState({imageFile: file,
                user:{...this.state.user, picture: null}});
            let data = new FormData();
            const url = '/api/files/upload',
                self = this;
            data.append('file',this.state.imageFile);
            Actions.post(url, data)
                .then((image) => {
                    self.setState({
                        user: {
                            ...self.state.user,
                            picture: image
                        },fileMsg:'Image uploaded successfully'
                    });
                    toast.success('Image uploaded successfully');
                })
                .catch (e=> {
                    console.log(e.response);
                    toast.error('Something wrong. Try again later');
                    this.setState({timeout:true,loader:false});
                });
        }
        else{
            this.setState({errImg:'Only images files allowed. Please try again (:'});
        }
    };

    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({user:{...this.state.user,[name]:value}},this.valid)
    };

    async saveForm() {
        const { user } = this.state;
        try {
            const resp = await UsersApi.editProfile(user,user._id);
            console.log(resp);
            toast.success('All changes saved successfully');
        }catch (e) {
            console.log(e.response);
            toast.error('Something wrong. Try again later');
            this.setState({timeout:true,loader:false});
        }
    };

    async deleteEvent() {
        this.setState({isLoading:'Wait....'});
        const result = await EventsApi.deleteOne(this.state.eventId);
        console.log(result);
        if(result.data === "True"){
            this.setState({message:{...this.state.message,class:'msg_success',content:'Evento borrado'},isLoading:false});
            const events = await EventsApi.getAll();
            setTimeout(()=>{
                this.setState({modal:false,events});
            },500)
        }else{
            this.setState({message:{...this.state.message,class:'msg_error',content:'Evento no borrado'},isLoading:false})
        }
    }

    closeModal = () => {
        this.setState({modal:false})
    };

    render() {
        const { loading, timeout, events, user } = this.state;
        return (
            <section className="section profile">
                {
                    loading ? <Loading/> :
                        <div className="container org-profile">
                            <div className="profile-info columns">
                                <div className="column is-4 user-info">
                                    <ImageInput picture={user.picture} imageFile={this.state.imageFile}
                                                divClass={'circle-img'}
                                                content={<div style={{backgroundImage: `url(${user.picture})`}}
                                                              className="avatar-img"/>}
                                                classDrop={'change-img is-size-2'}
                                                contentDrop={<TiArrowLoopOutline className="has-text-white"/>}
                                                contentZone={<figure className="image is-128x128">
                                                    <img className="is-rounded" src="https://bulma.io/images/placeholders/128x128.png" alt={'profileimage'}/>
                                                </figure>} style={{}}
                                                changeImg={this.changeImg}/>
                                    <div className="field">
                                        <label className="label is-size-7 has-text-grey-light">Nombre</label>
                                        <div className="control">
                                            <input className="input" name={"name"} type="text" placeholder="Nombre" value={user.name} onChange={this.handleChange} />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label className="label is-size-7 has-text-grey-light">Correo</label>
                                        <div className="control">
                                            <input className="input" name={"email"} type="email" placeholder="Email" value={user.email} onChange={this.handleChange} />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label className="label is-size-7 has-text-grey-light">Contraseña</label>
                                        <div className="control">
                                            <input className="input" name={"password"} type="password" placeholder="Contraseña" disabled/>
                                        </div>
                                    </div>
                                    <div className="columns is-centered">
                                        <div className="column is-half has-text-centered">
                                            <div className="control field">
                                                <button className="button is-primary" onClick={this.saveForm}>Guardar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="column is-8 user-data userData">
                                    <h1 className="title has-text-primary">Datos</h1>
                                    <div className="columns is-9">
                                        <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Cédula</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"cedula"} type="text" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div>
                                        <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Dirección</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"direccion"} type="text" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="columns is-9">
                                        <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Celular</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"celular"} type="num" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div>
                                        <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Empresa</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"empresa"} type="text" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="columns is-9">
                                        <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Fecha de nacimiento</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"nacimiento"} type="text" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div>
                                        <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Intereses</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"intereses"} type="text" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="columns is-9">
                                        <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Ciudad / País</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"ciudad"} type="text" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div>
                                        {/* <div className="field column">
                                            <label className="label is-size-7 has-text-grey-light">Proceso</label>
                                            <div className="control">
                                                <input className="input has-text-weight-bold" name={"proceso"} type="text" placeholder="Proximamente" disabled/>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="profile-data columns" id={'events'}>
                                <div className="column is-8">
                                    <h2>
                                        <small className="is-italic has-text-grey-light has-text-weight-300">Tus</small><br/>
                                        <span className="has-text-grey-dark is-size-3">Eventos</span>
                                    </h2>
                                    <div className="columns home is-multiline is-mobile">
                                        {
                                            events.map((event,key)=>{
                                                return <EventCard event={event} key={event._id} action={''} size={'column is-half'} right={
                                                    <div className="edit">
                                                        <Link className="button-edit has-text-grey-light" to={`/event/${event._id}`}>
                                                                <span className="icon is-medium">
                                                                    <i className="fas fa-lg fa-pencil-alt"/>
                                                                </span>
                                                            <span className="is-size-7 is-italic">Editar</span>
                                                        </Link>
                                                    </div>
                                                }
                                                />
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="column is-4">
                                    <h2 className="data-title">
                                        <small className="is-italic has-text-grey-light has-text-weight-300">Tus</small><br/>
                                        <span className="has-text-grey-dark is-size-3">Tickets</span>
                                    </h2>
                                    <div className="tickets soon"></div>
                                </div>
                            </div>
                        </div>
                }
                {
                    timeout&&(<LogOut/>)
                }
                <Dialog modal={this.state.modal} title={'Borrar Evento'}
                        content={<p>Seguro de borrar este evento?</p>}
                        first={{title:'Borrar',class:'is-dark has-text-danger',action:this.deleteEvent}}
                        message={this.state.message} isLoading={this.state.isLoading}
                        second={{title:'Cancelar',class:'',action:this.closeModal}}/>
            </section>
        );
    }
}

export default withRouter(UserEditProfile);