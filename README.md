# Creating a Pokémon AI with Deep Reinforcement Learning

The set-up for a multi-input neural network is done by following: https://pyimagesearch.com/2019/02/04/keras-multiple-inputs-and-mixed-data/

Other than that and a few sample codes to run the simulator, all other code is written by myself.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

For using this project, you need to install Keras, Tensorflow and Numpy for Python

Additionally, pokemon-showdown needs to be downloaded through Node.

```
pip install keras
pip install numpy
pip install tensorflow
npm install pokemon-showdown
```

### Dataset
The data used for this project is generated through Pokémon showdown's simulate battle feature to self-play against itself.



### Code functionality

```
node dex.js
```
This will create the dex files for pokemon species and moves (already created)

```
node simulate.js
```
This script is used to simulate many pokemon battles and store the results to the folder "data".

```
python read_json.py
```
This script is used to modify the "data" folder into inputs available for the model (stored in folder "model_data")

```
python train.py
```
This will create Model.h5, the model file. (Sample one is in the folder model)

```
python test.py
```
This will print how often the agent chose a high-win rate move, the best move, or at least one of both.


