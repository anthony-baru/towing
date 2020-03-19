const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const Invite = db.invite;

checkInviteExistence = (req, res, next) => {
    Invite.findOne({
        where: {
            regToken: req.params.token
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(invite => {
        if (!invite) {
            return res.status(200).send({ message: "Invite invalid!" })
        } else {

            req.userEmail = invite.email;
            req.userRoles = invite.role.split(",");
            req.regToken = invite.regToken;
            next();
        }
    })
}

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: "Failed! Username is already in use!"
            });
            return;
        }

        // Email
        User.findOne({
            where: {
                email: req.userEmail
            }
        }).then(user => {
            if (user) {
                res.status(400).send({
                    message: "Failed! Email is already in use!"
                });
                return;
            }

            next();
        });
    });
};

checkRolesExisted = (req, res, next) => {
    if (req.userRoles) {
        for (let i = 0; i < req.userRoles.length; i++) {
            if (!ROLES.includes(req.userRoles[i])) {
                res.status(400).send({
                    message: "Failed! Role does not exist = " + req.userRoles[i]
                });
                return;
            }
        }
    }

    next();
};

const verifySignUp = {
    checkInviteExistence: checkInviteExistence,
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;