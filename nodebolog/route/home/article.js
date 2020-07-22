const { Article } = require('../../model/article')

module.exports = async(req, res) => {
    //接收客户传过来的文章id值
    const id = req.query.id;
    //根据id查询文章详细信息
    let article = await Article.findOne({ _id: id }).populate('author')
    res.render('./home/article', {
        article: article
    })
}