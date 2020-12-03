const express = require('express');
const app = express();
const hb = require('express-handlebars');

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static(__dirname + './public'));

app.use((req, res, next) => {
    console.log("------------");
    console.log(`${req.method} request comming in on route ${req.url}`);
    console.log("------------");
    next();
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        layout: "main",
    });
});

app.listen(8080, () => console.log('Petition server listening!'));
