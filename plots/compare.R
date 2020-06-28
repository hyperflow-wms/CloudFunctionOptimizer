setwd('/Users/yoshimori/Desktop/Magisterka/New/CloudFunctionOptimizer/plots')
library('ggplot2')
types = read.table("./data/compare_all.csv",header = TRUE)
user_price=0.002426110571
user_time=32029
types
types$type <- factor(types$type, levels = types$type[order(types$time)])
#ggplot(types, aes(x = type, y=time)) + geom_bar(position="dodge", stat="identity", fill = "#66a0ff") + geom_hline(yintercept = user_time) + ylab("Time in seconds") + xlab("Function type")
ggplot(types, aes(x = type, y=price)) + geom_bar(stat="identity", fill = "#69f45d") + geom_hline(yintercept = user_price) + ylab("Price in dollars") + xlab("Function type")

#+ theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))

#ggsave("compare-prices-small.pdf", width = 9, height = 9, units = "cm")
#ggsave("compare-times-small.pdf", width = 9, height = 9, units = "cm")
#ggsave("compare-times.pdf", width = 16, height = 20, units = "cm")
# average_user_time = 32029
# average_budget_limit=0.002426110571