const fs = require("fs")
const { Console } = require("console") 
// var args = process.argv.slice(2) // read battle commands from argv
// const clonedeep = require('lodash.clonedeep');

const Sim = require('pokemon-showdown');

//console.log(stream);
console.log("----------------------------------------------------------------------");
console.log("----------------------------------------------------------------------");

// this prints out all the stream
// (async () => {
//     for await (const output of stream) {
//         console.log(output);
//     }
// })();

// add commands to the stream
// args.forEach(function(value, index) {
//     stream.write(value);
//     if (value.startsWith(">p1 ") | (value.startsWith(">p2 "))) {
//         fs.writeFileSync(`choice${index}.json`, JSON.stringify(stream, null, '\t'));
//         //console.log(JSON.stringify(stream, null, '\t'))
//     }
// })


// list all possible switch targets; to switch to another member in the party
function switchPokemon(playerdata, playerid) {
    var available_pkm = [] // store available targets to switch

    for (var j = 1; j < 6; j++) {
        var pokemon_j = playerdata['pokemon'][j]
        if ((pokemon_j['fainted'] == false) && (pokemon_j['isActive'] == false)) {
            available_pkm.push(j + 1)
            //stream.write(`>p${playerid} switch ${j + 1}`);
            //break;
        }
    }
    return available_pkm
}

// list all possible moves; choose a valid move
function chooseMove(playerdata, id) {
    var moves = playerdata['pokemon'][0]['moveSlots'] // move set data
    var volatiles = playerdata['pokemon'][0]['volatiles'] // niche cases data
    var available_moves = []; // store available moves

    if ("twoturnmove" in volatiles) { // locked into two turn move
        available_moves.push(volatiles['twoturnmove']['move'])
        //stream.write(`>>p${id} move ${volatiles['twoturnmove']['move']}`)

    } else if ("lockedmove" in volatiles) { // locked into move
        available_moves.push(volatiles['lockedmove']['move'])
        //stream.write(`>>p${id} move ${volatiles['lockedmove']['move']}`)

    } else {
        var valid = false // check if there is a valid move
        for (var j = 0; j < 4; j++) {
            if ((moves[j % 4]['disabled'] != true) && (moves[j % 4]['pp'] > 0)) { // find a useable move
                //stream.write(`>p${id} move ${(index+j)%4 + 1}`);
                valid = true
                available_moves.push(j%4 + 1)
                //break;
            }
        }
        if (valid != true) { //no valid moves
            available_moves.push("struggle")
            //stream.write(`>p${id} move struggle`)
        }
    }
    return available_moves
}

// random number generator from 0 to num-1
function randomOption(num) {
    return Math.floor(Math.random()*num)
}


// choose valid action
function chooseAction(playerdata, playerid, forceswitch, trapped) {

    if (forceswitch) { // must switch
        const available_switch = switchPokemon(playerdata, playerid);
        const switch_amt = available_switch.length;
        option = available_switch[randomOption(switch_amt)];
        action = `>p${playerid} switch ${option}`
        return [action, available_switch, []] // [action, all available switches, all available moves]
    
    } else {
        const available_moves = chooseMove(playerdata, playerid);
        const move_amt = available_moves.length;

        if (trapped) { // cant switch, move only
            option = available_moves[randomOption(move_amt)];
            action = `>p${playerid} move ${option}`
            return [action, [], available_moves] // [action, all available switches, all available moves]
        
        } else { // switch or move
            const available_switch = switchPokemon(playerdata, playerid);
            const switch_amt = available_switch.length;

            fulloption = randomOption(switch_amt + move_amt)
            if (fulloption < switch_amt) {
                option = available_switch[fulloption]
                action = `>p${playerid} switch ${option}`;
            } else {
                option = available_moves[fulloption - switch_amt]
                action = `>p${playerid} move ${option}`;
            }
            return [action, available_switch, available_moves] // [action, all available switches, all available moves]
        }
    }
    //stream.write(action)
    
}


// simulate a battle
function simBattle(stream) {
    for (var i = 0; i < 100; i++) { // stop after 100 turns/options
        //fs.writeFileSync(`test/test${i}.json`, JSON.stringify(stream, null, '\t'));
        var jsonfile = JSON.parse(JSON.stringify(stream, null, '\t'));
        
        var buf = jsonfile.buf
        var battle = jsonfile.battle
        var p1 = battle['sides'][0]
        var p2 = battle['sides'][1]

        if (battle['sentEnd'] == true) { // game ended, go to new game
            //console.log("GAME ENDED");
            return battle['winner'] // return winner
            break;
        } else if (buf[buf.length-1].includes("|error|")) { // an error occured
            console.log(`THERE IS AN ERROR ${i}`);
            fs.writeFileSync(`error${i}.json`, JSON.stringify(stream, null, '\t'));
            break;
        }

        // choose a valid option
        if (battle['requestState'] == 'switch') { // forced switch, either from a move or a faint
            if (p1['choice']['forcedSwitchesLeft'] > 0) {
                [action1, available_switch1, available_moves1] = chooseAction(p1, 1, true, false)
                stream.write(action1)
            }
            if (p2['choice']['forcedSwitchesLeft'] > 0) {
                [action2, available_switch2, available_moves2] = chooseAction(p2, 2, true, false)
                stream.write(action2)
            }
        } else {
            p1trapped = p1['pokemon'][0]['trapped'];
            p2trapped = p2['pokemon'][0]['trapped'];
            [action1, available_switch1, available_moves1] = chooseAction(p1, 1, false, p1trapped);
            [action2, available_switch2, available_moves2] = chooseAction(p2, 2, false, p2trapped);

            //fs.writeFileSync(`test/test${i}_1.json`, JSON.stringify(stream, null, '\t'));
            stream.write(action1)
            //fs.writeFileSync(`test/test${i}_2.json`, JSON.stringify(stream, null, '\t'));
            stream.write(action2)


        }

        // test
    }
}




var p1name = "Alice"
var p2name = "Bob"

let loop_amt = 11; // how many games to simulate for each move
let file_count = 20000; // for naming files
let data_folder = "data"; // folder to store state and choices
let max_turn = 100; // max turns for result storing

var d = new Date();
var curr_time = d.getTime();

for (var a = 0; a < 100; a++) { // start a new game with newly generated teams
    // get random seeds
    seed1 = randomOption(50000)
    seed2 = randomOption(50000)
    seed3 = randomOption(50000)
    seed4 = randomOption(50000)
    seed5 = randomOption(50000)
    seed6 = randomOption(50000)
    seed7 = randomOption(50000)
    seed8 = randomOption(50000)
    seed9 = randomOption(50000)
    seed10 = randomOption(50000)
    seed11 = randomOption(50000)
    seed12 = randomOption(50000)

    // store moves
    let log = [`>start {"formatid":"gen9randombattle", "seed":[${seed1},${seed2},${seed3},${seed4}]}`, 
        `>player p1 {"name":"${p1name}", "seed":[${seed5},${seed6},${seed7},${seed8}]}`, 
        `>player p2 {"name":"${p2name}", "seed":[${seed9},${seed10},${seed11},${seed12}]}`]

    
    for (var turn = 0; turn < max_turn; turn++) { // monte carlo tree search, explore best node at each branch
        stream = new Sim.BattleStream();

        // feed in selected moves
        log.forEach(item => stream.write(item));


        var jsonfile = JSON.parse(JSON.stringify(stream, null, '\t'));
        
        var battle = jsonfile.battle
        var p1 = battle['sides'][0]
        var p2 = battle['sides'][1]

        if (battle['sentEnd'] == true) { // game ended, go to new game
            //console.log("GAME ENDED");
            //winner = battle['winner'] // return winner
            stream._writeEnd() // kill stream
            break;

        } else {
            // get available moves
            let action1 = [];
            let action2 = [];
            let available_switch1 = [];
            let available_switch2 = [];
            let available_moves1 = [];
            let available_moves2 = [];
            let p1move = false;
            let p2move = false;
            let win1;
            let win2;

            if (battle['requestState'] == 'switch') { // forced switch, either from a move or a faint
                if (p1['choice']['forcedSwitchesLeft'] > 0) {
                    [action1, available_switch1, available_moves1] = chooseAction(p1, 1, true, false)
                    p1move = true;
                }
                if (p2['choice']['forcedSwitchesLeft'] > 0) {
                    [action2, available_switch2, available_moves2] = chooseAction(p2, 2, true, false)
                    p2move = true;
                }
            } else {
                p1trapped = p1['pokemon'][0]['trapped'];
                p2trapped = p2['pokemon'][0]['trapped'];
                [action1, available_switch1, available_moves1] = chooseAction(p1, 1, false, p1trapped);
                [action2, available_switch2, available_moves2] = chooseAction(p2, 2, false, p2trapped);
                p1move = true;
                p2move = true;
            }

            //get state
            let state = []

            // common state -> pkm name
            state.push([])
            p1['pokemon'].forEach(function(item) {
                state[0].push(item['speciesState']['id'])
            })
            p2['pokemon'].forEach(function(item) {
                state[0].push(item['speciesState']['id'])
            })

            // common state -> pkm hp
            state.push([])
            p1['pokemon'].forEach(function(item) {
                state[1].push(item['hp'] / item['maxhp'])
            })
            p2['pokemon'].forEach(function(item) {
                state[1].push(item['hp'] / item['maxhp'])
            })

            // common state -> boosts (status?)
            state.push([])
            state[2].push(p1['pokemon'][0]['boosts'])
            state[2].push(p2['pokemon'][0]['boosts'])
            

            // common state -> field effects
            state.push([])
            state[3].push(battle['field'])

            // separate state for each team
            let state1 = []
            let state2 = []

            if (p1move) { // add state for p1
                // -> first pokemon moves
                state1.push([])
                p1['pokemon'][0]['moveSlots'].forEach(function(item) {
                    state1[0].push(item['move'])
                })

                // -> status for team
                state1.push([])
                p1['pokemon'].forEach(function(item) {
                    state1[1].push(item['status'])
                })

                // -> available move
                state1.push(available_moves1)

                // -> available switch
                state1.push(available_switch1)


            } 
            if (p2move) { // add state for p2
                state2.push([])
                p2['pokemon'][0]['moveSlots'].forEach(function(item) {
                    state2[0].push(item['move'])
                })

                state2.push([])
                p2['pokemon'].forEach(function(item) {
                    state2[1].push(item['status'])
                })

                state2.push(available_moves2)
                state2.push(available_switch2)
            }


            // for each available move, loop 20 results
            stream._writeEnd() // kill stream

            if (p1move) {
                available_option1 = available_switch1.concat(available_moves1) // all options

                if (available_option1.length == 1) { // only one option, don't have to loop through options
                    if (available_switch1.length == 1) {
                        log.push(`>p1 switch ${available_option1[0]}`)
                    } else {
                        log.push(`>p1 move ${available_option1[0]}`)
                    }
                    state1.push([1])
                    

                } else {
                    var winrate1 = []; // store winrates for each option

                    for (var pos = 0; pos < available_option1.length; pos++) { // loop through turn options
                        win1 = 0;
                        win2 = 0;
                        var switch_length = available_switch1.length;

                        if (pos < switch_length) { // switch
                            command = `>p1 switch ${available_option1[pos]}`
                        } else {
                            command = `>p1 move ${available_option1[pos]}`
                        }

                        for (var loop1 = 0; loop1 < loop_amt; loop1++) { // loop through same option loop_amt times
                            stream = new Sim.BattleStream();
                            log.forEach(item => stream.write(item));
                            stream.write(command)
                            if (p2move) { // pick random move for p2 if needed
                                var switch_amt = available_switch2.length;

                                fulloption = randomOption(switch_amt + available_moves2.length)
                                if (fulloption < switch_amt) {
                                    option = available_switch2[fulloption]
                                    action = `>p2 switch ${option}`;
                                } else {
                                    option = available_moves2[fulloption - switch_amt]
                                    action = `>p2 move ${option}`;
                                }
                                stream.write(action)
                            }

                            winner = simBattle(stream);
                            if (winner == p1name) {
                                win1 = win1 + 1
                            } else if (winner == p2name) {
                                win2 = win2 + 1
                            }
                            stream._writeEnd() // kill stream
                        }

                        // store win rate for each option
                        if (win1 == 0) {
                            winrate1.push(0)
                        } else {
                            winrate1.push(win1/(win1+win2))
                        }

                        
                    } // end of loop for turn options

                    // pick move with best results, store move
                    // var cur_max = -1;
                    // var cur_pos = 0
                    // for (var pos = 0; pos < winrate1.length; pos++) {
                    //     if (winrate1[pos] > cur_max) {
                    //         cur_max = winrate1[pos]
                    //         cur_pos = pos
                    //     }
                    // }
                    var switch_length = available_switch1.length;
                    // if (cur_pos < switch_length) { // switch
                    //     command = `>p1 switch ${available_option1[cur_pos]}`
                    // } else {
                    //     command = `>p1 move ${available_option1[cur_pos]}`
                    // }
                    var random_choice = randomOption(available_option1.length)
                    if (random_choice < switch_length) {
                        log.push(`>p1 switch ${available_option1[random_choice]}`)
                    } else {
                        log.push(`>p1 move ${available_option1[random_choice]}`)
                    }
                    // log.push(command)
                    state1.push(winrate1)
                }

                // write state to file
                final_state = {"pokemon": state[0], "hp": state[1], "boosts": state[2], "field": state[3],
                               "moves": state1[0], "status": state1[1], "available_moves": state1[2], "available_switch": state1[3], "output": state1[4]}
                fs.writeFileSync(`${data_folder}/${file_count}_1.json`, JSON.stringify(final_state, null, '\t'));
                
            }
            // TODO: remove if added p2 state
            if (p2move) { // pick random move for p2 if needed
                // var switch_amt = available_switch2.length;

                // fulloption = randomOption(switch_amt + available_moves2.length)
                // if (fulloption < switch_amt) {
                //     option = available_switch2[fulloption]
                //     action = `>p2 switch ${option}`;
                // } else {
                //     option = available_moves2[fulloption - switch_amt]
                //     action = `>p2 move ${option}`;
                // }
                // log.push(action)
                available_option2 = available_switch2.concat(available_moves2) // all options

                if (available_option2.length == 1) { // only one option, don't have to loop through options
                    if (available_switch2.length == 1) {
                        log.push(`>p2 switch ${available_option2[0]}`)
                    } else {
                        log.push(`>p2 move ${available_option2[0]}`)
                    }
                    state2.push([1]) // push 100% chance of choosing move
                    

                } else {
                    var winrate2 = []; // store winrates for each option

                    for (var pos = 0; pos < available_option2.length; pos++) { // loop through turn options
                        win1 = 0;
                        win2 = 0;
                        var switch_length = available_switch2.length;

                        if (pos < switch_length) { // switch
                            command = `>p2 switch ${available_option2[pos]}`
                        } else {
                            command = `>p2 move ${available_option2[pos]}`
                        }

                        for (var loop = 0; loop < loop_amt; loop++) { // loop through same option loop_amt times
                            stream = new Sim.BattleStream();
                            log.forEach(item => stream.write(item));
                            if (p1move) { // pick random move for p1 if needed
                                var switch_amt = available_switch1.length;

                                fulloption = randomOption(switch_amt + available_moves1.length)
                                if (fulloption < switch_amt) {
                                    option = available_switch1[fulloption]
                                    action = `>p1 switch ${option}`;
                                } else {
                                    option = available_moves1[fulloption - switch_amt]
                                    action = `>p1 move ${option}`;
                                }
                                stream.write(action)
                            }
                            stream.write(command) // chosen action for p2

                            winner = simBattle(stream);
                            if (winner == p1name) {
                                win1 = win1 + 1
                            } else if (winner == p2name) {
                                win2 = win2 + 1
                            }
                            stream._writeEnd() // kill stream
                        }

                        // store win rate for each option
                        if (win2 == 0) {
                            winrate2.push(0)
                        } else {
                            winrate2.push(win2/(win1+win2))
                        }

                        
                    } // end of loop for turn options

                    // pick move with best results, store move
                    // var cur_max = -1;
                    // var cur_pos = 0
                    // for (var pos = 0; pos < winrate2.length; pos++) {
                    //     if (winrate2[pos] > cur_max) {
                    //         cur_max = winrate2[pos]
                    //         cur_pos = pos
                    //     }
                    // }
                    var switch_length = available_switch1.length;
                    // if (cur_pos < switch_length) { // switch
                    //     command = `>p2 switch ${available_option2[cur_pos]}`
                    // } else {
                    //     command = `>p2 move ${available_option2[cur_pos]}`
                    // }
                    var random_choice = randomOption(available_option2.length)
                    if (random_choice < switch_length) {
                        log.push(`>p2 switch ${available_option2[random_choice]}`) // push a random move
                    } else {
                        log.push(`>p2 move ${available_option2[random_choice]}`)
                    }
                    // log.push(command) // update log
                    state2.push(winrate2) // winrate/rough probability for each move
                }

                // write state to file
                final_state = {"pokemon": state[0].slice(6).concat(state[0].slice(0,6)), 
                               "hp": state[1].slice(6).concat(state[1].slice(0,6)), 
                               "boosts": state[2].slice(1).concat(state[2].slice(0,1)), 
                               "field": state[3],
                               "moves": state2[0], "status": state2[1], "available_moves": state2[2], "available_switch": state2[3], "output": state2[4]}
                fs.writeFileSync(`${data_folder}/${file_count}_2.json`, JSON.stringify(final_state, null, '\t'));
            }

            // for file naming purposes
            file_count = file_count + 1
            // to track how much has been stored
            if (file_count % 10 == 0) {
                d = new Date();
                console.log("file_count:", file_count)
                console.log("time (seconds):", (d.getTime() - curr_time) / 1000)
                curr_time = d.getTime();
            }

            
            
        }
    }
        

}


//console.log(JSON.stringify(stream));
//fs.writeFileSync('test5.json', JSON.stringify(stream, null, '\t'))

//console.log(`testing: ${process.argv[2]}`)


