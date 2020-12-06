const express = require('express');
const app = express();
const hb = require('express-handlebars');
const db = require("./db");
const cookieSession = require('cookie-session');
const csurf = require("csurf");
const { secret } = require("./secrets.json");

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
    if(!req.session.signed) {
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/thanks");
    }
});

app.post("/petition", (req, res) => {
    const { firstName, lastName, signature } = req.body;
    db.addSigner(firstName, lastName, signature)
        .then(({ rows }) => {
            console.log("yay it worked", rows);
            // res.sendStatus(200);
            req.session.id = rows[0].id;
            
            // req.session.signed = 'true';
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
    db.getTotalSigners()
        .then(({ rows }) => {
            const totalSigners = rows[0].count;
            db.getSignature(req.session.id)
                .then((result) => {
                    let signatureImg = result.rows[0].signature;
                    res.render("thanks", {
                        layout: "main",
                        totalSigners: totalSigners,
                        signersUrl: "/signers",
                        signature: signatureImg,
                    });
                }) ;

        })
        .catch((err) => {
            console.log("error in db.getTotalSigners", err);
        });        
});

app.get("/signers", (req, res) => {
    db.getFullName()
        .then(({ rows }) => {
            res.render("signers", {
                layout: "main",
                rows,
            });
            console.log("result from getFullName", rows);
        })
        .catch((err) => {
            console.log("error in db.getFullName", err);
        });
});

app.listen(8080, () => console.log('Petition server listening!'));


