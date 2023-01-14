'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({CartItem, User}) {
      this.hasMany(CartItem, {foreignKey: "cart_id", onDelete:'CASCADE', hooks:true});
      this.belongsTo(User, {foreignKey: "user_cart_id"});
    }
  }
  Cart.init({
  }, {
    sequelize,
    modelName: 'Cart',
  });
  return Cart;
};