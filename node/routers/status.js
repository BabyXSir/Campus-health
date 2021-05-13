// 创建router
const express = require("express")
let router = express.Router()
// 引入mysql
let query = require('../utils/query')
// 引入雪花算法
const snowId = require("../utils/snowflake")

// 1.获取卫生情况
router.get("/", async (req, res) => {
  let { time, area_id, class_id, page_num, page_size } = req.query

  page_num  = page_num || 1;
  page_size  = page_size || 5;

  // 查询卫生情况
  // 查询语句
  let sqlStr = "SELECT * FROM STATUS WHERE";
  if (time) sqlStr += ` TIME = '${time}' AND `;
  if (area_id) sqlStr += ` AREA_ID = ${area_id} AND `;
  if (class_id) sqlStr += ` CLASS_ID = ${class_id} AND `;
  // 去掉末尾的AND
  sqlStr = sqlStr.substr(0, sqlStr.length - 5)
  // 添加分页条件
  if (page_num && page_size) {
    page_num = Number(page_num)
    page_size = Number(page_size)
    sqlStr += ` ORDER BY ID DESC LIMIT ${(page_num - 1) * page_size},${page_size}`
  }
  // 发起查询请求
  let res1 = await query(sqlStr)
  
  // 查询status总数
  // 查询语句
  let totalSql = "SELECT count(*) as total FROM STATUS WHERE";
  if (time) totalSql += ` TIME = '${time}' AND `;
  if (area_id) totalSql += ` AREA_ID = ${area_id} AND `;
  if (class_id) totalSql += ` CLASS_ID = ${class_id} AND `;
  // 去掉末尾的AND
  totalSql = totalSql.substr(0, totalSql.length - 5)
  let res2 = await query(totalSql)
  
  // 返回正确信息
  res.send({
    code: 200,
    data: {
      statusData: res1,
      total: res2[0].total
    }
  })
})

// 2.添加卫生情况
router.post("/", async (req, res) => {
  let { class_id, class_name, area_id, area_name, principal_id, principal_name, time, status } = req.body;

  // 判断信息是否填写完整
  if (!(class_id && class_name && area_id && area_name && principal_id && principal_name && time)) {
    return res.json({
      code: 400,
      msg: "请将数据填写完整"
    })
  }

  // 判断是否重复添加
  let res1 = await query(`SELECT * FROM STATUS WHERE TIME = ('${time}') AND AREA_ID = ('${area_id}')`)
  // 如果重复添加则返回错误信息
  if (res1.length > 0) {
    return res.send({
      code: 400,
      msg: `${time} ${area_name} 区域的卫生情况重复添加`
    })
  }


  // 添加数据到数据库
  // mysql查询语句参数名
  let params_name = ['class_id', 'class_name', 'area_id', 'area_name', 'principal_id', 'principal_name', 'time', 'status']
  // mysql查询语句参数值
  // let id = snowId();
  let params_value = [class_id, class_name, area_id, area_name, principal_id, principal_name, time, 0]
  // 为了能够正确添加到mysql数据库数据，给每个数据添加双引号
  params_value.forEach((item, index) => {
    params_value[index] = '"' + item + '"'
  })
  // 添加
  let res2 = await query(`INSERT INTO STATUS (${params_name}) VALUES (${params_value})`)
  res.send({
    code: 200,
    msg: "分派成功"
  })

})

// 3.修改卫生情况
router.patch('/', async (req, res) => {

  // 获取body数据
  let { id, class_id, class_name, area_id, area_name, time, status, principal_id, principal_name } = req.body;

  // 当body数据中某一数据为空时，返回错误信息
  if (!(id && class_id && class_name && area_id && area_name && time && status && principal_id && principal_name)) {
    return res.json({
      code: 400,
      msg: "请将数据填写完整"
    })
  }

  // 当要修改的卫生情况日期在今天以后，则返回错误信息
  let now = new Date().getTime();
  let statusTime = new Date(time).getTime();
  if (now < statusTime) {
    return res.json({
      code: 400,
      msg: "修改的卫生情况超过今天"
    })
  }


  // 数据库请求语句
  let queryStr = "update status ";
  queryStr += "set class_id = " + class_id + ",";
  queryStr += "class_name = '" + class_name + "',";
  queryStr += "area_id = " + area_id + ",";
  queryStr += "area_name = '" + area_name + "',";
  queryStr += "time = '" + time + "',";
  queryStr += "status = " + status + ",";
  queryStr += "principal_id = " + principal_id + ",";
  queryStr += "principal_name = '" + principal_name + "'";
  queryStr += " where id = " + id;
  // 对数据库发起请求
  let res1 = await query(queryStr)
  // 判断是否响应
  if (res1.affectedRows > 0) {
    // 返回成功信息
    res.json({
      code: 200,
      msg: "修改成功"
    })
  } else {
    // 返回失败信息
    res.json({
      code: 400,
      msg: "修改失败"
    })
  }
})

module.exports = router;