import React, { Component, Fragment } from "react";

import EventContent from "../events/shared/content";

import { SurveysApi, Actions } from "../../helpers/request";
import { AntSelect, AntInput } from "./antField";
import DisplayForm from "./displayForm";
import showSelectOptions from "./constants";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button, Input, Select, Row, Col } from "antd";

import { Link, Redirect } from "react-router-dom";
import { toast } from "react-toastify";

const { Option } = Select;

class FormQuestions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      quantityQuestions: 0,
    };
  }

  componentDidMount() {}

  validationField = (values) => {
    console.log("realizando validaciones:", values);

    const errors = {};
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    return errors;
  };

  sendData = async (values) => {
    const { eventId, surveyId } = this.props;
    this.setState({ isSubmitting: true });
    console.log("-------------SE ESTAN ENVIANDO LOS DATOS:", values);
    const exclude = ({ selectOptions, ...rest }) => rest;
    let result = await SurveysApi.createQuestion(
      eventId,
      surveyId,
      exclude(values)
    );
    console.log(result);
  };

  render() {
    const { isSubmitting } = this.state;

    return (
      <Fragment>
        <EventContent>
          <div>
            <Formik
              initialValues={{
                questionName: "",
                questionTitle: "",
                page: "",
                selectOptions: showSelectOptions,
              }}
              onSubmit={this.sendData}
              render={DisplayForm}
            ></Formik>
          </div>
        </EventContent>
      </Fragment>
    );
  }
}

export default FormQuestions;
