// create files to store all species and moves that are available


const {Dex} = require('pokemon-showdown');
const fs = require("fs");

// const tackle = Dex.moves.get('Tackle');
// const flamethrower = Dex.moves.get('Flamethrower');
// const dragonite = Dex.
const all_species = Dex.species.all()
const all_moves = Dex.moves.all()


// console.log(tackle.basePower); // prints 40
// console.log(all_moves.length)
// console.log(all_moves[0])

spec_json = JSON.parse(JSON.stringify(all_species, null, '\t'))
move_json = JSON.parse(JSON.stringify(all_moves, null, '\t'))

let spec_names = []
let move_names = []

spec_json.forEach(function(item) {
	if (item["tier"] != "Illegal") {
		spec_names.push(item['id'])
	}
})

move_json.forEach(function(item) {
	if (item["isNonstandard"] === null) {
		move_names.push(item['name'])
	}
})

// full set
// fs.writeFileSync(`dex_species.json`, JSON.stringify(all_species, null, '\t'));
// fs.writeFileSync(`dex_moves.json`, JSON.stringify(all_moves, null, '\t'));

// // currently available set, only names
// fs.writeFileSync(`dex_species2.json`, JSON.stringify(spec_names, null, '\t'));
// fs.writeFileSync(`dex_moves2.json`, JSON.stringify(move_names, null, '\t'));

// lower case moves
let lower_case_moves = []
move_json.forEach(function(item) {
	if (item["isNonstandard"] === null) {
		lower_case_moves.push(item['id'])
	}
})
fs.writeFileSync(`dex/dex_moves_lower_case.json`, JSON.stringify(lower_case_moves, null, '\t'));