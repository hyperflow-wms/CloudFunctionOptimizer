const CostFunctions = require('./cost-functions');
const TaskUtilities = require('./task-utilities');

class SchedulingAlgorithm {
  constructor(config) {
    this.config = config;
    this.taskUtils = new TaskUtilities(config);
    this.costFunctions = new CostFunctions(config, this.taskUtils);
  }

  decorateTasksWithLevels(tasks) {
    tasks.forEach(
      task => {
        let predecessors = this.taskUtils.findPredecessorsForTask(tasks, task);
        if (predecessors.length === 0) task.level = 1;
        else {
          let levels = predecessors.map(pTask => pTask.level);
          let maxLevel = Math.max(...levels);
          task.level = maxLevel + 1;
        }
      }
    );
  }

  getScheduldedTimesOnResource(tasks, task, functionType) {
    let predecessors = this.taskUtils.findPredecessorsForTask(tasks, task);
    let delay = 0;
    let predecessorsMaxFinishTime = 0;

    if (predecessors.length > 0) {
      let pTask = this.taskUtils.findPredecessorWithLongestFinishTime(predecessors, functionType);
      delay = task.startTime[functionType] - pTask.finishTime[functionType];

      let predecessorsScheduldedFinishTimes = predecessors.map(pTask => pTask.config.scheduledFinishTime);
      predecessorsMaxFinishTime = Math.max(...predecessorsScheduldedFinishTimes);
    } else {
      //level 1 executor delay
      delay = task.startTime[functionType];
    }

    let newStartTime = predecessorsMaxFinishTime + delay;

    let executionTime = task.finishTime[functionType] - task.startTime[functionType];
    let newFinishTime = newStartTime + executionTime;

    return {
      "scheduledStartTime": newStartTime,
      "scheduledFinishTime": newFinishTime
    }
  }

  computeAverageExecutionTime(task) {

    let total = 0;
    let times = this.config.functionTypes.map(functionType => {
      return task.finishTime[functionType] - task.startTime[functionType];
    });

    times.forEach(time => total += time);
    return total / times.length;
  }

  computeTimeQuality(tasks, task, functionType) {
    let taskFinishTime = this.getScheduldedTimesOnResource(tasks, task, functionType).scheduledFinishTime;
    let inSubdeadline = taskFinishTime < task.subDeadline ? 1 : 0;

    let taskMaxFinishTime = this.taskUtils.findMaxTaskFinishTime(task);
    let taskMinFinishTime = this.taskUtils.findMinTaskFinishTime(task);

    if(taskMaxFinishTime === taskMinFinishTime) return 0;
    return (inSubdeadline * task.subDeadline - taskFinishTime) / (taskMaxFinishTime - taskMinFinishTime);
  }

  computeCostQuality(tasks, task, functionType) {
    let taskFinishTime = this.getScheduldedTimesOnResource(tasks, task, functionType).scheduledFinishTime;
    let inSubdeadline = taskFinishTime < task.subDeadline ? 1 : 0;

    let taskCost = this.taskUtils.findTaskExecutionCostOnResource(task, functionType);
    let taskMaxCost = this.taskUtils.findMaxTaskExecutionCost(task);
    let taskMinCost = this.taskUtils.findMinTaskExecutionCost(task);

    if(taskMaxCost === taskMinCost) return 0;
    return ((taskMaxCost - taskCost) / (taskMaxCost - taskMinCost)) * inSubdeadline;
  }

  calculateUserDeadline(maxDeadline, minDeadline) {
    return minDeadline + this.config.deadlineParameter * (maxDeadline - minDeadline);
  }

  calculateUserBudget(maxBudget, minBudget) {
    return minBudget + this.config.budgetParameter * (maxBudget - minBudget);
  }

  getMostExpensiveResourceType() {
    let prices = this.config.prices[this.config.provider];
    let sortedByPrice = Object.keys(prices).sort((p1, p2) => prices[p1] - prices[p2]);
    return sortedByPrice[sortedByPrice.length - 1]; // return the most expensive resource
  }

  // TODO: Unused
  // addOverheads(tasks) {
  //   tasks.forEach(task => {
  //     this.config.functionTypes.forEach(resourceType => {
  //       task.resourceTimes[resourceType] += this.config.overheads[this.config.provider];
  //     })
  //   })
  // }
}

module.exports = SchedulingAlgorithm;