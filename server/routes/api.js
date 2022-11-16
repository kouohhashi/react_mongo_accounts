import uuid from 'uuid';
import sha256 from 'sha256'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

// mongodb setting
import { MONGO_URL, USERS_COL, MONGO_DB_NAME, API_KEY } from './settings.js'
import MongoDbHelper from './MongoDbHelper';

// auth apis
import {
  create_user,
  login_with_email_password,
  logout,
  login_with_token,
  check_login_token,
  check_login_token_and_return_uid,
  update_password,
} from './auth_api'

// mongodb
const mongoDbHelper = new MongoDbHelper(MONGO_URL, MONGO_DB_NAME);
mongoDbHelper.start(() => {
  console.log("mongoDbHelper ready")
});

// generate random string
function makeid (count) {
  if (!count){
    count = 5;
  }

  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < count; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// index
exports.echo = (req, res) => {

  const { login_token } = req.session

  res.json({
    status: 'OK',
    login_token: login_token
  });
}

// create_user
exports.create_user = async (req, res) => {
  console.log("create_user started")

  try {

    if (!mongoDbHelper.db) {
      throw Error("can not access mongodb")
    }

    let _rtnObj = await create_user(req, res, mongoDbHelper)
    console.log("_rtnObj: ", _rtnObj)
    res.json({
      status: 'success',
      login_token: _rtnObj.login_token,
      user_info: _rtnObj.user_info,
    });

  } catch(err) {

    console.log("err: ", err)

    res.json({
      status: 'error',
      message: err.message
    });
  }
}

// login_with_email_password
exports.login_with_email_password = async (req, res) => {
  console.log("login_with_email_password started")

  try {

    if (!mongoDbHelper.db) {
      throw Error("can not access mongodb")
    }

    let {login_token, user_info} = await login_with_email_password(req, res, mongoDbHelper)

    console.log("login_with_email_password.login_token: ", login_token)
    console.log("login_with_email_password.user_info: ", user_info)

    res.json({
      status: 'success',
      login_token: login_token,
      user_info: user_info,
    });

  } catch(err) {
    console.log("err: ", err)

    res.json({
      status: 'error',
      message: err.message
    });
  }
}

// login_with_token
exports.login_with_token = async (req, res) => {
  console.log("login_with_token started")

  try {
    let {login_token, user_info} = await login_with_token(req, res, mongoDbHelper)
    res.json({
      status: 'success',
      login_token: login_token,
      user_info: user_info,
    });
  } catch(err) {
    console.log("err: ", err)

    res.json({
      status: 'error',
      message: err.message
    });
  }
}

// logout
exports.logout = async (req, res) => {
  console.log("logout started")

  try {
    let _login_token = await logout(req, res, mongoDbHelper)
    res.json({
      status: 'success',
      login_token: _login_token,
    });
  } catch(err) {
    console.log("err: ", err)

    res.json({
      status: 'error',
      message: err.message
    });
  }
}

// update_password
exports.update_password = async (req, res) => {
  console.log("update_password started")

  try {

    console.log("login_token ", req.body.login_token)

    let old_login_token =  req.body.login_token;
    let old_password =  req.body.old_password;
    let new_password =  req.body.new_password;

    let api_key =  req.headers.authorization
    if (api_key !== API_KEY){
      throw Error("api key is invalid")
      return;
    }

    if (!req.body.login_token) {
      throw Error("login token not found")
    }
    if (!old_password) {
      throw Error("current password not found")
    }
    if (!new_password) {
      throw Error("new password not found")
    }

    let results = await update_password({
      old_login_token: old_login_token,
      old_password: old_password,
      new_password: new_password,
      mongoDbHelper: mongoDbHelper,
    })

    res.json({
      status: 'success',
      login_token: results.login_token,
      user_info: results.user_info,
    });

  } catch(err) {
    console.log("err: ", err)

    res.json({
      status: 'error',
      message: err.message
    });
  }
}
