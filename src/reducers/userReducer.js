import {
  LOGIN_WITH_EMAIL,
} from '../actions/UserActions'

function user (state = {}, action) {

  switch (action.type) {

    case LOGIN_WITH_EMAIL :
      // console.log("AAAAAAA params:", action)
      const { login_token, user } = action.params

      return {
        ...state,
        login_token: login_token,
        user: user,
      }

    default :
      return state
  }
}

export default user
