const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const dagPath = process.argv[2];
const outputPath = process.argv[3];
const configPath = process.argv[4];

const config = JSON.parse(fs.readFileSync(configPath));

const SchedulingAlgorithm = require(`./src/${config.algorithm}`);
const schedulingAlgorithm = new SchedulingAlgorithm(config);

if(!dagPath || !outputPath)throw new Error("Provide valid arguments: node app.js DAG_PATH OUTPUT_PATH");
const stats = fs.statSync(dagPath);
if(!stats.isFile()) throw new Error("Given path is not a file");

console.log("Starting Application");
console.log("Configuration " + JSON.stringify(config));

// read dag file
decorate = (inputPath, outputPath) => {
    fs.readFileAsync(inputPath)
      .then(data => JSON.parse(data))
      .then(dag => decorateDag(dag))
      .then(dag => savePrettifyDag(dag, outputPath))
      .then(() => console.log("Saved decorated DAG file as " + outputPath))
      .catch(console.error);
};

decorateDag = (dag) => {
    if (!dag.tasks) throw new Error("DAG file doesn't contain tasks within.");
    schedulingAlgorithm.decorateStrategy(dag);
    return dag;
};

savePrettifyDag = (dag, outputPath) => {
    let objectToSave = JSON.stringify(dag, null, 2);
    return fs.writeFileAsync(outputPath, objectToSave);
};

decorate(dagPath, outputPath);