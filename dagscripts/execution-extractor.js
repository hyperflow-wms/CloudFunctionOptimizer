const fs = require('fs');
const taskUtils = require('../src/task-utilities');

const dagPath = process.argv[2];
const csvPath = process.argv[3];

if(!dagPath || !csvPath){
  throw new Error("Provide valid arguments: node execution-extractor.js DAG_PATH CSV_PATH");
}

console.log(`Path to DAG is ${dagPath}`);
console.log(`Output CSV path is ${csvPath}`);

const stats = fs.statSync(dagPath);

if(!stats.isFile()) {
  throw new Error("Given path is not a file");
}

fs.writeFileSync(csvPath, "task id resource start end time type\n");
saveToCSV(dagPath);

function saveToCSV(file) {

  fs.readFile(file, (err, dag) => {
    dag = JSON.parse(dag);
    isDAGValid(dag);
    const tasks = dag.tasks;
    appendTimestamps(tasks);
  });
}

function isDAGValid(dag) {

  const tasks = dag.tasks;

  if(!tasks){
    throw  new Error("There are no tasks in DAG!");
  }

  tasks.forEach(task => {
    if(!task.resourceTimes){
      throw new Error("There are no resourceTimes in DAG!");
    }

    if(!task.config.deploymentType){
      throw new Error("There is no deploymentType in task");
    }
  })
}

function appendTimestamps(tasks) {
  let startTime = 0;
  let levels = taskUtils.findTasksMaxLevel(tasks);
  let endTime = 0;
  let time = 0;

  for (let level = 1; level <= levels; level++) {
    let tasksFromLevel = taskUtils.findTasksFromLevel(tasks, level);
    tasksFromLevel.forEach(task => {
      time = task.resourceTimes[task.config.deploymentType]*1000;
      let predecessors = taskUtils.findPredecessorForTask(tasks, task);
      if(!predecessors || predecessors.length === 0) {
        task.startTime = 0;
      } else {
        task.startTime = Math.max(...predecessors.map(ptask => ptask.endTime));
      }
      task.endTime = task.startTime + time;
      fs.appendFile(csvPath,`${task.name} ${task.config.id} ${task.config.deploymentType} ${task.startTime} ${task.endTime} ${time} dbws \n`, console.err)
    });
  }

}