import React, { Component, Fragment } from 'react';
import { Alert, Button, Card, Col, Input, Row, Space, Typography } from 'antd';
import withContext from '../../../Context/withContext';
import { EventsApi } from '../../../helpers/request';
import { SettingOutlined, WarningOutlined } from '@ant-design/icons';
import Meta from 'antd/lib/card/Meta';
import Modal from 'antd/lib/modal/Modal';
import { connect } from 'react-redux';
import { setVirtualConference } from '../../../redux/virtualconference/actions';
import { withRouter } from 'react-router';
import  Parser  from 'html-react-parser';
import ReactPlayer from 'react-player';
class InformativeSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markup: '',
      informativeSection: null,
      galeries: [],
      isModalVisible: false,
      selectedGalery: null,
      value_oferta: null,
      valueoff: false,
      isModalVisibleRegister: false,
      ellipsis: true,
    };
  }

  componentDidMount() {
    this.props.setVirtualConference(false);
    this.setState({
      informativeSection: this.props.cEvent.value.itemsMenu.informativeSection,
      markup: this.props.cEvent.value.itemsMenu.informativeSection.markup,
    });
    //OBTENER GALERIA
    // EventsApi.getGallery(this.props.cEvent.value._id).then((resp) => {
    //   if (resp && resp.data) {
    //     this.setState({
    //       galeries: resp.data,
    //     });
    //   }
    // });
    /*EventsApi.getGallery(this.props.cEvent.value._id).then((resp) => {
      if (resp && resp.data) {
        this.setState({
          galeries: resp.data,
        });
      }
    });*/
  }

  componentWillUnmount() {
    this.props.setVirtualConference(true);
  }

  showModal = () => {
    this.setState({
      isModalVisible: true,
    });
  };
  // CUANDO SE OFRECE UN PRODUCTO
  handleOk = async () => {
    //validación para campo oferta vacío
    if (this.state.value_oferta === null || this.state.value_oferta === '') {
      this.setState({
        valueoff: true,
      });
      return false;
      //validación para oferta mayor al precio base
    } else if (this.state.value_oferta !== null || this.state.value_oferta !== '') {
      if (parseFloat(this.state.value_oferta) < this.state.selectedGalery.price) {
        this.setState({
          valueoff: true,
        });
        return false;
      } else {
        //gestionar y guardar valor de oferta
        let items = this.state.galeries;
        let newPuja = { ...this.state.selectedGalery, price: this.state.value_oferta };
        let newItems = items.map((item) => {
          if (item._id === this.state.selectedGalery._id) {
            return newPuja;
          } else {
            return item;
          }
        });
        let oferta = { valueOffered: parseFloat(this.state.value_oferta) };
        let resp = await EventsApi.storeGalley(this.props.cEvent.value._id, this.state.selectedGalery._id, oferta);

        this.inputOferta.value = '';
        this.setState({
          valueoff: false,
          galeries: newItems,
          value_oferta: null,
          selectedGalery: null,
          isModalVisible: false,
        });
      }
    }
  };
  //ir a registrar usuario
  registerUser = () => {
    this.props.history.push(`/landing/${this.props.cEvent.value._id}/tickets`);
  };
  //Cerrar modal
  handleCancel = () => {
    this.setState({
      isModalVisible: false,
    });
  };
  onChangeValue = (e) => {
    this.setState({
      value_oferta: e.target.value,
    });
  };

  pujar = (articulo) => {
    this.setState(
      {
        value_oferta: articulo.price,
        selectedGalery: articulo,
      },
      () => this.showModal()
    );
  };
  render() {
    const { markup, informativeSection, ellipsis } = this.state;
    const { Paragraph } = Typography;
    return (
      <Fragment>
        {informativeSection !== null && (
          <div className='site-card-border-less-wrapper' style={{ marginTop: 35 }}>
            <Card
              title={informativeSection.name || 'clasificación'}
              bordered={false}
              style={{ width: 1000, margin: 'auto' }}>
              {this.props.cEvent.value._id === '60797bfb2a9cc06ce973a1f4' && (
                <>
                  <p>
                    Llega el momento que tanto hemos esperado 😃 Inscribite al #IIITorneodeAjedrezdelCaribeALaRuedaRueda
                    ♟️ del 15 de mayo al 30 de junio a través de www.fundacionalaruedarueda.org. Te invitamos a que te
                    conectes a nuestras redes sociales 🤳🏽 para conocer más información 🤓. ¡No te lo pierdas!
                    #AjedrezDesdeElCaribeParaColombia
                  </p>
                  <a
                    href='https://www.chesskid.com/es/login'
                    target='_blank'
                    rel='noreferrer'
                    className='ant-btn ant-btn-primary'
                    style={{ width: 180 }}>
                    Inscríbete
                  </a>
                </>
              )}
              {this.props.cEvent.value._id !== '60797bfb2a9cc06ce973a1f4' && this.props.cEvent.value._id !=='611c285104f5d97d1b0f5ed2' && markup && Parser(markup)}
              {this.props.cEvent.value._id == '611c285104f5d97d1b0f5ed2' && (
              <>
                <h2 style={{ fontWeight: 700, fontSize: '20px', borderBottom: '1px solid #C0BAB9', marginTop: '15px',margin:'auto' }}>
                Proyecto Casos Clínicos de Obesidad: Adiposopatia en el Siglo XXI, más allá del peso Ideal
                </h2>
                <br></br>
                <ReactPlayer
                  style={{ width: '560px', height: '445px', margin: 'auto' }}
                  url='https://vimeo.com/589393733' 
                  controls
                />
              </>
            )}
            </Card>
            {this.props.cEvent.value._id == '60797bfb2a9cc06ce973a1f4' && (
              <div  style={{ width: 1000, margin: 'auto' }}>
                <iframe
                  src='https://firebasestorage.googleapis.com/v0/b/eviusauth.appspot.com/o/EventoAjedrez%2FCLASIFICADOS%20APARTADO%2014.08%20-%20III%20TORNEO%20DE%20AJEDREZ%20DEL%20CARIBE%202021.pdf?alt=media&token=0375998c-f7a6-4f76-aea8-911e2bce21f2'
                  style={{ width: 1000, height: 1000, marginTop: '45px' }}></iframe>
              </div>
            )}
            {this.props.cEvent.value._id == '60797bfb2a9cc06ce973a1f4' && (
              <div  style={{ width: 1000, margin: 'auto' }}>
                <iframe
                  src='https://firebasestorage.googleapis.com/v0/b/eviusauth.appspot.com/o/EventoAjedrez%2FCLASIFICADOS%20%20SINCELEJO%2015.08%20-%20III%20TORNEO%20DE%20AJEDREZ%20DEL%20CARIBE%202021.pdf?alt=media&token=b2b72c1a-8c09-45e3-9bb4-17f6c5be9376'
                  style={{ width: 1000, height: 1000, marginTop: '45px' }}></iframe>
              </div>
            )}          
          </div>
        )}
         
      </Fragment>
    );
  }
}
const mapDispatchToProps = {
  setVirtualConference,
};

let InformativeSection2WithContext = connect(null, mapDispatchToProps)(withContext(withRouter(InformativeSection)));
export default InformativeSection2WithContext;
