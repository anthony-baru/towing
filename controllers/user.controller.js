const db = require("../models");
const config = require("../config/auth.config");
const Invite = db.invite;
const Role = db.role;
const User = db.user;

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
                    res.status(200).send({ message: "Invite sent successfully!" })
                })
                    .catch(err => {
                        res.status(500).send({ message: err.message });
                    });
            }
        })
};