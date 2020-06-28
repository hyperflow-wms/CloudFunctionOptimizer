const BUDGET_PARAMETER = 0.3;
const DEADLINE_PARAMETER = 0.7;
const FUNCTION_TYPES = ["type1", "type2"];
const PROVIDER = "TEST";

const PRICES = {
    "TEST" : {
        "type1": 0.25,
        "type2": 0.1,
    }
};

module.exports = {
    "budgetParameter": BUDGET_PARAMETER,
    "deadlineParameter": DEADLINE_PARAMETER,
    "functionTypes": FUNCTION_TYPES,
    "prices": PRICES[PROVIDER]
};