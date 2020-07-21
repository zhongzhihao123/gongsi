const Joi = require('joi');


//定义验证规则
const schema = {
    username:Joi.string().min(2).max(5).error(new Error('用户信息没有通过'))
};



async function run() {
    try {
        //实施验证
    Joi.validate({username:'ab'},schema)
    }catch(ex) {
        //验证不通过
        //ex.message表示报错信息
        console.log(ex.message);
        return;
    }
    console.log('验证不通过')
}

run()