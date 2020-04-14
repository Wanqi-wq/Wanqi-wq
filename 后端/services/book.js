const Book = require('../models/Book')
const db = require('../db')
const _ = require('lodash')
function exists(book) {
  //查询是否有这本电子书
  const {title, author, publisher} = book
  const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}

async function removeBook(book) {
//移除数据库中数据和上传的文件
if(book) {
  //删除上传的文件
  book.reset()
  //删除数据库中的文件

  if(book.fileName){
    const removeBookSql = `delete from book where fileName='${book.fileName}'`
    const removeContentsSql = `delete from contents where fileName='${book.fileName}'`
    await db.querySql(removeBookSql)
    await db.querySql(removeContentsSql)
  }

}
}

async function insertContents(book) {
  const contents = book.getContents()
  if(contents && contents.length > 0) {
    for(let i = 0; i < contents.length ; i++) {
      const content = contents[i]
      const _content = _.pick(content, [
        'fileName',
        'id',
        'href',
        'text',
        'order',
        'level',
        'label',
        'pid',
        'navId'
      ])
      await db.insert(_content, 'contents')
    }
  }
}




function insertBook(book) {
  return new Promise(async (resolve, reject) => {
    try{
      if(book instanceof Book) {
        //判断电子书是否存在
        const result = await exists(book)
        if(result) {
          await removeBook(book)
          reject(new Error('电子书已存在'))
        }else {
          await db.insert(book.toDb(),'book')
          
          //传入电子书目录
          await insertContents(book)
          resolve()
        }

      }else {
        reject(new Error('添加的图书对象不合法'))
      }
    }catch(e) {
      reject(e)
    }
    
  })
}

//更新电子书
function updateBook(book) {
  return new Promise(async (resolve, reject) => {
    try{
      if(book instanceof Book) {
        const result = await getBook(book.fileName)
        if(result) {
          const model = book.toDb()
          if(+result.updateType === 0) {
          reject(new Error('内置图书不能编辑')) 
          }else {
              await db.update(model, 'book', `where fileName='${book.fileName}'`)
          }
          resolve()
        }    
      }else {
        reject(new Error('添加的图书对象不合法'))
      }
    }catch(e) {
      reject(e)
    }
  })
}


function getBook(fileName) {
  //获取电子书信息
  return new Promise(async (resolve, reject) => {
    const bookSql = `select * from book where fileName='${fileName}'`
    const contentsSql = `select * from contents where fileName='${fileName}' order by \`order\``
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentsSql)
    if(book) {
      book.cover = Book.genCoverUrl(book)
      book.chapterTree = Book.genContentsTree(contents)
      resolve(book)
    }else {
      reject(new Error('电子书存在'))
    }
    
  }) 

}

async function getCategory() {
  const sql = `select * from category order by category asc`
  const result = await db.querySql(sql)
  const categoryList = []
  result.forEach(item => {
    categoryList.push({
      label: item.categoryText,
      value: item.category,
      num: item.num

    })
  })
  return categoryList
  
}


async function listBook(query) {
  const {
    category,
    author,
    title,
    page = 1,
    pageSize=20,
    sort
  } = query
  const offSet = (page - 1) * pageSize
  let bookSql = 'select * from book'
  let where = 'where'
  category && (where = db.and(where, 'categoryText', category))
  title && (where = db.andLike(where, 'title', title))
  author  && (where = db.andLike(where, 'author', author))
  if(where !== 'where') {
    bookSql = `${bookSql} ${where}`
  }
  if(sort) {
    const symbol = sort[0]
    const column = sort.slice(1, sort.length) 
    const order = symbol === '+' ? 'asc' : 'desc'
    bookSql = `${bookSql} order by \`${column}\` ${order}`
  }
  let countSql = `select count(*) as count from book`
  if(where !== 'where') {
    //有查询条件
    countSql = `${countSql} ${where}`
  }
  const count = await db.querySql(countSql)
  bookSql = `${bookSql} limit ${pageSize} offset ${offSet}`
  const list = await db.querySql(bookSql)
  list.forEach(book => book.cover = Book.genCoverUrl(book))
  return { list, count: count[0].count, page, pageSize}
}

function deleteBook(fileName) {
  return new Promise(async (resolve, reject) => {
    let book = await getBook(fileName)
    if(book) {
      if(+book.updateType === 0) {
        reject(new Error('内置电子书不能删除'))
      }else {
        const bookSql = new Book(null, book)
        const sql = `delete from book where fileName='${fileName}'`
        db.querySql(sql).then(() => {
          bookObj.reset()
          resolve()
        })
      }
    }else {
      reject(new Error('电子书不存在'))
    }
    resolve()
  })
}
module.exports = {
  insertBook,
  getBook,
  updateBook,
  getCategory,
  listBook,
  deleteBook
}