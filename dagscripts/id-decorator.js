const fs = require('fs');
const path = require('path');

const dagPath = process.argv[2];
const outputPath = process.argv[3];

if(!dagPath){
    throw new Error("Provide valid arguments: node id-decorator.js DAG_PATH OUTPUT_PATH");
}

console.log(`Path to DAG is ${dagPath}`);

const stats = fs.statSync(dagPath);

if(stats.isDirectory()) {
    throw new Error("Given path is directory");
}

addIDToDag(dagPath);

function addIDToDag(file) {

    fs.readFile(file, (err, dag) => {

        dag = JSON.parse(dag);

        const tasks = dag.tasks;
        let count = 1;
        tasks.forEach(task => task.config.id = count++);

        fs.writeFile(outputPath, JSON.stringify(dag, null, 2), (err) => {
            if(err) throw err;
        })
    });
}




