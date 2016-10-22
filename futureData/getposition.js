var fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    myasync = require('async'),
    regex1 = /Client ID:\s*\d+/,
    regex2 = /日期 Date:\s*\d+/,
    regex3 = /Balance b\/f:\s*\d+\.\d{2}/,
    regex4 = /Balance c\/f:\s*\d+\.\d{2}/,
    regex5 = /Deposit\/Withdrawal:\s*\-*\d+\.\d{2}/;

var DailyPositionsSchema = new Schema({
    userId: {
        type: String
    }, //交易id
    tradeDate: {
        type: String
    }, //交易日期
    contract: {
        type: String
    }, //合约名
    positionType: {
        type: Boolean
    }, //true:买持仓;false:卖持仓;
    lots: {
        type: String
    }, //手数
    PriceAvg: {
        type: String
    }, //平均价格
    settlementYesterday: {
        type: Number
    }, //昨日结算价
    settlementToday: {
        type: Number
    } //今日结算价
});
var DailyPositions = mongoose.model('DailyPosition', DailyPositionsSchema);

mongoose.connect('mongodb://localhost/futures');
mongoose.connection.on('open', function() {
    console.log('Mongoose connected.');
});


fs.readdir('./20161021', function(err, files) {
    myasync.map(files, savePositions, function(err, results) {
        console.log(results);
        mongoose.connection.close(function() {
            console.log('db closed');
        });
    });
});

function savePositions(file, callback) {
    fs.readFile('./20161021/' + file, 'utf-8', (err, data) => {
        if (err) throw err;
        console.log(data);
        var userId = data.match(regex1)[0].split(':')[1].trim();
        var tradeDate = data.match(regex2)[0].split(':')[1].trim();
        var temp = data.match('持仓汇总 Positions');
        if (temp !== null) {
            var begin = temp.index;
            var subdata = data.substring(begin);
            var regex = /[A-Za-z]+\d+\s+\|\s+\d+\|\s+\d+\.\d{3}\|\s+\d+\|\s+\d+\.\d{3}\|\s+\d+\.\d{3}\|\s+\d+\.\d{3}/g;
            var positions = subdata.match(regex);
            myasync.map(positions,savePosition,function(err,results){
              console.log(results);
              callback(err,results);
            });
            function savePosition(position,echo){
                var temp = position.replace(/\s+/g, '').split('|');
                if (temp[1] === '0') {
                    var dailyPositions = new DailyPositions({
                        userId: userId,
                        tradeDate: tradeDate,
                        contract: temp[0],
                        positionType: false,
                        lots: Number(temp[3]),
                        priceAvg: Number(temp[4]),
                        settlementYesterday: Number(temp[5]),
                        settlementToday: Number(temp[6])
                    });

                } else {
                    var dailyPositions = new DailyPositions({
                        userId: userId,
                        tradeDate: tradeDate,
                        contract: temp[0],
                        positionType: true,
                        lots: Number(temp[1]),
                        priceAvg: Number(temp[2]),
                        settlementYesterday: Number(temp[5]),
                        settlementToday: Number(temp[6])
                    });
                }
                dailyPositions.save(function(err) {
                    console.log('Done');
                    echo(err,'positions saved');
                });
            }
        }
    });
}
