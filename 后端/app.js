const express = require('express')
const router = require('./router')
//用来解析body参数
const bodyParser = require('body-parser')
//解决跨域问题
const cors = require('cors')


const app = express()
//跨域中间件
app.use(cors())
//解析参数
app.use(bodyParser.urlencoded({extended: true})) 
//解析json参数的body
app.use(bodyParser.json())
app.use('/',router)

const server = app.listen(5000, function() {
  const { address, port } = server.address()
  console.log('Http服务启动成功' ,address, port);
})
