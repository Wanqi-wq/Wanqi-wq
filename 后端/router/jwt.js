//用途：做路由的验证
const jwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')

module.exports = jwt({
  secret: PRIVATE_KEY,
  credentialsRequired: true
}).unless({
  path:[    //设置验证白名单。这些路由不需要验证token
    '/',
    '/user/login'
  ]
})