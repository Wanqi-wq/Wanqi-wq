const DEV = 'dev'
const UPLOAD_PATH = DEV === 'dev' ? 'D:/nginx-1.16.1/html/root/upload/admin-upload/ebook':'/www/wwwroot/admin/upload/admin-upload/ebook'
const UPLOAD_URL = DEV === 'dev' ? 'http://localhost:80/root/upload/admin-upload/ebook' : 'http://114.215.84.9/upload/admin-upload/ebook'
const OLD_UP_LOAD_URL = 'https://www.youbaobao.xyz/book/res/img'
module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  CODE_TOKEN_EXPIRED: -2,
  debug: true,
  PWD_SALT: 'admin_imooc_node',
  PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
  JWT_EXPIRED: 60 * 60, // token失效时间,1小时
  UPLOAD_PATH,
  MINE_TYPE_EPUB:'application/epub',
  UPLOAD_URL,
  OLD_UP_LOAD_URL
}