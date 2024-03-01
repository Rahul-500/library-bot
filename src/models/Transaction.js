const { Sequelize, DataTypes } = require('sequelize');
const { dbConfig } = require('../../config/db.config');

const sequelize = new Sequelize(dbConfig);

const Transaction = sequelize.define('Transaction', {
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
    return_date: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
}, {
    tableName: 'transactions',
    timestamps: false
});

module.exports = Transaction;
