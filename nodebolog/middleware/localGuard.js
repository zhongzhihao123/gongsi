const guard = (req,res,next)=>{
    //判断用户访问的是否是登录界面
    //判断用户的登陆状态
    //判断用户是登陆的，将请求放行
    //如果不是登陆的，将重定向到登陆界面
    if(req.url != '/login' && !req.session.username) {
        res.redirect('/admin/login');
    } else {
        //用户是登陆的，将请求放行
        next();//请求继续放行
    }
}
module.exports = guard;