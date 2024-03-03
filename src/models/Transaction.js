const { Sequelize, DataTypes } = require('sequelize');
const { dbConfig } = require('../../config/db.config');

const sequelize = new Sequelize(dbConfig);

const IssuedBook = sequelize.define('IssuedBook', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    book_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
            model: 'books',
            key: 'id',
        },
    },
    checked_out: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'issued_books',
    timestamps: false
});

module.exports = IssuedBook;
