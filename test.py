import numpy as np
import keras
from keras.models import Model, load_model
from load_data import load_dataset
import pdb
import os
import json
# Load the trained model.
loaded_model = load_model("model/Model.h5")
#loaded_model.set_weights(loaded_model.get_weights())

#new_model = Model(loaded_model.inputs, loaded_model.layers.output)


data_dir = "model_data"
# for file in os.listdir(data_dir):
# 	print(file)
# 	f = open(os.path.join(data_dir, file))
# 	data = json.load(f)
x, y = load_dataset(data_dir)

x_pkm = x[:, 0]
x_pkm = np.array([np.array(val) for val in x_pkm])
x_hp = x[:, 1]
x_hp = np.array([np.array(val) for val in x_hp])
x_boost = x[:, 2]
x_boost = np.array([np.array(val) for val in x_boost])
x_move = x[:, 3]
x_move = np.array([np.array(val) for val in x_move])
x_status = x[:, 4]
x_status = np.array([np.array(val) for val in x_status])
x_mask = x[:, 5]
x_mask = np.array([np.array(val) for val in x_mask])

y_predict = loaded_model.predict([x_pkm, x_hp, x_boost, x_move, x_status, x_mask])
total_amt = len(y)
correct_amt = 0
best_amt = 0
best_or_correct = 0

for i, predict in enumerate(y_predict):
	argmax = np.argmax(predict)
	if y[i][argmax] >= 0.5:
		correct_amt += 1
	if y[i][argmax] == max(y[i]):
		best_amt += 1
	if y[i][argmax] >= 0.5 or y[i][argmax] == max(y[i]):
		best_or_correct += 1


print("high win rate move accuracy:", correct_amt / total_amt)
print("best move accuracy:", best_amt / total_amt)
print("best or high win rate move chosen:", best_or_correct / total_amt)
