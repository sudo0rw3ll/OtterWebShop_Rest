'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({OrderItem, User, Transaction}) {
      this.hasMany(OrderItem, {foreignKey: "order_id", onDelete:'CASCADE', hooks:true});
      this.belongsTo(User, {foreignKey: "user_order_id"});
      this.hasMany(Transaction, {foreignKey: "order_payment_id", onDelete:'CASCADE', hooks:true});
    }
  }
  Order.init({
    total: DataTypes.DECIMAL,
    shipping: DataTypes.DECIMAL,
    grand_total: DataTypes.DECIMAL,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};