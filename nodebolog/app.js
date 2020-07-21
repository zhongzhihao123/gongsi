//引用epxress框架
const express = require('express');
//处理路径
const path = require('path');
//引入body-parser模块 用来处理post请求参数
const bodyPaser = require('body-parser');

//导入express-session模块
const session = require('express-session')

//创建网站服务器
const app = express();

//引入数据库连接
require('./model/connect');
// require('./model/user')

//处理Post请求参数
app.use(bodyPaser.urlencoded({ extended: false }));
//配置session
app.use(session({ secret: 'secret key' }));

//告诉express模板框架是什么
app.set('views', path.join(__dirname, 'views'));
//告诉express框架模板的默认后缀是什么
app.set('view engine', 'art');
//当渲染后缀为art的模板时，所使用的模板引擎是什么
app.engine('art', require('express-art-template'));

//处理静态资源
app.use(express.static(path.join(__dirname, 'public')))




//引入路由模块
const home = require('./route/home')
const admin = require('./route/admin');
const bodyParser = require('body-parser');
const { nextTick } = require('process');

//  中间件 拦截请求 判断用户登录状态
app.use('/admin', require('./middleware/localGuard'))


//为路由匹配请求路径
app.use('/home', home)
app.use('/admin', admin)

//中间件  进行重定向
app.use((err, req, res, next) => {
    //将字符串对象转换为对象类型 
    //JSON.parse()
    const result = JSON.parse(err);
    // let obj = { path: '/admin/user-edit', message: '密码比对失败', id: id }
    let params = [];
    for (let attr in result) {
        if (attr != path) {
            params.push(attr + '=' + result[attr]);
        }
    }
    res.redirect(`${result.path}?${params.join('&')}`);
    // /admin/user-edit&message=密码比对失败&id=5f1654cc59945d27b83b9aaa
})

//监听端口
app.listen(80); //写80端口，你不写的话浏览器自动帮你写，其他端口不行
console.log('网站服务器启动成功，请访问localhost')