# Improved DynamoDB Transport for Winston

A DynamoDB transport for [winston][0].

## Usage
```javascript
  var winston = require('winston');
  
  require('winston-dynamodb-transport-v2').DynamoDB;
  
  winston.add(winston.transports.DynamoDB, options);
```

## Options

```
accessKeyId     : your AWS access key id
secretAccessKey : your AWS secret access key
region          : the region where the domain is hosted
tableName       : DynamoDB table name
```

## Prerequisite

Make a table with `tableName`

The table schema depends on how you intend to use it.

#### Simplest

The table should have

- hash key: (String) id
- range key: (String) timestamp

> Note: Timestamp has a millisecond resolution. It is nice to have it as a range key for queries.

## Installation

``` bash
  $ npm install winston
  $ npm install winston-dynamodb-transport-v2
```
