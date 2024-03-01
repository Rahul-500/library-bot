const { Sequelize, DataTypes } = require('sequelize');
const { dbConfig } = require('../../config/db.config')

const sequelize = new Sequelize(dbConfig);

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
    },
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;