import React, {Component} from 'react';
import ModalCrud from "../components/modalCrud";
import configCrud from '../config.jsx'
import ListCrud from '../components/listCrud';
import {Actions} from "../../../../helpers/request";

class ContainerCrud extends Component {
    constructor(props){
        super(props);
        this.state = {
            show: false,
            modal: false,
            fields: [],
            pageOfItems: [],
            data: {},
            itemInfo: {},
            valid: true
        };
        
       

        this.config = configCrud[this.props.idModel];
        this.eventId =this.props.eventId._id;   
        this.validForm = this.validForm.bind(this);
    }
    componentDidMount() {
        this.getData();
      
    }

    componentWillUnmount(){
        this.setState({     show: false,
            modal: false,
            fields: [],
            pageOfItems: [],
            data: {},
            itemInfo: {},
            valid: true})
    }

     //Usamos esta funcion para generar las cabeceras de las tablas con su llave y su label, solo se usa como ayuda, no hace parte de el desarrollo
     generaCabecerasDeConfiguracion(array){
        console.log('HEADERS DE CONFIGURACION===>> ', array)
     }

    // Consigue la informacion que se va a cargar en la lista de la tabla de el crud
    async getData(){
      
        const pageOfItems = [
        {
            id: '',
            name : '',
            created_at: '',
            updated_at: ''
        }
        ]
        let resp = await Actions.getAll(this.config.ListCrud.urls.getAll(this.eventId));

        try{
            this.generaCabecerasDeConfiguracion(Object.keys(resp.data[0]))
        }catch(e){
            console.log('no hay datos pra generar las cabeceras')
        }
        
      
        this.setState({
            pageOfItems: []
        });
        this.setState({
            pageOfItems: resp.data
        });
    }

   

    /*
        * Method to dynamic validations 
    */
    validForm = (dataFields, dataForm) => {
        const EMAIL_REGEX = new RegExp('[^@]+@[^@]+\ \.[^@]+');
        const fieldsForm = dataFields, infoNew = dataForm,
            mandatories = fieldsForm.filter(field => field.mandatory), validations = [];
        mandatories.map((field,key)=>{
            let valid;
            if(field.type === 'email')  valid = infoNew[field.name].length > 5 && infoNew[field.name].length < 61 && EMAIL_REGEX.test(infoNew[field.name]);
            if(field.type === 'text' || field.type === 'list')  valid = infoNew[field.name] && infoNew[field.name].length > 0 && infoNew[field.name] !== "";
            if(field.type === 'number') valid = infoNew[field.name] && infoNew[field.name] >= 0;
            if(field.type === 'boolean') valid = (typeof infoNew[field.name] === "boolean");
            return validations[key] = valid;
        });
        const valid = validations.reduce((sum, next) => sum && next, true);
        this.setState({valid:!valid})
    };
   

    //consigue la informacion de elemento para cargarla en formulacion en caso de que se quiera editar
    async update(id){
        let data = await Actions.getOne(this.config.ListCrud.urls.getOne(this.eventId),`/${id}`);
        this.setState(
             {itemInfo: data}
        )

        //mostramos el modal con la informacion cargada
        this.setState(prevState => {
            return {modal: true, show: true}
        });
    }

    async delete(id){
       
            await Actions.delete(this.config.ListCrud.urls.delete(this.eventId),id);  
            this.updateTable()
    
    }

    showModal = () => {
        this.setState(prevState => {
            return {modal: true, show: true}
        });

        //Limpiamos la informacion de el formulario cuando vayamos a editar
        this.setState(
            {itemInfo: {}}
       )
    };

    hideModal = () => {
        this.setState({ show: false });
    };
    //Refresca la pagina para mostrar los cambios
    updateTable(){
        this.getData();
    };

    render() {
        
        return (
            <div>{
                this.state.show ? 
                (<ModalCrud itemInfo = {this.state.itemInfo} hideModal={this.hideModal} updateTable= {this.updateTable.bind(this)} 
                modal={this.state.modal} info={this.config} config={this.config} enventInfo={this.props.eventId}
                validForm={this.validForm} validInfo={this.state.valid}/>) : ("")
            }
                <div className="column is-narrow has-text-centered">
                    <button className="button is-primary" onClick={this.showModal}>Agregar {this.props.buttonName} +</button>
                </div>
                <React.Fragment>
                    <ListCrud  data={this.state.pageOfItems} config={this.config} delete={this.delete.bind(this)}  update={this.update.bind(this)} />
                </React.Fragment>
            </div>
        );
    }
}

export default ContainerCrud;