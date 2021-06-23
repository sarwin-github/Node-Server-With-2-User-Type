const passport = require('passport');

module.exports.authorizeAccess = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Users is not authorized to access this route.'
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }

            next();
        });
    })
    (req, res);
}