import json
import os
import pdb
import numpy as np

def load_dataset(data_dir):
	count = 0
	# all_input, all_output, all_mapping = np.array([]), np.array([]), np.array([])
	all_input, all_output, all_mapping = [], [], []
	#all_pkm, all_hp, all_boost, all_move, all_status, all_output, all_mapping = [], [], [], [], [], [], []

	for file in os.listdir(data_dir):
		f = open(os.path.join(data_dir, file))
		data = json.load(f)
		# convert to numpy arrays
		curr_input = data['input']
		for i, _ in enumerate(curr_input[0]):
			curr_input[0][i] = np.asarray(curr_input[0][i])
		#curr_input[0] = np.asarray(curr_input[0])
		#curr_input[1] = np.asarray(curr_input[1])
		#curr_input[2] = np.asarray(curr_input[2])
		for i, _ in enumerate(curr_input[3]):
			curr_input[3][i] = np.asarray(curr_input[3][i])
		#curr_input[3] = np.asarray(curr_input[3])
		#curr_input[4] = np.asarray(curr_input[4])
		curr_mapping = np.asarray(data['map'])
		curr_input.append(curr_mapping)
		curr_input = np.array([np.array(val) for val in curr_input])

		#curr_input = np.asarray(curr_input, dtype=object)
		# curr_pkm = np.asarray(curr_input[0])
		# curr_hp = np.asarray(curr_input[1])
		# curr_boost = np.asarray(curr_input[2])
		# curr_move = np.asarray(curr_input[3])
		# curr_status = np.asarray(curr_input[4])
		curr_output = np.asarray(data['output'])
		

		# all_pkm.append(curr_pkm)
		# all_hp.append(curr_hp)
		# all_boost.append(curr_boost)
		# all_move.append(curr_move)
		# all_status.append(curr_status)
		all_input.append(curr_input)
		all_output.append(curr_output)
		# all_mapping.append(curr_mapping)
		# all_input = np.append(all_input, curr_input, axis=0)
		# all_output = np.append(all_output, curr_output, axis=0)
		# all_mapping = np.append(all_mapping, curr_mapping, axis=0)
		#pdb.set_trace()
		# count += 1
		# if count >= 20:
		# 	break

	#all_input = np.array([np.array(val) for val in all_input])
	return np.asarray(all_input), np.asarray(all_output)# , np.asarray(all_mapping)
	#return all_input, np.asarray(all_output), np.asarray(all_mapping)
	#return np.asarray(all_pkm), all_hp, all_boost, all_move, all_status, all_output, all_mapping


# data_dir = "model_data"
# test1, test2, test3 = load_dataset(data_dir)
# pdb.set_trace()
