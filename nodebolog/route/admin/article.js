//引入文章集合
const { Article } = require('../../model/article');

//引入数据分页插件
const pagination = require('mongoose-sex-page');


module.exports = async(req, res) => {
    //客户端传递过来的页数
    const pagecurrent = req.query.page;
    //标识 标识当前访问的是文章管理页面
    req.app.locals.currentLink = 'article';

    // page 指定当前页
    // suze 指定每页显示的数据条数
    // display 指定客户端要显示的页码数量  不是规定只有几页，而是显示几页
    // exec 向数据库中发送查询请求
    //查询所有文章数据
    //populate('author')这个是查询author属性的更详细信息，就是多级查询
    let articles = await pagination(Article).find().page(pagecurrent).size(2).display(2).populate('author').exec();
    // res.send(articles)

    //渲染文章列表页面模板
    res.render('admin/article.art', {
        articles: articles
    })

}