import React, { Component } from 'react'
import { withRouter } from '../utils/Helpers'
import { connect } from 'react-redux'
import { Container, Form, Input, Button, Grid } from 'semantic-ui-react'
import Alert from 'react-s-alert';
import * as MyAPI from '../utils/MyAPI'
import { LOCAL_STRAGE_KEY } from '../utils/Settings'
import { loginWithEmailRedux } from '../actions/UserActions'

class LoginForm extends Component {

  state = {
    email: '',
    password: '',
  }

  onSubmit = async () => {

    const { email, password } = this.state

    try {

      let results = await MyAPI.signinWithPassword({
        email: email,
        password: password,
      })
      if (!results) {
        throw Error("server error")
      }
      if (results.status === "error") {
        throw Error(results.message)
      }

      const params = {
        user: results.user,
        login_token: results.login_token,
      }

      localStorage.setItem(LOCAL_STRAGE_KEY, JSON.stringify(params))
      this.props.mapDispatchToLoginWithPassword(params)

      this.props.history("/dashboard")

    } catch (err) {
      console.log("err:", err)

      Alert.error(err.message, {
        position: 'top-right',
        effect: 'slide',
        timeout: 5000
      });

    }
  }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  render() {

    const { email, password } = this.state

    return(
      <Container text className='create_acount_form'>

        <Form onSubmit={this.onSubmit} style={{marginTop:60}}>
          <Grid>

            <Grid.Column textAlign='left' width={16}>
              <label>Email</label>
              <Input
                style={{width: '100%'}}
                icon='mail outline'
                iconPosition='left'
                name='email'
                onChange={this.handleChange}
                value={email}
                placeholder='yourname@example.com' />
            </Grid.Column>

            <Grid.Column textAlign='left' width={16}>
              <label>Password</label>
              <Input
                style={{width: '100%'}}
                icon='key'
                iconPosition='left'
                name='password'
                onChange={this.handleChange}
                value={password}
                placeholder='********' />
            </Grid.Column>

            <Grid.Column  width={16}>
              <Button
                style={{width: '100%'}}
                loading={this.state.loading}
                disabled={this.state.loading}
                type='submit'>Sign in</Button>
            </Grid.Column>

          </Grid>

        </Form>

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

function mapDispatchToProps (dispatch) {
  return {
    mapDispatchToLoginWithPassword: (data) => dispatch(loginWithEmailRedux({ params: data})),
  }
}


// export default withRouter(MainPage);
export default withRouter( connect( mapStateToProps, mapDispatchToProps )(LoginForm) )
