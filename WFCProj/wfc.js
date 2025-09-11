let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')


function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}


let DIM = 16
let h = canvas.height / DIM
let w = canvas.width / DIM

const rules = [
	[[0], [0], [0], [0]],
	[[1, 2], [1, 2], [1, 2], [1, 2]],
	[[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]],
	[[2, 3, 4], [2, 3, 4], [2, 3, 4], [2, 3, 4]],
	[[3, 4, 5], [3, 4, 5], [3, 4, 5], [3, 4, 5]],
	[[4, 5], [4, 5], [4, 5], [4, 5]]
]


let count = 0
function reset() {
	GRID = []
	count = 0
	for (let i = 0; i < DIM * DIM; i++) {
		GRID[i] = {
			collapsed : false,
			options : [1, 2, 3, 4, 5]
		}
	}
	h = canvas.height / DIM
	w = canvas.width / DIM
}


function runAnimation() {
	count++
	calculate()
	display()
	if (count !== GRID.length) {
		requestAnimationFrame(runAnimation)
	}
}

function start() {
	reset()
	runAnimation()
}

let lowestEntropyFound = 5
let lowestEntropyTiles = []
let currentTile = 0

function calculate() {
	lowestEntropyTiles = []
	lowestEntropyFound = 5
	for (let i = 0; i < GRID.length; i++) {
		if (GRID[i].options.length == lowestEntropyFound) {
			lowestEntropyTiles.push(i)
		} else if (GRID[i].options.length < lowestEntropyFound && !(GRID[i].options.length <= 1)) {
			lowestEntropyTiles = []
			lowestEntropyTiles.push(i)
			lowestEntropyFound--
		}
	}

	currentTile = lowestEntropyTiles[randInt(0, lowestEntropyTiles.length - 1)]
	GRID[currentTile].collapsed = true
	GRID[currentTile].options = [GRID[currentTile].options[randInt(0, GRID[currentTile].options.length - 1)]]
	
	if (currentTile % DIM !== DIM - 1) {
		neighborTiles(1)
	}
	if (currentTile % DIM !== 0) {
		neighborTiles(-1)
	}
	if (currentTile + DIM  < DIM * DIM) {
		neighborTiles(DIM)
	}
	if (currentTile >= DIM) {
		neighborTiles(-DIM)
	}	
}

function neighborTiles(direction) {
	let thisTile = currentTile + direction
	if (!GRID[thisTile].collapsed) {
		if (GRID[thisTile].options.length == 2) {
			GRID[thisTile].collapsed = true
		}
		if (thisTile % DIM !== DIM - 1) {
			reduceOptions(thisTile, 1)
		}
		if (thisTile % DIM !== 0) {
			reduceOptions(thisTile, -1)
		}
		if (thisTile + DIM < DIM * DIM) {
			reduceOptions(thisTile, DIM)
		}
		if (thisTile >= DIM) {
			reduceOptions(thisTile, -DIM)
		}
	}
}

function reduceOptions(thisTile, direction) {
	let options = GRID[thisTile].options
	if (GRID[thisTile + direction].collapsed && GRID[thisTile + direction] !== undefined) {
		for (let i = 0; i < GRID[thisTile].options.length; i++) {
			if (rules[GRID[currentTile].options[0]][0].indexOf(GRID[thisTile].options[i]) == -1 && GRID[thisTile].options.length > 1) {
				GRID[thisTile].options.splice(i, 1)
				i--
				if (GRID[thisTile].options.length == 1) {
					GRID[thisTile].collapsed = true
				}
			}
		}
	}
}

function display() {
	ctx.fillStyle = 'green'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	for (let i = 0; i < DIM; i++) {
		for (let j = 0; j < DIM; j++) {
			let cell = GRID[j + (i * DIM)]
			if (cell.collapsed) {
				setColorForTile(cell.options[0])
				ctx.fillRect(j * w, i * h, w, h)
			}
			//ctx.fillStyle = 'black'
			//ctx.fillText(cell.options.length, j * w + (j / 2), i * h + (h / 2))
		}
	}
}

function setColorForTile(tile) {
	if (tile == 1) {
		ctx.fillStyle = 'rgb(0, 0, 100)'
	} else if (tile == 2) {
		ctx.fillStyle = 'rgb(0, 0, 255)'
	} else if (tile == 3) {
		ctx.fillStyle = 'rgb(255, 255, 0)'
	} else if (tile == 4) {
		ctx.fillStyle = 'rgb(0, 200, 50)'
	} else if (tile == 5) {
		ctx.fillStyle = 'rgb(0, 170, 40)'
	} else {
		ctx.fillStyle = 'white'
	}
}
