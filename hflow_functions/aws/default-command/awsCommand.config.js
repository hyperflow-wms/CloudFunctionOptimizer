const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "1536";

const AWS_BUCKET = "hyperflow.workflow.test";
const AWS_PATH = "results";

exports.functionType = FUNCTION_TYPE;

exports.resources = {
  "128": "<link_to_128_lambda_function",
  "256": "<link_to_256_lambda_function",
  "512": "<link_to_512_lambda_function",
  "1024": "<link_to_1024_lambda_function",
  "1536": "<link_to_1536_lambda_function",
  "2048": "<link_to_2048_lambda_function",
  "2560": "<link_to_2560_lambda_function",
  "3008": "<link_to_3008_lambda_function",
};

// Google cloud storage
exports.options = {
  "storage": "aws",
  "bucket": AWS_BUCKET,
  "prefix": AWS_PATH,
};

