'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Country, Region, Location}) {
      this.belongsTo(Country, {foreignKey: "country_id"});
      this.belongsTo(Region, {foreignKey: "region_id"});
      this.hasMany(Location, {foreignKey: "city_id", onDelete:'CASCADE', hooks:true});
    }
  }
  City.init({
    city_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'City',
  });
  return City;
};