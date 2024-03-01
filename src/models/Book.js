const { Sequelize, DataTypes } = require('sequelize');
const { dbConfig } = require('../../config/db.config')

const sequelize = new Sequelize(dbConfig);

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    author: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    published_year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity_available: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    tableName: 'books',
    timestamps: false
});

module.exports = Book;
