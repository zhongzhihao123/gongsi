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
const Article = mongoose.model('Article');


//导出
module.exports = {
    Article
}
```

