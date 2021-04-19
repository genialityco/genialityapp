import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchCategories } from '../redux/categories/actions';
import { fetchTypes } from '../redux/types/actions';
import Header from './header';
import ContentContainer from './content';
import NotFoundPage from '../components/notFoundPage';

import { Layout } from 'antd';
import { userContext } from './userContext';
//const { Header, Footer, Sider, Content } = Layout;

class MainRouter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.dispatch(fetchCategories());
    this.props.dispatch(fetchTypes());
  }

  render() {
    return (
      <Router basename='/'>
        <Layout>
          <userContext.Consumer>
            {(user) => {
              return (
                <>
                  <Header user={user} />
                  <ContentContainer />
                </>
              );
            }}
          </userContext.Consumer>
        </Layout>
      </Router>
    );
  }
}

export default connect()(MainRouter);
