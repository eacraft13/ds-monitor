'use strict';

var config = require('./config/app');
var express = require('express'),
    app = express();

app.use(express.static('./src/app'));
app.use('/assets', express.static('./src/assets'));
app.use('/components', express.static('./src/components'));

app.listen(config.port);
