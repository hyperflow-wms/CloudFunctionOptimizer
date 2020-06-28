const fs = require('fs');
const path = require('path');

const dagPath = process.argv[2];
const outputPath = process.argv[3];
const configPath = process.argv[4];
const config = JSON.parse(fs.readFileSync(configPath));

if(!dagPath){
    throw new Error("Provide valid arguments: node extract-real-avg.js DAG_PATH OUTPUT_PATH");
}

console.log(`Path to DAG is ${dagPath}`);

const stats = fs.statSync(dagPath);

if(stats.isDirectory()) {
    throw new Error("Given path is directory");
}

fs.writeFileSync(outputPath, "task id resource start end time type\n");

extract(dagPath);

function extract(file) {

    fs.readFile(file, (err, dag) => {

        dag = JSON.parse(dag);

        const tasks = dag.tasks;

        tasks.forEach(task => {
            let time = task.finishTime[config.algorithm] - task.startTime[config.algorithm];
            fs.appendFileSync(outputPath,`${task.name} ${task.config.id} ${task.config.deploymentType} ${task.startTime[config.algorithm]} ${task.finishTime[config.algorithm]} ${time} ${config.algorithm} \n`)
        });

    });
}




