const User          = require('../model/users');
const Client        = require('../../client/model/clients');
const passport      = require('passport');

//local
const LocalStrategy = require('passport-local').Strategy;

//passport local - for login
passport.use('user-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, callback) => {
        //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // Check if email or password is empty, then validate error using the express-validator module
        //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        req.checkBody('email', 'Email is required.').notEmpty();
        req.checkBody('email', 'Invalid email format').isEmail();
        req.checkBody('password', 'Password is required.').notEmpty();
        let errors = req.validationErrors();

        if (errors) {
            let messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });

            // If there's error, create an alert that there's error, if you want to modify flash messages
            // set flash messages error info: req.flash('error', "Invalid Credentials, Please check username or password")  
            return callback(null, false, req.flash('error', messages));
        }

        User.findOne({ 'email': email.toLowerCase() }, (err, user) => {
            if (err) {
                return callback(err);
            }

            else if (!user) {
                return callback(null, false, { message: 'User does not exist in the database.'});
            }

            else if (!user.validPassword(password)) {
                return callback(null, false, { message: 'Invalid password.'});
            }
            
            return callback(null, user);
        });
    }
    ));

//passport local for signup
passport.use('user-signup', new LocalStrategy({
    // Get the username field and password field on req.body
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, callback) => {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // This is the Backend Validation using express-validator
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Incorrect email format.').isEmail();
    req.checkBody('password', 'Password is required.').notEmpty();
    req.checkBody('password', 'Password is invalid.').isLength({min:6});
    req.checkBody('confirm-password', 'Password does not matched.').equals(req.body.password);
    req.checkBody('name', 'Name is required.').notEmpty();
    req.checkBody('address', 'Address is required.').notEmpty();
    req.checkBody('phone', 'Phone is required.').notEmpty();

    // Validate Error
    let errors = req.validationErrors();
    // If there's error push the error to messages[index] = error array
    if (errors) {
        let messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });

        // If there's error, create an alert that there's error, if you want to modify flash messages
        // set flash messages error info: req.flash('error', "Invalid Credentials, Please check username or password")
        return callback(null, false, req.flash('error', messages));
    }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // A query that will search for an existing user in the mongo database, then after everything is validated, create new trainer
    // Find local.email from the database of user
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    User.findOne({ 'email': email.toLowerCase() }, (err, user)  => {
        if (err) {
            return callback(err);
        }
        else if (user) {
            return callback(null, false, {message: 'User already exist in the database.'});
        }

        else if(!err && !user){
            let newUser = new User();

            newUser.email    = req.body.email.toLowerCase();
            newUser.password = newUser.generateHash(password);
            newUser.name     = req.body.name;
            newUser.address  = req.body.address;
            newUser.phone    = req.body.phone;

            newUser.save(err => {
                if(err){
                    return callback(err);
                }

                return callback(null, newUser);
            });
        }
    });
}));

