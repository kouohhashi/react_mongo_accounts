import uuid from 'uuid';
import sha256 from 'sha256'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

// Connection URL
import MongoDbHelper from './MongoDbHelper';
let url = 'mongodb://localhost:27017/<database naem>';
let mongoDbHelper = new MongoDbHelper(url);

const API_KEY = 'apy_key'

// start connection
mongoDbHelper.start(() => {
  console.log("mongodb ready")
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

  const { userId, login_token } = req.session

  res.json({
    status: 'OK',
    userId: userId,
    login_token: login_token
  });
}

// create user
exports.create_user = (req, res) => {

  let password =  req.body.password;
  let email =  req.body.email;
  let api_key =  req.headers.authorization

  if (api_key !== API_KEY){
    res.json({ status: 'error', detail: 'api key is invalid' });
    return;
  }

  let user_info = {}
  let login_token

  let find_param = {
    'emails.address':email
  }
  mongoDbHelper.collection("users").count(find_param)
  .then((results) => {
    return new Promise((resolve, reject) => {
      if (results != 0){
        reject("user already exist")
      }
      resolve()
    })
  })
  .then(() => {
    // bcrypt of password
    let password2 = sha256(password)
    var bcrypt_hash = bcrypt.hashSync(password2, 10);

    // login token which to use login
    login_token = makeid('4') + parseInt(new Date().getTime()).toString(36);
    const hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');

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
      reader_id: reader_id,
    }

    // insert
    return mongoDbHelper.collection("users").insert(insert_params)
  })
  .then((results) => {
    console.log(results)

    if ( results === null ) {
      res.json({ status: 'error', detail: 'no such user' });
      return;
    }

    user_info._id = results._id;
    user_info.profile = results.profile;

    req.session.userId = user_info._id
    req.session.login_token = login_token // maybe not necessary

    res.json({
      status: 'success',
      user: user_info,
      login_token: login_token,
    })

  })
  .catch((err) => {
    console.log(err)
    res.json({ status: 'error', detail: err });
  })
}

// login with email and password
exports.login_with_email_password = (req, res) => {

  let password =  req.body.password;
  let email =  req.body.email;
  let api_key =  req.headers.authorization

  if (api_key !== API_KEY){
    res.json({ status: 'error', detail: 'api key is invalid' });
    return;
  }

  let find_param = {
    'emails.address':email
  }

  let user_info = {};
  let login_token

  // insert
  mongoDbHelper.collection("users").findOne(find_param)
  .then((results) => {
    // check password

    return new Promise( (resolve, reject) => {

      if (!results){
        reject("no such user")
      }
      if (!results.services || !results.services.password || !results.services.password.bcrypt){
        reject("something must be wrong")
      }

      // set user info
      user_info._id = results._id;
      user_info.profile = results.profile;

      let password2 = sha256(password)
      console.log("password2 :", password2)
      // let bcrypt_hash = bcrypt.hashSync(password2, 10);

      const saved_hash = results.services.password.bcrypt

      console.log("saved_hash :", saved_hash)
      // console.log("bcrypt_hash:", bcrypt_hash)

      bcrypt.compare(password2, saved_hash, (err, res) => {
        if (err){
          reject(err)
        }

        if (res === true){
          resolve()
        } else {
          reject("password is not valid")
        }
      });
    } )
  })
  .then(() => {
    // issue token

    let find_param = {
      _id: user_info._id
    }

    // login token
    login_token = makeid('4') + parseInt(new Date().getTime()).toString(36);
    const hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');

    const token_object = {
      'when':new Date(),
      'hashedToken':hashed_token,
    };

    let upd_param = {
      '$push':{
        'services.resume.loginTokens':token_object
      }
    };

    // update
    return mongoDbHelper.collection("users").update(find_param, upd_param)
  })
  .then((results) => {

    res.json({
      status: 'success',
      user: user_info,
      login_token: login_token,
    })

  })
  .catch((err) => {
    res.json({status: 'error', detail: err})
  })
}

// logout
exports.logout = (req, res) => {

  let login_token = req.body.login_token;
  let api_key =  req.headers.authorization

  if (api_key !== API_KEY){
    res.json({ status: 'error', detail: 'api key is invalid' });
    return;
  }

  const hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');
  let find_param = {
    'services.resume.loginTokens':{
      '$elemMatch':{
        'hashedToken':hashed_token
      }
    }
  }

  // find user
  mongoDbHelper.collection("users").findOne(find_param)
  .then((results) => {

    if (results === null){
      return Promise.reject("no such token")
    }

    let find_param = {
      '_id':results._id
    };
    var upd_param = {
      '$pull':{
        'services.resume.loginTokens':{
          'type':'ios'
        }
      }
    };
    return mongoDbHelper.collection("users").update(find_param, upd_param)
  })
  .then(() => {
    res.json({status: 'success'})
  })
  .catch((err) => {
     res.json({status: 'error', detail: err})
  })
}

// helper function to create directory
function checkDirectory(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, function (err) {
      if (err){
        reject(err)
      }
      resolve()
    });
  })
}

// login_with_token
exports.login_with_token = (req, res) => {

  let login_token =  req.body.login_token;
  let api_key =  req.headers.authorization

  if (api_key !== API_KEY){
    res.json({ status: 'error', detail: 'api key is invalid' });
    return;
  }

  let user_info = {};

  const hashed_token = crypto.createHash('sha256').update(login_token).digest('base64');
  let find_param = {
    'services.resume.loginTokens':{
      '$elemMatch':{
        'hashedToken':hashed_token
      }
    }
  }

  // find user
  mongoDbHelper.collection("users").findOne(find_param)
  .then((results) => {
    // set user info

    if ( results === null ) {
      res.json({ status: 'error', detail: 'no such user' });
      return;
    }

    user_info._id = results._id;
    user_info.profile = results.profile;

    // return success
    res.json({
      status: 'success',
      user: user_info,
      login_token: login_token,
    })
  })
  .catch((err) => {
    res.json({status: 'error', detail: err})
    console.log(err)
  })
}
