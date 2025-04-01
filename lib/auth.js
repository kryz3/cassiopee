const bcrypt = require("bcrypt");

const verifyPassword = async (password, password2) => {
    return bcrypt.compare(password, password2);
};

const isAdmin = (sessionId) => {

};