//引入文章集合
const { Article } = require('../../model/article');

//导入分页模块
const pagination = require('mongoose-sex-page');


module.exports = async(req, res) => {
    //获取当前分页值
    const pagecurrent = req.query.page

    //从数据库中查询数据
    let result = await pagination(Article).find().page(pagecurrent).size(4).display(5).populate('author').exec()

    res.render('home/default.art', {
        result: result
    })
}