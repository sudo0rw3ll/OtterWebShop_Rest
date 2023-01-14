'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Role, Comment, Cart, Transaction, Order, Location}) {
      this.belongsTo(Role, {foreignKey: "role_id"});
      this.belongsTo(Location, {foreignKey: "location_id"});
      this.hasMany(Cart, {foreignKey: "user_cart_id", onDelete:'CASCADE', hooks:true});
      this.hasMany(Comment, {foreignKey: "user_id", onDelete:'CASCADE', hooks:true});
      this.hasMany(Order, {foreignKey: "user_order_id", onDelete:'CASCADE', hooks:true});
      this.hasMany(Transaction, {foreignKey: "transaction_user_id", onDelete:'CASCADE', hooks:true});
    }
  }
  User.init({
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    mobile_phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};