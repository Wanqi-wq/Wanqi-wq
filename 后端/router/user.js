const express = require('express')
//Result类用来统一返回
const Result = require('../models/Result')
const { login, findUser } = require('../services/user')
//引入密码加密方法md5
const { md5, decoded } = require('../utils')
//引入密码的秘钥,与密码混合
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
//表单校验
const { body,validationResult } = require('express-validator')
const boom = require('boom')
//jwt生成token
const jwt = require('jsonwebtoken')



const router = express.Router()

router.get('/info', function(req, res) {
  const decode = decoded(req)
  if(decode && decode.username) {
    findUser(decode.username).then(user => {
      if(user) {
        user.roles = [user.role]
        new Result(user, '用户信息查询成功').success(res)
      }else {
        new Result('用户信息查询失败').fail(res)
      }
      
    })
  }else {
      new Result('用户信息查询失败').fail(res)
  }
  
})

router.post('/login', 
  [
    body('username').isString().withMessage('用户名必须为字符'),
    body('password').isString().withMessage('用户名必须为字符')
  ],
  function(req, res, next) {
    const err = validationResult(req)
    if(!err.isEmpty()) {
      //如果校验发生错误
      const [{msg}] = err.errors
      next(boom.badRequest(msg))
    }else {
      //如果校验成功
      const { username, password } = req.body;
    //进行用户查询和密码加密
      login(username, md5(`${password}${PWD_SALT}`)).then(user => {
        if(!user || user.length === 0) {
              //登陆失败
            new Result('登陆失败').fail(res)
        }else {
              //登陆成功
              const token = jwt.sign(
                {username },
                PRIVATE_KEY,
                //token过期时间
                { expiresIn: JWT_EXPIRED } 
                )  
            new Result({token},'登陆成功').success(res)
        }
      })
    }
  })

module.exports = router