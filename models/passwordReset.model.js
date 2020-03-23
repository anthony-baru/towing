module.exports = (sequelize, Sequelize) => {
    const PasswordResets = sequelize.define("password_resets", {
        email: {
            type: Sequelize.STRING
        },
        resetToken: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.STRING
        }
    });

    return PasswordResets;
};