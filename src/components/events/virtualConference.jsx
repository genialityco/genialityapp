import React, { Component, Fragment } from "react"
import { Card, Button } from "antd"
import WithUserEventRegistered from "../shared/withUserEventRegistered"
import { AgendaApi } from "../../helpers/request";
import TimeStamp from "react-timestamp";
import Moment from "moment";

class VirtualConference extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            infoAgendaArr: []
        }
    }

    async componentDidMount() {
        const infoAgenda = await AgendaApi.byEvent(this.props.event._id);
        const infoAgendaArr = [];
        for (const prop in infoAgenda.data) {
            if (("Aqui", infoAgenda.data[prop].meeting_id)) {
                infoAgendaArr.push(infoAgenda.data[prop]);
            }
        }

        console.log(infoAgendaArr);
        this.setState({ infoAgendaArr });
    }

    capitalizeDate(val) {
        val = Moment(val).format("DD MMMM HH:HH")
        return val.toLowerCase()
            .trim()
            .split(' ')
            .map(v => v[0].toUpperCase() + v.substr(1))
            .join(' ');
    }

    render() {
        const { infoAgendaArr } = this.state
        const { toggleConference, currentUser } = this.props
        return (
            <Fragment>
                <div>
                    <h1>Listado de conferencias Virtuales</h1>
                    {
                        infoAgendaArr.map((item, key) => (
                            <div key={key}>
                                <Card title={item.name} bordered={true} style={{ width: 300, marginBottom: "3%" }}>
                                    <p>
                                        {item.hosts ?
                                            <div>
                                                {
                                                    item.hosts.map((item, key) => (
                                                        <p key={key}>Conferencista: {item.name}</p>
                                                    ))
                                                }
                                            </div> :
                                            <div />
                                        }
                                    </p>
                                    <p>{this.capitalizeDate(item.datetime_start)} - {this.capitalizeDate(item.datetime_end)} </p>
                                    <Button onClick={() => { toggleConference(true, item.meeting_id, currentUser) }}>Entrar a la conferencia </Button>
                                </Card>
                            </div>
                        ))
                    }
                </div>
            </Fragment>
        )
    }
}

export default WithUserEventRegistered(VirtualConference)