#!/usr/bin/env bash

#full path to config file
export CONFIG_PATH=$(pwd)/tests/sdbws-test.config.js

#ouput file name
export TEST_DAG_PATH=$(pwd)/tests/sdbws-test-dag-decorated.json

node ./app.js ./tests/sdbws-test-dag.json ${TEST_DAG_PATH}
node ./node_modules/mocha/bin/mocha ./tests/app.test.js

rm ${TEST_DAG_PATH}