//引用express框架
const express = require('express')



//创建博客展示页面路由
const admin = express.Router()

//渲染登陆页面
admin.get('/login', require('./admin/loginPage'))


//提交登陆后请求的    用post要用到第三方模块body-parser  npm install body-parser  实现登陆功能
admin.post('/login', require('./admin/login'))

//创建用户列表页面路由
admin.get('/user', require('./admin/userPage'))

//创建用户列表
admin.get('/user', (req, res) => {
    res.render('admin/user')
})


//创建新增用户编辑列表路由
admin.get('/user-edit', require('./admin/user-edit'))

//创建新增用户添加功能
admin.post('/user-edit', require('./admin/user-edit-fn'))

//创建用户编辑功能
admin.post('/user-modify', require('./admin/user-modify'));

//实现退出功能
admin.get('/logout', require('./admin/logout'))


module.exports = admin;