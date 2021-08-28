import React, {Component} from 'react'

import io from 'socket.io-client'

import TweenMax from 'gsap'

import rand_arr_elem from '../../helpers/rand_arr_elem'
import rand_to_fro from '../../helpers/rand_to_fro'
import get_comp_choice from '../../helpers/get_comp_choice'


export default class SetName extends Component {

	constructor (props) {
		super(props)

		this.initStateObj = {
			cell_vals: {},
			next_turn_ply: true,
			game_play: true,
			game_stat: 'Start game',
			winner_set: []
		}

		this.win_sets = [
			['c1', 'c2', 'c3'],
			['c4', 'c5', 'c6'],
			['c7', 'c8', 'c9'],

			['c1', 'c4', 'c7'],
			['c2', 'c5', 'c8'],
			['c3', 'c6', 'c9'],

			['c1', 'c5', 'c9'],
			['c3', 'c5', 'c7']
		]


		if (this.props.game_type != 'live')
			this.state = JSON.parse(JSON.stringify(this.initStateObj))
		else {
			this.sock_start()

			this.state = {
				cell_vals: {},
				next_turn_ply: true,
				game_play: false,
				game_stat: 'Connecting'
			}
		}
	}

//	------------------------	------------------------	------------------------

	componentDidMount () {
    	TweenMax.from('#game_stat', 1, {display: 'none', opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeIn})
    	TweenMax.from('#game_board', 1, {display: 'none', opacity: 0, x:-200, y:-200, scaleX:0, scaleY:0, ease: Power4.easeIn})
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	sock_start () {

		this.socket = io(app.settings.ws_conf.loc.SOCKET__io.u);

		this.socket.on('connect', function(data) { 
			// console.log('socket connected', data)

			this.socket.emit('new player', { name: app.settings.curr_user.name });

		}.bind(this));

		this.socket.on('pair_players', function(data) { 
			// console.log('paired with ', data)

			this.setState({
				next_turn_ply: data.mode=='m',
				game_play: true,
				game_stat: 'Playing with ' + data.opp.name
			})

		}.bind(this));


		this.socket.on('opp_turn', this.turn_opp_live.bind(this));



	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	componentWillUnmount () {

		this.socket && this.socket.disconnect();
	}

//	------------------------	------------------------	------------------------

	cell_cont (c) {
		const { cell_vals } = this.state

		return (<div>
		        	{cell_vals && cell_vals[c]=='x' && <i className="fa fa-times fa-5x"></i>}
					{cell_vals && cell_vals[c]=='o' && <i className="fa fa-circle-o fa-5x"></i>}
				</div>)
	}

	check_cell_status (c) {
		let status = this.state.cell_vals[c] ? 'occupied' : this.state.winner_set.length > 0 ? 'game-over': 'empty';

		if (this.state.cell_vals[c] === 'x') {
			status = status + ' player';
		}

		if (this.state.cell_vals[c] === 'o') {
			status = status + ' comp';
		}

		if (status.indexOf('occupied') > -1 && this.state.winner_set.indexOf(c) > -1) {
			status = status + ' win';
		}
		return status;
	}

	get_game_stat_class () {
		let className = '';
		if (this.state.game_stat === 'Opponent win') {
			className = 'opponent-color';
		} else if (this.state.game_stat === 'You win') {
			className = 'player-color';
		} else if (this.state.game_stat === 'Draw') {
			className = 'game-draw';
		} 

		return className
	}

//	------------------------	------------------------	------------------------

	render () {
		const { cell_vals } = this.state
		// console.log(cell_vals)

		return (
			<div id='GameMain'>

				<h1>Play against: <span className="opponent-color">{this.props.game_type}</span></h1>

				<div id="game_stat">
					<div id="game_stat_msg" className={this.get_game_stat_class()}>{this.state.game_stat}</div>
					{this.state.game_play && <div id="game_turn_msg">{this.state.next_turn_ply ? `${app.settings.curr_user.name}'s turn` : 'Opponent turn'}</div>}
				</div>

				<div id="game_board">
					<table>
					<tbody>
						<tr>
							<td id='game_board-c1' ref='c1' className={this.check_cell_status('c1')} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c1')} </td>
							<td id='game_board-c2' ref='c2' className={`vbrd ${this.check_cell_status('c2')}`} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c2')} </td>
							<td id='game_board-c3' ref='c3' className={this.check_cell_status('c3')} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c3')} </td>
						</tr>
						<tr>
							<td id='game_board-c4' ref='c4' className={`hbrd ${this.check_cell_status('c4')}`} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c4')} </td>
							<td id='game_board-c5' ref='c5' className={`vbrd hbrd ${this.check_cell_status('c5')}`} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c5')} </td>
							<td id='game_board-c6' ref='c6' className={`hbrd ${this.check_cell_status('c6')}`} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c6')} </td>
						</tr>
						<tr>
							<td id='game_board-c7' ref='c7' className={this.check_cell_status('c7')} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c7')} </td>
							<td id='game_board-c8' ref='c8' className={`vbrd ${this.check_cell_status('c8')}`} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c8')} </td>
							<td id='game_board-c9' ref='c9' className={this.check_cell_status('c9')} onClick={(e)=>this.click_cell(e)}> {this.cell_cont('c9')} </td>
						</tr>
					</tbody>
					</table>
					<div className="btn-wrapper">
						<button type='submit' onClick={()=> this.reset_game()} className='button btn-reset'><span>Reset Game <span className='fa fa-caret-right'></span></span></button>
						<button type='submit' onClick={()=> this.end_game()} className='button btn-end'><span>End Game <span className='fa fa-caret-right'></span></span></button>
					</div>
				</div>

			</div>
		)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	click_cell (e) {
		// console.log('click_cell: ', this.state, e.currentTarget.id.substr(11));
		// console.log(e.currentTarget.id.substr(11))
		// console.log(e.currentTarget)

		if (!this.state.next_turn_ply || !this.state.game_play) return

		const cell_id = e.currentTarget.id.substr(11)
		if (this.state.cell_vals[cell_id]) return

		if (this.props.game_type != 'live')
			this.turn_ply_comp(cell_id)
		else
			this.turn_ply_live(cell_id)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------
	// Player turn during Player vs Comp
	turn_ply_comp (cell_id) {
		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		TweenMax.from(this.refs[cell_id], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: false
		// })

		// setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------
	// Computer turn during Player vs Comp
	turn_comp () {
		let { cell_vals } = this.state
		let empty_cells_arr = []


		for (let i=1; i<=9; i++) 
			!cell_vals['c'+i] && empty_cells_arr.push('c'+i)
		// console.log(cell_vals, empty_cells_arr, rand_arr_elem(empty_cells_arr))

		// const c = rand_arr_elem(empty_cells_arr) // Replaced with a smart opponent logic
		const c = get_comp_choice(this.win_sets, cell_vals, empty_cells_arr)
		console.log('turn_comp-choice: ', c);
		cell_vals[c] = 'o'

		TweenMax.from(this.refs[c], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: true
		// })

		this.state.cell_vals = cell_vals

		this.check_turn()
	}


//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	turn_ply_live (cell_id) {
		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		TweenMax.from(this.refs[cell_id], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})

		this.socket.emit('ply_turn', { cell_id: cell_id });

		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: false
		// })

		// setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	turn_opp_live (data) {
		let { cell_vals } = this.state
		let empty_cells_arr = []


		const c = data.cell_id
		cell_vals[c] = 'o'

		TweenMax.from(this.refs[c], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: true
		// })

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	check_turn () {
		const { cell_vals } = this.state

		let win = false
		let set
		let fin = true

		if (this.props.game_type!='live')
			this.state.game_stat = 'Play'


		for (let i=0; !win && i<this.win_sets.length; i++) {
			set = this.win_sets[i]
			if (cell_vals[set[0]] && cell_vals[set[0]]==cell_vals[set[1]] && cell_vals[set[0]]==cell_vals[set[2]])
				win = true
		}


		for (let i=1; i<=9; i++) 
			!cell_vals['c'+i] && (fin = false)

		if (win) {
			
			TweenMax.killAll(true)
			TweenMax.from('td.win', 1, {opacity: 0, ease: Linear.easeIn})

			this.setState({
				game_stat: (cell_vals[set[0]]=='x'?'You':'Opponent')+' win',
				game_play: false,
				winner_set: set
			})

			this.socket && this.socket.disconnect();

		} else if (fin) {
		
			this.setState({
				game_stat: 'Draw',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else {
			this.props.game_type!='live' && this.state.next_turn_ply && setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

			this.setState({
				next_turn_ply: !this.state.next_turn_ply
			})
		}
		
	}

//	------------------------	------------------------	------------------------

	end_game () {
		this.socket && this.socket.disconnect();

		this.props.onEndGame()
	}

	reset_game () {
		this.setState(JSON.parse(JSON.stringify(this.initStateObj)));
	}


}
