setwd('/Users/yoshimori/Desktop/Magisterka/New/CloudFunctionOptimizer/plots')
library('ggplot2')
types = read.table("./data/limit.csv",header = TRUE)

user_price=0.002426110571

types
types$type <- factor(types$type, levels = types$type[order(types$time)])

ggplot(types, aes(x = type, y=price)) + geom_bar(stat="identity", fill = "#69f45d") + geom_hline(yintercept = user_price) + ylab("Price in dollars") + xlab("Function type")

#ggsave("compare-prices-small.pdf", width = 9, height = 9, units = "cm")
#
# average_budget_limit=0.002426110571