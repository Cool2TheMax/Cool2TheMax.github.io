function start() {
	console.log('gaming');
	ctx.font = "bold 18px monospace"
	newMap();
	gameLoop();
}


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
	}
	
	if (activeTab) {
		tick++
	}
	//ctx.fillStyle = "black"
	//ctx.fillText(cameraX, 10, 40)
	//ctx.fillText(cameraY, 10, 60)
	if (!dialogue && !EDITOR) {
		ctx.drawImage(UIImages[2], 20, 270+Math.round(Math.sin(tick/50)*5), 24, 24)
		if (checkMouseBounds(false, 20, 270+Math.round(Math.sin(tick/50)*5), 44, 294+Math.round(Math.sin(tick/50)*5))) {
			ctx.fillStyle = 'rgb(43, 43, 43)'
			ctx.fillRect(mouseX, mouseY-9, 230, 21)
			ctx.fillStyle = 'rgb(250, 255, 186)'
			ctx.fillText('Not Working Inventory', mouseX+10, mouseY+6)
		}
	}
	requestAnimationFrame(gameLoop)
}


//PLAYER STUFF
//==============================================================
//==============================================================

let editorCamSupplement = 100

let playerXSup = 9
let playerYSup = 4


function playerTick() {
	if (!dialogue) {
		player.currentTile = player.x + playerXSup + ((player.y + playerYSup) * 32)
		if (!(player.walkTime > 0 && player.walkTime < player.walkDelay)) {
			playerControls();
		}
		if (joyDist > 0) {
			tryMove(joyX, joyY)
		}
		cameraX = player.x * 32 + (player.walkTime * joyX) + (EDITOR* (editorCamSupplement/2));
		if (cameraX < 0) {cameraX=0}
		if (cameraX > 422 +(EDITOR*96)) {cameraX= 422 +(EDITOR * editorCamSupplement)}
		cameraY = player.y * 32 + (player.walkTime * joyY) ;
		if (cameraY > 724) {cameraY=724}
		if (cameraY < 0) {cameraY=0}
		checkForSigns()
	}
}


function checkForSigns() {
	if (player.signReload == 0) {
		if (
			isKeyPressed('z') && 
			player.dir == 0 && 
			(GRID[player.currentTile - GMAX] == 7 || GRID[player.currentTile + (GMAX * (GMAX-1)) == 9]) 
		) 
		{
			player.signReload = 10
			newDialogue('You saw the sign!#Did it open up your eyes?#Anyways, the site you\'re on is #cool2themax.github.io! #Tell your friends!', tileImages[7])
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
		player.walkTime++
		if (player.walkTime == player.walkDelay) {
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
		if (solids[GRID[player.currentTile + (joyY*32)]]) {return true}
	}
	return false
}


function drawPlayer() {
	let base
	let costume

	if (joyDist > 0) {
		if (player.frame > 2) {player.frame=1}
		costume = 'img/player/walk' + player.dir + player.frame + '.png'
	} else {
		playerFrame = 1
		costume = 'img/player/idle' + player.dir + '.png'
	}

	if (dialogue) {costume = 'img/player/idle0.png'}
	ctx.drawImage(
		playerImages[playerSources.indexOf(costume)], 
		((player.x * 32) - cameraX) + canvas.width/2 - (playerImages[0].width) + (player.walkTime * joyX) + 4, 
		((player.y * 32) - cameraY) + canvas.height/2 - (playerImages[0].height) + (player.walkTime * joyY) - 9,
		(playerImages[0].width*2),
		(playerImages[0].height*2))
	if (tick % 10 === 1) {
		player.frame++
	}
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
	for (let i = 0; i < (GMAX); i++) {
		GRID.push(2)
	}
	for (let i = 0; i < (GMAX-2); i++) {
		GRID.push(2)
		for (let j = 0; j < (GMAX-2); j++) {
			if (Math.random() > 0.7) {
				GRID.push(1);
			} else { 
				GRID.push(0);
			}
		}
		GRID.push(2)
	}
	for (let i = 0; i < GMAX; i++) {
		GRID.push(2)
	}
	for (let i = 0; i < (GMAX*GMAX)*2; i++) {
		GRID.push(0)
	}

}

//EDITOR STUFF
//====================================================
//====================================================

function editorStuff() {
	if (isKeyPressed(' ') && (tick % 5 == 0)){
		if (EDITOR) {
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
		if (mouseDown && checkMouseBounds(true)) {GRID[tmp] = brushnum}
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
const particlesArray = []


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

