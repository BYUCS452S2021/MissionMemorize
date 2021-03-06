const express = require("express");
const argon2 = require("argon2");
const sqlite3 = require('sqlite3').verbose();
const sqlite = require("aa-sqlite");

const router = express.Router();

const DB_FILE_PATH = '../MissionMemorizeRelational.db'

// This is a method that we can call on User objects to compare the hash of the
// password the browser sends with the has of the user's true password stored in
// the database.
// comparePassword() = async function(password) {
//   try {
//     // note that we supply the hash stored in the database (first argument) and
//     // the plaintext password. argon2 will do the hashing and salting and
//     // comparison for us.
//     const isMatch = await argon2.verify(this.password, password);
//     return isMatch;
//   } catch (error) {
//     return false;
//   }
// };


// This is a method that will be called automatically any time we convert a user
// object to JSON. It deletes the password hash from the object. This ensures
// that we never send password hashes over our API, to avoid giving away
// anything to an attacker.

// userSchema.methods.toJSON = function() {
//   var obj = this.toObject();
//   delete obj.password;
//   return obj;
// }

/* Middleware */

// middleware function to check for logged-in users
const validUser = async (req, res, next) => {
  if (!req.session.userID)
    return res.status(403).send({
      message: "not logged in"
    });
  try {
    
    let db = new sqlite3.Database(DB_FILE_PATH)
// TODO: Make sure this is right
    let query = "SELECT COUNT(user_id) AS count FROM User" +
            "WHERE user_id = ?";
    count = 0
    db.get(query, [req.session.userID], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      count = row.count
    });


    if (count != 1) {
      return res.status(403).send({
        message: "not logged in"
      });
    }
    // set the user field in the request

    query = "SELECT username, first_name, last_name, email as count FROM User" +
            "WHERE user_id = ?";
    user = db.get(query, [req.session.userID], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      return row
        ? console.log(row.username)
        : console.log(`No user logged in right now`);
    });

    db.close


    req.user = {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    };

    db.close();

  } catch (error) {
    // Return an error if user does not exist.
    return res.status(403).send({
      message: "not logged in"
    });
  }

  // if everything succeeds, move to the next middleware
  next();
};




/* API Endpoints */

/* All of these endpoints start with "/" here, but will be configured by the
   module that imports this one to use a complete path, such as "/api/user" */

// create a new user
router.post('/register', async (req, res) => {
  // Make sure that the form coming from the browser includes all required fields,
  // otherwise return an error. A 400 error means the request was
  // malformed.
  if (!req.body.first_name || !req.body.last_name || !req.body.username || !req.body.password || !req.body.email)
    return res.status(400).send({
      message: "first name, last name, username, password and email are required"
    });

  try {
    let pass = req.body.password;

    // generate a hash. argon2 does the salting and hashing for us
    pass = await argon2.hash(pass);

// TODO check if user or email exists!!!!

    let query = "SELECT COUNT(username) AS usercount FROM User WHERE username = ? or email = ?";    

    await sqlite.open(DB_FILE_PATH);

    username_check = await sqlite.get(query, [req.body.username, req.body.email]);
    
    if (username_check.usercount > 0) {
      return res.status(403).send({
        message: "username or email already exist"
      });
    }
    console.log(username_check.usercount)
    sqlite.close();
    var entry = `'${req.body.username}','${pass}','${req.body.email}','${req.body.first_name}','${req.body.last_name}'`
    query = "INSERT INTO User (username, password, email, first_name, last_name)" +
            "VALUES(" + entry + ");"

    await sqlite.open(DB_FILE_PATH);
    await sqlite.run(query, [req.body.username, pass, req.body.email, req.body.first_name, req.body.last_name]);
    console.log('new user was added');
    sqlite.close();


    query = "SELECT user_id FROM User WHERE username = ?";
    await sqlite.open(DB_FILE_PATH);
    newUser = await sqlite.get(query, [req.body.username]);
    sqlite.close();


    req.session.user_id = newUser.user_id;
    //TODO: set user session info
    let retUser = {
      user_id: newUser.user_id,
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.first_name,
      lastName: req.body.last_name
    };

    // send back a 200 OK response, along with the user that was created
    return res.send({
      user: retUser,
        

// TODO:  Add returns for project and folder

//   *******************************  TODO:  Add Function Calls to folder and project

    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});


// login a user
router.post('/login', async (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.sendStatus(400);

  try {
    

    let query = "SELECT * FROM User WHERE username = ?";

    await sqlite.open(DB_FILE_PATH);
    result = await sqlite.get(query, [req.body.username])
    sqlite.close();


    let isMatch = false
    try {
        isMatch = await argon2.verify(result.password, req.body.password);
        isMatch = true;
    } catch (error) {
        isMatch = false;
    }

    // Return the SAME error if the password is wrong. This ensure we don't
    // leak any information about which users exist.
    if (!isMatch)
      return res.status(403).send({
        message: "username or password is wrong"
      });



    //   *******************************  TODO:  Add Function Calls to folder and project
    //  CAN probably assume have no projects/folders
    
    // query = "SELECT * FROM Projects" +
    // "WHERE user_id"
    
    let retUser = {
      user_id: result.user_id,
      username: result.username,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName
    };  

    // set user session info
    req.session.userID = result.user_id;
    // send back a 200 OK response, along with the user that was created
    return res.send({
      user: retUser
      

// TODO:  Add returns for project and folder

// TODO:  Return saved stuff but password


    });

  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// get logged in user
router.get('/', validUser, async (req, res) => {
  try {
    res.send({

        // TODO:  Return saved stuff but password and user_id


    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});


// logout
router.delete("/", validUser, async (req, res) => {
  try {
    req.session = null;
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});


module.exports = {
  routes: router,
  valid: validUser
};