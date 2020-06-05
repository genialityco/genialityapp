import React, { Component, Fragment, useState, useEffect } from "react";
import { Card, Button, Alert } from "antd";
import WithUserEventRegistered from "../shared/withUserEventRegistered";
import { AgendaApi, SurveysApi } from "../../helpers/request";
import { firestore } from "../../helpers/firebase";
import TimeStamp from "react-timestamp";
import Moment from "moment";

const MeetingConferenceButton = ({ activity, toggleConference }) => {
    const [infoActivity, setInfoActivity] = useState({});

    useEffect(() => {
        setInfoActivity(activity);
    }, [activity]);

    switch (infoActivity.habilitar_ingreso) {
        case "open_meeting_room":
            return (
                <Button
                    size="large"
                    type="primary"
                    className="buttonVirtualConference"
                    onClick={() => {
                        toggleConference(true, infoActivity.meeting_id);
                    }}>
                    Entrar
                </Button>
            );
            break;

        case "closed_meeting_room":
            return <Alert message="El ingreso se habilitará minutos antes del evento" type="warning" showIcon />;
            break;

        case "ended_meeting_room":
            return <Alert message="El evento ha terminado" type="info" showIcon />;

            break;

        default:
            return <Alert message="El ingreso se habilitará minutos antes del evento" type="warning" showIcon />;
            break;
    }
};

class VirtualConference extends Component {
    constructor(props) {
        super(props);
        console.log(
            "INNER event",
            this.props.event,
            "CurrentUser",
            this.props.currentUser,
            "UsuarioRegistrado",
            this.props.usuarioRegistrado
        );
        this.state = {
            data: [],
            infoAgendaArr: [],
            currentUser: this.props.currentUser || undefined,
            usuarioRegistrado: this.props.usuarioRegistrado || undefined,
            event: this.props.event || undefined,
            survey: [],
        };
    }

    async componentDidUpdate() {
        let { infoAgendaArr } = this.state;
        //Si aún no ha cargado el evento no podemos hacer nada más
        if (!this.props.event) return;

        //Si ya cargamos la agenda no hay que volverla a cargar o quedamos en un ciclo infinito
        if (this.state.infoAgendaArr && this.state.infoAgendaArr.length) return;
        console.log("actualizando componente");
        let filteredAgenda = await this.filterVirtualActivities(this.props.event._id);
        this.setState({ infoAgendaArr: filteredAgenda }, this.listeningStateMeetingRoom);
    }

    listeningStateMeetingRoom = () => {
        let { infoAgendaArr } = this.state;
        infoAgendaArr.forEach((activity, index, arr) => {
            firestore
                .collection("events")
                .doc(this.props.event._id)
                .collection("activities")
                .doc(activity._id)
                .onSnapshot((infoActivity) => {
                    if (!infoActivity.exists) return;
                    console.log("infoActivity:", infoActivity);
                    let { habilitar_ingreso } = infoActivity.data();
                    let updatedActivityInfo = { ...arr[index], habilitar_ingreso };

                    arr[index] = updatedActivityInfo;
                    this.setState({ infoAgendaArr: arr });
                });
        });
    };

    async componentDidMount() {
        if (!this.props.event) return;

        let filteredAgenda = await this.filterVirtualActivities(this.props.event._id);
        this.setState({ infoAgendaArr: filteredAgenda });
    }

    async filterVirtualActivities(event_id) {
        let infoAgendaArr = [];
        if (!event_id) return infoAgendaArr;
        const infoAgenda = await AgendaApi.byEvent(event_id);

        for (const prop in infoAgenda.data) {
            if (infoAgenda.data[prop].meeting_id) {
                infoAgendaArr.push(infoAgenda.data[prop]);
            }
        }

        return infoAgendaArr;
    }

    capitalizeDate(val) {
        val = Moment(val).format("DD MMMM HH:HH");
        return val
            .toLowerCase()
            .trim()
            .split(" ")
            .map((v) => v[0].toUpperCase() + v.substr(1))
            .join(" ");
    }

    render() {
        const { infoAgendaArr, survey } = this.state;
        const { toggleConference, currentUser, usuarioRegistrado, event } = this.props;
        return (
            <Fragment>
                <div>
                    <Card bordered={true}>
                        <span>Espacios Virtuales</span>
                    </Card>
                    {infoAgendaArr.map((item, key) => (
                        <div key={key}>
                            <Card bordered={true} style={{ marginBottom: "3%" }}>
                                <p>{item.name}</p>
                                {item.hosts && item.hosts.length > 0 && false && (
                                    <div>
                                        <span style={{ fontWeight: "bold" }}> Conferencistas: </span>{" "}
                                        {item.hosts.map((item, key) => (
                                            <span key={key}> {item.name}, </span>
                                        ))}
                                    </div>
                                )}
                                <p>
                                    {" "}
                                    {Moment(item.datetime_start).format("MMMM D h:mm A")} - {Moment(item.datetime_end).format("h:mm A")}{" "}
                                </p>
                                <MeetingConferenceButton activity={item} toggleConference={toggleConference} />
                            </Card>
                        </div>
                    ))}
                </div>
            </Fragment>
        );
    }
}

export default WithUserEventRegistered(VirtualConference);
