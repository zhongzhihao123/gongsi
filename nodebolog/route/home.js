//引用express框架
const express = require('express')
//创建博客展示页面路由
const home = express.Router()

home.get('/',(req,res)=>{
    res.send('欢迎来到博客首页')
})


module.exports = home;