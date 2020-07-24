//引入 formidable模块
const formidable = require('formidable');
//引入路径
const path = require('path')
const { Article } = require('../../model/article');

module.exports = async(req, res) => {
    //接收客户端参数
    const id = req.query.id;

    //创建表单解析对象
    const form = new formidable.IncomingForm();
    //配置上传文件的存放位置  存放在public的uploads目录上
    form.uploadDir = path.join(__dirname, '../', '../', 'public', 'uploads');
    //保留上传文件的后缀，默认为false要用true
    form.keepExtensions = true;
    //解析表单
    form.parse(req, async(err, fields, files) => {
        //1.err错误的对象 ，如果表单解析失败，err存错误信息，如果成功，为null
        //2.fields对象类型 保存普通表单数据
        //3. files对象类型 保存了和上传文件相关的数据
        //获取文件路径，要截取后面的字符串，这样再客户端的路径才对
        //截取public后面的路径files.cover.path.split('public')[1]
        await Article.updateOne({ _id: id }, {
                title: fields.title,
                author: fields.author,
                publishDate: fields.publishDate,
                cover: files.cover.path.split('public')[1],
                content: fields.content
            })
            //将页面重定向到文章列表页面
        res.redirect('/admin/article');

    })

}