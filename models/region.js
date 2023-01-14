'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Country, City}) {
      this.belongsTo(Country, {foreignKey: "country_id"});
      this.hasMany(City, {foreignKey: "region_id", onDelete:'CASCADE', hooks:true});
    }
  }
  Region.init({
    region_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Region',
  });
  return Region;
};