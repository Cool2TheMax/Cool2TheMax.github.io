
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
var cameraX = 0
var cameraY = 0
var cameraSelect = -1

let stopped = false
function start() {
	console.log('working?')
	loop()
}


function loop() {
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	if (cameraSelect < 0) {
		cameraX = 0
		cameraY = 0
	} else {
		cameraX = GravityObjList[cameraSelect].x - (canvas.width / 2)
		cameraY = GravityObjList[cameraSelect].y - (canvas.height / 2)
	}
	for (let i = 0; i < GravityObjList.length; i++) {
		GravityObjList[i].draw()
		GravityObjList[i].update()
	}
	requestAnimationFrame(loop);
}

function drawCircle(x, y, radius) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fill();
}

let friction = 0.999
let wallfriction = 0.9
class GravityObj {
	constructor(color, radius, x, y, xVel, yVel) {
		this.color = color
		this.radius = radius
		this.x = x
		this.y = y
		this.xVel = xVel
		this.yVel = yVel
		this.id = GravityObjList.length
	}

	draw() {
		ctx.fillStyle = this.color
		drawCircle(this.x - cameraX, this.y - cameraY, this.radius)
	}

	update() {
		if (!stopped && mouseDown && pythag(this.x - mouseX, this.y - mouseY) < this.radius) {
			stopped = true
			mouseSelect = this.id
		}
		if (stopped && mouseSelect == this.id) {
			ctx.fillStyle = 'white'
			for (let i = 0; i < 5; i++) {
				drawCircle(this.x + (((mouseX - this.x) / 5)* i), this.y + (((mouseY - this.y) / 5)* i), i)
			}
		} 
		if (!mouseDown && stopped && mouseSelect == this.id) {
			this.xVel -= (mouseX - this.x) / 10
			this.yVel -= (mouseY - this.y) / 10
			stopped = false
			let mouseSelect = -1
		}
		if (stopped) {return;}
		this.x += this.xVel
		this.y += this.yVel
		this.xVel *= friction
		this.yVel *= friction
		if (Math.abs(this.xVel) < 0.1) {this.xVel = 0}
		if (Math.abs(this.yVel) < 0.1) {this.yVel = 0} 
		if (this.x > canvas.width - this.radius) {
			this.xVel *= -wallfriction
			this.x = canvas.width - this.radius
		} else if (this.x < 0 + this.radius) {
			this.xVel *= -wallfriction
			this.x = this.radius
		}
		if (this.y < 0 + this.radius) {
			this.yVel *= -wallfriction
			this.y = this.radius
		} else if (this.y > canvas.height - this.radius) {
			if (this.yVel > 2) {this.yVel *= -Math.max(0, wallfriction - 0.3)} else {this.yVel = 0}
			this.y = canvas.height - this.radius
		} else {
			this.yVel += 1
		}
		for (let i = 0; i < GravityObjList.length; i++) {
			if (i == this.id) {i++}
			if (i == GravityObjList.length) {return;}
			let distancex = this.x - GravityObjList[i].x
			let distancey = this.y - GravityObjList[i].y
			let distancef = pythag(distancex, distancey)
			if (distancef !== 0 && distancef < this.radius + GravityObjList[i].radius) {
				this.x -= this.xVel
				this.y -= this.yVel
				//let thisMomentumX = this.radius * this.xVel
				//let thisMomentumY = this.radius * this.yVel
				//let otherMomentumX = GravityObjList[i].radius * GravityObjList[i].xVel
				//let otherMomentumY = GravityObjList[i].radius * GravityObjList[i].yVel
				if (this.xVel == 0) {
					this.xVel = GravityObjList[i].xVel
					GravityObjList[i].x -= GravityObjList[i].xVel
					GravityObjList[i].xVel = 0
				} else if ((this.xVel < 0 && GravityObjList[i].xVel > 0) || (this.xVel > 0 && GravityObjList[i].xVel < 0)) {
					let store = GravityObjList[i].xVel
					GravityObjList[i].xVel = this.xVel
					this.xVel = store
				} else if ((this.xVel > 0) == (GravityObjList[i].xVel > 0)) {
					if (Math.abs(this.xVel) > Math.abs(GravityObjList[i].xVel)) {
						let store = this.xVel
						this.xVel = GravityObjList[i].xVel
						GravityObjList[i].xVel = store
					}
				}
				if (this.yVel == 0) {
					this.yVel = GravityObjList[i].yVel
					GravityObjList[i].y -= GravityObjList[i].yVel
					GravityObjList[i].yVel = 0
				} else if ((this.yVel < 0 && GravityObjList[i].yVel > 0) || (this.yVel > 0 && GravityObjList[i].yVel < 0)) {
					let store = GravityObjList[i].yVel
					GravityObjList[i].yVel = this.yVel
					this.yVel = store
				} else if ((this.yVel > 0) == (GravityObjList[i].yVel > 0)) {
					if (Math.abs(this.yVel) > Math.abs(GravityObjList[i].yVel)) {
						let store = this.yVel
						this.yVel = GravityObjList[i].yVel
						GravityObjList[i].yVel = store
					}
				}
			}
		}
	}
}

function pythag(x, y) {
	return Math.sqrt((x*x)+(y*y))
} 

const GravityObjList = []
GravityObjList.push(new GravityObj('red', 10, canvas.width / 2 - 10, 180, -3, 1))
GravityObjList.push(new GravityObj('blue', 10, canvas.width / 2 + 10, 180, 2, 2))
GravityObjList.push(new GravityObj('green', 10, 200, 180, 3, 4))
GravityObjList.push(new GravityObj('white', 10, 325, 160, 3, -1))
GravityObjList.push(new GravityObj('lemonchiffon', 10, 20, 160, -3, 4))
GravityObjList.push(new GravityObj('purple', 10, 345, 160, 5, 5))


let mouseX = 0
let mouseY = 0
let mouseDown = false
let mouseSelect = -1
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
