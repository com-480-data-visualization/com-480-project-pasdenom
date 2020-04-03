# Milestone 1

## Dataset

The main dataset we will use is The Movies Dataset, found at https://www.kaggle.com/rounakbanik/the-movies-dataset/data#movies_metadata.csv. It is an ensemble of data collected from TMDB and GroupLens, offering various informations on 45000 movies including budget and revenues, production countries, actors and many other. A more detailed look at the dataset will be given in the data_processing notebook.
It is also worth mentioning this dataset comprehends a subset of ratings from 700 users on 9000 movies, only a small fraction of the full ratings dataset called The FullMovies Dataset (https://grouplens.org/datasets/movielens/latest/). We don't know yet if we will explore this perspective on cinema but we think it is important to mention the availability of such a dataset (comprehending 27,000,000 ratings and 1,100,000 tag applications applied to 58,000 movies by 280,000 users).

## Problematic

Our goal is to explore the history of cinema and its evolution over time from multiple perspectives. Movies are not just the final product you watch at cinema or home on your TV but an entire industry connecting people from all around the world. In this project, we would like to explore this complexity by offering a pluridimensional view through time, from the beginning of cinema to the present days.

From a technical point of view, our goal is to offer an interactive experience where users can walk through time and observe the evolution of cinema from different point of view, focusing on just a small subset of movies, on a particular period of time or on a specific angle. The idea is to link the different visualizations between them to offer users more control on how they want to watch the Story of Cinema.

Our target audience would be anyone interested in cinema, even without having concrete knowledges. You are not required to have watched a lot of movies to understand and enjoye the experience we are offering but the ones who have will certainly be pleased to discover more about their passion.

## Exploratory data analysis

The exploratory data analysis will be conducted in more details in the [dedicated notebook](./data_processing.ipynb). Here we only summarize the main insights we have found so far on the dataset:
* the distribution of movies released each year increases linearly until 1990 where there is a huge increase (by a factor of 4)
* most of the movies in the dataset have been produced in the US, in English
* only 7000 movies have informations about budget and revenues
* the popularity score is heavily skewed towards low values while the average users' vote seems normally distributed around 6
* the only information available about the cast are the actor's gender (coded as 1 for Women, 2 for Men and 0 for Undefined)

It goes without saying that this first exploratory analysis has given us multiple ideas to dive deeper into the data and create powerful visualizations to tell the Story of Cinema.

## Related work

In the kernel section of The Movies Dataset you can find a kernel named "The Story of Film" (https://www.kaggle.com/rounakbanik/the-story-of-film). This notebook is about a data analysis as you could find in the ADA course. Our idea is to create a nice visualization to help the user to travel around the history of the cinema. The problem with notebooks is that this support is totally non user-friendly and finding an information in the middle of the whole dataset is complicated, due to its linearity. Nonetheless this work has been of great help to preprocess and better understand the dataset.

As a first step we are going to only focus on given attributes of movies (production countries, budget and revenues, role distribution, etc...). We have found some interesting visualizations about cinema to motivate our choice and inspire us. A visualization about dialog by gender in Disney movies can be found at https://pudding.cool/2017/03/film-dialogue/. We would like to have something similar but easily connectable to other data. An efficient visualization about film costs is shown at https://tdwi.org/articles/2019/10/09/bi-all-visualization-movie-series.aspx. Our goal is to put all those information together with success. Finally, the exercise of week 5 with the multiple time-series data and multiple area charts has also inspired us to have this pluridimensional aspect, with various visualizations (of different kinds such as graphs or maps) linked and interconnected.

To summarize, our main goal is not simply to offer a diversity of visualizations patched together without real connections but instead offer the user an interactive experience where he can walk through the Story of Cinema, observing its multiple dimensions and direcly acting on the narrative he wants to follow.
