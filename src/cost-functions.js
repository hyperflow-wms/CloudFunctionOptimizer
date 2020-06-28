class CostFunctions {
  constructor(config, taskUtils) {
    this.config = config;
    this.taskUtils = taskUtils;
  }

  minBudget(tasks) {
    let costs = [];

    this.config.functionTypes.forEach(functionType => {
      let times = tasks.map(task => task.finishTime[functionType] - task.startTime[functionType]);
      let workflowCost = 0;
      times
        .map(time => Math.ceil(time / 100) * this.config.prices[this.config.provider][functionType])
        .forEach(cost => workflowCost += cost);
      costs.push(workflowCost);
    });

    return Math.min(...costs);
  }

  maxBudget(tasks) {
    let costs = [];

    this.config.functionTypes.forEach(functionType => {
      let times = tasks.map(task => task.finishTime[functionType] - task.startTime[functionType]);
      let workflowCost = 0;
      times
        .map(time => Math.ceil(time / 100) * this.config.prices[this.config.provider][functionType])
        .forEach(cost => workflowCost += cost);
      costs.push(workflowCost);
    });

    return Math.max(...costs);
  }

  minDeadline(tasks) {
    let maxLevel = this.taskUtils.findTasksMaxLevel(tasks);
    let tasksFromMaxLevel = this.taskUtils.findTasksFromLevel(tasks, maxLevel);
    let finishTimes = [];

    this.config.functionTypes.forEach(
      functionType => {
        finishTimes.push(
          Math.max(...tasksFromMaxLevel.map(task => task.finishTime[functionType]))
        )
      }
    );

    return Math.min(...finishTimes);
  }

  maxDeadline(tasks) {
    let maxLevel = this.taskUtils.findTasksMaxLevel(tasks);
    let tasksFromMaxLevel = this.taskUtils.findTasksFromLevel(tasks, maxLevel);
    let finishTimes = [];

    this.config.functionTypes.forEach(
      functionType => {
        finishTimes.push(
          Math.max(...tasksFromMaxLevel.map(task => task.finishTime[functionType]))
        )
      }
    );

    return Math.max(...finishTimes);
  }
}

module.exports = CostFunctions;
