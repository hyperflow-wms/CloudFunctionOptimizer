const SchedulingAlgorithm = require('./scheduling-algorithm.js');

class SDBWS extends SchedulingAlgorithm {
  constructor(config) {
    super(config);
  }

  decorateStrategy(dag) {
    const tasks = dag.tasks;

    this.decorateTasksWithLevels(tasks);
    const sortedTasks = tasks.sort((task1, task2) => task1.level - task2.level);

    const maxDeadline = this.costFunctions.maxDeadline(tasks);
    const minDeadline = this.costFunctions.minDeadline(tasks);

    const maxBudget = this.costFunctions.maxBudget(tasks);
    const minBudget = this.costFunctions.minBudget(tasks);

    const userDeadline = this.calculateUserDeadline(maxDeadline, minDeadline);
    const userBudget = this.calculateUserBudget(maxBudget, minBudget);

    console.log("userDeadline: " + userDeadline);
    console.log("userBudget: " + userBudget);

    if (userBudget < minBudget) throw new Error("No possible schedule map");
    else if (userBudget >= maxBudget) {
      tasks.forEach(task => task.config.deploymentType = this.getMostExpensiveResourceType());
      return;
    }

    this.decorateTasksWithSubdeadline(sortedTasks, userDeadline);

    const costEfficientFactor = minBudget / userBudget;
    sortedTasks.forEach(
      task => {
        let resourceMap = new Map();

        this.config.functionTypes.forEach(
          functionType => resourceMap.set(
            functionType, this.computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor)
          )
        );

        let maxQuality = Number.NEGATIVE_INFINITY;
        let selectedResource;

        for (let [functionType, quality] of resourceMap.entries()) {
          if (maxQuality < quality) {
            maxQuality = quality;
            selectedResource = functionType;
          }
        }

        task.config.deploymentType = selectedResource;
        // copy schedulded times to config
        Object.assign(task.config, this.getScheduldedTimesOnResource(tasks, task, selectedResource))
      }
    )
  }

  decorateTasksWithSubdeadline(tasks, userDeadline) {
    let levelExecutionTimeMap = this.findLevelExecutionTimeMap(tasks);

    let totalLevelExecutionTime = 0;
    for (let value of levelExecutionTimeMap.values()) {
      totalLevelExecutionTime += value
    }

    let prevLevelDeadline = 0;
    for (let i = 1; i <= this.taskUtils.findTasksMaxLevel(tasks); i++) {

      //calculate deadline based on prevDeadline, levelExecutionTime and userParameter
      let levelExecutionTime = levelExecutionTimeMap.get(i);
      let subDeadline = this.calculateSubDeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime, userDeadline);

      //decorate task at i-th level
      let levelTasks = this.taskUtils.findTasksFromLevel(tasks, i);
      levelTasks.forEach(task => task.subDeadline = subDeadline);

      prevLevelDeadline = subDeadline;
    }
  }

  findLevelExecutionTimeMap(tasks) {
    let levelExecutionTimeMap = new Map();

    for (let i = 1; i <= this.taskUtils.findTasksMaxLevel(tasks); i++) {
      let levelTasks = this.taskUtils.findTasksFromLevel(tasks, i);

      let maxTasksTime = levelTasks.map(task => this.taskUtils.findMaxTaskExecutionTime(task));
      let levelExecutionTime = Math.max(...maxTasksTime);

      levelExecutionTimeMap.set(i, levelExecutionTime);
    }

    return levelExecutionTimeMap;
  }

  calculateSubDeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime, userDeadline) {
    let subdeadline = prevLevelDeadline + userDeadline * (levelExecutionTime / totalLevelExecutionTime);
    return Math.round(subdeadline * 100) / 100;
  }

  computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor) {
    let timeQuality = this.computeTimeQuality(tasks, task, functionType);
    let costQuality = this.computeCostQuality(tasks, task, functionType);

    return (timeQuality * (1 - costEfficientFactor) + costQuality * costEfficientFactor);
  }
}

module.exports = SDBWS;
