const db = require("../models");
const config = require("../config/auth.config");
const Invite = db.invite;
const Role = db.role;

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

exports.inviteUserFe = (req, res) => {
    // res.sendFile("index.html");
};

exports.inviteUser = (req, res) => {
    //send information to db
    let regtoken = "8ad54a6df4g45ewe652a36ag465d4fe";
    Invite.create({
        email: req.body.email,
        regToken: regtoken,
        role: req.body.role,
        invitedBy: 1
    }).then(user => {
        if (req.body.roles) {
            Role.findAll({
                where: {
                    name: {
                        [Op.or]: req.body.roles
                    }
                }
            }).then(roles => {
                user.setRoles(roles).then(() => {
                    res.send({ message: "Invite was registered successfully!" });
                    //send mail
                });
            });
        } else {
            // user role = 1
            user.setRoles([1]).then(() => {
                res.send({ message: "Invite was registered successfully!" });
                // send mail
            });
        }
    })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });


};