'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({City, User}) {
      this.belongsTo(City, {foreignKey: "city_id"});
      this.hasMany(User, {foreignKey: "location_id"});
    }
  }
  Location.init({
    address: DataTypes.STRING,
    home_flat_number: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};