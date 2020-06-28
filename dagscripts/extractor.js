const fs = require('fs');

const dagPath = process.argv[2];
const csvPath = process.argv[3];
const timestampsCSVPath = process.argv[4];
const configPath = process.argv[5];
const config = JSON.parse(fs.readFileSync(configPath));

const TaskUtilities = require('../src/task-utilities');
const taskUtils = new TaskUtilities(config);

if(!dagPath || !csvPath || !timestampsCSVPath){
    throw new Error("Provide valid arguments: node extractor.js DIR_PATH CSV_PATH TIMESTAMPS_CSV_PATH");
}

console.log(`Path to DAG is ${dagPath}`);
console.log(`Output CSV path is ${csvPath}`);
console.log(`Output timestamps CSV path is ${timestampsCSVPath}`);

const stats = fs.statSync(dagPath);

if(!stats.isFile()) {
    throw new Error("Given path is not a file");
}

fs.writeFileSync(csvPath, "type time price\n");
fs.writeFileSync(timestampsCSVPath, "task id resource start end time type\n");

saveToCSV(dagPath);

function saveToCSV(file) {

    fs.readFile(file, (err, dag) => {
        dag = JSON.parse(dag);
        isDAGValid(dag);
        const tasks = dag.tasks;
        const functionTypes = config.functionTypes;
        functionTypes.forEach(type => appendTimeAndPriceByType(tasks, type));
        appendFinishTimeAndPriceForReal(tasks);
        appendTimestampsForDBWS(tasks);
    });
}

function isDAGValid(dag) {

    const tasks = dag.tasks;

    if(!tasks){
        throw  new Error("There are no tasks in DAG!");
    }

    tasks.forEach(task => {
        // if(!task.resourceTimes){
        //     throw new Error("There are no resourceTimes in DAG!");
        // }
        //
        // if(!task.resourceTimes['real']){
        //     throw new Error("There are no real times in tasks")
        // }

        if(!task.config.deploymentType){
            throw new Error("There is no deploymentType in task");
        }
    })
}

function appendTimeAndPriceByType(tasks, type) {

    let price = 0;

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let maxFinishTime = Math.max(...maxLevelTasks.map(task => task.finishTime[type]));

    tasks.forEach(task => {
      let taskTime = task.finishTime[type] - task.startTime[type];
      let timeSlots = Math.ceil(taskTime/100);
      price += timeSlots * config.prices[config.provider][type];
    });

    maxFinishTime = normalizeDouble(maxFinishTime);
    price = normalizeDouble(price, 10);

    console.log(`${type} ${maxFinishTime} ${price}`);

    fs.appendFileSync(csvPath, `${type} ${maxFinishTime} ${price}\n`)
}

function appendFinishTimeAndPriceForReal(tasks) {
    let price = 0;

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let maxFinishTime = Math.max(...maxLevelTasks.map(task => task.finishTime[config.algorithm]));

    tasks.forEach(task => {
        let taskTime = task.finishTime[config.algorithm] - task.startTime[config.algorithm];
        let timeSlots = Math.ceil(taskTime/100);
        price += timeSlots * config.prices[config.provider][task.config.deploymentType];
    });

    maxFinishTime = normalizeDouble(maxFinishTime);
    price = normalizeDouble(price, 10);

    console.log(`${config.algorithm} ${maxFinishTime} ${price}`);

     fs.appendFileSync(csvPath,`${config.algorithm} ${maxFinishTime} ${price}\n`)
}


function appendTimestampsForDBWS(tasks) {
    let maxLevel = taskUtils.findTasksMaxLevel(tasks);

    for (let level = 1; level <= maxLevel; level++) {
        let tasksFromLevel = taskUtils.findTasksFromLevel(tasks, level);
        tasksFromLevel.forEach(task => {

            let time = task.finishTime[task.config.deploymentType] - task.startTime[task.config.deploymentType];
            let predecessors = taskUtils.findPredecessorsForTask(tasks, task);
            if(!predecessors || predecessors.length === 0) {
                task.startTime['plan'] = 0;
            } else {
                task.startTime['plan'] = Math.max(...predecessors.map(ptask => ptask.finishTime['plan']));
            }
            task.finishTime['plan'] = task.startTime['plan'] + time;
            appendToTimestampsCSVfile(task, time);
        });
    }

    let price = 0;

    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let maxFinishTime = Math.max(...maxLevelTasks.map(task => task.finishTime['plan']));

    tasks.forEach(task => {
        let taskTime = task.finishTime['plan'] - task.startTime['plan'];
        let timeSlots = Math.ceil(taskTime/100);
        price += timeSlots * config.prices[config.provider][task.config.deploymentType];
    });

    maxFinishTime = normalizeDouble(maxFinishTime);
    price = normalizeDouble(price, 10);

    console.log(`plan ${maxFinishTime} ${price}`);

    fs.appendFileSync(csvPath,`plan ${maxFinishTime} ${price}\n`)
}

function appendToTimestampsCSVfile(task, time) {
    fs.appendFileSync(timestampsCSVPath,`${task.name} ${task.config.id} ${task.config.deploymentType} ${task.startTime[config.algorithm]} ${task.finishTime[config.algorithm]} ${time} ${config.algorithm} \n`)
}

function normalizeDouble(number, n = 3) {
    return Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
}

