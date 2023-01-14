'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ProductCategory, Comment, Cart, CartItem, OrderItem}) {
      this.belongsTo(ProductCategory, {foreign_key: "ProductCategoryId"});
      this.hasMany(Comment, {foreignKey: "product_id", onDelete:'CASCADE', hooks:true});
      this.hasMany(CartItem, {foreignKey: "cart_product_id", onDelete:'CASCADE', hooks:true});
      this.hasMany(OrderItem, {foreignKey: "order_product_id", onDelete:'CASCADE', hooks:true});
    }
  }
  Product.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    is_available: DataTypes.BOOLEAN,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};