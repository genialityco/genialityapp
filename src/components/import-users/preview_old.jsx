import React, { Component } from 'react';
import ErrorServe from '../modal/serverError';
import LogOut from '../shared/logOut';

class Preview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: [],
      loading: true,
      list: [],
      errorData: {},
      serverError: false,
      auxArr: [],
    };
  }

  componentDidMount() {
    let llaves = [],
      headers = [];
    const { list, extraFields } = this.props;

    //Promesa para recorrer las propiedades del evento/organizaciòn para crear el header de las listas
    const results = extraFields.map(async (item) => {
      return headers.push({ ...item, tag: item.name, used: false });
    });
    Promise.all(results).then(() => {
      //Se crea el arreglo de llaves para comparar con el header
      list.map((list) => {
        return llaves.push(list.key);
      });

      this.setState({ headers });
      this.renderHead(llaves, list, extraFields);
    });
  }

  //Funcion para manejar las propiedades
  //Se parsea si las propiedaeds existen(verde) en el excel o no(rojo)
  renderHead = (llaves, list) => {
    const a = llaves;
    const b = this.state.headers; //campos de evius

    //Se compara los headers con las llaves para realizar la validaciòn de campos
    const comparer = (otherArray) => {
      return (current) => {
        return (
          otherArray.filter((other) => {
            if (other === current.tag) {
              current.used = true;

              return true;
            } else {
              return false;
            }
          }).length === 0 && current.mandatory
        );
      };
    };

    const onlyInB = b.filter(comparer(a));

    this.setState({ auxArr: onlyInB });

    list.map((item) => {
      return (item.used = this.headExist(item.key));
    });
    let auxList = JSON.parse(JSON.stringify(list)); //create a copy of list

    this.setState({ list, loading: false, auxList });
  };

  //Pinta rojo/verde en la cabecera
  headExist = (key) => {
    const j = this.state.headers
      .map((e) => {
        return e.tag;
      })
      .indexOf(key);
    return j !== -1 ? this.state.headers[j].used : false;
  };

  sChange = (item, key) => {
    const auxHead = this.state.auxArr;
    const { headers, list } = this.state;
    const i = auxHead
      .map((e) => {
        return e.tag;
      })
      .indexOf(item.tag);
    const j = headers
      .map((e) => {
        return e.tag;
      })
      .indexOf(item.tag);
    headers[j].used = true;
    let listCopy = JSON.parse(JSON.stringify(list));
    listCopy[key].used = true;
    listCopy[key].key = item.tag;
    auxHead.splice(i, 1);
    this.setState({ auxArr: auxHead, headers, list: listCopy });
    this.headExist(key);
  };

  /*async addField(item, key) {
        
        try {
            const { list } = this.state;
            let resp = await Actions.post(`/api/user/events/${this.props.eventId}/addUserProperty`,{name:item.key});
            
            if(resp){
                list[key].used = true;
                this.setState({ list });
            }
        }catch (e) {
            
            this.setState({timeout: true});
        }
    };

    revertField = (item, position) => {
        const auxHead = this.state.auxArr;
        const list = JSON.parse(JSON.stringify(this.state.list));
        const head = [...this.state.headers];
        const j = head.map(e=>{ return e.tag; }).indexOf(item.key);
        head[j].used = false;
        list[position].used = false;
        list[position].key = this.state.auxList[position].key;
        auxHead.push({tag:item.key,used:false});
        this.setState({auxArr:auxHead,head,list});
    };*/

  render() {
    const { list, auxArr, timeout, serverError, errorData } = this.state;
    const self = this;
    return (
      <React.Fragment>
        <div className='is-pulled-left'>
          <button
            className='button is-primary'
            disabled={auxArr.length > 0}
            onClick={() => {
              this.props.importUsers(list);
            }}>
            Importar
          </button>
        </div>
        {this.state.loading ? (
          <div>Parsing excel</div>
        ) : (
          <div className='columns'>
            <div className='column is-7 preview-list'>
              {list.map((item, index) => {
                return (
                  <div className='preview-column' key={index}>
                    <div className='preview-title'>
                      <div className='preview-title-left'>
                        {!item.used && auxArr.length > 0 && (
                          <span className='icon action_pointer tooltip is-small' data-tooltip='Change Field'>
                            <i className='fas fa-redo' />
                          </span>
                        )}
                        <span
                          className={`${
                            item.used
                              ? 'has-text-success'
                              : `${auxArr.length > 0 ? 'has-text-danger' : 'has-text-warning'}`
                          }`}>
                          {item.key}
                        </span>
                      </div>
                      {!item.used && auxArr.length > 0 && (
                        <div className='preview-title-right'>
                          <div className='dropdown is-right is-hoverable'>
                            <div className='control dropdown-trigger'>
                              <button className='button is-text' aria-haspopup='true' aria-controls='dropdown-menu'>
                                <span className='icon is-small'>
                                  <i className='fas fa-angle-down' />
                                </span>
                              </button>
                            </div>
                            <div className='dropdown-menu' id='dropdown-menu' role='menu'>
                              <div className='dropdown-content'>
                                {auxArr.map((head, llave) => {
                                  return (
                                    <a
                                      className='dropdown-item'
                                      key={llave}
                                      onClick={() => {
                                        self.sChange(head, index);
                                      }}>
                                      {head.tag}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className='preview-items'>
                      {item.list.slice(0, 2).map((item, j) => {
                        return <p key={j}>{item}</p>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='column preview-warning'>
              {auxArr.length > 0 && (
                <p className='has-text-grey-light'>
                  <span className='icon is-medium has-text-danger'>
                    <i className='fas fa-exclamation-circle'></i>
                  </span>
                  <span>
                    <span>
                      Los siguientes campos <strong className='has-text-danger'>Obligatorios</strong> no se han
                      definido:{' '}
                    </span>
                    <span>
                      {auxArr.map((item) => {
                        return <strong key={item.tag}>{item.tag} </strong>;
                      })}
                    </span>
                  </span>
                </p>
              )}
              {auxArr.length < 0 && (
                <p className='has-text-grey-light'>
                  <span className='icon is-medium has-text-warning'>
                    <i className='fas fa-exclamation-circle'></i>
                  </span>
                  <span>
                    Tienes algunos campos <strong className='has-text-warning'>Opcionales</strong> sin definir.
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
        {timeout && <LogOut />}
        {serverError && <ErrorServe errorData={errorData} />}
      </React.Fragment>
    );
  }
}

export default Preview;