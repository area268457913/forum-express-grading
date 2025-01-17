const express = require('express')
const handlebars = require('express-handlebars') // 引入 handlebars
const bodyParser = require('body-parser')// Express 升級到了 4.17.1 之後，不用額外載入 body-parser，這行程式碼便不用寫
const flash = require('connect-flash')
const helpers = require('./_helpers')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')

const db = require('./models') // 引入資料庫
const app = express()
const port = process.env.PORT || 3000


app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
})) // Handlebars 註冊樣板引擎
app.set('view engine', 'handlebars') // 設定使用 Handlebars 做為樣板引擎
app.use(express.urlencoded({ extended: true }))

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  //res.locals.user = req.user //讓views能存取user
  res.locals.user = helpers.getUser(req) // 取代 req.user
  next()
})

app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由

require('./routes')(app, passport)

module.exports = app
