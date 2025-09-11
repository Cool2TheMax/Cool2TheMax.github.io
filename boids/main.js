const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const boidSource = "boidsImage.png"
const boidImage = new Image();
boidImage.src = boidSource

function start() {
	console.log("they're called 'boids' 'cause they fly around like them")
	loop()
}

function drawBoid(degrees, x, y) {
	ctx.save()
	ctx.translate(x, y)
	ctx.rotate(degToRad(-degrees))
	ctx.drawImage(boidImage, -8, -8, 16, 16)
	ctx.restore()
}


let player = {
	x : canvas.width / 2,
	xVel : 0,
	xAcel : 0,
	y : canvas.height / 2,
	yVel : 0,
	yAcel : 0,
	dirVel : 0,
	dir : 0
}

const boidList = []

function loop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	playerStuff()
	for (let i = 0; i < boidList.length; i++) {
		boidList[i].draw()
	}
	fpsStuff()
	requestAnimationFrame(loop)
}

function degToRad(x) {
	return (x * Math.PI / 180)
}

function playerStuff() {
	if (isKeyPressed('ArrowRight') && player.dirVel > -24) {
		player.dirVel-= 1
	}
	if (isKeyPressed('ArrowLeft') && player.dirVel < 24) {
		player.dirVel+= 1
	}
	if (player.dirVel < 0) {
		if (player.dirVel > -1) {
			player.dirVel += 0.1
		} else {
			player.dirVel += 0.3
		}
	} else if (player.dirVel > 0) {
		if (player.dirVel < 1) {
			player.dirVel -= 0.1
		} else {
			player.dirVel -= 0.3
		}
	}
	player.dir += player.dirVel
	if (player.dir > 359) {player.dir -= 360}
	if (player.dir < 0) {player.dir += 360}

	if (isKeyPressed('ArrowUp')) {
		player.xAcel -= Math.sin(degToRad(player.dir)) / 2
		player.yAcel -= Math.cos(degToRad(player.dir)) / 2
	}
	player.xVel += player.xAcel
	player.yVel += player.yAcel
	player.xVel *= friction
	player.yVel *= friction
	player.xAcel = 0
	player.yAcel = 0
	player.x += player.xVel
	player.y += player.yVel

	ctx.beginPath()
	ctx.moveTo(player.x, player.y)
	ctx.lineTo(player.x + player.xVel * 5, player.y + player.yVel * 5)
	ctx.closePath()
	ctx.stroke()
	if (player.x < 0) {player.x += canvas.width}
	if (player.x > canvas.width) {player.x -= canvas.width}
	if (player.y < 0) {player.y += canvas.height}
	if (player.y > canvas.height) {player.y -= canvas.height}

	drawBoid(player.dir, player.x, player.y)
}

let friction = 0.99

class Boid {
	constructor(x, y, dir) {
		this.x = x
		this.y = y
		this.dir = dir
	}
	draw() {
		drawBoid(this.dir, this.x, this.y)
	}
}
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

	ctx.fillStyle = 'black'
	ctx.fillText('FPS: ' + times.length, 0, 24)
}