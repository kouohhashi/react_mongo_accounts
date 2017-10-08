import React, { Component } from 'react';
import '../App.css';

import { Route, Switch } from 'react-router-dom'
import Dashboard from './Dashboard'
import Home from './Home'
import NoMatch from './NoMatch'
import CreateAccont from './CreateAccont'

// alert
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

// API
import * as MyAPI from '../utils/MyAPI'

// redux
import { connect } from 'react-redux'
// import { apiGetCategories } from '../actions/CategoriesActions'

import { withRouter } from 'react-router';

import { LOCAL_STRAGE_KEY } from '../utils/Settings'
import { signinWithToken } from '../utils/MyAPI'
import { loginWithEmailRedux } from '../actions/UserActions'

class App extends Component {

  componentDidMount() {
    // Login check

    const storage_data = localStorage.getItem(LOCAL_STRAGE_KEY)
    if (!storage_data) {
      return;
    }

    const storage_json = JSON.parse(storage_data)
    if ( storage_json && storage_json.login_token ) {
      this.signinWithTokenRequest(storage_json.login_token)
    }
  }

  signinWithTokenRequest = (login_token) => {
    // login with token

    const param = {
      login_token: login_token
    }

    MyAPI.signinWithToken(param)
    .then((data) => {


      return new Promise((resolve, reject) => {

        if (data.status !== 'success'){
          reject('error')
        } else {
          // success
          const params = {
            user: data.user,
            login_token: data.login_token,
          }
          localStorage.setItem(LOCAL_STRAGE_KEY, JSON.stringify(params))
          this.props.mapDispatchToLoginWithPassword(params)
          resolve()
        }
      })
    })
    .catch((err) => {
      console.log("signinWithToken -- 3 --")
      console.log("err:", err)
      localStorage.removeItem(LOCAL_STRAGE_KEY);
    })
  }

  render() {

    return (
      <div className="App">

        <Switch>

          <Route exact path='/' render={() => (
            <Home />
          )} />

          <Route exact path='/notfound' component={NoMatch} />

          <Route exact path='/dashboard' render={() => (
            <Dashboard />
          )} />


          <Route exact path='/create_acount' render={() => (
            <CreateAccont />
          )} />

          <Route component={NoMatch} />

        </Switch>

        <Alert stack={{limit: 3}} />

      </div>
    );
  }
}

function mapStateToProps ({ categories }) {
  return {
    categories,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    mapDispatchToLoginWithPassword: (data) => dispatch(loginWithEmailRedux({ params: data})),
  }
}

// export default App;
export default withRouter(connect( mapStateToProps, mapDispatchToProps )(App))
