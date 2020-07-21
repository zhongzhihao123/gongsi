const { User } = require('../../model/user');
const { use } = require('../home');
const { json } = require('body-parser');
module.exports = async(req, res, next) => {
    //接收客户端传递过来的请求参数
    const body = req.body;
    //即将要修改的用户id
    const id = req.query.id;

    let user = await User.findOne({ _id: id });
    const isValid = user.password == req.body.password;
    //密码比对
    if (isValid) {
        //比对正确
        //将用户信息更新到数据库中,且密码不要修改
        await User.updateOne({ _id: id }, {
                username: req.body.username,
                email: req.body.email,
                role: req.body.role,
                state: req.body.state
            })
            //将页面重定向到用户列表页面
        res.redirect('/admin/user');
    } else {
        //密码比对失败
        //进行重定向
        let obj = { path: '/admin/user-edit', message: '密码比对失败', id: id }
        next(JSON.stringify(obj))
    }
}