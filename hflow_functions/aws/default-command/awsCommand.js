//var request = require('request');
const request = require('requestretry');
const executorConfig = require('./awsCommand.config.js');
const identity = function (e) {return e};

function retryStrategy(err, response, body) {
    return err || response.statusCode >= 400 || request.RetryStrategies.HTTPOrNetworkError(err, response);
}

function awsCommand(ins, outs, config, cb) {

    let options = executorConfig.options;
    if (config.executor.hasOwnProperty('options')) {
        let executorOptions = config.executor.options;
        for (let opt in executorOptions) {
            if (executorOptions.hasOwnProperty(opt)) {
                options[opt] = executorOptions[opt];
            }
        }
    }
    let executable = config.executor.executable;
    let jobMessage = {
        "executable": executable,
        "args": config.executor.args,
        "env": (config.executor.env || {}),
        "inputs": ins.map(identity),
        "outputs": outs.map(identity),
        "options": options
    };

    console.log("Executing:  " + JSON.stringify(jobMessage));

    let functionType = config.deploymentType ? config.deploymentType : executorConfig.functionType;
    let url = executorConfig.resources[functionType];

    function optionalCallback(err, response, body) {
        if (err) {
            console.log("Function: " + executable + " error: " + err);
            cb(err, outs);
            return
        }
        if (response) {
            console.log("Function: " + executable + " response status code: " + response.statusCode + " number of request attempts: " + response.attempts)
        }
        console.log("Function: " + executable + " id: " + config.id + " resource: " + functionType + " data: " + body.message);
        cb(null, outs);
    }

    request.post({
        retryDelay: 1000,
        timeout: 600000,
        retryStrategy: retryStrategy,
        maxAttempts: 30,
        url: url,
        json: jobMessage,
        headers: {'Content-Type': 'application/json', 'Accept': '*/*'}
    }, optionalCallback);

}

exports.awsCommand = awsCommand;