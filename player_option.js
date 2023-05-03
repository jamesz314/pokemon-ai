// to switch to another member in the party
export function switchPokemon(playerdata, playerid) {
    for (var j = 1; j < 6; j++) {
        var pokemon_j = playerdata['pokemon'][j]
        if ((pokemon_j['fainted'] == false) && (pokemon_j['isActive'] == false)) {
            stream.write(`>p${playerid} switch ${j + 1}`);
            break;
        }
    }
}

// choose a valid move
export function chooseMove(playerdata, id, index) {
    var moves = playerdata['pokemon'][0]['moveSlots']
    var volatiles = playerdata['pokemon'][0]['volatiles']
    var valid = false
    if ("twoturnmove" in volatiles) { // locked into two turn move
        stream.write(`>>p${id} move ${volatiles['twoturnmove']['move']}`)

    } else if ("lockedmove" in volatiles) { // locked into move
        stream.write(`>>p${id} move ${volatiles['lockedmove']['move']}`)

    } else {
        for (var j = 0; j < 4; j++) {
            if ((moves[(index + j) % 4]['disabled'] != true) && (moves[(index + j) % 4]['pp'] > 0)) { // find a useable move
                stream.write(`>p${id} move ${(index+j)%4 + 1}`);
                valid = true
                break;
            }
        }
        if (valid != true) { //no valid moves
            stream.write(`>p${id} move struggle`)
        }
    }
}