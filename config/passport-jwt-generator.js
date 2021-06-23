const User        = require('../app/user/model/users');
const Client      = require('../app/client/model/clients');
const passport    = require('passport');
const passportJWT = require("passport-jwt");

//jwt authentication
const ExtractJWT  = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

//passport jwt for extracting token
const opts = {};

opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey    = process.env.jwt_secret;

passport.use('jwt', new JWTStrategy(opts, (jwt_payload, callback) => {
    let query;

    // CHECK USER
    if(jwt_payload.user_type === 'User')
        query = User.findOne({_id: jwt_payload._id}).select({'__v':0, 'password': 0});

    // CHECK CLIENT
    if(jwt_payload.user_type === 'Client')
        query = Client.findOne({_id: jwt_payload._id}).select({'__v':0, 'password': 0});

    query.exec((err, user) => {
        if (err) {
            return callback(err, false);
        }

        if (user) {
            return callback(null, user);
        } 

        else {
            return callback(null, false);
            // or you could create a new account
        }
    });
}));