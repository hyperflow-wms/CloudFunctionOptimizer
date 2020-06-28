#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
timeDecorator=${appdir}/dagscripts/time-decorator.js
dbwsDecorator=${appdir}/app.js
configPath=$1
config=${appdir}/${configPath}
dagPath=`jq -r '.dag' ${config}`
provider=`jq -r '.provider' ${config}`
algorithm=`jq -r '.algorithm' ${config}`
count=`jq '.count' ${config}`
workflow=`jq -r '.workflow' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

# Step 2
# Script responsible for preparing DBWS dag
# new DBWS dag will be created
# Run with .scripts/step2.sh  <path_to_configuration>

folder=${workflow}_${provider}_${functionTypesTitle}x${count}
folderPath=${appdir}/results/step2/${folder}

inputFile=${appdir}/results/step1/${folder}/normalized_logs.csv
outputFile=${appdir}/results/step2/${folder}/tmp-times.json
outputDag=${appdir}/results/step2/${folder}/dag-${algorithm}.json

# Validation of Step 1 data
if [[ ! -f "$inputFile" ]] ;then
    echo Input file ${inputFile} does not exist
    echo "Please re-run Step 1"
    exit 1
fi

# Check if results already exists
if [[ -d "$folderPath" ]] ;then
    echo Results ${workflow}_${provider}_${functionTypesTitle}x${count} already exists in path: ${folderPath}
    echo Delete folder \"${folderPath}\" to have a new data and try again
    exit 0
fi

mkdir -p ${folderPath}
echo Preparing DAG:

echo Will decorate with times
echo node ${timeDecorator} ${dagPath} ${inputFile} ${outputFile}
node ${timeDecorator} ${dagPath} ${inputFile} ${outputFile}

echo Decorated with times
echo node ${dbwsDecorator} ${outputFile} ${outputDag}
node ${dbwsDecorator} ${outputFile} ${outputDag} ${config}

echo DAG ready