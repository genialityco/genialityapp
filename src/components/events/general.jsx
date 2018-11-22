import React, {Component} from 'react';
import Moment from "moment"
import ImageInput from "../shared/imageInput";
import {Actions, CategoriesApi, EventsApi, OrganizationApi, TypesApi} from "../../helpers/request";
import FormEvent from "../shared/formEvent";
import {AuthUrl, BaseUrl} from "../../helpers/constants";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-widgets/lib/scss/react-widgets.scss'
import ErrorServe from "../modal/serverError";
import Dialog from "../modal/twoAction";
import * as Cookie from "js-cookie";
import {FormattedMessage} from "react-intl";
Moment.locale('es');

class General extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event : this.props.event,
            selectedOption: [],
            selectedOrganizer: {},
            selectedType: {},
            error: {},
            minDate: new Date(),
            valid: !this.props.event._id
        };
        this.submit = this.submit.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
    }

    async componentDidMount(){
        console.log(this.props);
        try{
            const {event} = this.state;
            const categories = await CategoriesApi.getAll();
            const types = await TypesApi.getAll();
            let organizers = await OrganizationApi.mine();
            organizers.unshift({id:'me',name: <FormattedMessage id="event.me" defaultMessage="Yo Mismo"/>});
            organizers = organizers.map(item=>{
                return {value:item.id,label:item.name}
            });
            const {selectedCategories,selectedOrganizer,selectedType} = handleFields(organizers,types,categories,event);
            this.setState({categories,organizers,types,selectedCategories,selectedOrganizer,selectedType})
        }catch (error) {
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

    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({event:{...this.state.event,[name]:value}},this.valid)
    };

    valid = () => {
        const error = {};
        const {event, selectedOrganizer, selectedType, selectedCategories} = this.state,
            valid = (event.name.length>0 && event.description.length>0 && !!event.location.PlaceId && !!selectedOrganizer && !!selectedType && selectedCategories.length>0);
        if(!event.location.FormattedAddress && !event.location.PlaceId){
            error.location = 'Fill a correct address'
        }
        this.setState({valid:!valid,error})
    };

    selectCategory = (selectedCategories) => {
        this.setState({ selectedCategories }, this.valid);
    };

    selectOrganizer = (selectedOrganizer) => {
        if(!selectedOrganizer.value) selectedOrganizer = undefined;
        this.setState({ selectedOrganizer }, this.valid);
    };

    selectType = (selectedType) => {
        if(!selectedType.value) selectedType = undefined;
        this.setState({ selectedType }, this.valid);
    };

    changeDate=(value,name)=>{
        let {event:{date_end}} = this.state;
        if(name === 'date_start') {
            const diff = Moment(value).diff(Moment(date_end),'days');
            if(diff >= 0) date_end = Moment(date_end).add(diff, 'days').toDate();
            this.setState({minDate:value,event:{...this.state.event,date_end:date_end,date_start:value}});
        }else this.setState({event:{...this.state.event,[name]:value}})
    };

    changeImg = (files) => {
        const file = files[0];
        if(file){
            this.setState({imageFile: file,
                event:{...this.state.event, picture: null}});
            let data = new FormData();
            const url = '/api/files/upload',
                self = this;
            data.append('file',this.state.imageFile);
            Actions.post(url, data)
                .then((image) => {
                    self.setState({
                        event: {
                            ...self.state.event,
                            picture: image
                        },fileMsg:'Imagen subida con exito',imageFile:null
                    });
                    toast.success(<FormattedMessage id="toast.img" defaultMessage="Ok!"/>);
                })
                .catch (e=> {
                    console.log(e.response);
                    toast.error(<FormattedMessage id="toast.error" defaultMessage="Sry :("/>);
                    this.setState({timeout:true,loader:false});
                });
        }
        else{
            this.setState({errImg:'Solo se permiten imágenes. Intentalo de nuevo'});
        }
    };

    async submit(e) {
        e.preventDefault();
        e.stopPropagation();
        const { event } = this.state;
        const self = this;
        this.setState({loading:true});
        const hour_start = Moment(event.hour_start).format('HH:mm');
        const date_start = Moment(event.date_start).format('YYYY-MM-DD');
        const hour_end = Moment(event.hour_end).format('HH:mm');
        const date_end = Moment(event.date_end).format('YYYY-MM-DD');
        const datetime_from = Moment(date_start+' '+hour_start, 'YYYY-MM-DD HH:mm');
        const datetime_to = Moment(date_end+' '+hour_end, 'YYYY-MM-DD HH:mm');
        const categories = this.state.selectedCategories.map(item=>{
            return item.value
        });
        const data = {
            name: event.name,
            datetime_from : datetime_from.format('YYYY-MM-DD HH:mm:ss'),
            datetime_to : datetime_to.format('YYYY-MM-DD HH:mm:ss'),
            picture: event.picture,
            location: event.location,
            visibility: event.visibility?event.visibility:'PUBLIC',
            description: event.description,
            category_ids: categories,
            organizer_id: this.state.selectedOrganizer.value,
            event_type_id : this.state.selectedType.value
        };
        try {
            if(event._id){
                const result = await EventsApi.editOne(data, event._id);
                console.log(result);
                self.setState({loading:false});
                toast.success(<FormattedMessage id="toast.success" defaultMessage="Ok!"/>)
            }
            else{
                const result = await Actions.create('/api/events', data);
                console.log(result);
                this.setState({loading:false});
                if(result._id){
                    window.location.replace(`${BaseUrl}/event/${result._id}`);
                }else{
                    toast.warn(<FormattedMessage id="toast.warning" defaultMessage="Idk"/>);
                    this.setState({msg:'Cant Create',create:false})
                }
            }
        } catch (e) {
            console.log('Some error');
            console.log(e);
            this.setState({timeout:true});
            toast.error(<FormattedMessage id="toast.error" defaultMessage="Sry :("/>)
        }
    }

    onSuggestSelect = (suggest) => {
        if(suggest){
            const place = suggest.gmaps;
            const location = place.geometry && place.geometry.location ? {
                Latitude: place.geometry.location.lat(),
                Longitude: place.geometry.location.lng()
            } : {};
            const componentForm = {
                street_number: 'short_name',
                route: 'long_name',
                locality: 'long_name',
                administrative_area_level_1: 'short_name'
            };
            const mapping = {
                street_number: 'number',
                route: 'street',
                locality: 'city',
                administrative_area_level_1: 'state'
            };
            for (let i = 0; i < place.address_components.length; i++) {
                const addressType = place.address_components[i].types[0];
                if (componentForm[addressType]) {
                    const val = place.address_components[i][componentForm[addressType]];
                    location[mapping[addressType]] = val;
                }
            }
            location.FormattedAddress = place.formatted_address;
            location.PlaceId = place.place_id;
            this.setState({event:{...this.state.event,location}},this.valid)
        }else{
            this.setState({event:{...this.state.event,location:{}}},this.valid)
        }
    };

    changeSuggest = () => {
        const error = {};
        const {event:{location}} = this.state;
        if(!location.FormattedAddress && !location.PlaceId){
            error.location = 'Fill a correct address'
        }
        this.setState({error})
    };


    //Delete event
    async deleteEvent() {
        this.setState({isLoading:'Cargando....'});
        try {
            const result = await EventsApi.deleteOne(this.state.event._id);
            console.log(result);
            if(result.data === "True"){
                this.setState({message:{...this.state.message,class:'msg_success',content:'Evento borrado'},isLoading:false});
                setTimeout(()=>{
                    this.setState({message:{},modal:false});
                    window.location.replace(`${BaseUrl}/`);
                },500)
            }else{
                this.setState({message:{...this.state.message,class:'msg_error',content:'Algo salió mal. Intentalo de nuevo'},isLoading:false})
            }
        }catch (e) {
            Cookie.remove("token");
            Cookie.remove("evius_token");
            window.location.replace(`${AuthUrl}/logout`);
        }
    }

    closeModal = () => {
        this.setState({modal:false,message:{}})
    };

    modalEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({modal:true});
    }

    render() {
        const { event, categories, organizers, types, selectedCategories, selectedOrganizer, selectedType, valid, timeout, error } = this.state;
        return (
            <form className="form event-general" onSubmit={this.submit}>
                <FormEvent event={event} categories={categories} organizers={organizers} types={types} error={error} changeSuggest={this.changeSuggest}
                           selectedCategories={selectedCategories} selectedOrganizer={selectedOrganizer} selectedType={selectedType}
                           imgComp={
                               <div className="field picture">
                                   <label className="label has-text-grey-light">Foto</label>
                                   <div className="control">
                                       <ImageInput picture={event.picture} imageFile={this.state.imageFile}
                                                   divClass={'drop-img'} content={<img src={event.picture} alt={'Imagen Perfil'}/>}
                                                   classDrop={'dropzone'} contentDrop={<button onClick={(e)=>{e.preventDefault()}} className={`button is-primary is-inverted is-outlined ${this.state.imageFile?'is-loading':''}`}>Cambiar foto</button>}
                                                   contentZone={<div className="has-text-grey has-text-weight-bold has-text-centered"><span>Subir foto</span><br/><small>(Tamaño recomendado: 1280px x 960px)</small></div>}
                                                   changeImg={this.changeImg} errImg={this.state.errImg}
                                                   style={{cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 250, width: '100%', borderWidth: 2, borderColor: '#b5b5b5', borderStyle: 'dashed', borderRadius: 10}}/>
                                   </div>
                                   {this.state.fileMsg && (<p className="help is-success">{this.state.fileMsg}</p>)}
                               </div>
                           }
                           handleChange={this.handleChange} minDate={this.state.minDate}
                           selectCategory={this.selectCategory} selectOrganizer={this.selectOrganizer} selectType={this.selectType}
                           changeDate={this.changeDate} onSuggestSelect={this.onSuggestSelect}/>
                <div className="buttons is-left">
                    {
                        this.state.loading? <p>Guardando...</p>
                        :<button type={"submit"} className={`button is-primary`} disabled={valid}>Guardar</button>
                    }
                    {
                        event._id && <button className="button is-outlined is-danger" onClick={this.modalEvent}>
                            Eliminar evento
                        </button>
                    }
                </div>
                {timeout&&(<ErrorServe/>)}
                <Dialog modal={this.state.modal} title={'Borrar Evento'}
                        content={<p>¿Estas seguro de eliminar este evento?</p>}
                        first={{title:'Borrar',class:'is-dark has-text-danger',action:this.deleteEvent}}
                        message={this.state.message} isLoading={this.state.isLoading}
                        second={{title:'Cancelar',class:'',action:this.closeModal}}/>
            </form>
        );
    }
}

const handleFields = (organizers,types,categories,event) =>{
    let selectedOrganizer = {};
    let selectedCategories = [];
    let selectedType = {};
    const {category_ids,organizer_type,organizer_id,event_type_id} = event;
    if(category_ids){
        categories.map(item=>{
            let pos = category_ids.indexOf(item.value);
            if(pos>=0){ return selectedCategories.push(item)}
        });
    }
    if(organizer_type==='App\\User'){
        selectedOrganizer = {value:'me',label:'Me'};
    }else{
        const pos = organizers.map((e) => { return e.value; }).indexOf(organizer_id);
        selectedOrganizer = organizers[pos];
    }
    if(event_type_id){
        const pos = types.map((e) => { return e.value; }).indexOf(event_type_id);
        selectedType = types[pos];
    }else selectedType = undefined;
    return {selectedOrganizer,selectedCategories,selectedType}
}

export default General;