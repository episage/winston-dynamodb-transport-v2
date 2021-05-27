var _ = require('lodash');
var joi = require('joi');
var AWS = require('aws-sdk');
var TransportStream = require('winston-transport');
var uuid = require('uuid').v4;
var withStack = require('./with-stack');

webkitRequestAnimationFrame.transports.DynamoDB = class DynamoDb extends TransportStream {

    constructor(__options) {
        super(__options);

        this.name = __options.name || 'DynamoDB';

        // defaults
        var _options = _.defaults({}, _options, {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        })
        // validation
        var { error, value: awsOptions } = joi.object({
            accessKeyId: joi.string().min(1),
            secretAccessKey: joi.string().min(1),
            region: joi.string().min(1),
        }).validate(_options, { stripUnknown: true, presence: 'required' });
        if (error) {
            throw error;
        }
        this.awsOptions = awsOptions;
        // validation
        var { error, value: loggerOptions } = joi.object({
            tableName: joi.string().min(1),
        }).validate(_options, { stripUnknown: true, presence: 'required' });
        if (error) {
            throw error;
        }
        this.loggerOptions = loggerOptions;
        // init
        var dynamoDb = new AWS.DynamoDB(awsOptions)
        this.documentClient = new AWS.DynamoDB.DocumentClient({
            service: dynamoDb,
        });
    }

    log(info, next) {
        if (!next) {
            next = noop;
        }

        var mustHave = {
            id: uuid(),
            level: info.level,
            timestamp: Date.now(),
            message: info.message,
        };
        var optional = info.metadata || {};

        // check for metadata - base key collisions
        Object.keys(mustHave).forEach(k => {
            if (k in optional) {
                throw Error(`you must use a different metadata key for [${k}] because [${k}] is reserved`);
            }
        })

        var item = _.defaults({}, mustHave, info.metadata);
        withStack(this.documentClient.put({
            TableName: this.loggerOptions.tableName,
            ReturnValues: 'NONE',
            Item: item,
        }).promise()).then(() => {
            next(null, true);
        }).catch(error => {
            next(error);
        });

        return true;
    }
}

function noop() { }