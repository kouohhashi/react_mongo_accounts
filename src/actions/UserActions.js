export const LOGIN_WITH_EMAIL = 'LOGIN_WITH_EMAIL'

export function loginWithEmailRedux ({ params }) {


  return {
    type: LOGIN_WITH_EMAIL,
    params
  }
}
