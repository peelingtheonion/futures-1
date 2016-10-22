var app = require('express')(),
    path = require('path'),
    conf = require('./lib/config'),
    wechat = require('./lib/wechat'),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended:true
}

));

wechat(conf.wechat);

wechat.createMenu(require('./lib/menu.json'));

app.use('/wxapi', require('./lib/routers/wxapi.js'));
app.use('/pages', require('./lib/routers/pages.js'));

app.set('views', path.join(__dirname, 'lib/views'));
// 设置模版引擎
app.set('view engine', 'ejs');

app.listen(8101,function(err){
  console.log('listening at 8101...')
});
