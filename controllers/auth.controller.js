const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Invite = db.invite;
const PasswordReset = db.passwordReset;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.userEmail,
        password: bcrypt.hashSync(req.body.password, 8)
    })
        .then(user => {
            if (req.userRoles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.userRoles
                        }
                    }
                }).then(roles => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User was registered successfully!" });
                        Invite.update({ regToken: "registered" }, { where: { regToken: req.regToken } });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully!" });
                    Invite.update({ regToken: "registered" }, { where: { regToken: req.regToken } });
                });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            var authorities = [];
            user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }
                res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.password_reset = (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (!user) {
            return res.status(200).send({ message: "Email not registered." });
        } else {
            let resetToken = Math.floor(Math.random(10000000) * 10000000);
            let protocol = req.protocol;
            const PORT = process.env.PORT || 8080;
            let hostname = req.hostname + ':' + PORT;
            let resetLink = protocol + '://' + hostname + '/api/auth/password-reset/' + resetToken
            PasswordReset.create({
                email: user.email,
                resetToken: resetToken,
            });
            return res.status(200).send({
                message: "Email sent. Click on the link provided.",
                resetLink: resetLink
            })
        }
    })
};

exports.password_reset_token = (req, res) => {
    PasswordReset.findOne({
        where: {
            resetToken: req.params.resetToken
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(reset => {
        if (!reset) {
            res.status(200).send({
                message: "Invalid token"
            })
        } else {
            if (req.body.password !== req.body.confirm_password) {
                res.status(200).send({ message: "Passwords provided don't match." })
            } else {
                //reset password
                let newPassword = bcrypt.hashSync(req.body.password, 8);
                let emailReset = reset.email;
                User.update({ password: newPassword }, { where: { email: emailReset } })
                    .then(userReset => {
                        PasswordReset.update({
                            resetToken: null,
                            status: 'reset'
                        }, {
                            where: { email: emailReset }
                        }
                        )
                            .catch(err => {
                                res.status(500).send({ message: err.message });
                            });

                        res.status(200).send({ message: "Password reset successfully!" });
                    })
                    .catch(err => {
                        res.status(500).send({ message: err.message });
                    })
            }
        }
    })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};