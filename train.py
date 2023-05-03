import numpy as np
import keras
from keras.models import Sequential
from keras import Model, Input
from keras import initializers
from keras import optimizers
from keras.utils import plot_model
from keras.layers import *
from sklearn.model_selection import train_test_split
#from keras.utils import normalize
import tensorflow as tf

from load_data import load_dataset
import pdb



data_dir = "model_data"
x, y = load_dataset(data_dir)
# x = np.asarray(x, dtype=object)
# y = np.asarray(y, dtype=object)
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.1, random_state=1)
x_train_pkm = x_train[:, 0]
x_train_pkm = np.array([np.array(val) for val in x_train_pkm])
x_train_hp = x_train[:, 1]
x_train_hp = np.array([np.array(val) for val in x_train_hp])
x_train_boost = x_train[:, 2]
x_train_boost = np.array([np.array(val) for val in x_train_boost])
x_train_move = x_train[:, 3]
x_train_move = np.array([np.array(val) for val in x_train_move])
x_train_status = x_train[:, 4]
x_train_status = np.array([np.array(val) for val in x_train_status])
x_train_mask = x_train[:, 5]
x_train_mask = np.array([np.array(val) for val in x_train_mask])

x_test_pkm = x_test[:, 0]
x_test_pkm = np.array([np.array(val) for val in x_test_pkm])
x_test_hp = x_test[:, 1]
x_test_hp = np.array([np.array(val) for val in x_test_hp])
x_test_boost = x_test[:, 2]
x_test_boost = np.array([np.array(val) for val in x_test_boost])
x_test_move = x_test[:, 3]
x_test_move = np.array([np.array(val) for val in x_test_move])
x_test_status = x_test[:, 4]
x_test_status = np.array([np.array(val) for val in x_test_status])
x_test_mask = x_test[:, 5]
x_test_mask = np.array([np.array(val) for val in x_test_mask])
#pdb.set_trace()


# multi-input neural network, idea from:
# https://pyimagesearch.com/2019/02/04/keras-multiple-inputs-and-mixed-data/
print("_____start_of_training_____")

# different inputs
input_species = Input(shape=(12,865))
input_hp = Input(shape=(12,))
input_boost = Input(shape=(14,))
input_move = Input(shape=(4,665))
input_status = Input(shape=(6,))
input_mask = Input(shape=(10,))


# species
x = Conv1D(filters=6, kernel_size=1)(input_species)
x = Activation("relu")(x)
x = BatchNormalization()(x)
x = Flatten()(x)
x = Dense(48)(x)
x = Activation("relu")(x)
x = BatchNormalization()(x)
x = Dense(12)(x)
x = Activation("softmax")(x)
model_species = Model(input_species, x)

# hp
x = Dense(6, activation="relu")(input_hp)
x = Dense(3, activation="relu")(x)
x = Dense(1, activation="linear")(x)
model_hp = Model(input_hp, x)

# boost
x = Dense(7, activation="relu")(input_boost)
x = Dense(3, activation="relu")(x)
x = Dense(1, activation="linear")(x)
model_boost = Model(input_boost, x)

# move
x = Conv1D(filters=4, kernel_size=1)(input_move)
x = Activation("relu")(x)
x = BatchNormalization()(x)
x = Flatten()(x)
x = Dense(16)(x)
x = Activation("relu")(x)
x = BatchNormalization()(x)
x = Dense(4)(x)
x = Activation("softmax")(x)
model_move = Model(input_move, x)


# status
x = Dense(3, activation="relu")(input_status)
x = Dense(1, activation="linear")(x)
model_status = Model(input_status, x)

# final model
combined = concatenate([model_species.output, model_hp.output, model_boost.output, model_move.output, model_status.output])
z = Dense(10, activation="softmax")(combined)
z = Multiply()([z, input_mask])
z = Lambda(lambda t: t/tf.linalg.norm(t,ord=1))(z)

model = Model(inputs=[input_species, input_hp, input_boost, input_move, input_status, input_mask], outputs=z)
#print(model.summary())



model.compile(loss="categorical_crossentropy", optimizer=optimizers.Adam(learning_rate=0.001), metrics=['categorical_accuracy'])

#pdb.set_trace()
model.fit([x_train_pkm, x_train_hp, x_train_boost, x_train_move, x_train_status, x_train_mask], y_train, epochs=20, verbose=1) #, validation_split=0.1)
score = model.evaluate([x_test_pkm, x_test_hp, x_test_boost, x_test_move, x_test_status, x_test_mask], y_test, verbose=1)
print(score)
model.save("Model.h5")
# print(model.predict([x_test_pkm, x_test_hp, x_test_boost, x_test_move, x_test_status, x_test_mask]))
# print(y_test)

print("_____end_of_training_____")

