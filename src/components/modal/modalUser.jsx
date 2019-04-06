import React, {Component} from 'react';
import {app,firestore} from "../../helpers/firebase";
import { toast } from 'react-toastify';
import Dialog from "./twoAction";
import {FormattedDate, FormattedMessage, FormattedTime} from "react-intl";
import QRCode from 'qrcode.react';
import {BadgeApi} from "../../helpers/request";
import {icon} from "../../helpers/constants";
import {Redirect} from "react-router-dom";

class UserModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statesList: [],
            message: {},
            user: {},
            state: "",
            prevState: "",
            userId: "mocionsoft",
            emailError:false,
            found: 0,
            newCC: 0,
            confirmCheck:true,
            valid: true,
            checked_in: false,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.printUser = this.printUser.bind(this);
    }

    componentDidMount() {
        const self = this;
        console.log(this.props);
        const {states} = this.props;
        self.setState({ statesList: states, state: states[1].value });
        if (this.props.edit) {
            const {value} = this.props;
            let user = {};
            Object.keys(value.properties)
                .map((obj) => {
                    return user[obj] = value.properties[obj];
                });
            let checked_in = (value.checked_in && value.checked_at) ? value.checked_at.toDate() : false;
            this.setState({user, state:value.state_id, edit:true, checked_in, userId:value._id, prevState: value.state_id});
        }
    }

    componentWillUnmount(){
        this.setState({user:{},edit:false});
    }

    async handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        const snap = {
            properties: this.state.user,
            state_id: this.state.state,
        };
        const self = this;
        let message = {};
        this.setState({create:true});
        const userRef = firestore.collection(`${this.props.eventId}_event_attendees`);
        if(!this.state.edit){
            snap.updated_at = new Date();
            snap.checked_in = false;
            snap.created_at = new Date();
            if(this.state.confirmCheck) {
                snap.checked_in = true;
                snap.checked_at = new Date();
            }
            console.log(snap);
            userRef.add(snap)
                .then(docRef => {
                    console.log("Document written with ID: ", docRef.id);
                    self.setState({userId:docRef.id});
                    message.class = 'msg_success';
                    message.content = 'USER CREATED';
                    toast.success(<FormattedMessage id="toast.user_saved" defaultMessage="Ok!"/>);
                })
                .catch(error => {
                    console.error("Error adding document: ", error);
                    message.class = 'msg_danger';
                    message.content = 'User can`t be created';
                });
        }
        else{
            message.class = 'msg_warning';
            message.content = 'USER UPDATED';
            if(snap.state_id !== this.state.prevState) this.props.statesCounter(snap.state_id,this.state.prevState);
            snap.updated_at = new Date();
            userRef.doc(this.state.userId).update(snap)
                .then(() => {
                    console.log("Document successfully updated!");
                    message.class = 'msg_warning';
                    message.content = 'USER UPDATED';
                    toast.info(<FormattedMessage id="toast.user_edited" defaultMessage="Ok!"/>);
                })
                .catch(error => {
                    console.error("Error updating document: ", error);
                    message.class = 'msg_danger';
                    message.content = 'User can`t be updated';
                });
        }
        if(this.state.edit){
            setTimeout(()=>{
                self.closeModal();
            },800);
        }else{
            this.setState({edit:true})
        }
        this.setState({message,create:false});
    }

    async printUser() {
        const resp = await BadgeApi.get(this.props.eventId);
        const {user} = this.state;
        const canvas = document.getElementsByTagName('CANVAS')[0];
        let qr = canvas ? canvas.toDataURL() : '';
        //if(this.props.value) this.props.checkIn(this.props.value);
        console.log(resp);
        if(resp._id){
            let oIframe = this.refs.ifrmPrint;
            let badge = resp.BadgeFields;
            let oDoc = (oIframe.contentWindow || oIframe.contentDocument);
            if (oDoc.document) {
                oDoc = oDoc.document
            }
            // Head
            oDoc.write('<head><title>Escarapela</title>');
            //oDoc.write('<link href="https://fonts.googleapis.com/css?family=Lato:700|Oswald" rel="stylesheet"></head>');
            // body
            oDoc.write('<body onload="window.print()"><div>');
            // Datos
            let i = 0;
            for(;i<badge.length;){
                if(badge[i].line){
                    if(badge[i].qr) oDoc.write(`<div><img src=${qr}></div>`);
                    else oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i].size}px;text-transform: uppercase">${user[badge[i].id_properties.value]?user[badge[i].id_properties.value]:user[badge[i].id_properties.label]?user[badge[i].id_properties.label]:''}</p>`);
                    i++
                }else{
                    if(badge[i+1]&&!badge[i+1].line){
                        oDoc.write(`<div style="display: flex">`);
                        if(!badge[i].qr){
                            oDoc.write(`<div style="margin-right: 20px">`);
                            oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i].size}px;text-transform: uppercase">${user[badge[i].id_properties.value]?user[badge[i].id_properties.value]:user[badge[i].id_properties.label]?user[badge[i].id_properties.label]:''}</p>`);
                            oDoc.write(`</div>`);
                        }else{
                            oDoc.write(`<div style="margin-right: 20px">`);
                            oDoc.write(`<div><img src=${qr}></div>`);
                            oDoc.write(`</div>`);
                        }
                        if(!badge[i+1].qr){
                            oDoc.write(`<div style="margin-right: 20px">`);
                            oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i+1].size}px;text-transform: uppercase">${user[badge[i+1].id_properties.value]?user[badge[i+1].id_properties.value]:user[badge[i+1].id_properties.label]?user[badge[i+1].id_properties.label]:''}</p>`);
                            oDoc.write(`</div>`);
                        }else{
                            oDoc.write(`<div style="margin-right: 20px">`);
                            oDoc.write(`<div><img src=${qr}></div>`);
                            oDoc.write(`</div>`);
                        }
                        oDoc.write(`</div>`);
                        i = i + 2;
                    } else {
                        oDoc.write(`<div style="display: flex">`);
                        oDoc.write(`<div style="margin-right: 20px">`);
                        if(!badge[i].qr){
                            oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i].size}px;text-transform: uppercase">${user[badge[i].id_properties.value]?user[badge[i].id_properties.value]:user[badge[i].id_properties.label]?user[badge[i].id_properties.label]:''}</p>`)
                        }else{
                            oDoc.write(`<div><img src=${qr}></div>`);
                        }
                        oDoc.write(`</div>`);
                        oDoc.write(`</div>`);
                        i++
                    }
                }
            }
            oDoc.close();
        }
        else this.setState({noBadge:true});
    };

    renderForm = () => {
        const {extraFields} = this.props;
        let formUI = extraFields.map((m,key) => {
            let type = m.type || "text";
            let props = m.props || {};
            let name= m.name;
            let mandatory = m.mandatory;
            let target = name;
            let value =  this.state.user[target];
            let input =  <input {...props}
                                className="input"
                                type={type}
                                key={key}
                                name={name}
                                value={value}
                                onChange={(e)=>{this.onChange(e, type)}}
            />;
            if (type == "boolean") {
                input =
                    <React.Fragment>
                        <input
                            name={name}
                            id={name}
                            className="is-checkradio is-primary is-rtl"
                            type="checkbox"
                            checked={value}
                            onChange={(e)=>{this.onChange(e, type)}} />
                        <label className={`label has-text-grey-light is-capitalized ${mandatory?'required':''}`} htmlFor={name}>{name}</label>
                    </React.Fragment>
            }
            if (type == "list") {
                input = m.options.map((o,key) => {
                    return (<option key={key} value={o.value}>{o.value}</option>);
                });
                input = <div className="select">
                    <select name={name} value={value} onChange={(e)=>{this.onChange(e, type)}}>
                        <option value={""}>Seleccione...</option>
                        {input}
                    </select>
                </div>;
            }
            return (
                <div key={'g' + key} className="field">
                    {m.type !== "boolean"&&
                    <label className={`label has-text-grey-light is-capitalized ${mandatory?'required':''}`}
                           key={"l" + key}
                           htmlFor={key}>
                        {name}
                    </label>}
                    <div className="control">
                        {input}
                    </div>
                </div>
            );
        });
        return formUI;
    };

    onChange = (e,type) => {
        const {value,name} = e.target;
        //console.log(`${name} changed ${value} type ${type}`);
        (type === "boolean") ?
            this.setState(prevState=>{return {user:{...this.state.user,[name]: !prevState.user[name]}}}, this.validForm)
            : this.setState({user:{...this.state.user,[name]:value}}, this.validForm);
    };

    selectChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({[name]:value}, this.validForm);
    };

    validForm = () => {
        const EMAIL_REGEX = new RegExp('[^@]+@[^@]+\\.[^@]+');
        const {extraFields} = this.props, {user}= this.state,
            mandatories = extraFields.filter(field => field.mandatory),validations = [];
        mandatories.map((field,key)=>{
            let valid;
            if(field.type === 'email')  valid = user[field.name].length > 5 && user[field.name].length < 61 && EMAIL_REGEX.test(user[field.name]);
            if(field.type === 'text' || field.type === 'list')  valid = user[field.name] && user[field.name].length > 0 && user[field.name] !== "";
            if(field.type === 'number') valid = user[field.name] && user[field.name] >= 0;
            if(field.type === 'boolean') valid = (typeof user[field.name] === "boolean");
            return validations[key] = valid;
        });
        const valid = validations.reduce((sum, next) => sum && next, true);
        this.setState({valid:!valid})
    };

    deleteUser = () => {
        const userRef = firestore.collection(`${this.props.eventId}_event_attendees`);
        const self = this;
        let message = {};
        this.props.statesCounter(null,this.props.value.state_id);
        userRef.doc(this.props.value._id).delete().then(function() {
            console.log("Document successfully deleted!");
            message.class = 'msg_warning';
            message.content = 'USER DELETED';
            toast.info(<FormattedMessage id="toast.user_deleted" defaultMessage="Ok!"/>);
        })
        setTimeout(()=>{
            message.class = message.content = '';
            self.closeModal();
        },500)
    };

    closeModal = () => {
        let message = {class:'',content:''};
        this.setState({user:{}, valid:true, modal:false, uncheck:false, message},this.props.handleModal);
    };

    goBadge = () => {
        this.setState({redirect:true,url_redirect:'/event/'+this.props.eventId+'/badge',noBadge:false})
    };
    closeNoBadge = () => {this.setState({noBadge:false});};

    unCheck = () => {
        //console.log(this.props.value);
        const userRef = firestore.collection(`${this.props.eventId}_event_attendees`).doc(this.props.value._id);
        userRef.update({checked_in:false,checked_at:app.firestore.FieldValue.delete()})
            .then(() => {
                this.setState({uncheck:false})
                this.closeModal()
                console.log("Document successfully updated!");
            })
            .catch(error => {
                console.error("Error updating document: ", error);
            });
    };

    closeUnCheck = () => {
        this.setState({uncheck:false})
    }

    searchCC = () => {
        console.log('searching');
        const usersRef = firestore.collection(`${this.props.eventId}_event_attendees`);
        let value = this.state.newCC;
        let user = {};
        usersRef.where('properties.cedula','==',`${value}`)
            .get()
            .then((querySnapshot)=> {
                if(querySnapshot.empty){
                    this.props.extraFields
                        .map((obj) => {
                            user[obj.name] = obj.type === "boolean" ? false : obj.type === "number" ? 0 : "";
                            if(obj.name === 'cedula') user[obj.name] = value;
                            return user
                        });
                    this.setState({found:1,user,edit:false});
                }
                else{
                    querySnapshot.forEach((doc)=> {
                        console.log(doc.id, " => ", doc.data().properties);
                        user = doc.data().properties;
                        this.setState({user,found:2,disabledFields:true,edit:true,userId:doc.id,valid:false})
                    });
                }
            })
            .catch(error => {
                this.setState({found:0})
                console.log("Error getting documents: ", error);
            });
    };

    changeCC = (e) => {
        const {value} = e.target;
        this.setState({newCC:value.substring(0,10)})
    };

    render() {
        const {user,checked_in,state,statesList,userId,found} = this.state;
        const {modal,edit} = this.props;
        if(this.state.redirect) return (<Redirect to={{pathname: this.state.url_redirect}} />);
        return (
            <React.Fragment>
                <div className={`modal modal-add-user ${modal ? "is-active" : ""}`}>
                    <div className="modal-background"/>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <div className="modal-card-title">
                                <div className="icon-header" dangerouslySetInnerHTML={{ __html: icon }}/>
                            </div>
                            <button className="delete is-large" aria-label="close" onClick={this.props.handleModal}/>
                        </header>
                        <section className="modal-card-body">
                            {
                                (!edit && found===2) ?
                                    <div className="msg"><p className="msg_info has-text-centered is-size-5">ENCONTRADO !!</p></div> :
                                    (!edit && found===1) ?
                                        <div className="msg"><p className="msg_warning has-text-centered is-size-5">NO ENCONTRADO</p></div> : ''
                            }
                            {
                                (!edit && Object.keys(user).length <= 0) && <React.Fragment>
                                    <div className="field">
                                        <div className="control">
                                            <label className={`label has-text-grey-light is-capitalized required`}>Cédula</label>
                                            <input className="input" name={'searchCC'} value={this.state.newCC} onChange={this.changeCC}/>
                                        </div>
                                    </div>
                                    <button className="button is-info" onClick={this.searchCC}>Buscar</button>
                                </React.Fragment>
                            }
                            {
                                Object.keys(user).length > 0 && this.renderForm()
                            }
                            {
                                checked_in && (
                                    <div className="field">
                                        <label className="label">Checked</label>
                                        <div className="control columns">
                                            <div className="column">
                                                <p><FormattedDate value={checked_in}/> - <FormattedTime value={checked_in}/></p>
                                            </div>
                                            <div className="column">
                                                <input className="is-checkradio is-primary is-small" id={"unCheckUser"}
                                                       type="checkbox" name={"unCheckUser"} onChange={()=>{this.setState({uncheck:true})}}/>
                                                <label htmlFor={"unCheckUser"}>UnCheck?</label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                Object.keys(user).length > 0 &&
                                    <div className="field is-grouped">
                                        <div className="control">
                                            <label className="label">Estado</label>
                                            <div className="control">
                                                <div className="select">
                                                    <select value={state} onChange={this.selectChange} name={'state'}>
                                                        {
                                                            statesList.map((item,key)=>{
                                                                return <option key={key} value={item.value}>{item.label}</option>
                                                            })
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            !this.state.edit&&
                                            <div className="control">
                                                <input className="is-checkradio is-primary is-small" id={"confirmCheckIn"}
                                                       type="checkbox" name={"confirmCheckIn"} checked={this.state.confirmCheck}
                                                       onChange={(e)=>{this.setState(prevState=>{
                                                           return {confirmCheck:!prevState.confirmCheck}})}}/>
                                                <label htmlFor={"confirmCheckIn"}>Chequear Usuario?</label>
                                            </div>
                                        }
                                    </div>
                            }
                        </section>
                        {
                            Object.keys(user).length > 0 &&
                                <footer className="modal-card-foot">
                                    {
                                        this.state.create?<div>Creando...</div>:
                                            <div className="modal-buttons">
                                                <button className="button is-primary" onClick={this.handleSubmit} disabled={this.state.valid}>Guardar</button>
                                                {
                                                    this.state.edit&&
                                                    <React.Fragment>
                                                        <button className="button" onClick={this.printUser}>Imprimir</button>
                                                        <button className="button" onClick={(e)=>{this.setState({modal:true})}}>Borrar</button>
                                                    </React.Fragment>
                                                }
                                                <button className="button" onClick={this.closeModal}>Cancel</button>
                                            </div>
                                    }
                                    <div className={"msg"}>
                                        <p className={`help ${this.state.message.class}`}>{this.state.message.content}</p>
                                    </div>
                                </footer>
                        }
                    </div>
                    <div style={{opacity:0, display:'none'}}>
                        <QRCode value={userId}/>
                    </div>
                    <iframe title={'Print User'} ref="ifrmPrint" style={{opacity:0, display:'none'}}/>
                    {/*<iframe title={'Print User'} ref="ifrmPrint" style={{backgroundColor:"aliceblue",width:"900px",height:"900px",zIndex:9}}/>*/}
                </div>
                <Dialog modal={this.state.modal} title={'Borrar Usuario'}
                        content={<p>Seguro de borrar este usuario?</p>}
                        first={{title:'Borrar',class:'is-dark has-text-danger',action:this.deleteUser}}
                        message={this.state.message}
                        second={{title:'Cancelar',class:'',action:this.closeModal}}/>
                <Dialog modal={this.state.uncheck} title={'Borrar Check In'}
                        content={<p>Seguro de borrar el checkIn de este usuario?</p>}
                        first={{title:'Si',class:'is-warning',action:this.unCheck}}
                        message={this.state.message}
                        second={{title:'Cancelar',class:'',action:this.closeUnCheck}}/>
                <Dialog modal={this.state.noBadge} title={'Sin Escarapela'}
                        content={<p>Aún no tienes creada una escarapela. Crea una o sigue editando el usuario</p>}
                        first={{title:'Crear',class:'is-info is-outlined',action:this.goBadge}}
                        second={{title:'Cancelar',class:'is-text',action:this.closeNoBadge}}/>
            </React.Fragment>
        );
    }
}

export default UserModal;