const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
var STOP = false;
const midX = canvas.width/2
const midY = canvas.height/2
var backGcolor = 43


var camRotXZ = 180
var camRotXY = 0
var rayX
var rayZ
var rendDist = 300
var resolution = 80
var fov = 70
var rayHitDistance = 0
var traceT = true
var noHit  = true
var hitTile = 0

const GRID = [
	1, 1, 1, 1, 1, 1, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 1, 0, 1, 1, 1, 1,
	1, 0, 0, 0, 1, 0, 0, 1,
	1, 0, 0, 0, 1, 0, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 1, 1, 1, 1, 1, 1
]

const texture = [
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	0, 0, 1, 0, 0, 0, 0, 0,	0, 0, 1, 0, 0, 0, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1,	1, 1, 1, 1, 1, 1, 1, 1,
	0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	0, 0, 1, 0, 0, 0, 0, 0,	0, 0, 0, 0, 0, 1, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1,	1, 1, 1, 1, 1, 1, 1, 1,
	0, 0, 0, 0, 0, 1, 0, 0,	0, 0, 0, 0, 0, 0, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1,	1, 1, 1, 1, 1, 1, 1, 1,
	0, 0, 1, 0, 0, 0, 0, 0,	0, 0, 1, 0, 0, 0, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1,	1, 1, 1, 1, 1, 1, 1, 1,
	0, 0, 0, 0, 0, 1, 0, 0,	0, 0, 0, 0, 0, 0, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1,	1, 1, 1, 1, 1, 1, 1, 1,
	0, 0, 1, 0, 0, 0, 0, 0,	0, 0, 0, 0, 0, 1, 0, 0,
	1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1,	1, 1, 1, 1, 1, 1, 1, 1
]


const DIM = Math.sqrt(GRID.length)
var camX = DIM * 32 / 2
var camZ = DIM * 32 / 2


function start() {
	console.log('now viewed in 2 dimensions!')
	loop();
}

function loop() {
	background();
	camXZrotControl();
	playerMovement();
	for(let i = -resolution/2; i < resolution/2; i++) {
		if (!traceT) {
			ctx.beginPath()
			ctx.moveTo(camX, camZ)
		}
		rayX = camX
		rayZ = camZ
		for(let j = 0; j < rendDist; j++) {
			rayX += Math.sin((camRotXZ + (i * (fov/resolution))) * Math.PI / 180)
			rayZ += Math.cos((camRotXZ + (i * (fov/resolution))) * Math.PI / 180)
			if (objInWallCheck(rayX, rayZ)) {
				noHit = false
				rayHitDistance = j
				j = rendDist
				hitTile = Math.floor(rayX / 32) + (Math.floor(rayZ / 32) * DIM)
			} else {
				noHit = true
			}

		}
		if (traceT) {
			if (!noHit) { 
				let distanceToViewPlane = rayHitDistance * Math.cos(degToRad(i + (resolution / 2)))
				let segmentW = canvas.width/resolution
				let segmentL = Math.ceil((rendDist - rayHitDistance) * (canvas.height/rendDist))
				let segmentOff = (canvas.height/2) - (segmentL/2)
				let segmentX = canvas.width - ((i + resolution/2) * segmentW)
				for (let k = 0; k < 16; k++) {
					if (texture[Math.floor((rayX % 32) / 4) + (k * 16) + Math.floor((rayZ % 32) / 4) + 1] == 1) {
						ctx.fillStyle = 'black'
					} else {
						ctx.fillStyle = 'gray'
					}

					// * 8)
					ctx.fillRect(segmentX, segmentOff + (segmentL * k / 16), - segmentW, segmentL/16 + 2)
				}
			}
		}

		if (!traceT) {
			ctx.fillStyle = 'rgb(0, 0, 0)'
			ctx.lineTo(rayX, rayZ)
			ctx.closePath()
			ctx.stroke()
			for (let i = 0; i < DIM; i++) {
				for (let j = 0; j < DIM; j++) {
					if (GRID[i * DIM + j] == 1)
					ctx.fillRect(0 + j * 32, 0 + i * 32, 32, 32)
				}
			}
		}
	}
	//ctx.fillStyle = 'green'
	//ctx.fillRect(Math.floor(mouseX / 32) * 32, Math.floor(mouseY / 32) * 32, 32, 32)
	fpsStuff()
	//ctx.fillText(Math.floor(mouseX/32) + (Math.floor(mouseY / 32) * DIM), 0, 30)
	if (!STOP) {
		requestAnimationFrame(loop)
	}
}

function background() {
	ctx.fillStyle = 'rgb(59,252, 255)'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = 'green'
	ctx.fillRect(0,canvas.height / 2, canvas.width, canvas.height / 2)
}

function camXZrotControl() {
	if (isKeyPressed("ArrowRight")) {
		camRotXZ -= 2 
		if (camRotXZ <= 0) {
			camRotXZ += 360
		}
	}
	if (isKeyPressed("ArrowLeft")) {
		camRotXZ += 2
		if (camRotXZ >= 360) {
			camRotXZ -= 360
		}
	}
}

function playerMovement() {
	if (isKeyPressed('t')) {
		if (!traceT) {traceT = true} else {traceT = false}
	}
	if (isKeyPressed('ArrowUp') || isKeyPressed('w')) {
		if (!objInWallCheck((camX + Math.sin(degToRad(camRotXZ)) * 2), camZ)) {
			camX += Math.sin(degToRad(camRotXZ)) * 2
		}
		if (!objInWallCheck(camX, camZ + Math.cos(degToRad(camRotXZ)) * 2)) {
			camZ += Math.cos(degToRad(camRotXZ)) * 2
		}

	} else if (isKeyPressed('ArrowDown') || isKeyPressed('s')) {
		if (!objInWallCheck((camX - Math.sin(degToRad(camRotXZ)) * 2), camZ)) {
			camX -= Math.sin(degToRad(camRotXZ)) * 2
		}
		if (!objInWallCheck(camX, camZ - Math.cos(degToRad(camRotXZ)) * 2)) {
			camZ -= Math.cos(degToRad(camRotXZ)) * 2
		}
	}
	if (isKeyPressed('a')) {
		if (!objInWallCheck((camX + Math.sin(degToRad(camRotXZ + 90)) * 2), camZ)) {
			camX += Math.sin(degToRad(camRotXZ + 90)) * 2
		}
		if (!objInWallCheck(camX, camZ + Math.cos(degToRad(camRotXZ + 90)) * 2)) {
			camZ += Math.cos(degToRad(camRotXZ + 90)) * 2
		}
	} else if (isKeyPressed('d')) {
		if (!objInWallCheck((camX - Math.sin(degToRad(camRotXZ + 90)) * 2), camZ)) {
			camX -= Math.sin(degToRad(camRotXZ + 90)) * 2
		}
		if (!objInWallCheck(camX, camZ - Math.cos(degToRad(camRotXZ + 90)) * 2)) {
			camZ -= Math.cos(degToRad(camRotXZ + 90)) * 2
		}
	}
}

function objInWallCheck(x, z) {
	return GRID[Math.floor(x / 32) + (Math.floor(z / 32) * DIM)]
}

function degToRad(x) {
	return (x * Math.PI / 180)
}

var mouseX = 0
var mouseY = 0
var mouseDown = false

window.addEventListener('mousemove', function (e) {
	mouseX = e.x;
	mouseY = e.y;
 	mouseX = mouseX-canvas.offsetLeft
	mouseY = mouseY-canvas.offsetTop
});

document.addEventListener('mousedown', () => {
	mouseDown = true;
});

document.addEventListener('mouseup', () => {
	mouseDown = false;
});

const keysPressed = {};


function isKeyPressed(key) {
	return keysPressed[key] == true;
}

	
document.addEventListener('keydown', function(event) {
	keysPressed[event.key] = true;
});


document.addEventListener('keyup', function(event) {
	keysPressed[event.key] = false;
});



let times = []
var feedback = []

function fpsStuff() {
	const now = performance.now();
	while (times.length > 0 && times[0] <= now - 1000) {
		times.shift();
	}
	times.push(now);

	ctx.fillStyle = 'rgb(' + (255-backGcolor) + ', ' + (255-backGcolor) + ', ' + (255-backGcolor) + ')'
	for (let i = 0; i < feedback.length; i++) {
		ctx.fillText(feedback[i].text, 0,  i * 20 + 30)
		feedback[i].howLongAgo++
		if (feedback[i].howLongAgo > 120) {
			feedback.splice(i, 1)
		}
	}

	ctx.fillText('FPS: ' + times.length, 0, 20)
}