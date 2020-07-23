`git 创建新分支`

`git branch  分支名称`

`git checkout 分支名称`

`推送到远程`

`git push origin 分支名称`

`本地分支管理到远程  才可以Push`

`git push --set-upstream origin 分支名称`  





## 把用户信息到渲染用户列表

在userPage.js文件

```
//导入用户集合构造函数
const { User } = require('../../module/user');

//将用户信息从数据库从查找出来
    let users =  await User.find({})
    //渲染用户列表
    res.render('admin/user',{
        users:users
    });
```

修改use.art文件  **不能用//注释**

```
<tbody>
                    {{each users}}
                    <tr>
                        <td>{{@$value._id}}</td>
                        <td>{{$value.username}}</td>
                        <td>{{$value.email}}</td>
                        <td>{{$value.role == 'admin' ? '超级管理员': '普通用户'}}</td>
                        <td>{{$value.state == 0 ? '启用': '禁用'}}</td>
                        <td>
                            <a href="/admin/user-edit?id={{@$value._id}}" class="glyphicon glyphicon-edit"></a>
                            <i class="glyphicon glyphicon-remove delete" data-toggle="modal" data-target=".confirm-modal" data-id="{{@$value._id}}"></i>
                        </td>
                    </tr>
                    {{/each}}
```

## 数据分页

分页功能核心要素：

当前页，用户通过点击上一页或者下一页或者页码产生，客户端通过get参数方式传递到服务器端
总页数，根据总页数判断当前页是否为最后一页，根据判断结果做响应操作

总页数：Math.ceil（总数据条数 / 每页显示数据条数）

```
limit(2) // limit 限制查询数量  传入每页显示的数据数量
skip(1) // skip 跳过多少条数据  传入显示数据的开始位置
数据开始查询位置=（当前页-1）* 每页显示的数据条数

```

```
 //接收客户端传递过来的当前页数
    let page = req.query.page
        //每一页的显示数
    let pagesize = 10;
    //查询用户数据的总数
    let count = await User.countDocuments({});
    //总页数
    let total = Math.ceil(count / pagesize);
    //页码对应的数据查询开始位置
    let start = (page - 1) * pagesize
    //将信息从数据库中查询出来
    let users = await User.find({}).limit(pagesize).skip(start)


 res.render('admin/user', {
        users: users,
        page: page,
        total: total
    });
```

## 用户信息修改

将要修改的用户ID传递到服务器端
2. 建立用户信息修改功能对应的路由
3. 接收客户端表单传递过来的请求参数 
4. 根据id查询用户信息，并将客户端传递过来的密码和数据库中的密码进行比对
5. 如果比对失败，对客户端做出响应

6. 如果密码对比成功，将用户信息更新到数据库中

在user.art中编辑的链接更改,要获取修改的id

```
<a href="/admin/user-edit?id={{@$value._id}}" class="glyphicon glyphicon-edit"></a>
```

在user-edit来判断是不是添加还是编辑操作  还有修改按钮以及要不要显示id和跳的链接地址

```javascript
module.exports = async(req, res) => {
    //获取地址栏的信息  和获取地址栏的id参数
    const { message, id } = req.query;

    //如果当前传递了id参数
    if (id) {
        //修改编辑操作
        let user = await User.findOne({ _id: id });

        //渲染用户编辑页面
        res.render('admin/user-edit', {
            message: message,
            user: user,
            link: '/admin/user-modify?id='+id,
            button: '修改'
        })
    } else {
        //添加操作
        res.render('admin/user-edit', {
            message: message,
            link: '/admin/user-edit',
            button: '添加'
        })
    }


}

```

在user-edit.art页面修改

```html
   <div class="form-group">
                    <label>用户名</label>
                    <input name="username" type="text" class="form-control" placeholder="请输入用户名" value="{{user && user.username}}">
                </div>
                <div class="form-group">
                    <label>邮箱</label>
                    <input type="email" class="form-control" placeholder="请输入邮箱地址" name="email" value="{{user && user.email}}">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" class="form-control" placeholder="请输入密码" name="password">
                </div>
                <div class="form-group">
                    <label>角色</label>
                    <select class="form-control" name="role">
                        <option value="normal" {{user && user.role == 'normal' ? 'selected' : ''}}>普通用户</option>
                        <option value="admin" {{user && user.role == 'admin' ? 'selected' : ''}}>超级管理员</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <select class="form-control" name="state">
                        <option value="0" {{user && user.state == '0' ? 'selected' : ''}}>启用</option>
                        <option value="1" {{user && user.state == '1' ? 'selected' : ''}}>禁用</option>
                    </select>
```



在user-edit-fn文件中 修改是否要显示id标题

```
<h4 style="display: {{button == '修改' ? 'block' : 'none'}}">{{@user && user._id}}</h4>
```

##### 创建user-modify.js文件用于修改

在admin.js文件中

```
//创建用户编辑功能
admin.post('/user-modify', require('./admin/user-modify'));
```

在user-modify.js文件中

```javascript
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
```

由于密码比对失败需要用到中间件，由于需要id参数所以还需要对重定向进行优化

```
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
```



​	

## 用户信息修改

1. 将要修改的用户ID传递到服务器端

2. 建立用户信息修改功能对应的路由
3. 接收客户端表单传递过来的请求参数 
4. 根据id查询用户信息，并将客户端传递过来的密码和数据库中的密码进行比对
5. 如果比对失败，对客户端做出响应

6. 如果密码对比成功，将用户信息更新到数据库中

先在user.art页面中

把弹出框加入一个隐藏域，为了在提交的时候找到这个表单的id

```javascript
<p>您确定要删除这个用户吗?</p>
                    <input type="hidden" name="id" id="deleteUserId">
                    
```

找到删除按钮，自定义属性data-id 并设置点击操作来获取id

```javascript
{{block 'script'}}
    <script type="text/javascript">
        $('.delete').on('click', function () {
            // 获取用户id
            var id = $(this).attr('data-id');
            // 将要删除的用户id存储在隐藏域中
            $('#deleteUserId').val(id);
        })
    </script>
{{/block}}
```



```javascript
<a href="/admin/user-edit?id={{@$value._id}}" class="glyphicon glyphicon-edit"></a>
                            <i class="glyphicon glyphicon-remove delete" data-toggle="modal" data-target=".confirm-modal" data-id="{{@$value._id}}"></i>
```



修改删改操作弹出框的提交的表单地址  为"/admin/delete"

```javascript
<form class="modal-content" action="/admin/delete" method="get">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                    <h4 class="modal-title">请确认</h4>
                </div>
                <div class="modal-body">
                    <p>您确定要删除这个用户吗?</p>
                    <input type="hidden" name="id" id="deleteUserId">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                    <input type="submit" class="btn btn-primary">
                </div>
            </form>
```

创建user-delete.js文件并记得在admin.js文件导入

```
//删除用户功能
admin.get('/delete', require('./admin/user-delete'));
```

创建user-delete.js文件

```
const { model } = require("mongoose");

const { User } = require('../../model/user')

module.exports = async(req, res) => {
    //获取要删除用户的id并根据用户id进行删除
    await User.findByIdAndDelete({ _id: req.query.id });

    //将页面重定向到用户列表页面
    res.redirect('/admin/user')

}
```

## 文章页面路由

在admin.js文件加入

```
//文章列表页面路由
admin.get('/article', require('./admin/article'));
//文章编辑页面路由
admin.get('/article-edit', require('./admin/article-edit'));
```

创建article.js 和article-edit.js文件

#### 要让点击用户管理或者文章管理页面高亮

在user-edit.js文件 userPage.js article.js article-edit.js文件两个分别加入

```
//标识 标识当前访问的是用户管理页面
    req.app.locals.currentLink = 'user';
```



```
//标识 标识当前访问的是文章管理页面
    req.app.locals.currentLink = 'article';
```

在aside.art修改active

```
  <a class="item {{currentLink == 'user' ? 'active' : ''}}" href="/admin/user">
				<span class="glyphicon glyphicon-user"></span>
				用户管理
			</a>
        </li>
        <li>
            <a class="item {{currentLink == 'article' ? 'active' : ''}}" href="/admin/article">
	  			<span class="glyphicon glyphicon-th-list"></span>
	  			文章管理
	  		</a>
```

### 创建文章数据库

```
//引入mongoose
const mongoose = require('mongoose')
    //创建文章集合规则
const articleSchema = new mongoose.Schema({
        title: {
            type: String,
            maxlength: 20,
            minlength: 4,
            require: [true, '请填写文章标题']
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '请填写作者']
        },
        publishDate: {
            type: Date,
            default: Date.now
        },
        cover: {
            type: String,
            default: null
        },
        content: {
            type: String
        }
    })
    //根据规则创建集合
const Article = mongoose.model('Article'，articleSchema);


//导出
module.exports = {
    Article
}
```

### 发布文章功能

修改article.js

```
<a href="/admin/article-edit" class="btn btn-primary new">发布新文章</a>
```

修改article-edit.art关于表单的提交方式还有数据

```javascript
  <form class="form-container" action="/admin/article-add" method="post" enctype="multipart/form-data">
                <div class="form-group">
                    <label>标题</label>
                    <input type="text" class="form-control" placeholder="请输入文章标题" name="title">
                </div>
                <div class="form-group">
                    <label>作者</label>
                    <input name="author" type="text" class="form-control" readonly value="{{@userInfo._id}}">
                </div>
                <div class="form-group">
                    <label>发布时间</label>
                    <input name="publishDate" type="date" class="form-control">
                </div>
                
                <div class="form-group">
                   <label for="exampleInputFile">文章封面</label>
                   <!--
                        multiple 允许用户一次性选择多个文件
                   -->
                   <input type="file" name="cover" id="file" >
                   <div class="thumbnail-waper">
                       <img class="img-thumbnail" src="" id="preview">
                   </div>
                </div>
                <div class="form-group">
                    <label>内容</label>
                    <textarea name="content" class="form-control" id="editor"></textarea>
                </div>
```



创建点击发布文章的js文件  article-add.js并在admin导入路由 还有创建文章功能

```
//点击发布文章功能
admin.get('article-add', require('./admin/article-add'))
// 实现文章添加功能的路由
admin.post('/article-add', require('./admin/article-add'))
```

### 项目包含的知识点

#### formidable

 **npm install formidable**

**作用：解析表单，支持get请求参数，post请求参数、文件上传。**

```javascript
/ 引入formidable模块
 const formidable = require('formidable');
 // 创建表单解析对象
 const form = new formidable.IncomingForm();
 // 设置文件上传路径
 form.uploadDir = "/my/dir";
 // 是否保留表单上传文件的扩展名
 form.keepExtensions = false;
 // 对表单进行解析
 form.parse(req, (err, fields, files) => {
     // fields 存储普通请求参数
         // files 存储上传的文件信息
 });

```

在article-add.js文件中

```
//引入 formidable模块
const formidable = require('formidable');
//引入路径
const path = require('path')

module.exports = (req, res) => {
    //创建表单解析对象
    const form = new formidable.IncomingForm();
    //配置上传文件的存放位置  存放在public的uploads目录上
    form.uploadDir = path.join(__dirname, '../', '../', 'public', 'uploads');
    //保留上传文件的后缀，默认为false要用true
    form.keepExtensions = true;
    //解析表单
    form.parse(req, (err, fields, files) => {
        //1.err错误的对象 ，如果表单解析失败，err存错误信息，如果成功，为null
        //2.fields对象类型 保存普通表单数据
        //3. files对象类型 保存了和上传文件相关的数据
        res.send(files)
    })
}
```

要想发布文章的作者自动填入该用户的id则在form表单的author加入默认值

```
<label>作者</label>
                    <input name="author" type="text" class="form-control" readonly value="{{@userInfo._id}}">
```

### 读取表单的文件并渲染到页面上

#### 

```javascript
var reader = new FileReader();
//读取文件，读的是二进制，由于不能异步所以需要监听
 reader.readAsDataURL('文件');
//监听
 reader.onload = function () {
     console.log(reader.result); 
 }

```

在article-edit.art上 读取功能

```javascript
        
        // 选择文件上传控件
        var file = document.querySelector('#file');
        var preview = document.querySelector('#preview');
        // 当用户选择完文件以后
        file.onchange = function () {
            // 1 创建文件读取对象
            var reader = new FileReader();
            // 用户选择的文件列表
            // console.log(this.files[0])
            // 2 读取文件
            reader.readAsDataURL(this.files[0]);
            // 3 监听onload事件
            reader.onload = function () {
            //reader.result 读到的是二进制，可以让在那个src上
                console.log(reader.result)
                // 将文件读取的结果显示在页面中
                preview.src = reader.result;
            }
        }
```

**如果想读取多个文件,在表单加入 multiple**

### 将文章渲染到文章列表

在article.js文件中

```
//引入文章集合
const { Article } = require('../../model/article');


module.exports = async(req, res) => {
    //标识 标识当前访问的是文章管理页面
    req.app.locals.currentLink = 'article';
    //查询所有文章数据
    //populate('author')这个是查询author属性的更详细信息，就是多级查询
    let articles = await Article.find().populate('author')

    //渲染文章列表页面模板
    res.render('admin/article.art', {
        articles: articles
    })

}
```

并在article.art中循环

```javascript
     {{each articles}}
                    <tr>
                        <td>{{@$value._id}}</td>
                        <td>{{$value.title}}</td>
                        <!--引入dateFormate日期格式化变量，第一个参数就是需要格式的值，第二个表示需要格式成什么样子-->
                        <td>{{dateFormate($value.publishDate,'yyyy-mm-dd')}}</td>
                        <td>{{$value.author.username}}</td>
                        <td>
                            <a href="article-edit" class="glyphicon glyphicon-edit"></a>
                            <i class="glyphicon glyphicon-remove" data-toggle="modal" data-target=".confirm-modal"></i>
                        </td>
                    </tr>
                  {{/each}}
```







#### 时间格式化

npm install dateformat

在app.js全局导入

```
//导入art-template模块
const template = require('art-template');
//导入dateFormat第三方模块  在app.js文件导入时为了全局都可以用这个时间格式
const dateFormat = require('dateformat')

//向模板内部导入dateformat变量
template.defaults.imports.dateFormat = dateFormat
```

在article-art上

```
<!--引入dateFormat日期格式化变量，第一个参数就是需要格式的值，第二个表示需要格式成什么样子-->
                        <td>{{dateFormat($value.publishDate,'yyyy-mm-dd')}}</td>
```

### 数据分页 mongoose-sex-page

**npm install mongoose-sex-page**

```
const pagination = require('mongoose-sex-page');
pagination(集合构造函数).page(1) .size(20) .display(8) .exec()
```

exec向数据库发送请求得到的

```javascript
"page": 1,//当前页
"size": 2,//每页显示数据条数
"total": 5,//总共的数据条数
"records": [//查询出来的具体数据
{
"cover": "\\uploads\\upload_cb428217340991ae8e5ebd6fb62488e9.jpg",
"_id": "5f17ad9b395b2e2654357fab",
"title": "测试",
"author": {
"state": 0,
"_id": "5f1654cc59945d27b83b9aab",
"username": "zhongzhihao",
"email": "514974922@qq.com",
"password": "123456",
"role": "admin",
"__v": 0
},
"publishDate": "2020-07-26T00:00:00.000Z",
"content": "<p>ces fg</p>",
"__v": 0
},
{
"cover": "\\uploads\\upload_6f20bff4ebbaa313afa291650c7faa28.jpg",
"_id": "5f17af32395b2e2654357fac",
"title": "gfdg'f'd",
"author": {
"state": 0,
"_id": "5f1654cc59945d27b83b9aab",
"username": "zhongzhihao",
"email": "514974922@qq.com",
"password": "123456",
"role": "admin",
"__v": 0
},
"publishDate": "2020-07-25T00:00:00.000Z",
"content": "<p>dsfdsafs</p>",
"__v": 0
}
],
"pages": 3,//总共的页数
"display": [//客户端显示的页码
1,
2,
3
]
```

修改article.js文件

```
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


    let articles = await pagination(Article).find().page(pagecurrent).size(2).display(3).populate('author').exec();


    //渲染文章列表页面模板
    res.render('admin/article.art', {
        articles: articles
    })

}
```

修改article.art文件，并修改form接收到的值

把

```
{{each articles}}改为{{each articles.records}}  //表示数据
```



```
<ul class="pagination">
                {{if articles.page > 1}}
                <li>
                    <a href="/admin/article?page={{articles.page - 1}}">
                    <span>&laquo;</span>
                  </a>
                </li>
                {{/if}}
                
                {{each articles.display}}
                <li><a href="/admin/article?page={{$value}}">{{$value}}</a></li>
                {{/each}}

                {{if articles.page < articles.pages}}
                <li>
                    <a href="/admin/article?page={{articles.page - 0 + 1}}">
    		        <span>&raquo;</span>
    		      </a>
                </li>
                {{/if}}
            </ul>
```

### mongoDB数据库添加账号

这样别人才不可以随便登录进去这个数据库进行管理

以系统管理员的方式运行powershell
2. 连接数据库 mongo

3. 查看数据库 show dbs

4. 切换到admin数据库 use admin    创建账号mongoDB要求我们先创建超级管理员账号

5. 创建超级管理员账户 db.createUser()

     `db.createUser({user:'root',pwd:'root',roles:['root']})`

6. 切换到blog数据 use blog

7. 创建普通账号 db.createUser()

     db.createUser({user:'itcast',pwd:'itcast',roles:['readWrite']})

8. 卸载mongodb服务
         1. 停止服务 net stop mongodb
             2. mongod --remove

9. 创建mongodb服务
             mongod --logpath="C:\Program Files\MongoDB\Server\4.1\log\mongod.log" --dbpath="C:\Program\Files\MongoDB\Server\4.1\data" --install –-auth

   10. 启动mongodb服务 net start mongodb

   11. 在项目中使用账号连接数据库
       
       user表示数据库用户名  pass表示密码  port端口号（27017）  database数据库名称
       
       ​      mongoose.connect('mongodb://user:pass@localhost:port/database')

### 博客首页显示页面

在Home.js文件

```

//博客前台首页的展示页面
home.get('/', require('./home/index'));

//博客前台文章详情展示页面
home.get('/article', require('./home/article'));

```

在home目录下创建index.js还有article.js  

复制公共文件public下的index.html 和default.html到view/home下并修改后缀为art，修改样式

防止在客户端的css样式不对

```
	<link rel="stylesheet" href="/home/css/base.css">
	<link rel="stylesheet" href="/home/css/article.css">
```

### 把用户的文章渲染到首页页面上



```
//引入文章集合
const { Article } = require('../../model/article');

//导入分页模块
const pagination = require('mongoose-sex-page');


module.exports = async(req, res) => {
    //从数据库中查询数据
    let result = await pagination(Article).find().page(1).size(4).display(5).populate('author').exec()

    res.render('home/default.art', {
        result: result
    })
}
```

修改default.art

```
{{each result.records}}
		<li class="{{$index%2 == 0? 'fl' :'fr'}}">
			<a href="article.html" class="thumbnail">
				<img src="{{$value.cover}}">
			</a>
			<div class="content">
				<a class="article-title" href="article.html">{{$value.title}}</a>
				<div class="article-info">
					<span class="author">{{$value.author.username}}</span>
					<span>{{dateFormat($value.publishDate,'yyyy-mm-dd')}}</span>
				</div>
				<div class="brief">
					{{$value.content}}
				</div>
			</div>
		</li>
	{{/each}}
```

#### 内容截取部分且去除html标签以及空格

```
{{@$value.content.replace(/<[^>]+>/g,'').substr(0,150)+'...'}}
//@去除&nbsp空格 正则匹配html标签
```

### 分页问题

```
	<!-- 分页开始 -->
	<div class="page w1100">
	{{if result.page>1}}
		<a href="/home/?page={{result.page-1}}">上一页</a>
	{{/if}}	
		{{each result.display}}
		<a href="/home/?page={{$value}}" class='{{$value == result.page ? 'active' : ''}}'>{{value}}</a>
		{{/each}}
	{{if result.page<1}}
		<a href="#">下一页</a>
	{{/if}}
	</div>
```

### 渲染文章详情页面

修改article.art中a的链接地址

`/home/article?id={{@$value._id}}`

### 文章评论

1. 创建评论集合
2. 判断用户是否登录，如果用户登录，再允许用户提交评论表单
3. 在服务器创建文章评论功能对应的路由
4. 在路由请求处理函数中接收客户端传递过来的评论信息
5. 将评论信息存储在评论集合中
6. 将页面重定向回文章详情页面
7. 在文章详情页面路由中获取文章评论信息并展示在页面中

创建评论数据库comment.js

```
//引入mongoose模块
const mongoose = require('mongoose');
//创建评论集合规则
const commentSchema = new mongoose.Schema({
        //文章id
        aid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        },
        //评论人用户id
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        //评论时间
        time: {
            type: Date
        },
        //评论内容
        content: {
            type: String
        }
    })
    //创建评论集合
const Comment = mongoose.model('Comment', commentSchema)

module.exports = {
    Comment: Comment
}
```

#### 判断用户是不是超级管理员还是普通用户而且能不能进入用户管理页面

在login.js文件中

```
      //将用户名角色存储到请求对象中
            req.session.role = user.role
  
  //对用户的角色进行判断
            if (user.role == 'admin') {
                //重定向到用户列表页面
                res.redirect('/admin/user');
            } else {
                //重定向到博客首页
                res.redirect('/home/');
            }
```

在localGuard.js文件中

```
//用户是登陆的，将请求放行 继续判断角色身份
        if (req.session.role == 'normal') {
            //普通用户
            //让它跳转到博客首页，阻止程序向下执行
            return res.redirect('/home/')
        }
        next(); //请求继续放行
```

#### 判断是不是登录，登录可以评论，没登录不可以评论

因为登录信息存储在login.js的userInfo中，则判断这个是否存在就好

在article.art中

```
<h4>评论</h4>
					{{if userInfo}}
					<form class="comment-form">
						<textarea class="comment"></textarea>
						<div class="items">
							<input type="submit" value="提交">
						</div>
					</form>
					{{else}}
					<div> 请登录再评论</div>
					{{/if}}
```

如果退出登录也不能评论，则在退出需要删除信息 在logout.js文件

```
req.app.locals.userInfo = null
```



获取评论的内容还需要加入2个隐藏域

```javascript
<form class="comment-form" action='/home/comment' method='post'>
<textarea class="comment"  name='content' ></textarea>
						<input type='hidden' name='uid' value={{@userInfo._id}}>//判断时哪个用户
						<input type='hidden' name='aid' value={{@article._id}}>//哪篇文章
						<div class="items">
							<input type="submit" value="提交">
                         </div>
</form>
```

在home.js文件

//f发表博客评论功能

`home.post('/comment', require('./home/comment'))`

在home目录下创建comment.js文件

```
//将评论集合构造函数进行导入
const { Comment } = require('../../model/comment')

module.exports = async(req, res) => {
    //接收客户端传递过来的请求参数
    const { content, uid, aid } = req.body;
    //将评论信息存储到评论集合中
    await Comment.create({
            content: content,
            uid: uid,
            aid: aid,
            time: new Date()
        })
        //将 页面重定向回文章详情页面
    res.redirect('/home/article?id=' + aid)
}
```

#### 将评论内容展示到页面



在article.js文件

```
const { Article } = require('../../model/article')

//导入评论集合构造函数
const { Comment } = require('../../model/comment')

module.exports = async(req, res) => {
    //接收客户传过来的文章id值
    const id = req.query.id;
    //根据id查询文章详细信息
    let article = await Article.findOne({ _id: id }).populate('author')

    //查询当前文章的评论信息
    let comments = await Comment.find({ aid: id }).populate('uid')



    res.render('./home/article', {
        article: article,
        comments: comments
    })
}
```

在article.art循环评论内容

```
{{each comments}}
						<div class="mb10">
							<div class="article-info">
								<span class="author">{{$value.uid.author}}</span>
								<span>{{dateFormat($value.time,'yyyy-mm-dd')}}</span>
								<span>{{$value.uid.email}}</span>
							</div>
							<div class="comment-content">
								{{$value.content}}
							</div>
						</div>
					{{/each}}	
```

