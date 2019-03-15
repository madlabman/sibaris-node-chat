'use strict';

const userModel = require('../db').models.user;

/**
 * Получить всех пользователей
 * @returns {Promise}
 */
const getAll = () => {
    return userModel.find({}).exec();
};

module.exports = {
    getAll
};