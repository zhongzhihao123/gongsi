const { model } = require("mongoose");

const { User } = require('../../model/user')

module.exports = async(req, res) => {
    //获取要删除用户的id并根据用户id进行删除
    await User.findByIdAndDelete({ _id: req.query.id });

    //将页面重定向到用户列表页面
    res.redirect('/admin/user')

}