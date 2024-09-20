function start() {
	console.log('gaming');
	ctx.font = "bold 18px monospace"
	newMap();
	gameLoop();
}

var STOP = false;
var MENU = false;

function gameLoop() {
	playerTick()
	drawBackground();
	drawTiles(1);
	drawTiles(2);
	particleStuff('spark')
	drawPlayer();
	drawTiles(3)
	
	particleStuff('smoke')
	if (dialogue) {
		dialogueStuff()
	} else {
		editorStuff()
		menuStuff()
	}

	fpsStuff()

	if (STOP) {return true;} 
	requestAnimationFrame(gameLoop)
}


var menuLevel = 0;
let MenuItems = ['Inventory', 'Save', 'Exit']
let MenuFunctions = [
		function() {console.log('WIP')}, 
		function() {
			saveScene()
			console.log('WIP'/*'savedGRIDS = [' + savedGRIDS + '];  savedNAMES = [\'' + savedNAMES + '\']'*/)
		},
		function() {MENU = false}
	]

function menuStuff() {
	if (isKeyPressed('Enter') && !EDITOR && !dialogue && tick % 10 == 0) {
		if (!MENU) {
			MENU = true;
			menuLevel = 0;
		}
	}
	if (MENU) {
		let menuJoy
		if (tick % 4 == 0){
			menuJoy = (isKeyPressed('s') || isKeyPressed('ArrowDown'))
			menuJoy -= (isKeyPressed('w') || isKeyPressed('ArrowUp'))
			menuLevel += menuJoy * !((menuLevel == 0 && menuJoy == -1) || (menuLevel == MenuItems.length - 1 && menuJoy == 1))
		}
		if (tick % 4 == 0 && isKeyPressed('z')) {MenuFunctions[menuLevel]()}
		drawMenu()
	}
}

function drawMenu() {
	ctx.fillStyle = 'rgb(43, 43, 43)'
	ctx.fillRect(10, 10, 120, 200)
	ctx.fillStyle = 'rgb(250, 255, 186)'				
	for (let i = 0; i < MenuItems.length; i++) {
		ctx.fillText(MenuItems[i], 16, i * 17 + 32)
	}

	ctx.beginPath()
	ctx.moveTo(110, menuLevel * 17 + 28)
	ctx.lineTo(128, menuLevel * 17 + 35)
	ctx.lineTo(128, menuLevel * 17 + 21)
	ctx.lineTo(110, menuLevel * 17 + 28)
	ctx.closePath()
	ctx.fill()
}


//PLAYER STUFF
//==============================================================
//==============================================================

let editorCamSupplement = 100

let playerXSup = 9
let playerYSup = 4


function playerTick() {
	place.full = place.name + '.' + place.x + '.' + place.y
	if (!dialogue && !TYPING) {
		player.currentTile = player.x + playerXSup + ((player.y + playerYSup) * 32)
		if (!(player.walkTime > 0 && player.walkTime < player.walkDelay)) {
			if (!MENU) {
				playerControls();
			} else {
				joyX = 0
				joyY = 0
				joyDist = 0
			}
		}
		if (joyDist > 0) {
			tryMove(joyX, joyY)
		}
		cameraX = player.x * 32 + (player.walkTime * joyX) + (EDITOR* (editorCamSupplement/2));
		if (cameraX < 0) {cameraX=0}
		if (cameraX > 422 +(EDITOR*96)-32) {cameraX= 422 +(EDITOR * 100)-32}
		cameraY = player.y * 32 + ((player.walkTime) * joyY) ;
		if (cameraY > 724-32) {cameraY=724-32}
		if (cameraY < 0) {cameraY=0}
		playerCheckOutOfBounds()
		checkForSigns()
	}
}

function checkForSigns() {
	if (!MENU && player.signReload == 0) {
		if (
			isKeyPressed('z') && 
			player.dir == 0 && 
			(GRID[player.currentTile - GMAX] == 7 || GRID[player.currentTile + (GMAX * (GMAX-1)) == 7]) 
		) 
		{
			player.signReload = 10
			if (GRID[player.currentTile - GMAX] == 7) {newDialogue(DIALOGUES[DialogueLocations.indexOf((player.currentTile - GMAX) + place.full)], tileImages[7])
			} else {newDialogue(DIALOGUES[DialogueLocations.indexOf((player.currentTile + (GMAX * (GMAX-1))) + place.full)], tileImages[7])}
			
			
		}
	} else {
		player.signReload--
	}

}
function playerControls() {
	joyX = (isKeyPressed('d') || isKeyPressed('ArrowRight'));
	joyX -= (isKeyPressed('a') || isKeyPressed('ArrowLeft'));
	joyY = (isKeyPressed('s') || isKeyPressed('ArrowDown'));
	joyY -= (isKeyPressed('w') || isKeyPressed('ArrowUp'));
	joyDist = Math.sqrt((joyX * joyX) + (joyY * joyY));
	if (joyX !== 0 && joyY !== 0) {joyX = 0}
	if (joyX > 0) {player.dir = 90} else if (joyX < 0) {player.dir = 270}

	if (joyY > 0) {player.dir = 180} else if (joyY < 0) {player.dir = 0}
}


function tryMove(dx, dy) {
	if (joyDist > 0 && !pathIsSolid()) {
		player.walkTime += (isKeyPressed('x') * 1) + 1 
		if (player.walkTime >= player.walkDelay) {
			player.x += dx;
			player.y += dy;
			player.walkTime = 0
		}
	}
}


function pathIsSolid() {
	if (joyY == 0) {
		if (solids[GRID[player.currentTile + joyX]]) {return true}
	}
	if (joyX == 0) {
		if (solids[GRID[player.currentTile + (joyY*GMAX)]]) {return true}
	}
	return false
}


let sx = 0
let sy = 0
let sw = 1
let sh = 1

function drawPlayer() {
	let costume

	if (joyDist > 0) {
		if (player.frame > 2) {player.frame=1}
		costume = 'img/player/walk' + player.dir + player.frame + '.png'
	} else {
		playerFrame = 1
		costume = 'img/player/idle' + player.dir + '.png'
	}

	if (dialogue) {costume = 'img/player/idle0.png'}
	//ctx.drawImage(
	//	playerImages[playerSources.indexOf(costume)], 
	//	((player.x * 32) - cameraX) + canvas.width/2 - (playerImages[0].width) + (player.walkTime * joyX) + 4, 
	//	((player.y * 32) - cameraY) + canvas.height/2 - (playerImages[0].height) + (player.walkTime * joyY) - 9,
	//	(playerImages[0].width*2),
	//	(playerImages[0].height*2))

		// Left Leg
		ctx.drawImage(
			playerImages[12],
			(player.dir == 90) * 8 + 2, 26, 4, 3, 
			player.x * 32 - cameraX + (canvas.width/2) + (player.walkTime * joyX) + ((player.dir % 180 == 0) * 1) + ((player.dir == 90) * 4) + ((player.dir == 270) * 3), 
			player.y * 32 - cameraY + (canvas.height/2) + (player.walkTime * joyY) + ((player.walkTime % 16 <= 7 && joyDist !== 0) * -1) + 10, 
			4, 5 
		)
		// Right Leg
		ctx.drawImage(
			playerImages[12],
			(player.dir == 270) * -8 + 10, 26, 4, 3, 
			player.x * 32 - cameraX + (canvas.width/2) + (player.walkTime * joyX) + ((player.dir == 90) * -3) + ((player.dir == 270) * -4) + 6, 
			player.y * 32 - cameraY + (canvas.height/2) + (player.walkTime * joyY) + ((player.walkTime % 16 >= 9) * -1) + ((player.walkTime % 16 >= 7) * -1) + 10, 
			4, 5
		)
		// head
		ctx.drawImage(
			playerImages[12],
			player.dir / 90 * 18, 0, 18, 11, 
			player.x * 32 - cameraX + (canvas.width/2) + (player.walkTime * joyX) - 2, 
			player.y * 32 - cameraY + (canvas.height/2) + (player.walkTime * joyY) - 11, 
			18, 11, 
		)
		//player body		
		ctx.drawImage(
			playerImages[12],
			23, 26, 11, 11, 
			player.x * 32 - cameraX + (canvas.width/2) + (player.walkTime * joyX), 
			player.y * 32 - cameraY + (canvas.height/2) + (player.walkTime * joyY), 
			11, 11
		)
		//bag
		ctx.drawImage(
			playerImages[12],
			player.dir / 90 * 18, 17, 18, 7, 
			player.x * 32 - cameraX + (canvas.width/2) + (player.walkTime * joyX) - 2, 
			player.y * 32 - cameraY + (canvas.height/2) + (player.walkTime * joyY), 
			18, 7
		)
		//left hand
		ctx.drawImage(
			playerImages[12],
			60, 26, 4, 4, 
			player.x * 32 - cameraX + (canvas.width/2) + (player.walkTime * joyX) + ((player.dir % 180 == 90) * 8) - 4, 
			player.y * 32 - cameraY + (canvas.height/2) + (player.walkTime * joyY) + 4, 
			4, 4 
		)
		//right hand
		ctx.drawImage(
			playerImages[12],
			60, 26, 4, 4, 
			player.x * 32 - cameraX + (canvas.width/2) + (player.walkTime * joyX) + ((player.dir % 180 == 90) * -8) + 11, 
			player.y * 32 - cameraY + (canvas.height/2) + (player.walkTime * joyY) + 4, 
			4, 4 
		)


	if (tick % 10 === 1) {
		player.frame++
	}
}


function playerCheckOutOfBounds() {
	if (player.x < -9) {changeScene('edge', -1, 0)}
	if (player.y < -4) {changeScene('edge', 0, -1)}
	if (player.x > 21) {changeScene('edge', 1, 0)}
	if (player.y > 26) {changeScene('edge', 0, 1)}
}

function changeScene(type, dx, dy) {
	if (EDITOR) {saveScene()}

	if (type === 'edge') {
		place.x += dx
		place.y += dy
	}
	place.full = place.name + '.' + place.x + '.' + place.y
	loadScene()

	if (type === 'edge') {
		if (dx) {
			if (dx === 1) {player.x = -9}
			if (dx === -1) {player.x = 21}
		}
		if (dy) {
			if (dy === 1) {player.y = -3}
			if (dy === -1) {player.y = 25}
		}
	}
	particlesArray = []	
}



function saveScene() {
	savedGRIDS[savedNAMES.indexOf(place.full)] = GRID
}

function loadScene() {
	if (savedNAMES.indexOf(place.full) === -1) {
		newMap()
		savedGRIDS.push(GRID)
		savedNAMES.push(place.full)
	}
	GRID = savedGRIDS[savedNAMES.indexOf(place.full)]
}

//MAP STUFF
//==============================================================
//==============================================================

function drawBackground() {
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32), -((cameraY % 32)+32));
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32) + UIImages[0].width, -((cameraY % 32)+32));
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32), -((cameraY % 32)+32) + UIImages[0].height);
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32) + UIImages[0].width, -((cameraY % 32)+32) + UIImages[0].height);
}

function drawTiles(lay) {
	let gidx = Math.floor(cameraX / 32) + ((lay-1)*GMAX*GMAX)
	gidx += GMAX * Math.floor(cameraY / 32)
	let y = -(cameraY % 32)
	let x = -(cameraX % 32)
	
	for (let i = 0; i < 12; i++) {
		x = - (cameraX % 32)
		for (let j = 0; j < 22; j++) {
			if (GRID[gidx] !== 0 && GRID[gidx] !== undefined) {
				ctx.drawImage(
						tileImages[GRID[gidx] + ((GRID[gidx] == 3) * Math.ceil(tick/8) % 4)], 
						x, y
						);
				if (tileSources[GRID[gidx]] === 'img/tiles/tile4f0.png') {
					if (tick % 60 === 1) {
						particlesArray.push(new Particle('smoke', x+11+cameraX, y+cameraY, 0))
					}
					if (Math.random() > 0.999) {
						particlesArray.push(new Particle('spark', x+cameraX, y+cameraY, 50))
					}
				}

			}
			x += 32
			gidx++
		}
		gidx += GMAX-22
		y += 32
		
	}
}



function newMap() {
	GRID = []
	for (let i = 0; i < (GMAX); i++) {
		GRID.push(2)
	}
	for (let i = 0; i < (GMAX-3); i++) {
		GRID.push(2)
		for (let j = 0; j < (GMAX-3); j++) {
			if (Math.random() > 0.7) {
				GRID.push(1);
			} else { 
				GRID.push(0);
			}
		}
		GRID.push(2)
		GRID.push(0)
	}
	for (let i = 0; i < GMAX-1; i++) {
		GRID.push(2)
	}
	for (let i = 0; i < (GMAX*GMAX)*2+(GMAX+1); i++) {
		GRID.push(0)
	}

}

//EDITOR STUFF
//====================================================
//====================================================

function editorStuff() {
	if (isKeyPressed(' ') && (tick % 5 == 0) && !TYPING && !MENU){
		if (EDITOR) {
			saveScene()
			EDITOR = false;
		} else {
			EDITOR = true;
		}
	}
	if (EDITOR) {
		drawEditor()
		drawPallete()
		ctx.fillText('Editor Enabled', 10, 20)
	}
	if (brushnum < 0 || brushnum > tileImages.length-1) {brushnum = 0}
}


function drawEditor() {
	if (mouseX < 500) {
		let gx = Math.floor((mouseX + cameraX) / 32)
		let gy = Math.floor((mouseY + cameraY) / 32)
		let gidx = gx+(gy*GMAX)
		if (brushnum > tileImages.length) {brushnum=0}
		printImg(tileImages[brushnum], (gx*32)-cameraX, (gy*32)-cameraY)

		ctx.strokeRect((gx*32)-cameraX, (gy*32)-cameraY, 32, 32)
		let tmp = gidx + ((LAYER-1)*(GMAX*GMAX))
		if (mouseDown && checkMouseBounds(true)) {
			if (tileSources[GRID[tmp]] === 'img/tiles/tile5.png') {
				tmp2 = DialogueLocations.indexOf(tmp + place.full)
				DIALOGUES.splice(tmp2, 1)
				DialogueLocations.splice(tmp2, 1)
			} 
			if (brushnum === 7) {
				DialogueLocations.push(tmp + place.full)
				DIALOGUES.push('You Saw The Sign!#Did It Open Up Your eyes?#Anyways, the site you\'re on is #cool2themax.github.io!#Tell your friends')
			}
			GRID[tmp] = brushnum
		}
		if (isKeyPressed('e') && checkMouseBounds()) {brushnum = GRID[tmp]}
		
	}
}





function drawPallete(){
	ctx.fillStyle = "black"
	ctx.fillRect(canvas.width - 100, 0, 100, canvas.height)
	pallx += joyX
	pally += joyY
	if (pallx < 0) {pallx=0}
	if (pally < 0) {pally=0}
	if (pallx > 0) {pallx=0}
	if (pally < 0) {pally=0}
	pallIdx = pallx + (pally * 3)
	let gx
	let gy
	let x = 502
	let y = 11

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 3; j++) {
			printImg(UIImages[1], x, y)
			if (j+(i*3)+1 < tileImages.length) {
				printImg(tileImages[j+(i*3)+1], x, y)
			}
			if (j+(i*3)+1 === brushnum) {
				gx = x
				gy = y
			}
			x += 32
		}
	x = 502
	y += 32
	}
	if (mouseX > 502 && mouseDown === true && checkMouseBounds(true)) {
		brushnum = Math.ceil((mouseX-502)/32)+((Math.ceil((mouseY-11)/32))-1)*3
	}
	ctx.strokeRect(gx, gy, 32, 32)
	
}




//PARTICLES
//===========================================================
//===========================================================

var particlesArray = []


class Particle {
	constructor(type, x, y, frame) {
		this.x = x
		this.y = y
		if (type === 'smoke') {
			this.speedY = 1
		} else if (type === 'spark') {
			this.speedY = 6 +((Math.random()-0.5)*4)
			this.speedX = randInt(-3, 3)
		}
		
		this.type = type
		this.frame = frame
	}

	draw() {
		if (this.type === 'smoke') {
			ctx.fillStyle = "rgba(120, 120, 120," + (100-(Math.round(this.frame/4))*3)/100 + ")"
			ctx.fillRect(this.x - cameraX, this.y - cameraY, 10, 10)		
		} else if (this.type === 'spark') {
			ctx.fillStyle = "yellow"
			ctx.fillRect(this.x - cameraX, this.y - cameraY, 2, 2)
		}	
	}

	update() {
		if (this.type === 'smoke') {
			this.y -= this.speedY
		} else if (this.type === 'spark') {
			if (this.frame < 15) {
				this.y -= this.speedY
				this.x += this.speedX
				this.speedY -= 1
				this.speedX = this.speedX * 0.9
			}
		}
		this.frame++
	}



}


function particleStuff(type) {
	let par = particlesArray.length
	for (let i = 0; i < par-1; i++) {
		if (particlesArray[i].type === type) {particlesArray[i].draw()
			if (tick % 5 === 1) {
				particlesArray[i].update()
			}
			if (particlesArray[i].frame > 150) {
				particlesArray.splice(i, 1)
				i--
				par--
			}
		}
	}
}


//FPS
//===========================================================
//===========================================================


let times = []

function fpsStuff() {
	const now = performance.now();
	while (times.length > 0 && times[0] <= now - 1000) {
		times.shift();
	}
	times.push(now);
	if (EDITOR) {
		ctx.fillStyle = 'black'
		ctx.fillText('FPS: ' + times.length, 10, 40)
	}
	if (activeTab) {
		tick++
	}
}
