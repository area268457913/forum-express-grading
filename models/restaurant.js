'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Restaurant.belongsTo(models.Category)  // 加入關聯設定
      Restaurant.hasMany(models.Comment)
      Restaurant.belongsToMany(models.User, {
        through: models.Favorite,
        foreignKey: 'RestaurantId',
        as: 'FavoritedUsers'
      }),
        Restaurant.belongsToMany(models.User, {
          through: models.Like,
          foreignKey: 'RestaurantId',
          as: 'LikeUsers'
        })
    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    opening_hours: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    CategoryId: DataTypes.INTEGER,  // 更新欄位清單
    viewCounts: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'Restaurant',
  });
  return Restaurant;
};