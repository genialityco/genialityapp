import React, { Component } from "react";
import { Button, Card } from "antd";
import Fullscreen from "react-full-screen";
import { FullscreenOutlined, SwitcherOutlined, LineOutlined } from "@ant-design/icons";
import SurveyComponent from "../surveys";

const closeFullScreen = {
  position: "absolute",
  top: "7px",
  right: "7px",
  bottom: 0,
};

const surveyButtons = {
  position: "absolute",
  minWidth: "50%",
  maxHeight: "90%",
  top: "37px",
  text: {
    color: "#42A8FC",
  }
};

export default class ZoomComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id_conference: "284693751",
      url_conference: `https://gifted-colden-fe560c.netlify.com/?meetingNumber=`,
      meeting_id: null,
      userEntered: null,
      isFull: false,
      isMedium: false,
      isMinimize: false,
      displayName: "",
      email: null,
      event: props.event,
      activity: props.activity,
    };
  }
  async componentDidMount() {


    let { meetingId, userEntered } = this.props;

    let displayName = "Anónimo";
    let email = "anonimo@evius.co";
    if (userEntered) {
      displayName = userEntered.displayName || userEntered.names || displayName;
      email = userEntered.email || email
    }

    this.setState({
      meeting_id: meetingId,
      userEntered,
      displayName, email
    });

  }


  componentDidUpdate(prevProps) {

    const { meetingId, userEntered } = this.props;

    if (prevProps.meetingId !== meetingId) {
      let displayName = "Anónimo";
      let email = "anonimo@evius.co";
      if (userEntered) {
        displayName = userEntered.displayName || userEntered.names || displayName;
        email = userEntered.email || email
      }

      this.setState({ meeting_id: meetingId, userEntered, displayName, email });
    }
  }

  // Función full screen
  goFull = () => {
    this.setState({ isFull: true });
  };

  closeFull = () => {
    this.setState({ isFull: false });
  };

  // Función medium screen
  goMedium = () => {
    this.setState({
      isMedium: !this.state.isMedium,
      isMinimize: false,
    });
  };

  // Función minimize screen
  goMinimize = () => {
    this.setState({
      isMinimize: !this.state.isMinimize,
      isMedium: false,
    });
  };



  render() {
    const { toggleConference, event, activity } = this.props;
    let { url_conference, meeting_id, userEntered, isMedium, isFull, isMinimize, displayName, email } = this.state;
    return (
      <div
        className={`content-zoom ${isMedium === true ? "mediumScreen" : ""} ${
          isMinimize === true ? "minimizeScreen" : ""
          }`}>
        <div className="buttons-header">
          <div>
            <div className="title-header">
              <span className="icon-live">&#9673;</span>&nbsp;
              <span>Conferencia en vivo</span>
            </div>
          </div>

          <div>
            {/* botón pantalla completa */}
            <Button onClick={this.goFull}>
              <FullscreenOutlined />
            </Button>

            {/* botón pantalla minimizada */}
            <Button onClick={this.goMinimize}>
              <LineOutlined />
            </Button>

            {/* botón cerrar */}
            <Button onClick={() => toggleConference(false)}>
              <span className="icon-close">&#10006;</span>
            </Button>
          </div>
        </div>

        <Fullscreen enabled={isFull} onChange={(isFull) => this.setState({ isFull })}>
          {
            <div style={surveyButtons}>
              <SurveyComponent event={event} activity={activity} availableSurveysBar={true} />
            </div>
          }

          {isFull === true ? (
            <Button type="primary" danger style={closeFullScreen} onClick={this.closeFull}>
              <span className="icon-close">&#10006;</span>
            </Button>
          ) : null}

          <iframe
            src={url_conference + meeting_id + `&userName=${displayName}` + `&email=${email}`}
            allow="camera *;microphone *"
            allowusermedia
            className="iframe-zoom nuevo">
            <p>Your browser does not support iframes.</p>
          </iframe>
        </Fullscreen>
      </div>
    );
  }
}
