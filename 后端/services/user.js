//所有的业务逻辑放在services中
const { querySql, queryOne }  = require('../db')
function login(username, password) {
  //查询mysql
  return querySql(`select * from admin_user where username='${username}' and password = '${password}'`)
}

function findUser(username) {
  return queryOne(`select id, username, nickname, role, avatar from admin_user where username='${username}'`)
}

module.exports = {
  login,
  findUser
}