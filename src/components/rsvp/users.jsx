import React, {Component} from 'react';
import { Redirect } from 'react-router-dom';
import {EventsApi, UsersApi} from "../../helpers/request";
import UserModal from "../modal/modalUser";
import ImportUsers from "../modal/importUser";
import SearchComponent from "../shared/searchTable";
import { FormattedMessage } from "react-intl";
import Dialog from "../modal/twoAction";
import API from "../../helpers/request"
import Table from "../shared/table";
import { FaSortUp, FaSortDown, FaSort} from "react-icons/fa";
import LogOut from "../shared/logOut";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class UsersRsvp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            actualEvent:{},
            events: [],
            users: [],
            totalUsers: [],
            selection: [],
            auxArr: [],
            state: 'all',
            preselection: [],
            importUser: false,
            addUser:    false,
            checked: false,
            ticket: false,
            indeterminate: false,
            loading:    true,
            pages:      null,
            pageSize:   10,
            message:    {class:'', content:''},
            columns:    columns,
            sorted:     []
        };
        this.checkEvent = this.checkEvent.bind(this);
        this.modalImport = this.modalImport.bind(this);
        this.addToList = this.addToList.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    async componentDidMount() {
        try {
            const listEvents = await EventsApi.mine();
            const eventId = this.props.event._id;
            const resp = await UsersApi.getAll(eventId);
            const users = handleUsers(resp.data);
            const pos = listEvents.data.map((e)=> { return e._id; }).indexOf(eventId);
            listEvents.data.splice(pos,1);
            if(this.props.selection.length>0) this.setState({selection:this.props.selection});
            const columns = this.state.columns;
            let index = columns.map((e) => { return e.id; }).indexOf('properties.name');
            if(index<=-1) columns.push({
                ...this.genericHeaderArrows(),
                headerText: "Name",
                id: "properties.name",
                accessor: d => d.name
            },{
                ...this.genericHeaderArrows(),
                headerText: "Email",
                id: "properties.email",
                accessor: d => d.email,
                width: 200
            });
            columns.splice(0, 1);
            columns.unshift(
                {
                    Header: (
                        <div className="field">
                            <input className="is-checkradio is-info is-small" id={"checkallUser"}
                                   type="checkbox" name={"checkallUser"} onClick={this.toggleAll}/>
                            <label htmlFor={"checkallUser"}>Todos</label>
                        </div>
                    ),
                    id: "checked_in",
                    accessor: d => d,
                    Cell: props => <div>
                        <input className="is-checkradio is-info is-small" id={"checkinUser"+props.value.id}
                               type="checkbox" name={"checkinUser"+props.value.id} checked={this.isChecked(props.value.id)} onChange={(e)=>{this.toggleSelection(props.value)}}/>
                        <label htmlFor={"checkinUser"+props.value.id}/>
                    </div>,
                    width: 80,
                    sortable: false,
                    filterable: false,
                }
            );
            this.setState({events:listEvents.data,users,userReq:resp,userAux:users,loading:false,actualEvent:this.props.event});
            this.handleCheckBox(users,this.state.selection)
        }catch (e) {
            console.log(e);
            this.setState({timeout:true,loading:false,events:[],users:[]});
        }
    }

    //Fetch user of selected event
    async checkEvent(event) {
        if(this.state.actualEvent._id !== event._id){
            try{
                const resp = await UsersApi.getAll(event._id);
                const users = handleUsers(resp.data);
                const columns = this.state.columns;
                let index = columns.map((e) => { return e.id; }).indexOf('state_id');
                if(index>=0) columns.splice(index,1);
                this.setState({ actualEvent:event, users, userAux:users });
                this.handleCheckBox(users,this.state.selection)
            }catch (e) {
                console.log(e.response);
                this.setState({timeout:true,loader:false});
            }
        }
    };

    handleCheckBox = (users, selection) => {
        /*let exist = 0,
            unexist = 0;
        for(let i=0;i<users.length;i++){
            const pos = selection.map((e)=> { return e.id; }).indexOf(users[i].id);
            (pos < 0) ?  unexist++ : exist++;
        }
        if(exist === users.length){
            this.refs.checkbox.indeterminate = false;
            this.refs.checkbox.checked = true;
        }
        else if(unexist === users.length){
            this.refs.checkbox.indeterminate = false;
            this.refs.checkbox.checked = false;
        }
        else {
            this.refs.checkbox.indeterminate = true;
            this.refs.checkbox.checked = false;
        }*/
    };

    //Add all of users to selection state
    toggleAll = () => {
        const selectAll = !this.state.selectAll;
        let selection = [...this.state.selection];
        const currentRecords = this.state.totalUsers;
        if (selectAll) {
            currentRecords.forEach(item => {
                const pos = selection.map((e)=> { return e.id; }).indexOf(item.id);
                if(pos<=-1) selection.push(item);
            });
        }
        else{
            currentRecords.map(user=>{
                const pos = selection.map((e)=> { return e.id; }).indexOf(user.id);
                if (pos >= 0) {
                    selection = [
                        ...selection.slice(0, pos),
                        ...selection.slice(pos + 1)
                    ];
                }
            })
        }
        this.handleCheckBox(currentRecords,selection);
        this.setState({ selectAll, selection, auxArr: selection });
    };

    //Add or remove user to selection state
    toggleSelection = (user) => {
        let selection = [...this.state.selection];
        let auxArr = [...this.state.auxArr];
        const keyIndex = selection.map((e)=> { return e.id; }).indexOf(user.id);
        if (keyIndex >= 0) {
            selection = [
                ...selection.slice(0, keyIndex),
                ...selection.slice(keyIndex + 1)
            ];
            auxArr = [
                ...auxArr.slice(0, keyIndex),
                ...auxArr.slice(keyIndex + 1)
            ];
        } else {
            selection.push(user);
            auxArr.push(user);
        }
        this.handleCheckBox(this.state.users, selection);
        this.setState({ selection, auxArr });
    };

    //Check if user exist at selection state
    isChecked = (id) => {
        if(this.state.selection.length>0){
            const pos = this.state.selection.map((e)=> { return e.id; }).indexOf(id);
            return pos !== -1
        }
    };

    //Remove user at selection state
    removeThis = (user) => {
        let selection = [...this.state.selection];
        const keyIndex = selection.map((e) => {
            return e.id;
        }).indexOf(user.id);
        selection = [
            ...selection.slice(0, keyIndex),
            ...selection.slice(keyIndex + 1)
        ];
        this.handleCheckBox(this.state.users,selection);
        this.setState({ selection, auxArr: selection });
    };

    //Modal add single User
    modalUser = () => {
        const html = document.querySelector("html");
        html.classList.add('is-clipped');
        this.setState((prevState) => {
            return {addUser:!prevState.addUser,edit:false}
        });
    };
    closeModal = () => {
        const html = document.querySelector("html");
        html.classList.remove('is-clipped');
        this.setState((prevState) => {
            return {addUser:!prevState.addUser,edit:undefined}
        });
    };

    //Add user to current list at middle column
    async addToList(user){
        console.log(user);
        try{
            const {data} = await UsersApi.getAll(this.props.event._id);
            const users = handleUsers(data);
            toast.success('Usuario creado exitosamente');
            this.setState({ users });
        }catch (e) {
            console.log(e.response);
            toast.error("Algo salió mal. Intentalo de nuevo");
            this.setState({timeout:true,loader:false});
        }
    };

    //Modal import
    async modalImport() {
        try{
            const html = document.querySelector("html");
            const {data} = await UsersApi.getAll(this.props.event._id);
            const users = handleUsers(data);
            this.setState((prevState) => {
                !prevState.importUser ? html.classList.add('is-clipped') : html.classList.remove('is-clipped');
                return {importUser:!prevState.importUser,users}
            });
        }catch (e) {
            console.log(e.response);
            this.setState({timeout:true,loader:false});
        }
    };

    //Search records at third column
    searchResult = (data) => {
        !data ? this.setState({selection:this.state.auxArr}) : this.setState({selection:data})
    };

    //Button Ticket Logic
    showTicket = () => {
        const html = document.querySelector("html");
        this.setState((prevState)=>{
            !prevState.ticket ? html.classList.add('is-clipped') : html.classList.remove('is-clipped');
            return {ticket:!prevState.ticket}
        })
    };
    sendTicket = () => {
        const { event } = this.props;
        const { selection } = this.state;
        const url = '/api/eventUsers/bookEventUsers/'+event._id;
        const html = document.querySelector("html");
        let users = [];
        selection.map(item=>{
            return users.push(item.id)
        });
        this.setState({disabled:true});
        API.post(url, {eventUsersIds:users})
            .then((res) => {
                console.log(res);
                toast.success('Ticket sent successfully');
                html.classList.remove('is-clipped');
                this.setState({redirect:true,url_redirect:'/event/'+event._id+'/messages',disabled:false})
            })
            .catch(e=>{
                console.log(e.response);
                toast.error('Something wrong. Try again later');
                this.setState({timeout:true,loader:false});
            });

    };

    //Table
    fetchData(state, instance) {
        this.setState({ loading: true });
        this.requestData(
            this.state.userReq,
            this.state.actualEvent._id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            console.log(res);
            const pageSize = res.total;
            const page = Math.ceil(res.total / 10);
            //const page = Math.ceil(res.total/res.perPage);
            const pager = this.getPager(page, res.total, state.page, 10);
            let pageOfItems = (res.rows.length > 0) ? res.rows.slice(pager.startIndex, pager.endIndex + 1):[];
            this.setState({
                users: (res.rows.length <=0) ? [{id:'',name:'',email:''}]:pageOfItems,
                totalUsers: res.rows,
                pages: page,
                pageSize: pageSize,
                loading: false
            });
        });
    }
    getSortedComponent = (id) => {
        // console.log('getSortedComponent sorted:',this.state.sorted);
        let sortInfo = this.state.sorted.filter(item => item.id === id);
        if (sortInfo.length) {
            // console.log('getSortedComponent sortInfo:',sortInfo[0].desc);
            if (sortInfo[0].desc === true) return <FaSortDown />;
            if (sortInfo[0].desc === false) return <FaSortUp />;
        }
        return <FaSort />;
    };
    genericHeaderArrows = () => {
        return {
            Header: props => {
                const Sorted = this.getSortedComponent(props.column.id);
                return (<span>{props.column.headerText} {Sorted}</span>);
            },
            headerStyle: { boxShadow: "none" }
        };
    };
    requestData = (users, eventId, pageSize, page, sorted, filtered) => {
        return new Promise((resolve, reject) => {
            let filteredData = users;
            let res = {rows: filteredData.data, pages: filteredData.meta.total};
            let query = '?';
            if (filtered.length) {
                let queryFilter = [];
                filtered.map(filter=>{
                    if(filter.value!=='all') return queryFilter.push({"id":filter.id,"value":filter.value,"comparator":"like"})
                });
                queryFilter = JSON.stringify(queryFilter);
                query = query+`filtered=${queryFilter}`;
            }
            if (sorted.length) {
                let querySort = [];
                sorted.map(sort=>{
                    return querySort.push({"id":sort.id,"order":sort.desc?"desc":"asc"})
                });
                querySort = JSON.stringify(querySort);
                query = query+`&orderBy=${querySort}`;
            }
            API.get(`/api/events/${eventId}/eventUsers${query}&page=1&pageSize=10000`)
                .then(({data})=>{
                    filteredData = data;
                    const users = handleUsers(filteredData.data);
                    res = {rows: users, total: filteredData.meta.total, perPage: filteredData.meta.per_page};
                    resolve(res)
                })
                .catch(e=>{
                    console.log(e.response);
                    this.setState({timeout:true,loader:false});
                });

        });
    };
    getPager = (totalPages, totalItems, currentPage, pageSize) => {
        const startIndex = currentPage * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startIndex: startIndex,
            endIndex: endIndex
        };
    }

    render() {
        if(this.state.redirect) return (<Redirect to={{pathname: this.state.url_redirect}} />);
        const {users, pages, pageSize, loading, columns, timeout, disabled, events} = this.state;
        return (
            <React.Fragment>
                <div className="columns is-multiline event-inv-send">
                    <div className="column is-12 title-col">
                        <h2 className="subtitle has-text-weight-bold">Invitar a {this.props.event.name}</h2>
                    </div>

                    <div className="column is-9 big-col">
                        <div className="columns">
                            <div className="column is-4">
                                <div className="">
                                    <div className="event-inv-users">
                                        <h3 className="event-inv-subtitle">Asistentes a este evento</h3>
                                        <div className="field event-inv-option">
                                            <input className="is-checkradio" id="thisEvent"
                                                type="radio" name="thisEvent" onChange={(e)=>{this.checkEvent(this.props.event)}}
                                                checked={this.state.actualEvent._id === this.props.event._id}/>
                                            <label htmlFor="thisEvent">{this.props.event.name}</label>
                                        </div>
                                        {
                                            this.state.actualEvent._id === this.props.event._id && (
                                                <React.Fragment>
                                                    <div className="field control">
                                                        <button className="btn-list button is-primary is-outlined is-small" onClick={this.modalUser}>
                                                            <span>Agregar Usuario</span>
                                                            <span className="icon is-small">
                                                                <i className="fa fa-plus"></i>
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <div className="field control">
                                                        <button className="btn-list button is-primary is-outlined is-small" onClick={this.modalImport}>
                                                            <span>Importar Usuarios</span>
                                                            <span className="icon is-small">
                                                                <i className="fa fa-plus"></i>
                                                            </span>
                                                        </button>
                                                    </div>
                                                </React.Fragment>
                                            )
                                        }
                                    </div>
                                    {
                                        events.length>=1&&
                                        <div className="event-inv-users">
                                            <h3 className="event-inv-subtitle">Asistentes a eventos pasados</h3>
                                            {
                                                events.map((event,key)=>{
                                                    return <div className="field event-inv-option" key={key}>
                                                        <input className="is-checkradio" id={`event${event._id}`}
                                                            type="radio" name={`event${event._id}`} onChange={(e)=>{this.checkEvent(event)}}
                                                            checked={this.state.actualEvent._id === event._id}/>
                                                        <label htmlFor={`event${event._id}`} className="has-text-weight-bold has-text-grey">{event.name}</label>
                                                    </div>
                                                })
                                            }
                                        </div>
                                    }
                                </div>
                            </div>

                            <div className="column is-8">
                                <strong className="is-5">
                                    {
                                        this.state.actualEvent._id === this.props.event._id ?
                                            'Usuarios ' + this.props.event.name : 'Usuarios ' + this.state.actualEvent.name
                                    }
                                </strong>
                                {users.length>=1?
                                    <Table
                                        columns={columns}
                                        manual
                                        data={users}
                                        pages={pages}
                                        loading={loading}
                                        onFetchData={this.fetchData}
                                        filterable
                                        onSortedChange={sorted => this.setState({ sorted })}
                                        defaultFilterMethod={(filter, row) =>
                                            String(row[filter.id]) === filter.value}
                                        defaultPageSize={pageSize}
                                        showPageSizeOptions={false}
                                        className="-highlight"/>
                                    :<p>Aun no hay usuarios. Intenta crear uno o importarlo desde un excel</p>
                                }
                            </div>
                        </div>
                    </div>


                    <div className="column is-3 small-col">
                        <div className="">
                            <div className="field">
                                <strong>Seleccionados - {this.state.selection.length}</strong>
                            </div>
                            {
                                this.state.selection.length > 0 &&
                                    <SearchComponent  data={this.state.selection} kind={'invitation'} searchResult={this.searchResult}/>
                            }   
                            <div className="event-inv-selected field">
                                {
                                    this.state.selection.map((item,key)=>{
                                        return <div key={key} className="media">
                                            <div className="media-content">
                                                <p className="title is-6">{item.name}</p>
                                                <p className="subtitle is-7">{item.email}</p>
                                            </div>
                                            <div className="media-right">
                                                <span className="icon has-text-danger is-small" onClick={(e)=>{this.removeThis(item)}}>
                                                    <i className="fa fa-times-circle"/>
                                                </span>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                            {
                                this.state.selection.length > 0 &&
                                <div>
                                    <div className="field control btn-wrapper">
                                        <button className="button is-primary"
                                                disabled={this.state.selection.length<=0}
                                                onClick={this.showTicket}>
                                            Enviar Tiquete
                                        </button>
                                    </div>
                                    <div className="field control btn-wrapper">
                                        <button className="button is-primary is-outlined"
                                                disabled={this.state.selection.length<=0}
                                                onClick={(e)=>{this.props.userTab(this.state.selection)}}>
                                            Enviar Invitación
                                        </button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <UserModal handleModal={this.closeModal} modal={this.state.addUser} eventId={this.props.event._id} addToList={this.addToList}
                         value={this.state.selectedUser} extraFields={this.props.event.user_properties} edit={this.state.edit}/>
                <ImportUsers handleModal={this.modalImport} modal={this.state.importUser} eventId={this.props.event._id} extraFields={this.props.event.user_properties}/>
                <Dialog modal={this.state.ticket} title='Tiquetes' message={{class:'',content:''}}
                        content={<p>
                            Está seguro de enviar {this.state.selection.length} tiquetes
                        </p>}
                        first={{
                            title:'Enviar',disabled:disabled,
                            class:'is-info',action:this.sendTicket}}
                        second={{
                            title:<FormattedMessage id="global.cancel" defaultMessage="Sign In"/>,
                            class:'',action:this.showTicket}}/>
                {timeout&&(<LogOut/>)}
            </React.Fragment>
        );
    }
}

//Add only id, name and email
const handleUsers = (list) => {
        let users = [];
        list.map(user=>{
            return users.push({name:user.properties.name,email:user.properties.email,state:user.state.name,id:user._id})
        });
        return users;
};

const columns = [
    {},
    {
        Header: "Estado",
        id: "state_id",
        accessor: d => d.state,
        sortable: false,
        Filter: ({ filter, onChange }) =>
            <select
                onChange={event => onChange(event.target.value)}
                style={{ width: "100%" }}
                value={filter ? filter.value : "all"}
            >
                <option value="all">TODOS</option>
                <option value="5b0efc411d18160bce9bc706">DRAFT</option>
                <option value="5b859ed02039276ce2b996f0">BOOKED</option>
                <option value="5ba8d200aac5b12a5a8ce748">RESERVED</option>
                <option value="5ba8d213aac5b12a5a8ce749">INVITED</option>
            </select>
    }
];

export default UsersRsvp;