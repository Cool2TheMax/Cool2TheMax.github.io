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
	requestAnimationFrame(gameLoop)
}


//PLAYER STUFF
//==============================================================
//==============================================================

function playerTick() {
	if (!dialogue) {
		player.currentTile = player.x + 4 + ((player.y+2) * 32)
		if (!(player.walkTime > 0 && player.walkTime < player.walkDelay)) {
			playerControls();
		}
		if (joyDist > 0) {
			tryMove(joyX, joyY)
		}
		cameraX = player.x * 32 + (player.walkTime * joyX) + (EDITOR*50);
		if (cameraX < 0) {cameraX=0}
		if (cameraX > 724+(EDITOR*100)) {cameraX=724+(EDITOR*100)}
		cameraY = player.y * 32 + (player.walkTime * joyY) ;
		if (cameraY > 874) {cameraY=874}
		if (cameraY < 0) {cameraY=0}
		checkForSigns()
	}
}


function checkForSigns() {
	if (player.signReload == 0) {
		if (
			isKeyPressed('z') && 
			player.dir == 0 && 
			(GRID[player.currentTile - GMAX] == 9 || GRID[player.currentTile + (GMAX * (GMAX-1)) == 9]) 
		) 
		{
			player.signReload = 10
			newDialogue()
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
	let playerTile = player.x+4 + ((player.y+2) * 32)
	if (joyY == 0) {
		if (solids[GRID[playerTile + joyX]]) {return true}
	}
	if (joyX == 0) {
		if (solids[GRID[playerTile + (joyY*32)]]) {return true}
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
		((player.x* 32) - cameraX) + canvas.width/2 - (playerImages[0].width * 2) + (player.walkTime * joyX) + 4, 
		((player.y* 32) - cameraY) + canvas.height/2 - (playerImages[0].height) + (player.walkTime * joyY),
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
	printImg(tileImages[0], -((cameraX % 32)+32), -((cameraY % 32)+32));
}

function drawTiles(lay) {
	let gidx = Math.floor(cameraX / 32) + ((lay-1)*GMAX*GMAX)
	gidx += GMAX * Math.floor(cameraY / 32)
	let y = -(cameraY % 32)
	let x = -(cameraX % 32)
	
	for (let i = 0; i < 6; i++) {
		x = - (cameraX % 32)
		for (let j = 0; j < 11; j++) {
			if (GRID[gidx] !== 0 && GRID[gidx] !== undefined) {
				printImg(
						tileImages[GRID[gidx] + ((GRID[gidx] == 5) * Math.ceil(tick/8) % 4)], 
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
		gidx += GMAX-11
		y += 32
		
	}
}



function newMap() {
	for (let i = 0; i < (GMAX); i++) {
		GRID.push(4)
	}
	for (let i = 0; i < (GMAX-2); i++) {
		GRID.push(4)
		for (let j = 0; j < (GMAX-2); j++) {
			if (Math.random() > 0.7) {
				GRID.push(3);
			} else { 
				GRID.push(0);
			}
		}
		GRID.push(4)
	}
	for (let i = 0; i < GMAX; i++) {
		GRID.push(4)
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
		ctx.fillText('Editor Enabled', 10, 40)
	}
	if (brushnum < 1) {brushnum = 2}
}


function drawEditor() {
	if (mouseX < 200) {
		let gx = Math.floor((mouseX + cameraX) / 32)
		let gy = Math.floor((mouseY + cameraY) / 32)
		let gidx = gx+(gy*GMAX)
		if (brushnum===0) {brushnum=2}
		if (brushnum > tileImages.length) {brushnum=0}
		printImg(tileImages[brushnum], (gx*32)-cameraX, (gy*32)-cameraY)

		ctx.strokeRect((gx*32)-cameraX, (gy*32)-cameraY, 32, 32)
		let tmp = gidx + ((LAYER-1)*(GMAX*GMAX))
		if (brushnum===2) {brushnum=0}
		if (mouseDown && checkMouseBounds(true)) {GRID[tmp] = brushnum}
		if (isKeyPressed('e') && checkMouseBounds()) {brushnum = GRID[tmp]}
		
	}
}





function drawPallete(){
	ctx.fillStyle = "black"
	ctx.fillRect(200, 0, 100, 150)
	pallx += joyX
	pally += joyY
	if (pallx < 0) {pallx=0}
	if (pally < 0) {pally=0}
	if (pallx > 0) {pallx=0}
	if (pally < 0) {pally=0}
	pallIdx = pallx + (pally * 3)
	let gx
	let gy
	let x = 202
	let y = 11

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 3; j++) {
			printImg(tileImages[1], x, y)
			if (j+(i*3)+1 < tileImages.length) {
				printImg(tileImages[j+(i*3)+1], x, y)
			}
			if (j+(i*3)+1 === brushnum) {
				gx = x
				gy = y
			}
			x += 32
		}
	x = 202
	y += 32
	}
	if (mouseX > 202 && mouseDown === true && checkMouseBounds(true)) {
		brushnum = Math.ceil((mouseX-202)/32)+((Math.ceil((mouseY-11)/32))-1)*3
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


