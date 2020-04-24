const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const cors = require("cors");
const sendMail = require('./config/mail.config');
const morgan = require('morgan');
const fs = require('fs');
var bcrypt = require("bcryptjs");


require('dotenv').config();

const app = express();
let accessLogStream = fs.createWriteStream(path.join(__dirname, './logs/access.log'), { flags: 'a' })

app.use(morgan('combined', { stream: accessLogStream }));

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
const User = db.user;

db
    //for production
    .sequelize.sync();
//for dev
// .sequelize.sync({ force: true }).then(() => {
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

    User.create({
        id: 1,
        username: 'anthonybaru',
        email: 'anthonybaru@gmail.com',
        password: bcrypt.hashSync('anthonybaru@gmail.com', 8)
    })
        .then(defaultUser => {
            console.log(defaultUser);
            return defaultUser;
        })
        .then(defaultUser => {
            defaultUser.setRoles([3]);
            console.log(defaultUser);
        })
        .catch(err => console.log(err))
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

