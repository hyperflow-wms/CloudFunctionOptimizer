const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "2048";

const GOOGLE_BUCKET = "gcf-test123";
const GOOGLE_PATH   = "data/0.25";

exports.functionType = FUNCTION_TYPE;

exports.resources = {
    "128": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_128",
    "256": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_256",
    "512": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_512",
    "1024": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_1024",
    "2048": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_2048"
};

// Google cloud storage
exports.options = {
     "storage": "google",
     "bucket": GOOGLE_BUCKET,
     "prefix": GOOGLE_PATH,
 };

