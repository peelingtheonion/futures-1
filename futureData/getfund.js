var fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    myasync = require('async'),
    regex1 = /Client ID:\s*\d+/,
    regex2 = /日期 Date:\s*\d+/,
    regex3 = /Balance b\/f:\s*\d+\.\d{2}/,
    regex4 = /Balance c\/f:\s*\d+\.\d{2}/,
    regex5 = /Deposit\/Withdrawal:\s*\-*\d+\.\d{2}/,
    regex6 = /Risk Degree:\s*\d+\.\d{2}%/;

var DailyFundSchema = new Schema({
    userId: {
        type: String
    }, //查询id
    tradeDate: {
        type: String
    }, //交易日期
    previousFund: {
        type: Number
    }, //上日结存
    presentFund: {
        type: Number
    }, //当日结存
    realFund: {
        type: Number
    }, //实有货币资金
    riskdegree:{
      type:String
    },
    dynamicFund: {
        type: Number
    }, //当日出入金（人民币）;
});
var DailyFund = mongoose.model('DailyFund', DailyFundSchema);

mongoose.connect('mongodb://localhost/futures');
mongoose.connection.on('open', function() {
    console.log('Mongoose connected.');
});

fs.readdir('./20161021', function(err, files) {
    myasync.map(files, saveFund, function(err, results) {
        console.log(results);
        mongoose.connection.close(function() {
            console.log('db closed');
        });
    });
});


function saveFund(file, callback) {
    fs.readFile('./20161021/' + file, 'utf-8', (err, data) => {
        if (err) throw err;

        var userId = data.match(regex1)[0].split(':')[1].trim();
        var tradeDate = data.match(regex2)[0].split(':')[1].trim();
        var dailyFund = new DailyFund({
            userId: userId,
            tradeDate: tradeDate,
            previousFund: Number(data.match(regex3)[0].split(':')[1].trim()),
            presentFund: Number(data.match(regex4)[0].split(':')[1].trim()),
            riskdegree:data.match(regex6)[0].split(':')[1].trim(),
            dynamicFund: Number(data.match(regex5)[0].split(':')[1].trim())
        });
        dailyFund.save(function(err) {
            console.log('Done');
            callback(err,'fund saved');
        });
    });
}
