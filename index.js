const express = require('express');
const hb = require('express-handlebars');
const db = require("./db");
const cookieSession = require('cookie-session');
const csurf = require("csurf");
const {
    safetyCookie,
    requireLoggedInUser,
    requireSignedPetition,
    requireUnsignedPetition,
    requireLoggedOutUser
} = require("./middleware");

const app = (exports.app = express());

let secret;
process.env.NODE_ENV === "production"
    ? (secret = process.env)
    : (secret = require("./secrets.json"));

const { hash, compare } = require('./bc');

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: `${secret}`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);

app.use(csurf()); 

app.use(safetyCookie);

app.get("/home", (req, res) => {
    res.render("home", {});
});

app.use(requireLoggedInUser);

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    const { firstName, lastName, emailAddress, userPassword } = req.body;
    hash(userPassword)
        .then((hashedPw) => {
            db.addUser(firstName, lastName, emailAddress, hashedPw)
                .then(({ rows }) => {
                    console.log("it worked", rows[0].id);
                    req.session.userId = rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("error in db.addUser", err);
                    res.render("register", {
                        message: true,
                    });
                });
        })
        .catch((err) => {
            console.log("error in db.addUser", err);
            res.render("register", {
                message: true,
            });
        });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
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
                        console.log(
                            "error in POST /login route compare: ",
                            err
                        );
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

app.get("/profile", requireUnsignedPetition, (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    const { age, city, homepage } = req.body;
    const newHomepage = (() => {
        if (homepage.startsWith("http://") || homepage.startsWith("https://")) {
            return homepage;
        } else {
            return null;
        }
    })();
    db.addUserProfile(age, city, newHomepage, req.session.userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in db.addUserProfile", err);
            res.render("profile", {
                message: true,
            });
        });
});

app.get("/petition", requireUnsignedPetition, (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", requireUnsignedPetition, (req, res) => {
    const { signature } = req.body;
    db.addSigner(signature, req.session.userId)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error in db.addSigner", err);
            res.render('petition', {
                message: true,
            });
        });
});

app.get("/thanks", requireSignedPetition, (req, res) => {
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
});

app.post('/thanks', (req, res) => {
    const { deleteSign, editProfile } = req.body;
    if (deleteSign === '') {
        db.deleteSign(req.session.userId)
            .then(() => {
                req.session.sigId = null;
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error in db.deleteSign", err);
                res.render("thanks", {
                    layout: "main",
                });
            });
    } else if (editProfile === '') {
        res.redirect("/edit");
    }
});

app.get("/signers", requireSignedPetition, (req, res) => {
    db.getSignersInfo()
        .then(({ rows }) => {
            res.render("signers", {
                layout: "main",
                rows,
            });
        })
        .catch((err) => {
            console.log("error in db.getFullName", err);
        });
});


app.get("/signers/:city", requireSignedPetition, (req, res) => {
    const { city } = req.params;
    db.getSignersByCity(city)
        .then(({ rows }) => {
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
});

app.get("/edit", (req, res) => {
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
});

app.post('/edit', (req, res) => {
    const { firstName, lastName, emailAddress, userPassword, age, city, homepage } = req.body;
    if (userPassword.length > 0) {
        hash(userPassword)
            .then((hashedPw) => {
                db.editUsersTable(
                    firstName,
                    lastName,
                    emailAddress,
                    hashedPw,
                    req.session.userId
                )
                    .then(() => {
                        const newHomepage = (() => {
                            if (
                                homepage.startsWith("http://") ||
                                homepage.startsWith("https://")
                            ) {
                                return homepage;
                            } else {
                                return "";
                            }
                        })();
                        db.editProfileTable(
                            age,
                            city,
                            newHomepage,
                            req.session.userId
                        )
                            .then(() => {
                                res.redirect('/thanks');
                            })
                            .catch((err) => {
                                console.log("error in editUsersTable", err);
                                res.render("edit", {
                                    message: true,
                                });
                            });
                    })
                    .catch((err) => {
                        console.log("error in editUsersTable", err);
                        res.render("edit", {
                            message: true,
                        });
                    });
            })
            .catch((err) => {
                console.log("error in hash", err);
                res.render("edit", {
                    message: true,
                });            
            });
    } else {
        db.editUsersTable(
            firstName,
            lastName,
            emailAddress,
            req.session.userId
        ).then(() => {
            const newHomepage = (() => {
                if (homepage.startsWith("http://") ||
                homepage.startsWith("https://")) {
                    return homepage;
                } else {
                    return null;
                }})();
            db.editProfileTable(age, city, newHomepage, req.session.userId)
                .then(() => {
                    res.redirect("/thanks");
                })
                .catch((err) => {
                    console.log("error in editProfileTable", err);
                    res.render("edit", {
                        message: true,
                    });
                });
        })
            .catch((err) => {
                console.log("error in editUsersTable", err);
                res.render("edit", {
                    message: true,
                });
            });        
    }
});

app.get("/logout", (req, res) => {
    req.session.userId = null;
    res.redirect("/home");
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Petition server listening!")
    );
}