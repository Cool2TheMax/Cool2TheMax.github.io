const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
var STOP = false
ctx.font = 'bold 18px monospace'

function start() {
	main()
}
let tick = 0
const NPClist = [[1389, 1984]]
var EDITOR = 1
var cameraX = 0
var cameraY = 1600
var score = 0


const lvl1 = [
	{x : 320, y : 256, r : 32, t: 's'},
	{t : 'w', a : 32, spanX : 2048+1792, x : 0, y : 512 - 128, spanY : 0, r : 32},
	{t : 'w', a : 6, spanX : 0, x : 1792 + 2048 - 256, y : 512-128, spanY : 672 - 256, r : 32},
	{x : 3838, y : 746, r : 32, t: 'g', g : 2}
	
]

const lvl2 = [
	{x : 350, y : 256, r : 32, t: 's'},
	{t : 'w', a : 12, spanX : 678, x : 0, y : 0, spanY : 678, r : 32},
	{t : 'w', a : 28, spanX : 1792 + 1024 + 512, x : 512, y : 672, spanY : 0, r : 32},
	{t : 'w', a : 6, spanX : 0, x : 1792 + 2048 - 256, y : 512-128, spanY : 672 - 256, r : 32},
	{t : 'w', a : 28, spanX : 1024+512+1792, x : 512+256, y : 512 - 128, spanY : 0, r : 32},
	{x : 3477, y : 509, r : 32, t: 'g', g : 3}
]

const lvl3 = [{x : 320, y : 256, r : 32, t: 's'},
	{t : 'w', a : 8, spanX : 0, x : 512, y : 0, spanY : 768, r : 32},
	{t : 'w', a : 28, spanX : 1792 + 1024 + 512, x : 512, y : 672, spanY : 0, r : 32},
	{t : 'w', a : 6, spanX : 0, x : 1792 + 2048 - 256, y : 256, spanY : 672 - 256, r : 32},
	{t : 'w', a : 28, spanX : 1024+512+1792, x : 512, y : 512 - 128, spanY : 0, r : 32},
	{x : 629, y : 256, r : 32, t: 'g', g : 4}
]

var badCirList = []
var spawnCirList = []
var goalCirList = []

function newLvl(lvl) {
	badCirList = []
	spawnCirList = []
	goalCirList = []
	popCirL()
	newlvlgrid = lvl
	for (let i = 0; i < newlvlgrid.length; i++) {
		if (newlvlgrid[i].t == 'w') {
			for (let j = 0; j < newlvlgrid[i].a; j++) {
				badCirList.push({x : newlvlgrid[i].x + (newlvlgrid[i].spanX / newlvlgrid[i].a) * j, y: newlvlgrid[i].y + (newlvlgrid[i].spanY / newlvlgrid[i].a) * j, r : newlvlgrid[i].r})
			}
		} else if (newlvlgrid[i].t == 'b') {
			badCirList.push(newlvlgrid[i])
		} else if (newlvlgrid[i].t == 's') {
			spawnCirList.push(newlvlgrid[i])
		} else {
			goalCirList.push(newlvlgrid[i])
		}
	}
}

newLvl(lvl1)

let playerVelX = 0
let playerVelY = 0
const player = {
	active : 0,
	x : spawnCirList[0].x,
	y : spawnCirList[0].y
}

function popCirL() {
	for (let j = 0; j < 2; j++) {
		for (let i = 0; i < 32; i++) {
			badCirList.push({x : i * 128, y: -128 + (j * 1280), r : 256})
		}
	}
	for (let j = 0; j < 2; j++) {
		for (let i = 0; i < 16; i++) {
			badCirList.push({x : -128 + (j * (2304 + 2048)), y: i * 128, r : 256})
		}
	}
}

var goalCounter = 0
var newlvl = []
function main() {
	score++
	ctx.fillStyle = 'rgb(0, 211, 231)'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(imageList[1], 0 - ((64 / 3584) * cameraX * 8), 0, imageList[1].width * 8, imageList[1].height * 8)
	camera()
	for (let i = 0; i < spawnCirList.length; i++) {
		ctx.fillStyle = 'blue'
		drawCircle(spawnCirList[i].x - cameraX, spawnCirList[i].y - cameraY, spawnCirList[i].r)
		if (pythag(spawnCirList[i].x - player.x, spawnCirList[i].y - player.y) <= 24 + spawnCirList[i].r) {
			active = i
			spawnX = spawnCirList[i].x
			spawnY = spawnCirList[i].y
		}
		
	}
	for (let i = 0; i < goalCirList.length; i++) {
		ctx.fillStyle = 'green'
		drawCircle(goalCirList[i].x - cameraX, goalCirList[i].y - cameraY, goalCirList[i].r)
		if (pythag(goalCirList[i].x - player.x, goalCirList[i].y - player.y) <= 24 + goalCirList[i].r) {
			if (goalCirList[i].g == 2) {
				newlvl = lvl2
			} else if (goalCirList[i].g == 3) {
				newlvl = lvl3
			} else {
				STOP = true
				ctx.drawImage(imageList[3], 0, 0, canvas.width, canvas.height)
				ctx.fillStyle = 'black'
				ctx.fillText('SCORE :' + (10000 - score), canvas.width / 2 - Math.ceil(ctx.measureText('SCORE :' + (1000000 - score)).width / 2), 256)
				return;
			}
			goalCounter++
			playerXVel = 0
			playerYVel = 0
		}
		
	}
	if (explodeCounter > 0 && explodeCounter <= 30) {
		explodeCounter++
		if (explodeCounter > 30) {
			explodeCounter = 0
		} 	
	} else {
		if (goalCounter == 0) {
			playerControls()
		}
	}
	if (explodeCounter % 3 == 0) {
		drawPlayer()
	}
	for (let i = 0; i < badCirList.length; i++) {
		ctx.fillStyle = 'black'
		drawCircle(badCirList[i].x - cameraX, badCirList[i].y - cameraY, badCirList[i].r)
		if (pythag(badCirList[i].x - player.x, badCirList[i].y - player.y) <= 24 + badCirList[i].r) {
			explode()
		}
	}
	miniMap()
	if (goalCounter > 0 && goalCounter <= 120) {
		goalCounter++
		ctx.drawImage(imageList[2], 0, 0, canvas.width, canvas.height)

	} else 	if (goalCounter > 120) {
		newLvl(newlvl)
		player.x = spawnCirList[0].x
		player.y = spawnCirList[0].y
		playerVelX = 0
		playerVelY = 0
		goalCounter = 0
	}
	tick++
	if (!STOP) {
		requestAnimationFrame(main)
	}
}

function miniMap() {
	ctx.fillStyle = 'black'
	ctx.fillRect(canvas.width - 128, 0, 128, 64)
	ctx.strokeStyle = 'white'
	ctx.strokeRect(canvas.width - 128, 0, 128, 64)
	for (let i = 0; i < spawnCirList.length; i++) {
		ctx.fillStyle = 'blue'
		ctx.fillRect(Math.ceil(spawnCirList[i].x / 4096 * 128) + canvas.width - 128, Math.ceil(spawnCirList[i].y / 2112 * 64), 2, 2)
	}
	for (let i = 0; i < goalCirList.length; i++) {
		ctx.fillStyle = 'green'
		ctx.fillRect(Math.ceil(goalCirList[i].x / 4096 * 128) + canvas.width - 128, Math.ceil(goalCirList[i].y / 2112 * 64), 2, 2)
	}
	ctx.fillStyle = 'yellow'
	ctx.fillRect(Math.ceil(player.x / 4096 * 128) + canvas.width - 128, Math.ceil(player.y / 2112 * 64), 2, 2)
}

var explodeCounter = 0
var spawnX = spawnCirList[player.active].x
var spawnY = spawnCirList[player.active].y
function explode() {
	explodeCounter++
	playerVelX = 0
	playerVelY = 0
	player.x = spawnX
	player.y = spawnY
}

let GRAVITY = false
function playerControls() {
	if (keyPressCheck("ArrowRight")) {
		playerVelX++
	} else if (keyPressCheck("ArrowLeft")) {
		playerVelX--
	}
	playerVelX *= 0.99
	if (Math.abs(playerVelX) < 0.5) {
		playerVelX = 0
	}
	player.x += Math.round(playerVelX)
	player.x = Math.floor(player.x)
	if (player.x < 0) {explode()} else if (player.x > 4032) {explode()}
	if (keyPressCheck("ArrowDown")) {
		playerVelY++
	} else if (keyPressCheck("ArrowUp")) {
		playerVelY--
	}
	playerVelY *= 0.99
	if (Math.abs(playerVelY) < 0.5) {
		playerVelY = 0
	}
	player.y += Math.round(playerVelY)
	player.y = Math.floor(player.y)
	if (player.y < 0) {explode()} else if (player.y > 1600 + 512 - 64) {explode()}
}

function camera() {
	cameraY = player.y - 256 + 32
	if (player.y < 256 - 32) {cameraY = 0}
	if (cameraY > 1600) {cameraY = 1600}
	cameraX = player.x - 256 + 32
	if (player.x < 256 - 32) {cameraX = 0}
	if (cameraX > 3584) {cameraX = 3584}
}

function drawPlayer() {
	let id = 0
	if ((keyPressCheck('w') || keyPressCheck('ArrowUp')) && !(keyPressCheck('s') || keyPressCheck('ArrowDown'))) {
		id = 1
	} else if ((keyPressCheck('s') || keyPressCheck('ArrowDown')) && !(keyPressCheck('w') || keyPressCheck('ArrowUp'))) {
		id = 4
	} else if ((keyPressCheck('a') || keyPressCheck('ArrowLeft')) && !(keyPressCheck('d') || keyPressCheck('ArrowRight'))) {
		id = 3
	} else if ((keyPressCheck('d') || keyPressCheck('ArrowRight')) && !(keyPressCheck('a') || keyPressCheck('ArrowLeft'))) {
		id = 2
	} else if (playerVelY > 0 && playerVelY > playerVelX) {
		id = 5
	} else if (pythag(playerVelX, playerVelY) < 25) {
		id = 0
	}
	printTileImgFromMap(id, player.x - cameraX - 24, player.y - cameraY - 24, 48, 48)
}

function drawCircle(x, y, radius) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fill();
}

function pythag(x, y) {
	return Math.sqrt(x * x + y * y);
}

function drawTiles() {
	let TileIndex = Math.floor(cameraX / 64) + (GridXMax * Math.floor(cameraY / 64))
	let x = -(cameraX % 64)
	let y = -(cameraY % 64) 
	for (let i = 0; i < 9; i++) {
		x = -(cameraX % 64)
		for (let j = 0; j < 9; j++) {
			printTileImgFromMap(GRID[TileIndex], x, y, 64, 64)
			x += 64
			TileIndex++	
		}
		TileIndex += GridXMax - 9
		y += 64
		
	}
}



function stop() {
		STOP = true
}

var solidTiles = [1, 0, 1, 1, 1, 1, 1, 0]
const GridXMax = 64
const GridYMax = 32
var GRID = []

function initGrid() {
	GRID = []
	for (let i = 0; i < GridYMax; i++) {
		for (let j = 0; j < GridXMax - 2; j++) {
			GRID.push(1)
		}
	}
	for (let i = 0; i < GridXMax; i++) {
		GRID.push(7)
	}
	for (let i = 0; i < GridXMax; i++) {
		GRID.push(0)
	}
}
const imageList = [];
const imageSList = [
	'image/playersheet.png',
	'image/bckgnd.png',
	'image/point.png',
	'image/final.png'
]



for (let i = 0; i < imageSList.length; i++) {
	const img = new Image();
	img.src = imageSList[i];
	imageList.push(img);
}


const tileMapWidth = 3
function printTileImgFromMap(tileID, x, y, width, height) {
	let mapX = ((tileID % tileMapWidth)) * 16
	let mapY = ((tileID - (tileID % tileMapWidth)) / tileMapWidth) * 16
	ctx.drawImage(imageList[0], mapX, mapY, 16, 16, x, y, width, height)

}


const keys = {};
mouseX = 0
mouseY = 0
mouseDown = false
function keyPressCheck(key) {
	return keys[key];
}	
document.addEventListener('keydown', function(event) {
	keys[event.key] = true;
});
document.addEventListener('keyup', function(event) {
	keys[event.key] = false;
});
window.addEventListener('mousemove', function (event) {
	mouseX = event.x;
	mouseY = event.y;
 	mouseX -= canvas.offsetLeft
	mouseY -= canvas.offsetTop
});
document.addEventListener('mousedown', () => {
	mouseDown = true;
});
document.addEventListener('mouseup', () => {
	mouseDown = false;
});

//Math.ceil((mouseX + cameraX)/ 64 - 1) + (Math.ceil((mouseY + cameraY)/ 64 - 1) * GridXMax)
//Gets Tile Idx from Mouse Location.
