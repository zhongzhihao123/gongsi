module.exports = (req,res) => {
    //获取地址栏的信息
    const {message} =req.query;
    
    res.render('admin/user-edit',{
        message:message
    })
}