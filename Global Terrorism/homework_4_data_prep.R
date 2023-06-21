library(tidyverse)
library(magrittr)

input_data <- read_csv("/home/cam/Documents/ECS 163/Homework 4/public/Data/globalterrorismdb_0718dist.csv")

input_data %<>% select(eventid,iyear,latitude,longitude,summary,success,
                       suicide,attacktype1_txt,targtype1_txt,weaptype1_txt,nkill)
input_data %<>% filter(iyear >= 2010,nkill > 0) %>% drop_na(latitude)

write_csv(input_data,"/home/cam/Documents/ECS 163/Homework 4/public/Data/global_terrorism.csv")
