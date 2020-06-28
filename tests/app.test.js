const fs = require('fs');
const assert = require('assert');
const taskUtils = require("../src/task-utilities");
const costUtils = require("../src/cost-functions");
const sdbws = require("../src/sdbws");
const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : "../configuration/config.js");

const dagPath = process.env.TEST_DAG_PATH;
if (!config || !dagPath) {
    throw new Error("Invalid inputs!")
}

const dag = JSON.parse(fs.readFileSync(dagPath, "utf-8"));
const tasks = dag.tasks;
const firstTask = tasks[0];
const lastTask = tasks[tasks.length - 1];


function areDoubleEqual(x, y) {
    return Math.abs(x - y) < 0.0000001
}


describe('Cost-utils', function () {
    it('makespan should be equal to 35200ms for faster type1', function () {
        let makespan = costUtils.minDeadline(tasks);
        assert.equal(makespan, 35200);
    });
    it('makespan should be equal to 70400ms for slower type2', function () {
        let makespan = costUtils.maxDeadline(tasks);
        assert.equal(makespan, 70400);
    });
    it('cost should be equal to 84.2$ for more expensive type1', function () {
        let cost = costUtils.minBudget(tasks);
        assert.equal(cost, 84.2);
    });
    it('makespan should be equal to 105.25$ for cheaper type2', function () {
        let cost = costUtils.maxBudget(tasks);
        assert.equal(cost, 105.25);
    });
});

describe('Task-utils', function () {
    it('should find task predecessors', function () {
        let firstTaskPredecessors = taskUtils.findPredecessorForTask(tasks, firstTask);
        assert.equal(firstTaskPredecessors.length, 0);

        let lastTaskPredecessors = taskUtils.findPredecessorForTask(tasks, lastTask);
        assert.equal(lastTaskPredecessors.length, 2);
        assert.equal(lastTaskPredecessors[0].name, "level4");
        assert.equal(lastTaskPredecessors[1].name, "level4");
    });
    it('should find task successors', function () {
        let firstTaskSuccessors = taskUtils.findSuccessorsForTask(tasks, firstTask);
        assert.equal(firstTaskSuccessors.length, 3);
        assert.equal(firstTaskSuccessors[0].name, "level2");
        assert.equal(firstTaskSuccessors[1].name, "level2");
        assert.equal(firstTaskSuccessors[2].name, "level2");

        let lastTaskSuccessors = taskUtils.findSuccessorsForTask(tasks, lastTask);
        assert.equal(lastTaskSuccessors.length, 0);
    });
    it('should find tasks from given level', function () {
        let entryTasks = taskUtils.findTasksFromLevel(tasks, 1);
        assert.equal(entryTasks.length, 1);
        assert.equal(entryTasks[0].name, "level1");

        let secondLevelTasks = taskUtils.findTasksFromLevel(tasks, 2);
        assert.equal(secondLevelTasks.length, 3);
        assert.equal(secondLevelTasks[0].name, "level2");
        assert.equal(secondLevelTasks[1].name, "level2");
        assert.equal(secondLevelTasks[2].name, "level2");

        let lastLevelTasks = taskUtils.findTasksFromLevel(tasks, 5);
        assert.equal(lastLevelTasks.length, 1);
        assert.equal(lastLevelTasks[0].name, "level5");
    });
    it('max level should be equal to 5', function () {
        let maxLevel = taskUtils.findTasksMaxLevel(tasks);
        assert.equal(maxLevel, 5)
    });
    it('should return the biggest execution time for given task', function () {
        let firstTaskExecutionTime = taskUtils.findMaxTaskExecutionTime(firstTask);
        assert.equal(firstTaskExecutionTime, 10000);
        let secondLevelTaskExecutionTime = taskUtils.findMaxTaskExecutionTime(tasks[1]);
        assert.equal(secondLevelTaskExecutionTime, 4200);
        let lastTaskExeuctionTime = taskUtils.findMaxTaskExecutionTime(lastTask);
        assert.equal(lastTaskExeuctionTime, 20000);
    });
    it('should return the smallest execution time for given task', function () {
        let firstTaskExecutionTime = taskUtils.findMinTaskExecutionTime(firstTask);
        assert.equal(firstTaskExecutionTime, 5000);
        let secondLevelTaskExecutionTime = taskUtils.findMinTaskExecutionTime(tasks[1]);
        assert.equal(secondLevelTaskExecutionTime, 2100);
        let lastTaskExeuctionTime = taskUtils.findMinTaskExecutionTime(lastTask);
        assert.equal(lastTaskExeuctionTime, 10000);
    });
    it('should return the biggest cost for given task', function () {
        let firstTaskCost = taskUtils.findMaxTaskExecutionCost(firstTask);
        assert.equal(firstTaskCost, 12.5);
        let secondLevelTaskCost = taskUtils.findMaxTaskExecutionCost(tasks[1]);
        assert.equal(secondLevelTaskCost, 5.25);
        let lastTaskCost = taskUtils.findMaxTaskExecutionCost(lastTask);
        assert.equal(lastTaskCost, 25);
    });
    it('should return the smallest cost for given task', function () {
        let firstTaskExecutionTime = taskUtils.findMinTaskExecutionCost(firstTask);
        assert.equal(firstTaskExecutionTime, 10);
        let secondLevelTaskExecutionTime = taskUtils.findMinTaskExecutionCost(tasks[1]);
        assert.equal(secondLevelTaskExecutionTime, 4.2);
        let lastTaskExeuctionTime = taskUtils.findMinTaskExecutionCost(lastTask);
        assert.equal(lastTaskExeuctionTime, 20);
    });
    it('should return task execution cost on given function type', function () {
        let firstTaskCostOnType1 = taskUtils.findTaskExecutionCostOnResource(firstTask, "type1");
        let firstTaskCostOnType2 = taskUtils.findTaskExecutionCostOnResource(firstTask, "type2");
        assert.equal(firstTaskCostOnType1, 12.5);
        assert.equal(firstTaskCostOnType2, 10);
        let lastTaskCostOnType1 = taskUtils.findTaskExecutionCostOnResource(lastTask, "type1");
        let lastTaskCostOnType2 = taskUtils.findTaskExecutionCostOnResource(lastTask, "type2");
        assert.equal(lastTaskCostOnType1, 25);
        assert.equal(lastTaskCostOnType2, 20);
    });
    it('should return predecessor with the longest finish time', function () {
        let predecessor1 = taskUtils.findPredecessorWithLongestFinishTime(tasks, lastTask, "type1");
        assert.equal(predecessor1.finishTime["type1"], 25200);
        assert.equal(predecessor1.name, "level4");
        let predecessor2 = taskUtils.findPredecessorWithLongestFinishTime(tasks, lastTask, "type2");
        assert.equal(predecessor2.finishTime["type2"], 50400);
        assert.equal(predecessor2.name, "level4");
    });
    it('should return max finish time among all resources for given task', function () {
        let firstTaskMaxFinishTime = taskUtils.findMaxTaskFinishTime(firstTask);
        assert.equal(firstTaskMaxFinishTime, 10000);
        let lastTaskMaxFinishTime = taskUtils.findMaxTaskFinishTime(lastTask)
        assert.equal(lastTaskMaxFinishTime, 70400);
    });
    it('should return min finish time among all resources for given task', function () {
        let firstTaskMinFinishTime = taskUtils.findMinTaskFinishTime(firstTask);
        assert.equal(firstTaskMinFinishTime, 5000);
        let lastTaskMinFinishTime = taskUtils.findMinTaskFinishTime(lastTask);
        assert.equal(lastTaskMinFinishTime, 35200);
    });
});

describe('sdbws algorithm', function () {
    it('user makespan should be equal to 21.2 and 59840', function () {
        let userDeadline = sdbws.calculateUserDeadline(23, 17);
        assert.equal(userDeadline, 21.2);
        userDeadline = sdbws.calculateUserDeadline(70400, 35200);
        assert.equal(userDeadline, 59840);
    });
    it('user budget should be equal to 18.8', function () {
        const maxBudget = 105.25;
        const minBudget = 84.2;
        const userBudget = sdbws.calculateUserBudget(maxBudget, minBudget);
        assert.equal(userBudget, 90.515);
    });
    it('getMostExpensiveResourceType should return type1', function () {
        assert.equal(sdbws.getMostExpensiveResourceType(), "type1");
    });
    it('should properly calculate average time ', function () {
        const firstTaskAverageTime = sdbws.computeAverageExecutionTime(firstTask);
        assert.equal(firstTaskAverageTime, 7500);
        const lastTaskAverageTime = sdbws.computeAverageExecutionTime(lastTask);
        assert.equal(lastTaskAverageTime, 15000);
    });
    it('should check if subdeadlines were calculated correctly', function () {
        assert.equal(tasks[0].subDeadline, 8500); //level 1
        assert.equal(tasks[2].subDeadline, 12240); //level 2
        assert.equal(tasks[4].subDeadline, 37740); //level 3
        assert.equal(tasks[5].subDeadline, 42840); //level 4
        assert.equal(tasks[7].subDeadline, 59840); //level 5
    });
    it('should calculate time quality measure correctly', function () {
        let type1TimeQuality = sdbws.computeTimeQuality(tasks, firstTask, "type1");
        let type2TimeQuality = sdbws.computeTimeQuality(tasks, firstTask, "type2");
        assert.equal(type1TimeQuality, 0.7);
        assert.equal(type2TimeQuality, -2.0);

        type1TimeQuality = sdbws.computeTimeQuality(tasks, tasks[2], "type1");
        type2TimeQuality = sdbws.computeTimeQuality(tasks, tasks[2], "type2");
        assert.equal(areDoubleEqual(type1TimeQuality, 0.74857142857), true);
        assert.equal(areDoubleEqual(type2TimeQuality, 0.46285714285), true);

        type1TimeQuality = sdbws.computeTimeQuality(tasks, tasks[4], "type1");
        type2TimeQuality = sdbws.computeTimeQuality(tasks, tasks[4], "type2");
        assert.equal(areDoubleEqual(type1TimeQuality, 0.60090090090), true);
        assert.equal(areDoubleEqual(type2TimeQuality, -1.7747747747), true);
    });
    it('should calculate cost quality measure correctly', function () {
        let type1CostQuality = sdbws.computeCostQuality(tasks, firstTask, "type1");
        let type2CostQuality = sdbws.computeCostQuality(tasks, firstTask, "type2");
        assert.equal(type1CostQuality, 0);
        assert.equal(type2CostQuality, 0); //finish time on this resource is lower than subdeadline

        type1CostQuality = sdbws.computeCostQuality(tasks, tasks[2], "type1");
        type2CostQuality = sdbws.computeCostQuality(tasks, tasks[2], "type2");
        assert.equal(type1CostQuality, 0);
        assert.equal(type2CostQuality, 1);

        type1CostQuality = sdbws.computeCostQuality(tasks, tasks[4], "type1");
        type2CostQuality = sdbws.computeCostQuality(tasks, tasks[4], "type2");
        assert.equal(type1CostQuality, 0);
        assert.equal(type2CostQuality, 0);//finish time on this resource is lower than subdeadline 5000+4400+30000 > 37740
    });
    it('should calculate quality measure correctly', function () {
        const costEfficientFactor = 0.9302;

        let type1Quality = sdbws.computeQualityMeasureForResource(tasks, firstTask, "type1", costEfficientFactor);
        let type2Quality = sdbws.computeQualityMeasureForResource(tasks, firstTask, "type2", costEfficientFactor);
        assert.equal(areDoubleEqual(0.04886, type1Quality), true);
        assert.equal(areDoubleEqual(-0.1396, type2Quality), true);

        type1Quality = sdbws.computeQualityMeasureForResource(tasks, tasks[2], "type1", costEfficientFactor);
        type2Quality = sdbws.computeQualityMeasureForResource(tasks, tasks[2], "type2", costEfficientFactor);
        assert.equal(areDoubleEqual(0.052250285714186, type1Quality), true);
        assert.equal(areDoubleEqual(0.96250742857093, type2Quality), true);

        type1Quality = sdbws.computeQualityMeasureForResource(tasks, tasks[4], "type1", costEfficientFactor);
        type2Quality = sdbws.computeQualityMeasureForResource(tasks, tasks[4], "type2", costEfficientFactor);
        assert.equal(areDoubleEqual(0.04194288288282, type1Quality), true);
        assert.equal(areDoubleEqual(-0.12387927927406, type2Quality), true);
    });
});



