/**
 * See index.js for routing to this point.
 * This route handles requests regarding experiment scenarios.
 */
var express = require('express');
var router = express.Router();

var fs = require('fs');
const { runInNewContext } = require('vm');
const { config } = require('process');
var uuid = require('uuid').v4;

/**
 * Get the list of scenarios.
 * @param void
 * @return Name of new directory (UUID) or error code in JSON format.
 */
router.get('/', (req, res)=>{
    fs.readdir('data', (e, f)=>res.send(f));
});

/**
 * Creates a new scenario directory copying in all files from the template.
 * @param void
 * @return Name of new directory (UUID) or error code in JSON format.
 */
router.post('/', (req, res)=>{

    try {
        let scenario_id = uuid();
        fs.mkdirSync('data/' + scenario_id);
  
        let list = fs.readdirSync('data_templates/scenario/');
  
        for (const filename of list)
            fs.copyFileSync('data_templates/scenario/' + filename, 'data/' + scenario_id + '/' + filename);
  
        // TODO: Update user scenario list.
        res.json(scenario_id);
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({'error': e.message});
    }
  
    console.log('done!');
});

/**
 * Get a particular scenario.
 * @param void
 * @return 
 */
router.get('/:scenario_id', (req, res)=>{
    req.params.scenario_id;
    res.send(req.params.scenario_id);
});

/**
 * Delete a scenario.
 * @param void
 * @return 
 */
router.delete('/:scenario_id', (req, res)=>{
    console.log(req.query.scenario_id);
    fs.readdirSync('data/');
    res.status(200).end();
});

router.use('/:scenario_id/i', require('./scene'));

module.exports = router;