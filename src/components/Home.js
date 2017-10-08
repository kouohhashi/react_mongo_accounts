import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// semantic-ui
import { Container, Form, Input, Button, Grid } from 'semantic-ui-react'

import LoginForm from './LoginForm'

class Home extends Component {

  state = {
    userId: '',
    password: '',
  }

  onSubmit = () => {
    console.log("onSubmit called")

    const { userId, password } = this.state

    // login
  }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  render() {

    const { userId, password } = this.state

    return(
      <Container className='home' style={{textAlign: 'center'}}>

        <Grid style={{marginTop:60}}>
          <Grid.Column textAlign='right' width={16}>
            <Link to="/create_acount">Create an account</Link>
          </Grid.Column>
        </Grid>


        <LoginForm />

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
export default withRouter( connect( mapStateToProps )(Home) )
