const express = require('express');
const app = express();
const hb = require('express-handlebars');
const db = require("./db");
const cookieSession = require('cookie-session');
// const csurf = require("csurf");

// const { secret } = require("./secrets.json");
let { secret } =
    process.env.NODE_ENV === "production"
        ? (secret = process.env)
        : (secret = require("./secrets.json"));

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

// app.use(csurf()); 

app.engine("handlebars", hb());

app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use((req, res, next) => {
    // res.set("x-frame-options", "DENY");
    // res.locals.csrfToken = req.csrfToken();
    console.log(`${req.method} request comming in on route ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if(req.session.userId) {
        if (!req.session.sigId) {
            res.render("petition", {
                layout: "main",
            });
        } else {
            res.redirect("/thanks");
        }
    } else {
        res.redirect('/login');
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    db.addSigner(signature, req.session.userId)
        .then(({ rows }) => {
            console.log("yay it worked", rows);
            req.session.sigId = rows[0].id;
            // req.session.authenticated = true;
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
    if(req.session.userId) {
        if (req.session.sigId) {
            db.getTotalSigners()
                .then(({ rows }) => {
                    const totalSigners = rows[0].count;
                    db.getSignature(req.session.sigId).then((result) => {
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
    } else {
        res.redirect('/login');
    }      
});

app.get("/signers", (req, res) => {
    if(req.session.userId) {
        if (req.session.sigId) {
            db.getSignersInfo()
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
    } else {
        res.redirect('/login');
    }
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("/thanks");
        } 
        else {
            res.redirect("/petition");
        }
    } 
    else {
        res.render("register", {
            layout: "main",
        });
    }
});

app.post("/register", (req, res) => {
    const { firstName, lastName, emailAddress, userPassword } = req.body;
    hash(userPassword)
        .then((hashedPw) => {
            db.addUser(firstName, lastName, emailAddress, hashedPw)
                .then(({ rows }) => {
                    console.log("it worked", rows[0].id);
                    req.session.userId = rows[0].id;
                    res.redirect("/profile");
                });
        }).catch((err) => {
            console.log("error in db.addUser", err);
            res.render("register", {
                message: true,
            });
        });
});

app.get("/login", (req, res) => {
    if(req.session.userId) {
        if(req.session.sigId) {
            res.redirect('/thanks');
        }
        else {
            res.redirect('/petition');
        }
    } 
    else {
        res.render("login", {
            layout: "main",
        });
    }
});

app.post("/login", (req, res) => {
    const { emailAddress, userPassword } = req.body;
    db.getUserInfo(emailAddress)
        .then(({ rows }) => {
            if (rows.length > 0) {
                compare(userPassword, rows[0].password)
                    .then((result) => {
                        if (result) {
                            req.session.userId = rows[0].id;
                            console.log("Deu certo!", rows[0].id);
                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                message: true,
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("error in POST /logig route compare: ", err);
                        res.render("login", {
                            message: true,
                        });
                    });
            } else {
                res.redirect("/register");
            }
        })
        .catch((err) => {
            console.log("error in POST db.getUserInfo: ", err);
            res.render("login", {
                message: true,
            });
        });
});

app.get("/profile", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("/thanks");
        } 
        else {
            res.render("profile", {
                layout: "main",
            });
        } 
    } 
    else {
        res.redirect("/register");
    }
});

app.post('/profile', (req, res) => {
    const { age, city, homepage } = req.body;
    const newHomepage = (() => {
        if (homepage.startsWith("http://") || homepage.startsWith("https://")) {
            return homepage;
        } else {
            return '';
        }
    })();
    console.log(newHomepage);

    db.addUserProfile(age, city, newHomepage, req.session.userId)
        .then(() => {
            console.log("addUserProfile worked");
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in db.addUserProfile", err);
            res.render("profile", {
                message: true,
            });
        });
});

app.get("/signers/:city", (req, res) => {
    if(req.session.userId) {
        if(req.session.sigId) {
            const { city } = req.params;
            db.getSignersByCity(city)
                .then(({ rows }) => {
                    console.log(" db.getSignersByCity worked");
                    res.render("city", {
                        layout: "main",
                        city: city,
                        rows
                    });
                })
                .catch((err) => {
                    console.log("error in b.getSignersByCity", err);
                    res.render("signers", {
                        message: true,
                    });
                });
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/login");
    }
});

// app.get("*", (req, res) => {
//     res.redirect("/register");
// });

app.get("/edit", (req, res) => {
    if (req.session.userId) {
        db.getInfoToEdit(req.session.userId)
            .then(({ rows }) => {
                res.render("edit", {
                    layout: "main",
                    rows,
                });
            })
            .catch((err) => {
                console.log("error in db.getInfoToEdit", err);
                res.render("edit", {
                    message: true,
                });
            });
    } else {
        res.redirect("/register");
    }
});

app.post('/edit', (req, res) => {
    const { firstName, lastName, emailAddress, userPassword, age, city, homepage } = req.body;
    console.log(req.body);
    if (userPassword.length === 0) {
        console.log('no pw');
     // hash the new password
     // update 4 columns in users
     // run upsert for user_profiles
     } else {
         console.log('pw');
     // no password provided so only update 3 columns in users
     // run upsert for user_profiles
 }
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server listening!")
);


