api = "http://localhost:4002"

const API_KEY = 'api_key'

const headers = {
  'Accept': 'application/json',
  'Authorization': API_KEY
}

// create an account
export const createAccount = (params) =>
  fetch(`${api}/create_user`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

// signin
export const signinWithPassword = (params) =>
  fetch(`${api}/login_with_email_password`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


// upload
export const upload = (data) =>
  fetch(`${api}/files`, {
    method: 'POST',
    body: data
  }).then(res => res.json())

// signin with token
export const signinWithToken = (params) =>
  fetch(`${api}/login_with_token`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

// logout
export const logout = (params) =>
  fetch(`${api}/logout`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())
