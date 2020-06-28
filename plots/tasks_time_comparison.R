setwd('/Users/yoshimori/Studyspace/Magisterka/CloudFunctionOptimizer/plots')
library('ggplot2')
library(grid)
library(gridExtra)
library(cowplot)

csv_256_results = read.table("../../results/output256/real_avg_execution.csv",header = TRUE)
csv_512_results = read.table("../../results/output512/real_avg_execution.csv",header = TRUE)
csv_1024_results = read.table("../../results/output1024/real_avg_execution.csv",header = TRUE)
csv_1536_results = read.table("../../results/output1536/real_avg_execution.csv",header = TRUE)
csv_2048_results = read.table("../../results/output2048/real_avg_execution.csv",header = TRUE)
csv_2560_results = read.table("../../results/output2560/real_avg_execution.csv",header = TRUE)
csv_3008_results = read.table("../../results/output3008/real_avg_execution.csv",header = TRUE)
csv_256_results = csv_256_results[order(csv_256_results$id),]
csv_256_results$type <- 256
csv_512_results = csv_512_results[order(csv_512_results$id),]
csv_512_results$type <- 512
csv_1024_results = csv_1024_results[order(csv_1024_results$id),]
csv_1024_results$type <- 1024
csv_1536_results = csv_1536_results[order(csv_1536_results$id),]
csv_1536_results$type <- 1536
csv_2048_results = csv_2048_results[order(csv_2048_results$id),]
csv_2048_results$type <- 2048
csv_2560_results = csv_2560_results[order(csv_2560_results$id),]
csv_2560_results$type <- 2560
csv_3008_results = csv_3008_results[order(csv_3008_results$id),]
csv_3008_results$type <- 3008
results <- rbind(csv_256_results, csv_512_results, csv_1024_results, csv_1536_results, csv_2048_results, csv_2560_results, csv_3008_results)
results = results[order(results$type), ]
projects = unique(results$task)
ggplot(results, aes(x=id, y=time, group = type, colour=as.factor(type))) + geom_point() + scale_x_continuous(breaks=c(10, 27, 28, 29, 39, 40, 41, 42, 43), labels=projects) + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + labs(x = "Task names", y = "Time in ms", colour = "Functions") + ylim(0, 10000)

p1 = ggplot(csv_256_results, aes(x=id, y=time)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + ylim(0, 10000) + labs(x = "Task ID", y = "Time in ms")
p2 = ggplot(csv_512_results, aes(x=id, y=time)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + ylim(0, 10000) + labs(x = "Task ID", y = "Time in ms")
p3 = ggplot(csv_1024_results, aes(x=id, y=time)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + ylim(0, 10000) + labs(x = "Task ID", y = "Time in ms")
p4 = ggplot(csv_1536_results, aes(x=id, y=time)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + ylim(0, 10000) + labs(x = "Task ID", y = "Time in ms")
p5 = ggplot(csv_2048_results, aes(x=id, y=time)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + ylim(0, 10000) + labs(x = "Task ID", y = "Time in ms")
p6 = ggplot(csv_2560_results, aes(x=id, y=time)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + ylim(0, 10000) + labs(x = "Task ID", y = "Time in ms")
p7 = ggplot(csv_3008_results, aes(x=id, y=time)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + ylim(0, 10000) + labs(x = "Task ID", y = "Time in ms")

plot_grid(p1, p2, p3, p4, p5, p6, p7, labels=c("256", "512", "1024", "1536", "2048", "2560", "3008"), ncol = 2, nrow = 4)

