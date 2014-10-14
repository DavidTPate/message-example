(function (module, express, AWS, uuid, requestType) {
    module.exports = function (options) {
        AWS.config.update(options);

        var router = express.Router(),
            sns = new AWS.SNS(options),
            dynamodb = new AWS.DynamoDB();

        router.get('/messages', function (req, res) {
            var params = {
                TableName: process.env.DYNAMO_TABLE,
                Limit: 10,
                Select: 'ALL_ATTRIBUTES'
            };

            if (req.query.since) {
                params.ScanFilter = {
                    receivedDate: {
                        ComparisonOperator: 'GE',
                        AttributeValueList: [
                            {
                                S: req.query.since
                            }
                        ]
                    }
                };
            }
            dynamodb.scan(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    return res.status(400).send('Failed to save message ' + err);
                }
                res.status(200).send(fromDynamoResponse(data));
            });
        });

        router.post('/messages', requestType('application/json'), function (req, res) {
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
                TopicArn: process.env.TOPIC_ARN
            };

            sns.publish(params, function (err, data) {
                if (err) {
                    return res.status(400).send(err);
                }
                res.status(200).send(data);
            });
        });

        /**
         * Converts items from a dynamo dialect field back into javascript object notation
         * * Example: {"name":{'S':"jhorlin}} wold be converted to {name:"jhorlin"}
         * @param field
         * @param typeMap
         * @returns {*}
         */
        function objectType(field, typeMap) {
            var fieldType = Object.keys(field)[0],
                ret;
            switch (fieldType) {
                case 'B':
                    ret = bufferToJSON(field[fieldType]);
                    break;
                case 'BS':
                    ret = field[fieldType].map(bufferToJSON);
                    break;
                case 'N':
                    ret = parseFloat(field[fieldType]);
                    break;
                case 'NS':
                    ret = field[fieldType].map(parseFloat);
                    break;
                case 'S':
                case 'SS':
                    ret = field[fieldType];
                    break;
                default :
                    throw new Error('invalid dynamo type:' + fieldType);
            }
            if (typeMap) {
                ret = ret instanceof Array ? ret.map(typeMap) : typeMap(ret);
            }

            return ret;
        }

        /**
         * Converts items from dialect object notation back into javascript object notation
         * @param item
         * @param map
         * @returns {{}}
         */
        function fromDynamoResponse(data) {
            var response = [],
                temp;

            data.Items.forEach(function (item) {
                temp = {};
                Object.keys(item).forEach(function (key) {
                    temp[key] = objectType(item[key]);
                });
                response.push(temp);
            });

            return response;
        }

        /**
         * Coverts a buffer back into json
         * @param item
         * @returns {Object|string|*}
         */
        function bufferToJSON(item) {
            return (new Buffer(item)).toJSON();
        }

        return router;
    };
}(module, require('express'), require('aws-sdk'), require('uuid'), require('request-type')));