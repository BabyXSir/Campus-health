// 引入数据库
const db = require('../db/index')

// 请求函数
let query = (queryStr, params) => {
  // Promise
  return new Promise(function (resolve, reject) {
      queryStr = queryStr.toLowerCase();
      // 发起请求
    db.query(queryStr, params || [], function (err, result) {
      console.log('queryStr', queryStr)
      console.log('params', params)
      // reject返回报错
      if (err) reject(new Error(err))
      // resolve返回数据
      resolve(result)
    })
  })
}

module.exports = query