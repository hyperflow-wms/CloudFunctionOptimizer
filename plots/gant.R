setwd('/Users/yoshimori/Desktop/Magisterka/New/CloudFunctionOptimizer')
library('ggplot2')
tasks = read.table("./output3008/parsed/logs_real_3.csv",header = TRUE)
min_start = min(tasks$start)
tasks$start=(tasks$start-min_start)/1000
tasks$end=(tasks$end-min_start)/1000
tasks = tasks[order(tasks$start),]
tasks$machine = 0
maxmachine=1
for(i in 1:nrow(tasks))
{
  st = tasks$start[i]
  last_tasks = aggregate(end ~ machine, data = tasks, max)
  busy = last_tasks[last_tasks$end < st & last_tasks$machine != 0,]
  print(st)
  print(busy)
  if (nrow(busy)==0)
  {
    tasks$machine[i] = maxmachine
    maxmachine = maxmachine+1
  }
  else tasks$machine[i] = busy$machine[1]
}
tasks

ggplot(tasks, aes(colour=task)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + scale_y_discrete(labels=tasks$task) + theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))
# + geom_text(aes(x=time, y=id, label = task), color = "gray20", data = tasks)
# + theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))

#ggplot(tasks, aes(colour=resource)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + theme (axis.text.y = element_text(size=10)) + scale_color_continuous(name="", breaks = c(256, 512, 1024, 2048), labels = c(256, 512, 1024, 2048), low="blue", high="red")
#+ theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))

#ggplot(tasks, aes(colour=task)) + geom_segment(aes(x=start, xend=end, y=machine, yend=machine), size=3) + xlab("Time in seconds") + ylab("Machine") + scale_y_discrete(labels=1:maxmachine) + theme (axis.text.y = element_text(size=10)) + theme(legend.justification=c(1,0), legend.position="right") + theme(legend.text = element_text(size = 8))
# ggsave("logs_real_3.pdf", width = 16, height = 24, units = "cm")

#ggsave("plot121.pdf", width = 16, height = 24, units = "cm")
#ggsave("plot10.emf", width = 8, height = 12, units = "cm")