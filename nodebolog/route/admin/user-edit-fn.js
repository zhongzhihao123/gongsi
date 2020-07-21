const Joi = require('joi');

//引入集合的构造函数
const {User,validateUser} = require('../../model/user')

module.exports = async(req,res,next) => {
    
    try {
        await validateUser(req.body)

    }catch(e) {
        //验证没有通过
        //重定向到用户添加页面
        // res.redirect('/admin/user-edit?message='+e.message)  把重定向代码进行优化，所以注释掉

        // JSON.stringify()将对象数据类型转换为字符串类型
        // JSON.stringify({path:'/admin/user-edit',message:e.message})
        return next(JSON.stringify({path:'/admin/user-edit',message:e.message}))
    }

    //根据邮箱地址查询用户是否存在
    let user = await User.findOne({email:req.body.email});
    //如果用户存在，就是邮箱地址已经被用了
    if(user) {
        //重定向回用户添加页面返回错误信息
        // return res.redirect(`/admin/user-edit?message=邮箱地址已经存在`)
        //重定向代码优化
        return next(JSON.stringify({path:'/admin/user-edit',message='邮箱地址已经存在'}))
    }

    //将用户信息添加到数据库中
    await User.create(req.body);
    //将页面重定向到用户列表页面
    res.redirect('/admin/user')
}