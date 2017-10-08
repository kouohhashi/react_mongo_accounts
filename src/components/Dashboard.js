import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// alert
import Alert from 'react-s-alert';

import { LOCAL_STRAGE_KEY } from '../utils/Settings'

// API
import * as MyAPI from '../utils/MyAPI'

class Dashboard extends Component {

  logoutRequest = () => {

    const { user } = this.props

    const param = {
      login_token: user.login_token
    }

    MyAPI.logout(param)
    .then((results) => {
      console.log(results)
      localStorage.removeItem(LOCAL_STRAGE_KEY);
      this.props.history.push("/")
    })
    .catch((err) => {
      console.log(err)
      localStorage.removeItem(LOCAL_STRAGE_KEY);
      this.props.history.push("/")
    })
  }

  render() {

    const { user } = this.props
    const { recording, recordedBlob } = this.state
    console.log("user:", user)

    return(
      <Container className='dashboard' style={{textAlign: 'center'}}>

        <Grid style={{marginTop:60}}>
          <Grid.Column textAlign='right' width={16}>
            <span style={{cursor: 'pointer'}} onClick={() => this.logoutRequest()}>logout</span>
          </Grid.Column>
        </Grid>

        <Grid>
          <Grid.Column textAlign='center' width={16}>
            Dashborad
          </Grid.Column>
        </Grid>

      </Container>
    )
  }
}

// react-redux
function mapStateToProps ( {user} ) {
  return {
    user
  }
}

// export default withRouter(MainPage);
export default withRouter( connect( mapStateToProps )(Dashboard) )
