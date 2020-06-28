setwd('/Users/yoshimori/Desktop/Magisterka/New/CloudFunctionOptimizer/plots')
library('ggplot2')
csv = read.table("./data/all_results_2.csv",header = TRUE)
x <- csv$time
y <- csv$price
head(iris)
head(csv)
ggplot(csv, aes(x=time, y=price, color=function., shape=type)) +
  geom_point()
