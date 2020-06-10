/**
 * See index.js for routing to this point.
 */
var express = require('express');
var router = express.Router();

var fs = require('fs');
const { runInNewContext } = require('vm');
const { config } = require('process');
var uuid = require('uuid').v4;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Authentication', name: module.filename });
});

module.exports = router;