const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const cors = require("cors");
const sendMail = require('./config/mail.config');
require('dotenv').config()


const app = express();

var corsOptions = {
    origin: "http://localhost:8080"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//loading models
const db = require("./models");
const Role = db.role;

//for production
db.sequelize.sync();
//for dev
// db.sequelize.sync().then(() => {
//     console.log('Drop and Resync Db');
//     initial();
// });
function initial() {
    Role.create({
        id: 1,
        name: "user"
    });

    Role.create({
        id: 2,
        name: "moderator"
    });

    Role.create({
        id: 3,
        name: "admin"
    });
}

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to apa myrescue application.", data: process.env });
});

app.get('/email', (req, res) => {
    // return res.json({ data: req.body });
    const { email, subject, text } = req.body;
    sendMail(email, subject, text, (err, data) => {
        if (err) {
            res.status(500).json({ message: "Internal Error!", data: data });
        } else {
            res.status(200).json({ message: 'Email sent' });
        }
    });
});

// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

var today = new Date();
var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
console.log(date, time)

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

