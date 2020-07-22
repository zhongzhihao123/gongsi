//导入用户集合
const { User } = require('../../model/user')


module.exports = async(req, res) => {
    //接收请求参数
    const { email, password } = req.body;
    //如果用户没有输入邮件地址
    if (email.trim().length == 0 || password.trim().length == 0) {
        return res.status(400).render('admin/error', { msg: '邮件地址或者密码错误' });
    }

    //根据邮箱地址查询用户信息
    //如果查询到了用户user变量为对象类型
    //如果查询不到user变量为空
    let user = await User.findOne({ email }) //await是异步获取到信息

    //查询到用户
    if (user) {
        //将客户端传递过来的密码和用户信息中的密码进行比对
        if (password == user.password) {
            //将用户名存储到请求对象中
            req.session.username = user.username
                //将用户名角色存储到请求对象中
            req.session.role = user.role
                //登录成功
                //    res.send('登陆成功')

            //把用户信息存储进来然后放在header.art文件中
            req.app.locals.userInfo = user

            //对用户的角色进行判断
            if (user.role == 'admin') {
                //重定向到用户列表页面
                res.redirect('/admin/user');
            } else {
                //重定向到博客首页
                res.redirect('/home/');
            }


        } else {
            //密码失败
            res.status(400).render('admin/error', { msg: '邮箱或者密码错误' })
        }

    } else {
        //没有查询到用户
        res.status(400).render('admin/error', { msg: '邮箱或者密码错误' })
    }
}