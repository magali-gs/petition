const express = require('express');
const app = express();
const hb = require('express-handlebars');
const db = require("./db");
const cookieSession = require('cookie-session');
const csurf = require("csurf");

const { secret } = require("./secrets.json");
const { hash, compare } = require('./bc');

app.use(
    cookieSession({
        secret: `${secret}`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf()); 

app.engine("handlebars", hb());

app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    console.log("------------");
    console.log(`${req.method} request comming in on route ${req.url}`);
    console.log("------------");
    next();
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (!req.session.authenticated) {
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/thanks");
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    db.addSigner( signature)
        .then(({ rows }) => {
            console.log("yay it worked", rows);
            // res.sendStatus(200);
            req.session.id = rows[0].id;
            req.session.authenticated = true;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error in db.addSigner", err);
            res.render('petition', {
                message: true,
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.authenticated) {
        db.getTotalSigners()
            .then(({ rows }) => {
                const totalSigners = rows[0].count;
                db.getSignature(req.session.id).then((result) => {
                    let signatureImg = result.rows[0].signature;
                    res.render("thanks", {
                        layout: "main",
                        totalSigners: totalSigners,
                        signersUrl: "/signers",
                        signature: signatureImg,
                    });
                });
            })
            .catch((err) => {
                console.log("error in db.getTotalSigners", err);
            });
    } else {
        res.redirect("/petition");
    }        
});

app.get("/signers", (req, res) => {
    if (req.session.authenticated) {
        db.getFullName()
            .then(({ rows }) => {
                res.render("signers", {
                    layout: "main",
                    rows,
                });
                // console.log("result from getFullName", rows);
            })
            .catch((err) => {
                console.log("error in db.getFullName", err);
            });
    } else {
        res.redirect("/petition");
    } 
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: 'main',
    });
});

app.post("/register", (req, res) => {
    const { firstName, lastName, emailAddress} = req.body;
    hash(req.body.userPassword)
        .then((hash) => {
            db.addUser(firstName, lastName, emailAddress, hash)
                .then(({ rows }) => {
                    console.log('it worked', rows[0].id);
                    req.session.userId = rows[0].id;
                });
            // req.session.userId = rows.id;
            res.redirect("/petition");
        }).catch((err) => {
            console.log("error in db.addSigner", err);
            res.render("register", {
                message: true,
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.listen(8080, () => console.log('Petition server listening!'));


