#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}

# Step 1
if ! ./scripts/step1.sh ${config}; then
    echo "Step 1 returned error"
    exit 1
fi


# Step 2
if ! ./scripts/step2.sh ${config}; then
    echo "Step 2 returned error"
    exit 1
fi


# Step 3
if ! ./scripts/step3.sh ${config}; then
    echo "Step 3 returned error"
    exit 1
fi

# Step 4
if ! ./scripts/step4.sh ${config}; then
    echo "Step 4 returned error"
    exit 1
fi

# Step 5
if ! ./scripts/step5.sh ${config}; then
    echo "Step 5 returned error"
    exit 1
fi