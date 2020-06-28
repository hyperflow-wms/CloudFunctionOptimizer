#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}
normalizer=${appdir}/dagscripts/normalizer.js
dagPath=`jq -r '.dag' ${config}`
provider=`jq -r '.provider' ${config}`
count=`jq '.count' ${config}`
workflow=`jq -r '.workflow' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

outputFolder=${appdir}/results/step1/${workflow}_${provider}_${functionTypesTitle}x${count}
outputFile=${outputFolder}/normalized_logs.csv

# Step 1
# Script responsible for running passed
# function types on lambdas a given number of times
# It returns normalized output all of functions
# Run with ./scripts/step1.sh  <path_to_configuration>

# Check if results already exists
if [[ -d "$outputFolder" ]] ;then
    echo Results ${workflow}_${provider}_${functionTypesTitle}x${count} already exists in path: ${outputFolder}
    echo Delete folder \"${outputFolder}\" to have a new data and try again
    exit 0
fi

mkdir -p ${outputFolder}
printf "task id resource start end time downloaded executed uploaded type\n" > ${outputFile}

for functionType in $(jq -r '.functionTypes[]' ${config}); do
    echo Executing workflow for type: ${functionType}
    export FUNCTION_TYPE=${functionType};
    folder=${appdir}/results/step1/${workflow}_${provider}_${functionType}x${count}

    if [[ ! -d "$folder" ]] ;then
        mkdir -p ${folder}
    fi

    echo Saving to ${folder}
    for ((i = 1; i <= count; i++))
    do
        if [[ ! -d "$folder/logs_$i.txt" ]] ;then
            # Run Hyperflow
            if [[ "$workflow" == "ellipsoids" ]] ;then
                # !!! Temporary HACK for running ellipsoids workflow !!!
                # Because hyperflow for some reason doesn't reach post-processing tasks during ellipsoids
                # workflow execution, the program must be terminated manually
                expect -c "set timeout 360; spawn ${appdir}/node_modules/hyperflow/bin/hflow run ${dagPath} -s; expect \", executable: summary.js\" {close}" >> ${folder}/logs_${i}.txt
            else
                ${appdir}/node_modules/hyperflow/bin/hflow run ${dagPath} -s >> ${folder}/logs_${i}.txt
            fi

            echo Workflow run ${i} finished! Parsing response...
            ${appdir}/scripts/parse_log.sh ${folder}/logs_${i}.txt ${functionType} ${provider} >> ${folder}/logs_${i}.csv

            # Normalize
            node ${normalizer} ${folder}/logs_${i}.csv ${outputFile}
        fi
    done
done