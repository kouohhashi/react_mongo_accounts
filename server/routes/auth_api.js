import uuid from 'uuid';
import crypto from 'crypto'
import bcrypt from 'bcrypt'

import { USERS_COL, API_KEY } from './settings'

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

// create user
export const create_user = async (req, res, mongoDbHelper) => {

  try {

    let password =  req.body.password;
    let email =  req.body.email;
    let api_key =  req.headers.authorization

    if (api_key !== API_KEY){
      throw Error("api key is invalid")
      return;
    }

    let user_info = {}

    let find_param = {
      'emails.address':email
    }
    let results = null
    results = await mongoDbHelper.collection(USERS_COL).count(find_param)
    if (results != 0){
      throw Error("user already exist")
    }

    // bcrypt of password
    // let password2 = sha256(password)
    let password2 = crypto.createHash('sha256').update(password).digest('hex');
    let bcrypt_hash = bcrypt.hashSync(password2, 10);

    // login token which to use login
    let login_token = makeid('4') + parseInt(new Date().getTime()).toString(36);
    let hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');

    const token_object = {
      'when':new Date(),
      'hashedToken':hashed_token,
    };

    let insert_params = {
      createdAt: new Date(),
      services:{
        password : {
          bcrypt : bcrypt_hash
        },
        resume : {
          loginTokens : [token_object]
        },
        email : {
          verificationTokens : [
            {
              // nameHash : nameHash,
              address : email,
              when : new Date(),
            }
          ]
        },
      },
      emails : [
        {
          "address" : email,
          "verified" : false
        }
      ],
      profile : {},
    }

    // insert
    results = null
    results =  await mongoDbHelper.collection(USERS_COL).insert(insert_params)

    console.log("results: ", results)

    if ( results === null ) {
      throw Error("could not create a user...")
    }

    user_info._id = results._id;
    user_info.profile = results.profile;

    return {
      login_token: login_token,
      user_info: user_info,
    }

  } catch (err) {
    throw Error(err.message)
  }

}

// login with email and password
export const login_with_email_password = async (req, res, mongoDbHelper) => {

  try {

    let password =  req.body.password;
    let email =  req.body.email;
    let api_key =  req.headers.authorization

    if (api_key !== API_KEY){
      throw Error("api key is invalid 2")
    }

    let find_param = {
      'emails.address':email
    }

    let user_info = {};

    // find user
    let results = null
    results = await mongoDbHelper.collection(USERS_COL).findOne(find_param)

    if (!results){
      throw Error("no such user")
    }
    // check password
    if (!results.services || !results.services.password || !results.services.password.bcrypt){
      throw Error("something must be wrong")
    }

    // set user info
    user_info._id = results._id;
    user_info.profile = results.profile;

    // let password2 = sha256(password)
    let password2 = crypto.createHash('sha256').update(password).digest('hex');
    let saved_hash = results.services.password.bcrypt

    results = null
    results = await bcrypt.compare(password2, saved_hash)
    if (results !== true) {
      throw Error("password is not okay")
    }

    // create new token
    find_param = null
    find_param = {
      _id: user_info._id
    }

    // login token
    let login_token = makeid('4') + parseInt(new Date().getTime()).toString(36);
    let hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');

    let token_object = {
      'when':new Date(),
      'hashedToken':hashed_token,
    };

    let upd_param = {
      '$push':{
        'services.resume.loginTokens':token_object
      }
    };

    // update mongo
    await mongoDbHelper.collection(USERS_COL).update(find_param, upd_param)

    return {
      login_token: login_token,
      user_info: user_info,
    }

  } catch (err) {
    throw Error(err.message)
  }
}

// logout
export const logout = async (req, res, mongoDbHelper) => {

  try {

    // let login_token = req.session.login_token;
    let login_token = req.body.login_token;
    if (!login_token){
      // user is not login
      return "user is not login"
    }

    let api_key =  req.headers.authorization
    if (api_key !== API_KEY){
      res.json({ status: 'error', detail: 'api key is invalid' });
      return;
    }

    let hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');
    find_param = null
    find_param = {
      'services.resume.loginTokens':{
        '$elemMatch':{
          'hashedToken':hashed_token
        }
      }
    }

    // find user
    let results = null
    results = await mongoDbHelper.collection(USERS_COL).findOne(find_param)
    if (results === null){
      throw Error("no such token")
    }

    let find_param = {
      '_id':results._id
    };
    let upd_param = {
      '$pull':{
        'services.resume.loginTokens':{
          'type':'ios'
        }
      }
    };
    results = null
    results = await mongoDbHelper.collection(USERS_COL).update(find_param, upd_param)

    // destory session
    // await req.session.destroy()
    return

  } catch (err) {
    throw Error(err.message)
  }
}

// login_with_token
export const login_with_token = async(req, res, mongoDbHelper) => {

  try {

    let login_token =  req.body.login_token;
    let api_key =  req.headers.authorization

    if (api_key !== API_KEY){
      throw Error("api key is invalid")
      return;
    }

    let user_info = {};

    let hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');
    let find_param = {
      'services.resume.loginTokens':{
        '$elemMatch':{
          'hashedToken':hashed_token
        }
      }
    }

    // find user
    let results = null
    results = await mongoDbHelper.collection(USERS_COL).findOne(find_param)
    if ( results === null ) {
      throw Error("no such user")
    }

    user_info._id = results._id;
    user_info.profile = results.profile;

    // set session
    return {
      login_token: login_token,
      user_info: user_info,
    }

  } catch (err) {
    throw Error(err.message)
  }
}


// check login_token
export const check_login_token = async(login_token, mongoDbHelper) => {

  try {

    if (!login_token) {
      throw Error("login token not found")
    }

    let hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');
    let find_param = {
      'services.resume.loginTokens':{
        '$elemMatch':{
          'hashedToken':hashed_token
        }
      }
    }

    // find user
    let results = null
    results = await mongoDbHelper.collection(USERS_COL).findOne(find_param)
    if ( results === null ) {
      throw Error("no such user")
    }

    return true

  } catch (err) {
    console.log("check_login_token.err: ", err)
    return false
  }
}

// check login_token and return user id
export const check_login_token_and_return_uid = async(login_token, mongoDbHelper) => {

  try {

    if (!login_token) {
      throw Error("login token not found")
    }

    let hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');
    let find_param = {
      'services.resume.loginTokens':{
        '$elemMatch':{
          'hashedToken':hashed_token
        }
      }
    }

    // find user
    let results = null
    results = await mongoDbHelper.collection(USERS_COL).findOne(find_param)
    if ( results === null ) {
      throw Error("no such user")
    }

    return results._id

  } catch (err) {
    console.log("check_login_token.err: ", err)
    return null
  }
}


// update password
export const update_password = async ({
  old_login_token,
  old_password,
  new_password,
  mongoDbHelper,
}) => {

  try {

    // console.log("update_password.old_login_token: ", old_login_token)
    // console.log("old_password:", old_password)
    // console.log("new_password: ", new_password)

    // check login_token
    let user_id = await check_login_token_and_return_uid(old_login_token, mongoDbHelper)
    // console.log("user_id: ", user_id, old_login_token)
    if (!user_id) {
      throw Error("login token is not valid")
    }

    // get user info
    let find_param = {
      '_id':user_id
    }
    let results = await mongoDbHelper.collection(USERS_COL).findOne(find_param)
    // console.log("dasf results: ", results)

    // check current password
    let old_password2 = crypto.createHash('sha256').update(old_password).digest('hex');
    let saved_hash = results.services.password.bcrypt

    // let results = await bcrypt.compare(old_password2, saved_hash)
    if ((await bcrypt.compare(old_password2, saved_hash)) !== true) {
      throw Error("password is not okay")
    }

    // now password is okay let's update it

    // new
    let new_password2 = crypto.createHash('sha256').update(new_password).digest('hex');
    let new_bcrypt_hash = bcrypt.hashSync(new_password2, 10);

    // login token which to use login
    let login_token = makeid('4') + parseInt(new Date().getTime()).toString(36);
    let hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');

    let token_object = {
      'when':new Date(),
      'hashedToken':hashed_token,
    };

    // update database
    await mongoDbHelper.collection(USERS_COL).update({
      '_id': user_id,
    }, {
      '$set': {
        'services.password.bcrypt': new_bcrypt_hash,
        'services.resume.loginTokens': [token_object],
        'password_updatedAt': new Date(),
      }
    })

    let user_info = {}
    user_info._id = results._id;
    user_info.profile = results.profile;

    return {
      login_token: login_token,
      user_info: user_info,
    }

  } catch (err) {
    throw Error(err.message)
  }
}
