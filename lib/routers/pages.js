var router = require('express').Router();

router.route('/one')
    .get(function(req, res, next) {

        res.render('one');
    });

router.route('/two')
    .get(function(req, res, next) {

        res.render('two');
        });

module.exports = router;
