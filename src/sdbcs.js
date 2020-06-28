const SchedulingAlgorithm = require('./scheduling-algorithm.js');

class SDBCS extends SchedulingAlgorithm {
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

    if (userBudget < minBudget) {
      throw new Error("No possible schedule map")
    }

    this.decorateTasksWithUpwardRank(sortedTasks);
    this.decorateTasksWithSubdeadline(sortedTasks, userDeadline);

    const tasksSortedUpward = tasks.sort((task1, task2) => task2.upwardRank - task1.upwardRank);
    const costEfficientFactor = minBudget / userBudget;
    let deltaCost = userBudget - minBudget;
    tasksSortedUpward.forEach(
      task => {
        let maximumAvailableBudget = deltaCost + this.taskUtils.findMinTaskExecutionCost(task);
        let resourceMap = new Map();
        const admissibleProcesors = this.config.functionTypes.filter(p => this.isProcesorAdmisible(task, p, maximumAvailableBudget));
        if(admissibleProcesors.length ===0) throw new Error("No possible schedule map");
        admissibleProcesors.forEach(
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
        Object.assign(task.config, this.getScheduldedTimesOnResource(tasks, task, selectedResource));
        deltaCost = deltaCost - [this.taskUtils.findTaskExecutionCostOnResource(task, selectedResource) - this.taskUtils.findMinTaskExecutionCost(task)]
      }
    );
  }

  isProcesorAdmisible(task, procesor, maxBudget) {
    return this.taskUtils.findTaskExecutionCostOnResource(task, procesor) <= maxBudget;
  }

  decorateTasksWithSubdeadline(tasks, userDeadline) {
    tasks.forEach(task => {
      if(task.subDeadline === undefined) this.computeSubDeadline(tasks, task, userDeadline);
    });
  }

  computeSubDeadline(tasks, task, userDeadline) {
    // Path do exit task??
    let successors = tasks.filter( x => x.level === task.level + 1);

    if(successors.length === 0) {
      task.subDeadline = userDeadline;
    } else {
      let successorSubDeadlines = successors.map( x => this.findOrComputeSubDeadline(tasks, x, userDeadline));
      task.subDeadline = Math.min(...successorSubDeadlines);
    }

    return task.subDeadline;
  }

  findOrComputeSubDeadline(tasks, task, userDeadline) {
    let minExecutionTime = this.taskUtils.findMinTaskExecutionTime(task);
    let subDeadline;
    let originalTask = tasks.find( x => x.config.id === task.config.id);
    if(originalTask.subDeadline === undefined) {
      subDeadline = this.computeSubDeadline(tasks, originalTask, userDeadline);
    } else {
      subDeadline = originalTask.subDeadline;
    }
    // Average communication time = 0
    return (subDeadline - minExecutionTime);
  }

  decorateTasksWithUpwardRank(tasks) {
    tasks.forEach(task => {
      if(task.upwardRank === undefined) this.computeUpwardRank(tasks, task);
    });
  }

  computeUpwardRank(tasks, task) {
    let averageExecutionTime = this.computeAverageExecutionTime(task);
    let successors = tasks.filter( x => x.level === task.level + 1);

    if(successors.length === 0) {
      task.upwardRank = averageExecutionTime;
    } else {
      let successorRanks = successors.map( x => this.findOrComputeRank(tasks, x));
      task.upwardRank = averageExecutionTime + Math.max(...successorRanks);
    }

    return task.upwardRank;
  }

  findOrComputeRank(tasks, task) {
    // Average communication time = 0
    let originalTask = tasks.find( x => x.config.id === task.config.id);
    if(originalTask.upwardRank === undefined) {
      return this.computeUpwardRank(tasks, originalTask);
    } else {
      return originalTask.upwardRank;
    }
  }

  computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor) {
    let timeQuality = this.computeTimeQuality(tasks, task, functionType);
    let costQuality = this.computeCostQuality(tasks, task, functionType);

    return timeQuality + costQuality * costEfficientFactor;
  }
}

module.exports = SDBCS;
