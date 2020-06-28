setwd('/Users/yoshimori/Desktop/Magisterka/New/CloudFunctionOptimizer/plots')
library('ggplot2')
types = read.table("./data/all_results.csv",header = TRUE)
titles = types[seq(1,21,3),1]
#titles = c("256", "512", "1024", "1536", "2048", "2560", "3008")
limit_time <- types[seq(1,21,3),2]
limit_price <- types[seq(1,21,3),3]
real_time <- types[seq(2,21,3),2]
real_price <- types[seq(2,21,3),3]
sdbws_time <- types[seq(3,21,3),2]
sdbws_price <- types[seq(3,21,3),3]

x <- data.frame("Real" = real_price, "Limit" = limit_price, "SDBWS" = sdbws_price)
str(x)
matrix = t(data.matrix(x))
colnames(matrix) <- titles
barplot(matrix,
        main = "Execution cost",
        xlab = "Functions",
        col = c("blue","red", "green"),
        beside = TRUE)
leg =  legend("topleft",
              c("Real","Limit", "SDBWS"),
              fill = c("blue","red", "green"))
