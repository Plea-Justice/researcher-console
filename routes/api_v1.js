var express = require('express');
var router = express.Router();

var fs = require('fs');
const { runInNewContext } = require('vm');
const { config } = require('process');
var uuid = require('uuid').v4;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Applicable documentation at https://expressjs.com/en/guide/routing.html.

/**
 * Get the list of scenarios.
 * @param void
 * @return Name of new directory (UUID) or error code in JSON format.
 */
router.get('/scenarios', (req, res)=>{
  fs.readdir('data', (e, f)=>res.send(f));
});

router.get('/scenarios/:scenario_id', (req, res)=>{
  req.params.scenario_id;
  
  res.send(req.params.scenario_id);
});

/**
 * Creates a new scenario directory copying in all files from the template.
 * @param void
 * @return Name of new directory (UUID) or error code in JSON format.
 */
router.delete('/scenarios/:scenario_id', (req, res)=>{
  console.log(req.query.scenario_id);
  fs.readdirSync('data/')
  res.status(200).end();
});

/**
 * Creates a new scenario directory copying in all files from the template.
 * @param void
 * @return Name of new directory (UUID) or error code in JSON format.
 */
router.post('/scenarios', (req, res)=>{

  try {
    let scenario_id = uuid();
    fs.mkdirSync('data/' + scenario_id);

    let list = fs.readdirSync('data/template');

    for (const filename of list)
      fs.copyFileSync('data/template/' + filename, 'data/' + scenario_id + '/' + filename);

    // TODO: Update user scenario list.
    res.json(scenario_id);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.json({'error': e.message});
  }

  console.log('done!');
});

module.exports = router;
