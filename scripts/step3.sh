#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}
normalizer=${appdir}/dagscripts/normalizer.js
provider=`jq -r '.provider' ${config}`
count=`jq '.count' ${config}`
workflow=`jq -r '.workflow' ${config}`
algorithm=`jq -r '.algorithm' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

# Step 3
# Script responsible for running prepared DAG
# parsing and normalizing logs
# Run with ./scripts/step3.sh <path_to_configuration>

folder=${workflow}_${provider}_${functionTypesTitle}x${count}
dagPath=${appdir}/results/step2/${folder}/dag-${algorithm}.json
outputFolder=${appdir}/results/step3/${algorithm}-${folder}
outputFile=${outputFolder}/normalized_logs.csv

# Validation of Step 2 data
if [[ ! -f "$dagPath" ]] ;then
    echo Input dag ${dagPath} does not exist
    echo "Please re-run Step 2"
    exit 1
fi

# Check if results already exists
if [[ -d "$outputFolder" ]] ;then
    echo Results ${workflow}_${provider}_${functionTypesTitle}x${count} already exists in path: ${outputFolder}
    echo Delete folder \"${outputFolder}\" to have a new data and try again
    exit 0
fi

mkdir -p ${outputFolder}
printf "task id resource start end time downloaded executed uploaded type\n" > ${outputFile}

echo Saving to ${folder}
for ((i = 1; i <= count; i++))
do
    # Run Hyperflow
    if [[ "$workflow" == "ellipsoids" ]] ;then
        # !!! Temporary HACK for running ellipsoids workflow !!!
        # Because hyperflow for some reason doesn't reach post-processing tasks during ellipsoids
        # workflow execution, the program must be terminated manually
        expect -c "set timeout 360; spawn ${appdir}/node_modules/hyperflow/bin/hflow run ${dagPath} -s; expect \", executable: summary.js\" {close}" >> ${outputFolder}/logs_${i}.txt
    else
        ${appdir}/node_modules/hyperflow/bin/hflow run ${dagPath} -s >> ${outputFolder}/logs_${i}.txt
    fi

    echo Workflow run ${i} finished! Parsing response...
    ${appdir}/scripts/parse_log.sh ${outputFolder}/logs_${i}.txt ${algorithm} ${provider} >> ${outputFolder}/logs_${i}.csv

    # Normalize
    node ${normalizer} ${outputFolder}/logs_${i}.csv ${outputFile}
done