import React, { Component } from "react";
import { Link, Redirect, withRouter } from "react-router-dom";
import Dropzone from "react-dropzone";
import ReactQuill from "react-quill";
import { FaChevronLeft } from "react-icons/fa";
import EventContent from "../events/shared/content";
import Loading from "../loaders/loading";
import { handleRequestError, sweetAlert, uploadImage } from "../../helpers/utils";
import { imageBox, toolbarEditor } from "../../helpers/constants";
import { SpeakersApi } from "../../helpers/request";

class Speaker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isLoading: false,
            name: "",
            profession: "",
            description: "",
            description_activity: "false",
            image: "",
            imageData: "",
            networks: []
        }
        this.descriptionActivity = this.descriptionActivity.bind(this)
    }

    async componentDidMount() {
        const { eventID, location: { state } } = this.props;
        if (state.edit) {
            const info = await SpeakersApi.getOne(state.edit, eventID);
            console.log(info)
            Object.keys(this.state).map(key => info[key] ? this.setState({ [key]: info[key] }) : "");
        }
        this.setState({ loading: false });
    }

    handleChange = (e) => {
        const { name } = e.target;
        const { value } = e.target;
        this.setState({ [name]: value });
    };
    handleImage = async (files) => {
        try {
            const file = files[0];
            if (file) {
                const image = await uploadImage(file);
                this.setState({ image })
            }
            else {
                this.setState({ errImg: 'Only images files allowed. Please try again :)' });
            }
        } catch (e) {
            sweetAlert.showError(handleRequestError(e))
        }
    };
    chgTxt = content => this.setState({ description: content });

    submit = async () => {
        try {
            sweetAlert.showLoading("Espera (:", "Guardando...");
            const { eventID, location: { state } } = this.props;
            this.setState({ isLoading: true });
            const { name, profession, description_activity, description, image } = this.state;
            const info = { name, image, description_activity, description, profession };
            console.log(info)
            if (state.edit) await SpeakersApi.editOne(info, state.edit, eventID);
            else await SpeakersApi.create(eventID, info);
            sweetAlert.hideLoading();
            sweetAlert.showSuccess("Información guardada")
        } catch (e) {
            sweetAlert.showError(handleRequestError(e))
        }
    };

    remove = () => {
        const { eventID, location: { state } } = this.props;
        if (state.edit) {
            sweetAlert.twoButton(`Está seguro de borrar a ${this.state.name}`, "warning", true, "Borrar", async (result) => {
                try {
                    if (result.value) {
                        sweetAlert.showLoading("Espera (:", "Borrando...");
                        await SpeakersApi.deleteOne(state.edit, eventID);
                        this.setState({ redirect: true });
                        sweetAlert.hideLoading();
                    }
                } catch (e) {
                    sweetAlert.showError(handleRequestError(e))
                }
            })
        } else this.setState({ redirect: true });
    };

    descriptionActivity(e) {
        console.log(e.target.value)
        this.setState({ description_activity: e.target.value })
    }

    render() {
        const { matchUrl } = this.props;
        const { redirect, loading, name, profession, description, image } = this.state;
        if (!this.props.location.state || redirect) return <Redirect to={matchUrl} />;
        return (
            <EventContent title={<span><Link to={matchUrl}><FaChevronLeft /></Link>Conferencista</span>}>
                {loading ? <Loading /> :
                    <div className="columns">
                        <div className="column is-8">
                            <div className="field">
                                <label className="label">Nombre</label>
                                <div className="control">
                                    <input className="input" type="text" name={"name"} value={name} onChange={this.handleChange}
                                        placeholder="Nombre conferencista" />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Profesión</label>
                                <div className="control">
                                    <input className="input" type="text" name={"profession"} value={profession} onChange={this.handleChange}
                                        placeholder="Profesión" />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Descripción de conferencias</label>
                                <div className="select">
                                    <select defaultValue={this.state.description_activity} onChange={(e) => { this.descriptionActivity(e) }}>
                                        <option value="true">Si</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Descripción (opcional)</label>
                                <div className="control">
                                    <ReactQuill value={description} modules={toolbarEditor}
                                        onChange={this.chgTxt} />
                                </div>
                            </div>
                        </div>
                        <div className="column is-4 general">
                            <div className="field is-grouped">
                                <button className="button is-text" onClick={this.remove}>x Eliminar conferencista
                                </button>
                                <button onClick={this.submit}
                                    className={`button is-primary`}>Guardar
                                </button>
                            </div>
                            <div className="section-gray">
                                <label className="label has-text-grey-light">Imagen</label>
                                <div className="columns">
                                    <div className="column">
                                        {
                                            image ? <img src={image} alt={`speaker_${name}`} className="author-image" /> :
                                                <div dangerouslySetInnerHTML={{ __html: imageBox }} />
                                        }
                                    </div>
                                    <div className="column is-9">
                                        <div className="has-text-left">
                                            <p>Dimensiones: 1080px x 1080px</p>
                                            <Dropzone onDrop={this.handleImage} accept="image/*" className="zone">
                                                <button className="button is-text">{image ? "Cambiar imagen" : "Subir imagen"}</button>
                                            </Dropzone>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </EventContent>
        )
    }
}

export default withRouter(Speaker)
