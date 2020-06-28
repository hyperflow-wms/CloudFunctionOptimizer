const fs = require('fs');
const path = require('path');
const csvParser = require('fast-csv');

const startTimesString = "startTime";
const finishTimesString = "finishTime";

const dagPath = process.argv[2];
const csvPath = process.argv[3];
const outputPath = process.argv[4];

if(!csvPath || !dagPath || !outputPath){
    throw new Error("Provide valid arguments: node time-decorator.js DAG_PATH CSV_PATH OUTPUT_PATH");
}

console.log(`DAG file path is ${dagPath}`);
console.log(`CSV file path is ${csvPath}`);

let dag = fs.readFileSync(dagPath);
dag = JSON.parse(dag);

if(!dag.tasks){
    throw new Error("There are no tasks in dag file");
}

let tasks = dag.tasks;

let idTypeMap = new Map();

csvParser
    .fromPath(csvPath, {delimiter: ' ', headers: true})
    .on("data", data => {
        // Setting times from normalized logs
        if(!idTypeMap.has(data.id)) idTypeMap.set(data.id, new Map());
        let typeTimeMap = idTypeMap.get(data.id);
        if(!typeTimeMap.get(data.type)) typeTimeMap.set(data.type, []);
        typeTimeMap.get(data.type).push( { startTime: Number(data.start), finishTime: Number(data.end) } );
    })
    .on("end", function () {
        let resourceTimes = calculateResourceTimes(idTypeMap);
        decorateTaskWithTime(tasks, resourceTimes);
        fs.writeFile(outputPath, JSON.stringify(dag, null, 2), (err) => { if (err) throw err; });
    });

function calculateResourceTimes(idTimeMap) {
    let startTimes = {};
    let finishTimes = {};

    for(let id of idTimeMap.keys()){
      let typeTimeMap = idTimeMap.get(id);
      for(let type of typeTimeMap.keys()){
        let timestamps = typeTimeMap.get(type);
        let average = calculateAverage(timestamps);
        if (!startTimes[id]) startTimes[id] = {};
        if (!finishTimes[id]) finishTimes[id] = {};
          startTimes[id][type] = average.startTime;
          finishTimes[id][type] = average.finishTime;
      }
    }
    return { startTimes: startTimes, finishTimes: finishTimes };
}

function calculateAverage(times) {

    let startSum = 0;
    let finishSum = 0;
    for(let i=0; i< times.length; i++){
        startSum += times[i].startTime;
        finishSum += times[i].finishTime;
    }
    return { startTime: Math.round(startSum / times.length), finishTime: Math.round(finishSum / times.length) };
}

function decorateTaskWithTime(tasks, times) {
    tasks.forEach(task => {
        let id = task.config.id;
        let startTimes = times.startTimes[id];
        let finishTimes = times.finishTimes[id];
        task[startTimesString] = {...task[startTimesString], ...startTimes};
        task[finishTimesString] = {...task[finishTimesString], ...finishTimes};
    })
}
