'use strict';

var config = require('./config/app');
var express = require('express'),
    app = express();

/**
 * App
 */
app.use(express.static('./src/app'));
app.use('/assets', express.static('./src/assets'));
app.use('/components', express.static('./src/components'));

/**
 * Api
 */
app.use(express.json());
app.use(require('res-error'));
app.use('/listings', require('./api/listings'));

app.listen(config.port);
