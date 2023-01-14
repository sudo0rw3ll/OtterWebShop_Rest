'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Order, User}) {
      this.belongsTo(Order, {foreignKey: "order_payment_id"});
      this.belongsTo(User, {foreignKey: "transaction_user_id"});
    }
  }
  Transaction.init({
    expire_date: DataTypes.DATE,
    cvv: DataTypes.INTEGER,
    card_number: DataTypes.STRING,
    owner_name: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};