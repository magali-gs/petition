module.exports.safetyCookie = (req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId 
        && req.url != '/register'
        && req.url != '/login') {
        res.redirect('/register');
    } else {
        next();
    }
};

module.exports.requireSignedPetition = (req, res, next) => {
    if (!req.session.sigId) {
        res.redirect('/thanks');
    } else {
        next();
    }
};

module.exports.requireUnsignedPetition = (req, res, next) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};