import React, {Component} from "react";
import {Link, Redirect} from "react-router-dom";
import EventContent from "../events/shared/content";
import {AgendaApi} from "../../helpers/request";
import Moment from "moment";
import EvenTable from "../events/shared/table";

class Agenda extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list:[],
            days:[],
            day:"",
            filtered:[],
            redirect:false
        }
    }

    componentDidMount() {
        const { event } = this.props;
        let days = [];
        const init = Moment(event.date_start);
        const end = Moment(event.date_end);
        const diff = end.diff(init, 'days');
        for(let i = 0; i < diff+1; i++){
            days.push(Moment(init).add(i,'d'))
        }
        this.setState({days, day:days[0]},this.fetchAgenda);
    }

    fetchAgenda = async() => {
        const {data} = await AgendaApi.byEvent(this.props.event._id);
        const filtered = this.filterByDay(this.state.days[0],data);
        this.setState({list:data,filtered})
    };

    filterByDay = (day,agenda) => {
        //First filter activities by day. Use include to see if has the same day
        //Sort the filtered list by hour start, use moment format HHmm to get a number and used it to sort
        const list = agenda.filter(a => a.datetime_start.includes(day.format("YYYY-MM-DD")))
            .sort((a, b) => Moment(a.datetime_start, "YYYY-MM-DD HH:mm").format("HHmm") - Moment(b.datetime_start, "YYYY-MM-DD HH:mm").format("HHmm"));
        list.map(item=>{
            item.restriction = item.access_restriction_type === "EXCLUSIVE" ? "Exclusiva para: " : item.access_restriction_type === "SUGGESTED" ? "Sugerida para: " : "Abierta";
            item.roles = item.access_restriction_roles.map(({name})=>name);
            return item
        })
        return list
    };

    selectDay = (day) => {
        const filtered = this.filterByDay(day,this.state.list);
        this.setState({filtered,day})

    };

    redirect = () => this.setState({redirect:true});

    render() {
        if(this.state.redirect) return <Redirect to={{pathname:`${this.props.matchUrl}/actividad`,state:{new:true}}}/>;
        const {days,day,filtered} = this.state;
        return (
            <EventContent title={"Programación"} classes={"agenda-list"} addAction={this.redirect} addTitle={"Nueva actividad"}>
                <nav className="level">
                    <div className="level-left">
                        {
                            days.map((date,key)=> <div onClick={()=>this.selectDay(date)} key={key} className={`level-item date ${date===day?"active":""}`}>
                                    <p className="subtitle is-5">
                                        <strong>{date.format("MMM DD")}</strong>
                                    </p>
                                </div>
                            )
                        }
                    </div>
                    <div className="level-right">

                    </div>
                </nav>
                <EvenTable head={["Hora", "Actividad", "Categorías", "Espacio", "Conferencista", ""]}>
                    {filtered.map(agenda=><tr key={agenda._id}>
                        <td>{Moment(agenda.datetime_start,"YYYY-MM-DD HH:mm").format("HH:mm")} - {Moment(agenda.datetime_end,"YYYY-MM-DD HH:mm").format("HH:mm")}</td>
                        <td>
                            <p>{agenda.name}</p>
                            <small className="is-italic">{agenda.restriction} {agenda.roles.map(rol=>rol)}</small>
                            {agenda.type&&<p><strong>{agenda.type.name}</strong></p>}
                        </td>
                        <td>
                            {agenda.activity_categories.map(cat=><span style={{background:cat.color,color:cat.color?"white":""}} className="tag">{cat.name}</span>)}
                        </td>
                        <td>{agenda.space?agenda.space.name:""}</td>
                        <td>{agenda.hosts.map(({name})=><p>{name}</p>)}</td>
                        <td>
                            <Link to={{pathname:`${this.props.matchUrl}/actividad`,state:{edit:agenda._id}}}>
                                <button><span className="icon"><i className="fas fa-2x fa-chevron-right"/></span></button>
                            </Link>
                        </td>
                    </tr>)}
                </EvenTable>
            </EventContent>
        )
    }
}

export default Agenda
