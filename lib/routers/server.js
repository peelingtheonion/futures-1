
var router = require('express').Router();
app.post('/', function (req, res) {
    var Model = require('./path/to/model'),
        datatablesQuery = require('datatables-query'),
        params = req.body,
        query = datatablesQuery(Model);

    query.run(params).then(function (data) {
        res.json(data);
    }, function (err) {
        res.status(500).json(err);
    });
};
module.exports = router;
