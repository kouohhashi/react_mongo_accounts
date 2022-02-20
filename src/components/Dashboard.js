import React, { Component } from 'react'
import { withRouter } from '../utils/Helpers'
import { connect } from 'react-redux'
import { LOCAL_STRAGE_KEY } from '../utils/Settings'
import * as MyAPI from '../utils/MyAPI'

class Dashboard extends Component {

  logoutRequest = () => {

    const { user } = this.props

    const param = {
      login_token: user.login_token
    }

    MyAPI.logout(param)
    .then((results) => {
      localStorage.removeItem(LOCAL_STRAGE_KEY);
      this.props.history("/")
    })
    .catch((err) => {
      console.log("err: ", err)
      localStorage.removeItem(LOCAL_STRAGE_KEY);
      this.props.history("/")
    })
  }

  render() {

    const { user } = this.props

    return(
      <div className='dashboard' style={{textAlign: 'center'}}>

        <div style={{marginTop:60}}>
          <div>
            <span style={{cursor: 'pointer'}} onClick={() => this.logoutRequest()}>logout</span>
          </div>
        </div>

        <div>
          <div>
            { JSON.stringify(user)}
          </div>
        </div>

      </div>
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
