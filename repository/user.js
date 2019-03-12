'use strict';

const userModel = require('../db').models.user;

// Получить всех пользователей
const getAll = cb => {
    userModel.find({}, cb);
};

module.exports = {
    getAll
};