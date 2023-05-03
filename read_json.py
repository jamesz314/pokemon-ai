# import pandas as pd
# import numpy as np
import pdb
import os
import json
import time

# read in moves file
move_file = "dex/dex_moves2.json"
f = open(move_file)
dex_moves = json.load(f)
moves_count = len(dex_moves)

# read in moves lower case file
move_file_lc = "dex/dex_moves_lower_case.json"
f = open(move_file_lc)
dex_moves_lc = json.load(f)

# read in species file
species_file = "dex/dex_species2.json"
f = open(species_file)
dex_species = json.load(f)
species_count = len(dex_species)


data_input = [] # [pkm, hp, boosts, moves, status]
data_output = [] # [move1, 2, 3, 4, switch 2, 3, 4, 5, 6, move struggle]
output_mapping = [] # set invalid options to 0

data_dir = "data" # folder to read data from
model_data_dir = "model_data" # folder to send input data to

curr_time = time.time()
count = 0
for file in os.listdir(data_dir):

	f = open(os.path.join(data_dir, file))
	data = json.load(f)
	curr_input, curr_output, curr_mapping = [], [0] * 10, [0] * 10

	# read from file
	pokemon = data['pokemon']
	hp = data['hp']
	boosts = data['boosts']
	field = data['field']
	moves = data['moves']
	status = data['status']
	available_moves = data['available_moves']
	available_switch = data['available_switch']
	winrate = data['output']

	### convert to input
	# pokemon
	temp = []
	for pkm in pokemon:
		if len(pkm) >= 9 and pkm[:9] == 'gastrodon': # special case
			pkm = 'gastrodon'
		entry = dex_species.index(pkm)
		pkm_vector = [0] * species_count # create (species_count * 1) vector for each pokemon
		pkm_vector[entry] = 1
		temp.append(pkm_vector)
	curr_input.append(temp)

	# hp
	curr_input.append(hp)

	# boosts
	curr_input.append([boosts[0]["atk"], boosts[0]["def"], boosts[0]["spa"], boosts[0]["spd"], boosts[0]["spe"], boosts[0]["accuracy"], boosts[0]["evasion"],
					   boosts[1]["atk"], boosts[1]["def"], boosts[1]["spa"], boosts[1]["spd"], boosts[1]["spe"], boosts[1]["accuracy"], boosts[1]["evasion"]])

	# field

	# moves
	temp = []
	for m in moves:
		entry = dex_moves.index(m)
		vector = [0] * moves_count # create (moves_count * 1) vector for each move
		vector[entry] = 1
		temp.append(vector)
	curr_input.append(temp)

	# status
	temp = []
	for s in status:
		if len(s) > 0:
			temp.append(1)
		else:
			temp.append(0)
	curr_input.append(temp)

	### convert to output
	for i, w in enumerate(winrate):
		if i < len(available_moves): # move
			move_id = available_moves[i]
			if move_id == "struggle": # special case struggle
				curr_output[-1] = winrate[i]
				curr_mapping[-1] = 1
			elif type(move_id) != int: # other special cases like outrage
				move_index = moves.index(dex_moves[dex_moves_lc.index(move_id)])
				curr_output[move_index] = winrate[i]
				curr_mapping[move_index] = 1
			else: # other normal moves
				curr_output[move_id - 1] = winrate[i] # e.g. move 1 -> 0th pos on vector
				curr_mapping[move_id - 1] = 1
		
		else: # switch
			switch_id = available_switch[i - len(available_moves)]
			curr_output[switch_id + 2] = winrate[i] # e.g. switch 6 -> 8th pos on vector
			curr_mapping[switch_id + 2] = 1

	# add to dataset
	# data_input.append(curr_input)
	# data_output.append(curr_output)
	# output_mapping.append(curr_mapping)

	to_write_data = {"input": curr_input, "output": curr_output, "map": curr_mapping}

	with open(os.path.join(model_data_dir, file), "w") as outfile:
		outfile.write(json.dumps(to_write_data, indent=4))
	#count+= 1
	
#print(count)
#print(time.time() - curr_time)
# def load_dataset():
# 	return train_x, train_y, test_x, test_y


