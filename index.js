const express = require('express');
const app = express();
const hb = require('express-handlebars');
const db = require("./db");
// const cookieSession = require('cookie-session');
// const csurf = require("csurf");

// app.use(
//     cookieSession({
//         secret: `I'm always angry.`,
//         maxAge: 1000 * 60 * 60 * 24 * 7 * 6
//     })
// );

app.use(
    express.urlencoded({
        extended: false,
    })
);

// app.use(csurf()); 

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    const { firstName, lastName, signature } = req.body;
    //inserir condicional para cookie - se foi submetido sem erros, 
    //'signed' = true, se nao 'signed' = false
    db.addSigner(firstName, lastName, signature)
        .then(() => {
            console.log("yay it worked");
            // res.sendStatus(200);
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
    // if (req.cookies.signed !== "true") {
    //     res.redirect('/petition');
    // }
    // else {
        db.getTotalSigners()
            .then(({ rows }) => {
                const totalSigners = rows[0].count;
                res.render("thanks", {
                    layout: "main",
                    totalSigners: totalSigners,
                    signersUrl: '/signers',
                });
                console.log("result from getTotalSigners", rows);
            })
            .catch((err) => {
                console.log("error in db.getTotalSigners", err);
            });        

    // }
});

app.get("/signers", (req, res) => {
    // if (req.cookies.signed !== "true") {
    //     res.redirect("/petition");
    // } else {
        db.getFullName()
            .then(({ rows }) => {
                // const signerArr = rows.map( (elem) => {
                //     return `${elem.first_name} ${elem.last_name}`;
                // });

                res.render("signers", {
                    layout: "main",
                    rows,
                });
                console.log("result from getFullName", rows);
            })
            .catch((err) => {
                console.log("error in db.getFullName", err);
            });
        
        // res.render("signers", {
        //     layout: "main",
        // });
    // }
});

app.use((req, res, next) => {
    // res.set("x-frame-options", "DENY");
    // res.locals.csrfToken = req.csrfToken();
    console.log("------------");
    console.log(`${req.method} request comming in on route ${req.url}`);
    console.log("------------");
    next();
});

app.listen(8080, () => console.log('Petition server listening!'));


