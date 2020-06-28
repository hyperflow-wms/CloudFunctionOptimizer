setwd('/Users/yoshimori/Studyspace/Magisterka')
library('ggplot2')

planned_execution = read.table("./results/ellipsoids/3/sdbws_x5/results/step4/sdbws-AWS_256_512_1024_1536_2048_2560_3008x5/planned_execution.csv",header = TRUE)
real_execution = read.table("./results/ellipsoids/3/sdbws_x5/results/step4/sdbws-AWS_256_512_1024_1536_2048_2560_3008x5/average_execution.csv",header = TRUE)

# Prepare planned data
planned_execution$start=planned_execution$start/1000
planned_execution$end=planned_execution$end/1000

# Prepare real execution data
real_execution$start=real_execution$start/1000
real_execution$end=real_execution$end/1000

# Sort
real_execution = real_execution[order(real_execution$id),]
planned_execution = planned_execution[match(real_execution$id, planned_execution$id),]

# ggplot(planned_execution, aes(time, factor(id), color=task)) + scale_y_discrete(breaks=factor(planned_execution$id), labels = planned_execution$task) + geom_segment(aes(x=start, xend=end, y=factor(1:nrow(planned_execution)), yend=factor(1:nrow(planned_execution))), size=3, alpha=0.3)
p <- ggplot(planned_execution, aes(time, factor(id), colour=id)) + geom_segment(aes(x=start, xend=end, y=factor(1:nrow(planned_execution)), yend=factor(1:nrow(planned_execution))), size=3, alpha=0.3) + xlab("Time in seconds") + ylab("Task") + scale_y_discrete(breaks=factor(planned_execution$id), labels=planned_execution$task) + theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))
p <- p + geom_segment(data=real_execution, aes(x=start, xend=end, y=factor(1:nrow(real_execution)), yend=factor(1:nrow(real_execution))), size=3, alpha=0.7)
p                      

