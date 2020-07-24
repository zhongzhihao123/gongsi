const { Article } = require('../../model/article')

module.exports = async(req, res) => {
    //标识 标识当前访问的是文章管理页面
    req.app.locals.currentLink = 'article';

    const { id } = req.query;
    //有id参数
    if (id) {
        //编辑页面
        let article = await Article.findOne({ _id: id });
        res.render('admin/article-edit.art', {
            article: article,
            button: '修改',
            link: '/admin/article-modify?id=' + id
        })


    } else {
        //添加文章页面
        res.render('admin/article-edit.art', {
            button: '提交',
            link: '/admin/article-add'
        })
    }
    // res.render('admin/article-edit.art')

}