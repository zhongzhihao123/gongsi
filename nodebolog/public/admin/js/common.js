
        //获取表单数据且转化为JSON
        function serializeToJson(form){
            var f = form.serializeArray();
            var result = {};
            f.foreach(function(item){
                result[item.name] = item.value;
            });
            return result;
        }