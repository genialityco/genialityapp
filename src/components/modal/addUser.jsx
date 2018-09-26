import React, {Component} from 'react';
import axios from 'axios';
import {Actions, UsersApi} from "../../helpers/request";

class AddUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rolsList: [],
            statesList: [],
            message: {},
            user: {},
            rol: "",
            state: "",
            emailError:false,
            valid: false
        };
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        const self = this,
            rols = Actions.getAll('/api/rols'),
            states = Actions.getAll('/api/states');
        axios.all([rols, states])
            .then(axios.spread(function (roles, estados) {
                let rolData = roles.map(rol => ({
                    value: rol._id,
                    label: rol.name
                }));
                let stateData = estados.map(state => ({
                    value: state._id,
                    label: state.name
                }));
                self.setState({ rolsList: rolData, statesList: stateData });
            }))
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.edit) {
            const value = nextProps.value;
            let user = {};
            Object.keys(value.properties)
                .map((obj) => (
                    user[obj] = value.properties[obj]
                ));
            this.setState({
                user, rol: value.rol._id + ':' + value.rol.name,
                state: value.state._id + ':' + value.state.name, edit: true
            });
        }else {
            let user = {name: '', email: ''};
            nextProps.extraFields
                .map((obj) => (
                    user[obj.name] = ''))
            this.setState({user,  edit: false});
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        const snap = {
            properties: this.state.user,
            role_id: this.state.rol.split(':')[0],
            state_id: this.state.state.split(':')[0],
        };
        let message = {};
        this.setState({create:true});
        try {
            let resp = await UsersApi.editOne(snap,this.props.eventId);
            console.log(resp);
            if (resp.message === 'OK'){
                this.props.addToList(resp.data);
                message.class = (resp.status === 'CREATED')?'msg_success':'msg_warning';
                message.content = 'USER '+resp.status;
            } else {
                alert("User can`t be created/updated");
            }
        } catch (err) {
            console.log(err.response);
            message.class = 'msg_error';
            message.content = 'ERROR...TRYING LATER';
        }
        this.setState({message,create:false});
        setTimeout(()=>{
            message.class = message.content = '';
            this.closeModal();
        },1000)
    }

    handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({user:{...this.state.user,[name]:value}})
    };

    selectChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        let split = value.split(':');
        const label = 'label' + name;
        this.setState({[name]:value, [label]:split[1]}, this.validForm);
    }

    validForm = () => {
        const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let state= this.state,
            emailValid = state.user.email.length > 5 && state.user.email.length < 61 && EMAIL_REGEX.test(state.user.email),
            valid = !(emailValid && state.user.name.length>0 && state.rol.length>0 && state.state.length>0);
        this.setState({emailError:!emailValid});
        this.setState({valid})
    };

    closeModal = () => {
        this.setState({user:{}, rol: '', state: ''},this.props.handleModal());
    };

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
            '\t<text transform="matrix(1 0 0 1 871.8398 189.939)"><tspan x="0" y="0" style="fill:#50D3C9;font-family:\'Montserrat-Light\';font-size:122.7092px;letter-spacing:24;">.C</tspan><tspan x="159.4" y="0" style="fill:#50D3C9;font-family:\'Montserrat-Light\';font-size:122.7092px;letter-spacing:24;">O</tspan></text>\n' +
            '</g>\n' +
            '</svg>';
        return (
            <div className={`modal ${this.props.modal ? "is-active" : ""}`}>
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
                                return <div className="field is-horizontal" key={obj}>
                                    <div className="field-label is-normal">
                                        <label className="label">{obj}</label>
                                    </div>
                                    <div className="field-body">
                                        <div className="field">
                                            <div className="control">
                                                <input className="input is-rounded" type="text" name={obj} onChange={this.handleChange} value={this.state.user[obj]} placeholder="Evius.co"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                        <div className="field is-horizontal">
                            <div className="field-label is-normal">
                                <label className="label">Rol</label>
                            </div>
                            <div className="field-body">
                                <div className="field">
                                    <div className="control">
                                        <div className="select">
                                            <select value={this.state.rol} onChange={this.selectChange} name={'rol'}>
                                                <option value="">Seleccione....</option>
                                                {
                                                    this.state.rolsList.map((item,key)=>{
                                                        return <option key={key} value={item.value + ':' + item.label}>{item.label}</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="field is-horizontal">
                            <div className="field-label is-normal">
                                <label className="label">Estado</label>
                            </div>
                            <div className="field-body">
                                <div className="field">
                                    <div className="control">
                                        <div className="select">
                                            <select value={this.state.state} onChange={this.selectChange} name={'state'}>
                                                <option value="">Seleccione....</option>
                                                {
                                                    this.state.statesList.map((item,key)=>{
                                                        return <option key={key} value={item.value + ':' + item.label}>{item.label}</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer className="modal-card-foot">
                        {
                            this.state.create?<div>Creando...</div>:
                                <div>
                                    <button className="button is-success" onClick={this.handleSubmit} disabled={this.state.valid}>{this.state.edit?'Guardar':'Crear'}</button>
                                    <button className="button" onClick={this.closeModal}>Cancel</button>
                                </div>
                        }
                        <div className={"msg"}>
                            <p className={`help ${this.state.message.class}`}>{this.state.message.content}</p>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}

export default AddUser;