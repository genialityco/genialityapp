import React, { Component } from 'react'
import { Form, Input, Col, Row, Button, Spin, Card } from "antd";
import { app } from "../../../helpers/firebase";
import * as Cookie from "js-cookie";
import FormTags from "./constants";

const textLeft = {
  textAlign: "left",
};


class UserLogin extends Component {

  constructor( props ) {
    super( props );
    this.reCaptchaRef = React.createRef();
    this.state = {
      user: {},
      emailError: false,
      valid: true,
      extraFields: [],
      loading: false,
      initialValues: {},
      eventUsers: [],
      registeredUser: false,
      submittedForm: false,
      successMessage: null,
      refreshToken: null,
      enabledLoginForm: true,
      enabledVerificationForm: false,
      errorLogin: false,
      errorValidation: false,
      eventId: this.props.eventId,
      formTexts: FormTags('login')
    };
  }  

  async componentDidMount(){
    const {eventId} = this.props

    this.initializeCaptcha();    
    
    await app.auth().onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then(async function (idToken) {
          if(idToken){
            Cookie.set("evius_token", idToken); 
            setTimeout(function () {
              window.location.replace(`/landing/${eventId}?token=${idToken}`);
            }, 1000);
          }
        })
      }
    })
  }
  
  componentDidUpdate ( prevProps, prevState ) {
    let { loading } = this.state;

    if ( prevState.loading !== loading ){
      if ( !loading ){
        // Inicializa el captcha para la autenticacion por SMS
        this.initializeCaptcha();
      }
    }
  }    
 
  initializeCaptcha = () => {
    let { initialValues } = this.state;
    if ( Object.entries( initialValues ).length == 0 ) {
      //console.log( "this.reCaptchaRef:", this.reCaptchaRef, this.reCaptchaRef.current, this.reCaptchaRef.current.id );
      window.recaptchaVerifier = new app.auth.RecaptchaVerifier( this.reCaptchaRef.current.id, {
        size: "invisible",
        callback: function ( response ) {
          console.log( "response,", response );
        },
        "expired-callback": function () {
          console.log( "response callback expired" );
        },
      } );

      window.recaptchaVerifier.render().then( function ( widgetId ) {
        window.recaptchaWidgetId = widgetId;
      } );
    }
  };

  handleLoginWithPhoneNumber = ( values ) => {
    app.auth().signInWithEmailAndPassword(values.email, values.password).catch(function(error) {
      // Handle Errors here.
      console.error(error.code);
      console.error(error.message);
      // ...
    });
    
    
    /* El script comentariado en este método corresponde al método de autenticacion con celular
    NO BORRAR
    */
   
    // var appVerifier = window.recaptchaVerifier;
    //let phone = `+57${ values.phone }`;
        
    // app
    // .auth()
    // .signInWithPhoneNumber( phone, appVerifier )
    // .then( function ( confirmationResult ) {
    //   window.confirmationResult = confirmationResult;
    //   console.log( "confirmationResult:", confirmationResult );
    // })
    // .catch( function ( error ) {
    //   console.error( "error:", error.message );
    //   this.setState({errorLogin: true})
    // });
    // this.setState({enabledLoginForm: false})
    // this.setState({loading: true})

    // setTimeout(()=>{
    //   this.setState({loading: true})
    //   this.setState({enabledVerificationForm: true})
    // },1000)
  };
  
  loginEmailPassword = (data) => {
    
    this.setState({errorLogin: false })
    app.auth().signInWithEmailAndPassword(data.email, data.password)
    .catch(()=>{
      console.error('Error: Email or password invalid')
      this.setState({errorLogin: true })
      this.setState({loading: false})
    });
  }
  
  handleLoginEmailPassword = async (values) => {
    this.setState({loading: true})
    await this.loginEmailPassword(values)
  }

  handleVerificationWithPhoneNumber= (values) =>{
    this.setState({loading: false})
    var credential = app.auth.PhoneAuthProvider.credential(window.confirmationResult.verificationId, values.verificationCode);
    app.auth().signInWithCredential(credential)
    .then(response=>{
      console.log('response',response)
      this.setState({ errorValidation: false})
    })
    .catch(err=>{
      console.log('upps hubo un error')
      this.setState({ errorValidation: true})
    })
    // window.confirmationResult.confirm(values.verificationCode)
    // .then(function (result) {
    //   const user = result.user;
    //   return  user.refreshToken
      
    //   //window.localStorage.setItem('refresh_token', user.refreshToken)
    // })
    // .then((refreshToken)=>{
    //   this.setState({refreshToken: refreshToken})
    //   console.log('*********************refreshtoken',refreshToken)
    // })    
    // .catch(function (error) {
    //  console.error(error)
    // });
  }
  
  render(){
    const {formTexts} = this.state
    return (
    //<div style={{background: '#ffffff', padding: '50px', width: '450px', borderRadius: '15px', margin: 'auto'}}>
    <Card title={formTexts.titleForm} bodyStyle={textLeft}>
    {/* {this.state.enabledLoginForm && (
      <Form onFinish={this.handleLoginWithPhoneNumber}>
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <Form.Item
              label="Celular"
              name="phone"
              rules={[
                {
                  required: true,
                  message: 'Ingrese nÃºmero de celular',
                },
              ]}
              >
                <Input />
            </Form.Item>
          </Col>
        </Row>  
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <div ref={ this.reCaptchaRef } id="este-test"></div>
          </Col>
        </Row>
        {this.state.errorLogin && (
          <Row gutter={[24, 24]}>
            <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
              <span style={{color: 'red'}}>Sucedió un error, verifique la información ingresada</span>
            </Col>
          </Row> 
        )}    
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Ingresar
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )} */}

    {/* Inicio  de formulario para autenticación con Email y contraseña */}
    {this.state.enabledLoginForm && (
      <Form onFinish={this.handleLoginEmailPassword}>
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <Form.Item
              label="E-Mail"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Ingrese E-Mail',
                },
              ]}
              >
                <Input style={{ width: "300px" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Ingrese su password',
                  
                },
              ]}
              >
                <Input type='password' style={{ width: "300px" }}/>
            </Form.Item>
          </Col>
        </Row>  
        {this.state.errorLogin && (
          <Row gutter={[24, 24]}>
            <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
              <span style={{color: 'red'}}>{formTexts.errorLoginEmailPassword}</span>
            </Col>
          </Row> 
        )}    
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <Form.Item>
            {this.state.loading ?  <Spin /> : (
              <Button type="primary" htmlType="submit">
              Ingresar
            </Button>
            )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <div ref={ this.reCaptchaRef } id="este-test"></div>
          </Col>
        </Row>
      </Form>
    )}

    {/* Inicio del formulario de verificación del código envia al celular */}
    {this.state.enabledVerificationForm && (
    <Form onFinish={this.handleVerificationWithPhoneNumber}>
      <Row gutter={[24, 24]}>
        <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
          <Form.Item
          label="Código de verificación"
          name="verificationCode"
          rules={[
          {
              required: true,
              message: 'Ingrese el código de verificación',
          },
          ]}
          >
            <Input />
            </Form.Item>
        </Col>
      </Row>         
      <Row gutter={[24, 24]}>
        <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
          <div ref={ this.reCaptchaRef } id="este-test"></div>
        </Col>
      </Row>
      {this.state.errorValidation && (
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <span style={{color: 'red'}}>Código de verificación invalido</span>
          </Col>
        </Row> 
      )}  
        <Row gutter={[24, 24]}>
          <Col span={24} style={{ display: "inline-flex", justifyContent: "center" }}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Verificar
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )}
    </Card>
    )
  }
}

export default UserLogin;
