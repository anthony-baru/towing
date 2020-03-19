module.exports = (sequelize, Sequelize) => {
    const Invite = sequelize.define("invites", {
        email: {
            type: Sequelize.STRING
        },
        invited_by: {
            type: Sequelize.INTEGER
        },
        regToken: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING
        }


    });

    return Invite;
};