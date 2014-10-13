(function(module, express) {
    var router = express.Router();

    router.get('/', function(req, res) {
        res.render('index', { title: 'Message Example' });
    });

    module.exports = router;
}(module, require('express')));