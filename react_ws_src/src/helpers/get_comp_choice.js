import rand_arr_elem from './rand_arr_elem'

// main function invoked by the game to smartly identify computer's next move
const get_comp_choice = function (win_sets, curr_choices, empty_cells_arr) {
	let choice;
	reset_local_states(); // To Do: delete - only for troubshooting

	if (empty_cells_arr.length === 8) {
		choice = rand_arr_elem(empty_cells_arr);
		random = true;
	}

	// Step 1: Check if there's any winning move
	if (!choice) {
		choice = check_win_move (win_sets, curr_choices);
	}

	// Step 2: If previous step unsuccessful, check if there's any defending move
	if (!choice) {
		choice = check_defend_move (win_sets, curr_choices);
	}

	// Step 3: If previous step unsuccessful, plan a next move as per the winning set data
	if (!choice) {
		choice = check_win_strategy (win_sets, curr_choices);
	}

	// Step 4: Failover mechanism: if everything fails choose the next move randomly
	if (!choice) {
		choice = rand_arr_elem(empty_cells_arr);
		random = true;
	}

	// To Do: Dev Delete - For dev purposes to identify which mode worked out in each computer's move
	console.log(`%c Winning Selection: ${win} | Defensive Selection: ${defend} | Strategtic Selection: ${strategy}| Random Selection: ${random} | Comp_Choice: ${choice}`, 'color: blue');

	return choice;
	
}

export default get_comp_choice

let random = false;
let win = false;
let strategy = false;
let defend = false;

// identify computer's last move to win the game
const check_win_move = (win_sets, curr_choices) => {
	let choice;
	const win_sets_arr = JSON.parse(JSON.stringify(win_sets));

	for(let i = 0; i< win_sets_arr.length; i += 1) {
		win_sets_arr[i] = win_sets_arr[i].filter(item => (curr_choices[item] === 'o'))
		if (win_sets_arr[i].length === 2 ) {
			const choice_option_arr =  win_sets[i].filter(item => (win_sets_arr[i].indexOf(item) === -1 && typeof curr_choices[item] === 'undefined'));

			if (choice_option_arr.length > 0) {
				choice = choice_option_arr[0];
				win = true;
				break;
			}
			
		}
	}

	return choice
}

// identify computer's next move to defend
const check_defend_move = (win_sets, curr_choices) => {
	let choice;
	const win_sets_arr = JSON.parse(JSON.stringify(win_sets));
	
	for (const key of Object.keys(curr_choices)) {
		if (curr_choices[key] === 'x') {
			for(let i = 0; i< win_sets_arr.length; i += 1) {
				win_sets_arr[i] = win_sets_arr[i].filter(item => item !== key)
				if (win_sets_arr[i].length === 1 && typeof curr_choices[win_sets_arr[i][0]] === 'undefined') {
					defend = true;
					choice = win_sets_arr[i][0];
					break;
				}
			}
		}
	}

	return choice;
}


const has_one_cell_selected = (win_sets_arr, curr_choices) => {
	let result = false;

	for(let i = 0; i < win_sets_arr.length; i += 1) {
		if (curr_choices[win_sets_arr[i]] === 'o') {
			result = true;
		}
	}
	return result;
}

// identify computer's next move as per the win strategy
const check_win_strategy = (win_sets, curr_choices) => {
	let choice;
	const win_sets_arr = JSON.parse(JSON.stringify(win_sets));
	
	for(let i = 0; i< win_sets_arr.length; i += 1) {
		let arr = JSON.parse(JSON.stringify(win_sets_arr[i]));
		win_sets_arr[i] = win_sets_arr[i].filter(item => (curr_choices[item] === 'o' || typeof curr_choices[item] === 'undefined'))

		if (win_sets_arr[i].length === 3 && has_one_cell_selected(win_sets_arr[i], curr_choices)) {
			choice = typeof curr_choices[win_sets_arr[i][0]] === 'undefined' ? win_sets_arr[i][0] : typeof curr_choices[win_sets_arr[i][1]] === 'undefined' ?  win_sets_arr[i][1] : win_sets_arr[i][2];
			strategy = true;
			break;
		}
	}

	return choice;
}

// To Do: delete - only for troubshooting
const reset_local_states = () => {
	random = false;
	win = false;
	defend = false;
	strategy = false;
}