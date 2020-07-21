//创建用户集合
//引入数据库
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        //保证邮箱地址在插入数据库时不重复
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    //admin 超级管理员
    //normal 普通用户
    role: {
        type: String,
        required: true
    },
    //0 启用状态
    //1 禁用
    state: {
        type: Number,
        default: 0
    }
})

const Joi = require('joi')
    //创建集合
const User = mongoose.model('User', userSchema);


// 创建用户
// User.create({
//     username:'itheima',
//     email:'itheima@itcast.cn',
//     password:'123456',
//     role:'admin',
//     state:0
// }).then(()=> {
//     console.log('用户创建成功')
// }).catch(()=>{
//     console.log('用户创建失败')
// })
// User.create({
//     username:'zhongzhihao',
//     email:'514974922@qq.com',
//     password:'123456',
//     role:'admin',
//     state:0
// }).then(()=> {
//     console.log('用户创建成功')
// }).catch(()=>{
//     console.log('用户创建失败')
// })

//验证用户信息
const validateUser = (user) => {
    //定义对象验证规则
    const schema = {
            username: Joi.string().min(2).max(12).required().error(new Error('用户不符合')),
            email: Joi.string().email().required().error(new Error('邮件格式不符合')),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required().error(new Error('密码错误')),
            role: Joi.string().valid('normal', 'admin').required().error(new Error('角色值非法')),
            state: Joi.number().valid(0, 1).required().error(new Error('状态值非法'))
        }
        //实施验证
    return Joi.validate(user, schema);
    //修改了
}

//将用户集合做为模块成员进行导出
module.exports = {
    User,
    validateUser
}