(function (module, express, AWS, uuid, requestType) {
    module.exports = function (options) {
        AWS.config.update(options);

        var router = express.Router(),
            sns = new AWS.SNS(options);

        router.post('/message', requestType('application/json'), function (req, res) {
            if (!req.body) {
                return res.status(400).send('Missing Message');
            }

            if (!req.body.content) {
                return res.status(400).send('Missing Message Content');
            }

            if (!req.body.id) {
                req.body.id = uuid.v4();
            }

            req.body.receivedDate = new Date();
            req.body.sentDate = req.body.sentDate || req.body.receivedDate;

            var params = {
                Message: JSON.stringify(req.body, null, 4),
                TopicArn: process.env.QUEUE_ARN
            };

            sns.publish(params, function(err, data) {
                if (err) {
                    return res.status(400).send(err);
                }
                res.status(200).send(data);
            });
        });

        return router;
    };
}(module, require('express'), require('aws-sdk'), require('uuid'), require('request-type')));