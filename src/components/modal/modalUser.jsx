import React, {Component} from 'react';
import {app,firestore} from "../../helpers/firebase";
import { toast } from 'react-toastify';
import Dialog from "./twoAction";
import {FormattedDate, FormattedMessage, FormattedTime} from "react-intl";
import QRCode from 'qrcode.react';
import {BadgeApi} from "../../helpers/request";

class UserModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rolesList: [],
            statesList: [],
            message: {},
            user: {},
            rol: "",
            state: "",
            userId: "mocionsoft",
            emailError:false,
            confirmCheck:true,
            valid: true,
            checked_in: false,
        };
        this.handleSubmit = this.handleSubmit.bind(this)
        this.printUser = this.printUser.bind(this)
    }

    componentDidMount() {
        const self = this;
        const {rolstate:{roles,states}} = this.props;
        self.setState({ rolesList: roles, statesList: states, state: states[1].value, rol: roles[1].value });
    }

    componentDidUpdate(prevProps) {
        if(prevProps.edit !== this.props.edit){
            if (this.props.edit) {
                const {value,extraFields} = this.props;
                let user = {};
                Object.keys(value.properties)
                    .map((obj) => {
                        let pos = extraFields.map((e)=>{return e.name}).indexOf(obj);
                        if(pos>=0) user[extraFields[pos].name] = '';
                        return user[obj] = value.properties[obj]?value.properties[obj]:''
                    });
                let checked_in = (value.checked_in && value.checked_at) ? value.checked_at.toDate() : false;
                this.setState({user, rol:value.rol._id, state:value.state._id, edit:true, checked_in, userId:value._id});
            }else {
                let user = {name: '', email: ''};
                this.props.extraFields
                    .map((obj) => (
                        user[obj.name] = ''));
                this.setState({user,edit:false});
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        const snap = {
            properties: this.state.user,
            rol_id: this.state.rol,
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
            if(snap.state_id !== this.props.value.state_id) this.props.statesCounter(snap.state_id,this.props.value.state_id);
            snap.updated_at = new Date();
            userRef.doc(this.props.value._id).update(snap)
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
        let qr = canvas.toDataURL();
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
            oDoc.write('<link href="https://fonts.googleapis.com/css?family=Lato:700|Oswald" rel="stylesheet"></head>');
            // body
            oDoc.write('<body onload="window.print()"><div>');
            // Datos
            let i = 0;
            for(;i<badge.length;){
                if(badge[i].line){
                    if(badge[i].qr) oDoc.write(`<div><img src=${qr}></div>`);
                    else oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i].size}px;text-transform: uppercase">${user[badge[i].id_properties.value]?user[badge[i].id_properties.value]:user[badge[i].id_properties.label]}</p>`);
                    i++
                }else{
                    if(badge[i+1]&&!badge[i+1].line){
                        oDoc.write(`<div style="display: flex">`);
                        if(!badge[i].qr){
                            oDoc.write(`<div style="margin-right: 20px">`);
                            oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i].size}px;text-transform: uppercase">${user[badge[i].id_properties.value]?user[badge[i].id_properties.value]:user[badge[i].id_properties.label]}</p>`);
                            oDoc.write(`</div>`);
                        }else{
                            oDoc.write(`<div style="margin-right: 20px">`);
                            oDoc.write(`<div><img src=${qr}></div>`);
                            oDoc.write(`</div>`);
                        }
                        if(!badge[i+1].qr){
                            oDoc.write(`<div style="margin-right: 20px">`);
                            oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i+1].size}px;text-transform: uppercase">${user[badge[i+1].id_properties.value]?user[badge[i+1].id_properties.value]:user[badge[i+1].id_properties.label]}</p>`);
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
                            oDoc.write(`<p style="font-family: Lato, sans-serif;font-size: ${badge[i].size}px;text-transform: uppercase">${user[badge[i].id_properties.value]?user[badge[i].id_properties.value]:user[badge[i].id_properties.label]}</p>`)
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
    };

    handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({user:{...this.state.user,[name]:value}}, this.validForm)
    };

    changeType = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({user:{...this.state.user,[name]:value}}, this.validForm)
    }

    selectChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({[name]:value}, this.validForm);
    };

    validForm = () => {
        const EMAIL_REGEX = new RegExp('[^@]+@[^@]+\\.[^@]+');
        let state= this.state,
            emailValid = state.user.email.length > 5 && state.user.email.length < 61 && EMAIL_REGEX.test(state.user.email),
            valid = !(emailValid && state.user.name.length>0 && state.rol.length>0 && state.state.length>0);
        this.setState({emailError:!emailValid});
        this.setState({valid})
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

    unCheck = () => {
        console.log(this.props.value);
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

    render() {
        const icon = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
            '\t viewBox="0 0 1128 193" style="enable-background:new 0 0 1128 193;" xml:space="preserve">\n' +
            '<g>\n' +
            '\t<path style="fill:#50D3C9" d="M318.4,8.6l-68,174.7c-0.8,2.3-2,3.1-4.3,3.1h-4.8c-2.5,0-3.6-0.8-4.3-2.8l-68-175c-0.8-1.8-0.3-3.1,2-3.1h4.8\n' +
            '\t\tc3.8,0,4.8,0.5,5.6,2.8l56.6,146.4c2.3,6.4,4.3,13.8,5.6,17.1h0.8c1.3-3.3,3.1-10.4,5.3-17.1L305.9,8.4c0.8-2.3,2-2.8,5.6-2.8h4.8\n' +
            '\t\tC318.9,5.6,319.2,6.8,318.4,8.6"/>\n' +
            '\t<path style="fill:#50D3C9" d="M396.8,5.6h5.3c2.3,0,3.1,0.8,3.1,3.3v174.2c0,2.5-0.8,3.3-3.1,3.3h-5.3c-2.6,0-3.3-0.8-3.3-3.3V8.9\n' +
            '\t\tC393.5,6.3,394.3,5.6,396.8,5.6"/>\n' +
            '\t<path style="fill:#50D3C9" d="M563.6,179.3c37.2,0,55.3-21.1,55.3-54V8.9c0-2.5,0.8-3.3,3.1-3.3h5.6c2.3,0,3.1,0.8,3.1,3.3v116.4\n' +
            '\t\tc0,39.5-22.1,64.9-67,64.9c-45.1,0-67.2-25.5-67.2-64.9V8.9c0-2.5,0.8-3.3,3.3-3.3h5.3c2.3,0,3.1,0.8,3.1,3.3v116.4\n' +
            '\t\tC508.1,158.1,526.1,179.3,563.6,179.3"/>\n' +
            '\t<path style="fill:#50D3C9" d="M779,2c34.1,0,53.5,12.5,66.7,39.5c1.3,2.3,0.5,3.6-1.5,4.3l-5.1,2.3c-2,0.8-2.8,0.8-4.1-1.5\n' +
            '\t\tc-11.5-22.7-27.5-33.4-56-33.4c-32.9,0-52,14.3-52,38.7c0,30.1,28.3,34.9,57.1,38c31.1,3.6,63.4,8.9,63.4,48.1\n' +
            '\t\tc0,33.1-22.9,52-67.2,52c-35.7,0-56.3-14.3-68.5-44.6c-1-2.6-0.8-3.6,1.8-4.6l4.8-1.8c2.3-0.8,3.1-0.5,4.3,2\n' +
            '\t\tc11,25.7,29,37.7,57.6,37.7c36.7,0,55.5-13.2,55.5-40.2c0-30-26.5-33.9-54.2-37.2c-31.8-3.8-66.5-9.2-66.5-48.6\n' +
            '\t\tC715,21.6,738.7,2,779,2"/>\n' +
            '\t<path style="fill:#50D3C9" d="M108.2,17.8H3.7C3.3,17.8,3,17.4,3,17V5.8C3,5.4,3.3,5,3.7,5h104.4c0.4,0,0.7,0.3,0.7,0.7V17\n' +
            '\t\tC108.9,17.4,108.6,17.8,108.2,17.8"/>\n' +
            '\t<path style="fill:#50D3C9" d="M108.2,102.3H3.7c-0.4,0-0.7-0.3-0.7-0.7V90.3c0-0.4,0.3-0.7,0.7-0.7h104.4c0.4,0,0.7,0.3,0.7,0.7v11.2\n' +
            '\t\tC108.9,101.9,108.6,102.3,108.2,102.3"/>\n' +
            '\t<path style="fill:#50D3C9" d="M108.2,186.8H3.7c-0.4,0-0.7-0.3-0.7-0.7v-11.2c0-0.4,0.3-0.7,0.7-0.7h104.4c0.4,0,0.7,0.3,0.7,0.7V186\n' +
            '\t\tC108.9,186.5,108.6,186.8,108.2,186.8"/>\n' +
            '\t<rect x="3" y="161.3" style="fill:#50D3C9" width="12.7" height="15.4"/>\n' +
            '\t<text transform="matrix(1 0 0 1 871.8398 189.939)"><tspan x="0" y="0" style="fill:#50D3C9;font-family:\'Montserrat\';font-size:122.7092px;letter-spacing:24;">.C</tspan><tspan x="159.4" y="0" style="fill:#50D3C9;font-family:\'Montserrat\';font-size:122.7092px;letter-spacing:24;">O</tspan></text>\n' +
            '</g>\n' +
            '</svg>';
        return (
            <React.Fragment>
                <div className={`modal modal-add-user ${this.props.modal ? "is-active" : ""}`}>
                    <div className="modal-background"/>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <div className="modal-card-title">
                                <div className="icon-header" dangerouslySetInnerHTML={{ __html: icon }}/>
                            </div>
                            <button className="delete" aria-label="close" onClick={this.props.handleModal}/>
                        </header>
                        <section className="modal-card-body">
                            {
                                Object.keys(this.state.user).map((obj, i)=>{
                                    if(obj === 'type') return;
                                    return <div className="field" key={obj}>
                                        <label className="label is-required has-text-grey-light is-capitalized">{obj}</label>
                                        <div className="control">
                                            <input className="input" type="text" name={obj} onChange={this.handleChange} value={this.state.user[obj]} placeholder={obj}/>
                                        </div>
                                    </div>
                                })
                            }
                            {
                                this.state.checked_in && (
                                    <div className="field">
                                        <label className="label">Checked</label>
                                        <div className="control columns">
                                            <div className="column">
                                                <p><FormattedDate value={this.state.checked_in}/> - <FormattedTime value={this.state.checked_in}/></p>
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
                            <div className="field">
                                <label className="label">Tipo de Usuario</label>
                                <div className="control">
                                    <div className="select">
                                        <select value={this.state.user.type} onChange={this.changeType} name={'type'}>
                                            <option value={'General'}>{'General'}</option>
                                            <option value={'Preferencial'}>{'Preferencial'}</option>
                                            <option value={'VIP'}>{'VIP'}</option>
                                            <option value={'Alumno'}>{'Alumno'}</option>
                                            <option value={'Prensa'}>{'Prensa'}</option>
                                            <option value={'Staff'}>{'Staff'}</option>
                                            <option value={'Speaker'}>{'Speaker'}</option>
                                            <option value={'Sin nombre'}>{'Sin nombre'}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Rol</label>
                                <div className="control">
                                    <div className="select">
                                        <select value={this.state.rol} onChange={this.selectChange} name={'rol'}>
                                            {
                                                this.state.rolesList.map((item,key)=>{
                                                    return <option key={key} value={item.value}>{item.label}</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Estado</label>
                                <div className="control">
                                    <div className="select">
                                        <select value={this.state.state} onChange={this.selectChange} name={'state'}>
                                            {
                                                this.state.statesList.map((item,key)=>{
                                                    return <option key={key} value={item.value}>{item.label}</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {
                                !this.state.edit&&
                                <div className="field">
                                    <input className="is-checkradio is-primary is-small" id={"confirmCheckIn"}
                                           type="checkbox" name={"confirmCheckIn"} checked={this.state.confirmCheck}
                                           onChange={(e)=>{this.setState(prevState=>{
                                               return {confirmCheck:!prevState.confirmCheck}})}}/>
                                    <label htmlFor={"confirmCheckIn"}>Chequear Usuario?</label>
                                </div>
                            }
                        </section>
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
                    </div>
                    <div style={{opacity:0, display:'none'}}>
                        <QRCode value={this.state.userId}/>
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
            </React.Fragment>
        );
    }
}

export default UserModal;