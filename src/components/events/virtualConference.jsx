import React, { Component, Fragment, useState, useEffect } from "react";
import { Card, Button, Alert } from "antd";
import WithUserEventRegistered from "../shared/withUserEventRegistered";
import { AgendaApi } from "../../helpers/request";
import { firestore } from "../../helpers/firebase";
import Moment from "moment";
import { Avatar } from "antd";


const MeetingConferenceButton = ({ activity, toggleConference, usuarioRegistrado, event }) => {
    const [infoActivity, setInfoActivity] = useState({});
    const [infoEvent, setInfoEvent] = useState({});

    useEffect(() => {
        setInfoActivity(activity);
        setInfoEvent(event)
    }, [activity]);

    switch (infoActivity.habilitar_ingreso) {
        case "open_meeting_room":
            return (
                <>
                    {event && event.visibility === "ORGANIZATION" ? (                        
                        usuarioRegistrado ? (
                            <>
                                <Button
                                    size="large"
                                    type="primary"
                                    className="buttonVirtualConference"
                                    onClick={() => {
                                        toggleConference(true, infoActivity.meeting_id, infoActivity);
                                    }}>
                                    {infoActivity.meeting_id_en ? "Entrar (Español)" : "Entrar"}
                                </Button>
                                {infoActivity.meeting_id_en && (<Button
                                    size="large"
                                    type="primary"
                                    className="buttonVirtualConference"
                                    onClick={() => {
                                        toggleConference(true, infoActivity.meeting_id_en, infoActivity);
                                    }}>
                                    Join (English)
                                </Button>)}
                            </>
                        ) : (
                                <Alert message="No se encuentra registrado en el evento" type="info" showIcon />
                            )
                    ) : (                        
                            <>
                                <Button
                                    size="large"
                                    type="primary"
                                    className="buttonVirtualConference"
                                    onClick={() => {
                                        toggleConference(true, infoActivity.meeting_id, infoActivity);
                                    }}>
                                    {infoActivity.meeting_id_en ? "Entrar (Español)" : "Entrar"}
                                </Button>
                                {infoActivity.meeting_id_en && (<Button
                                    size="large"
                                    type="primary"
                                    className="buttonVirtualConference"
                                    onClick={() => {
                                        toggleConference(true, infoActivity.meeting_id_en, infoActivity);
                                    }}>
                                    Join (English)
                                </Button>)}
                            </>
                        )
                    }
                </>
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
        this.state = {
            data: [],
            infoAgendaArr: [],
            currentUser: this.props.currentUser || undefined,
            usuarioRegistrado: this.props.usuarioRegistrado || undefined,
            event: this.props.event || undefined,
            survey: [],
        };
    }

    async componentDidUpdate(prevProps) {

        //Cargamos solamente los espacios virtuales de la agenda

        //Si aún no ha cargado el evento no podemos hacer nada más
        if (!this.props.event) return;

        //Revisamos si el evento sigue siendo el mismo, no toca cargar nada
        if (prevProps.event && this.props.event._id === prevProps.event._id) return;

        let filteredAgenda = await this.filterVirtualActivities(this.props.event._id);
        this.setState({ event: this.props.event, usuarioRegistrado: this.props.usuarioRegistrado, infoAgendaArr: filteredAgenda }, this.listeningStateMeetingRoom);

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
        console.log("componentDidUpdate el componente se monto");
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
            } else if ((infoAgenda.data[prop].vimeo_id)) {
                infoAgendaArr.push(infoAgenda.data[prop]);
            }
        }

        return infoAgendaArr;
    }

    render() {
        const { infoAgendaArr, event, usuarioRegistrado } = this.state;
        const { toggleConference } = this.props;
        if (!infoAgendaArr || infoAgendaArr.length <= 0) return null;
        return (
            <Fragment>
                {
                    <div>
                        <Card bordered={true}>
                            <span>Sesiones</span>
                        </Card>
                        {infoAgendaArr.map((item, key) => (
                            <div key={key}>
                                <Card bordered={true} style={{ marginBottom: "3%" }}>

                                    <h1 style={{ fontSize: "120%", fontWeight: "Bold" }}>{item.name}</h1>
                                    <p>
                                        {Moment(item.datetime_start).format("D ")}<span>&nbsp;de&nbsp;</span>
                                        {item.datetime_start && ((Moment(item.datetime_start).format("MMMM")).charAt(0).toUpperCase())}
                                        {item.datetime_start && ((Moment(item.datetime_start).format("MMMM")).slice(1))}

                                        <span>&nbsp;&nbsp;&nbsp;</span>
                                        {Moment(item.datetime_start).format("h:mm A")} {" - "}
                                        {Moment(item.datetime_end).format("h:mm A")}
                                    </p>

                                    <div className="Virtual-Conferences">
                                        {item.hosts.map((host, key) => {
                                            return (
                                                <div style={{ margin: "13px 14px" }} key={key}>
                                                    <Avatar size={80} src={host.image} />
                                                    <div >{host.name}</div>
                                                </div>

                                            )
                                        })}
                                    </div>
                                    <MeetingConferenceButton activity={item} toggleConference={toggleConference} event={event} usuarioRegistrado={usuarioRegistrado} />

                                </Card>
                            </div>
                        ))}
                    </div>
                }
            </Fragment>
        );
    }
}

export default WithUserEventRegistered(VirtualConference);
