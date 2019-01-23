import React, {Component} from 'react';
import '../crud.css'
import Table from '../../table';
import Pagination from "../../../shared/pagination";

class ListCrud extends Component {
    constructor(props){
        super(props);
        console.log('props ===>> ')
       this.state = {
            modalFields: [],
            pageOfItems: []
       }
     
    }

    componentDidMount() {

        const fields = this.props.config.fieldsModal;
        this.setState({modalFields: fields});
        let newInfo = {};
        /*
            * This is to create keys inside newInfo object and avoid uncontrolled input error
        */
        fields.map(info => (
            newInfo[info.name] = ''));
        this.setState({newInfo, edit:false});
    }

    onChangePage = (pageOfItems) => {
        this.setState({ pageOfItems: pageOfItems });
    };

    render() {
    
        return(
            <React.Fragment>
                 
                <table className="table"> 
                                            <thead>
                                                <tr>                                                  
                                                {
                                                    this.props.config.ListCrud.headers.map((item,key)=>{
                                                        return <th key={key}>{item}</th>
                                                })
                                                }
                                                </tr>
                                            </thead>
                                            <tbody>
                                           {
                                                this.props.data.map((item,key)=>{
                                                    return <tr key={key}>
                                                   {Object.keys(item).map((keyField,key)=>{
                                                       //Si el campo no se llama imagen no mostramos la imagen
                                                       return  (item[keyField]) ? <td key={key}>{ (keyField != 'image') ? item[keyField]: <img className="imageTable" src={item[keyField]} height="25" width= "25" alt=""/> } </td>: (null)
                                                    })}
                                                    </tr>
                                                })
                                            }                                         
                                            </tbody>
                </table>
                <Pagination
                    items={this.props}
                    onChangePage={this.onChangePage}
                />
            </React.Fragment>
        )
    }

}

export default ListCrud;