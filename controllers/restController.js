const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const pageLimit = 10
const Comment = db.Comment
const User = db.User
const Like = db.Like


const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then((result) => {
      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      // clean up restaurant data
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLike: req.user.LikeRestaurants.map(d => d.id).includes(r.id),
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },  // 加入關聯資料
        { model: User, as: 'LikeUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      // console.log(restaurant.Comments[0].dataValues)
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id) // 找出收藏此餐廳的 user
      const isLike = restaurant.LikeUsers.map(d => d.id).includes(req.user.id)
      restaurant.increment("viewCounts"); //sequelize遞增方法，用increment
      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited: isFavorited,  // 將資料傳到前端
        isLike: isLike
      })
    })
  },

  // getFeeds: (req, res) => {
  //   return Restaurant.findAll({
  //     limit: 10,
  //     raw: true,
  //     nest: true,
  //     order: [['createdAt', 'DESC']],
  //     include: [Category]
  //   }).then((restaurants) => {
  //     return Comment.findAll({
  //       limit: 10,
  //       raw: true,
  //       nest: true,
  //       order: [['createdAt', 'DESC']],
  //       include: [User, Restaurant]
  //     }).then((comments) => {
  //       return res.render('feeds', { restaurants, comments })
  //     })
  //   })
  // }

  // Promise.all 寫法
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', { restaurants, comments })
    })
  },
  getDashBoard: (req, res) => {
    return Restaurant.findByPk(
      req.params.id,
      {
        include: [
          Category,
          { model: Comment, include: [Restaurant] }
        ]
      },

    ).then((restaurant) => {
      console.log(restaurant.toJSON())
      return res.render('dashboard', { restaurant: restaurant.toJSON() })
    })
  },
  getTopRestaurant: (req, res) => {
    return res.render('top')
  }

}
module.exports = restController