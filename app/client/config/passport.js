const Client        = require('../model/clients');
const passport      = require('passport');
const passportJWT   = require("passport-jwt");

//jwt authentication
const ExtractJWT    = passportJWT.ExtractJwt;
const JWTStrategy   = passportJWT.Strategy;

//local
const LocalStrategy = require('passport-local').Strategy;

//passport local - for login
passport.use('client-login', new LocalStrategy({
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

        Client.findOne({ 'email': email.toLowerCase() }, (err, client) => {
            if (err) {
                return callback(err);
            }

            else if (!client) {
                return callback(null, false, { message: 'Client does not exist in the database.'});
            }

            else if (!client.validPassword(password)) {
                return callback(null, false, { message: 'Invalid password.'});
            }
            return callback(null, client);
        });
    }
));

//passport local for signup
passport.use('client-signup', new LocalStrategy({
    // Get the clientname field and password field on req.body
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
    req.checkBody('company', 'Company is required.').notEmpty();
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
        // set flash messages error info: req.flash('error', "Invalid Credentials, Please check clientname or password")
        return callback(null, false, messages);
    }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // A query that will search for an existing client in the mongo database, then after everything is validated, create new trainer
    // Find local.email from the database of client
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Client.findOne({ 'email': email.toLowerCase() }, (err, client)  => {
        if (err) {
            return callback(err);
        }

        else if (client) {
            return callback(null, false, {message: 'Client already exist in the database.'});
        }

        else if(!err && !client){
            let newClient = new Client();

            newClient.email    = req.body.email.toLowerCase();
            newClient.password = newClient.generateHash(password);
            newClient.name     = req.body.name;
            newClient.company  = req.body.company;
            newClient.address  = req.body.address;
            newClient.phone    = req.body.phone;

            newClient.save(err => {
                if(err){
                    return callback(err);
                }

                return callback(null, newClient);
            });
        }
    });
}));

//passport jwt for extracting token
const opts = {};

opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey    =  process.env.jwt_secret;

passport.use(new JWTStrategy(opts, (jwt_payload, callback) => {
    console.log(jwt_payload)
    let query = Client.findOne({_id: jwt_payload._id}).select({'__v':0, 'password': 0});

    query.exec((err, client) => {
        if (err) {
            return callback(err, false);
        }
        if (client) {
            return callback(null, client);
        } else {
            return callback(null, false);
            // or you could create a new account
        }
    });
}));