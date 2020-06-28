#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}
timeDecorator=${appdir}/dagscripts/time-decorator.js
extractor=${appdir}/dagscripts/extractor.js
averageResult=${appdir}/dagscripts/extract-real-avg.js

provider=`jq -r '.provider' ${config}`
count=`jq '.count' ${config}`
workflow=`jq -r '.workflow' ${config}`
algorithm=`jq -r '.algorithm' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

folder=${workflow}_${provider}_${functionTypesTitle}x${count}
dagPath=${appdir}/results/step2/${folder}/dag-${algorithm}.json
normalizedLogs=${appdir}/results/step3/${algorithm}-${folder}/normalized_logs.csv

# Step 4
# Script responsible for extracting results from
# prepared DAG and normalized logs
# Run with ./scripts/step4.sh  <path_to_configuration>

outputFolder=${appdir}/results/step4/${algorithm}-${folder}
outputDag=${outputFolder}/dag-extracted.json
outputResults=${outputFolder}/extracted_results.csv
outputExecution=${outputFolder}/planned_execution.csv
outputAverage=${outputFolder}/average_execution.csv

# Validation of Step 2 data
if [[ ! -f "$dagPath" ]] ;then
    echo Input dag ${dagPath} does not exist
    echo "Please re-run Step 2"
    exit 1
fi

# Validation of Step 3 data
if [[ ! -f "$normalizedLogs" ]] ;then
    echo Normalized logs: ${normalizedLogs} does not exist
    echo "Please re-run Step 3"
    exit 1
fi

# Check if results already exists
if [[ -d "$outputFolder" ]] ;then
    echo Results ${workflow}_${provider}_${functionTypesTitle}x${count} already exists in path: ${outputFolder}
    echo Delete folder \"${outputFolder}\" to have a new data and try again
    exit 0
fi

mkdir -p ${outputFolder}

#Extracting times and prices...
echo node ${timeDecorator} ${dagPath} ${normalizedLogs} ${outputDag}
node ${timeDecorator} ${dagPath} ${normalizedLogs} ${outputDag}

echo node ${extractor} ${outputDag} ${outputResults} ${outputExecution}
node ${extractor} ${outputDag} ${outputResults} ${outputExecution} ${configPath}

echo node ${averageResult} ${outputDag} ${outputAverage} ${configPath}
node ${averageResult} ${outputDag} ${outputAverage} ${configPath}