let dialogue = false;
let text;
let alreadyPrinted = "";
let letter = 1;
let speaker;
let textSkipNext = false;
let textMultipleNum = 0
let textMultiple = false;
let TYPING = false;
let tpSleepTime = 0
let textSource = ''


function dialogueStuff() {
	printRect('rgb(43, 43, 43)')
	typeText();
}

function printRect(fill) {
	ctx.fillStyle = fill
	ctx.fillRect(80, 190, canvas.width - 160, 100)
	ctx.fillStyle = 'black'
	ctx.strokeRect(80, 190, canvas.width - 160, 100)
}


var wrapWidth = 320

function typeText() {
	let x = 190
	let y = 210
	ctx.fillStyle = 'rgb(250, 255, 186)'
	if (speaker == 's' || speaker == 'c') {
		printTileImgFromMap('tile', 7 + ((speaker == 'c') * 1), 80, 190 + ((speaker == 's') * 10), 96, 96)
	} else {
		ctx.drawImage(NPCImages[speaker], 80, 190, 96, 96)
	}
	if (EDITOR && !(letter == text.length + 1) && !TYPING) {
		selectedArray = 'd'
		alreadyPrinted = text
		letter = text.length + 1
		TYPING = true
		
		typedInputBox.style.display = 'block'
		typedInputBox.value = text
		document.getElementById("submitButton").style.display = 'block'
		return;
	}
	
	wrapTextF(alreadyPrinted, x, y, 32, 15)
	if (isKeyPressed('x')) {
		letter = text.length + 1
		alreadyPrinted = text
	}
	if (isKeyPressed('z') && letter == text.length + 1 && !player.zHeldDown) {
		if (textMultiple) {
			if (textSource[textMultipleNum] !== undefined) {
				textMultipleNum++
				alreadyPrinted = ''
				letter = 1
				text = textSource[textMultipleNum]
				if (text == undefined) {
					text = ''
					dialogue = false
					NPCttp = -1
					return;
				}
			} else {
				NPCttp = -1
				text = ''
				textMultiple = false
				textMultipleNum = 0
				dialogue = false
				return;
			}
		} else {
			letter = 1
			text = ''
			NPCttp = -1
			dialogue = false
			return;
		}
	}
	if (tick % 4 == 3) {
		if (letter < text.length + 1) {
			alreadyPrinted = alreadyPrinted + text.charAt(letter - 1)
			letter++
			
		}
	}
	ctx.font = 'bold 18px monospace'
}


function newDialogue(textLocationI, newSpeaker) {
	dialogue = true;
	textSource = textLocationI
	selectedInputLocation = textLocationI
	textMultipleNum = 0
	speaker = newSpeaker;
	alreadyPrinted = "";
	letter = 1;
	if (DIALOGUES[DialogueLocations.indexOf(textLocationI)] === undefined) {
		text = textLocationI
	} else {
		text = DIALOGUES[DialogueLocations.indexOf(textLocationI)]
		textSource = DIALOGUES[DialogueLocations.indexOf(textLocationI)]
	}
	if (text[0].length > 1) {
		if (text !== textLocationI) {
			text = DIALOGUES[DialogueLocations.indexOf(textLocationI)][0]
		} else {
			text = textLocationI[0]
			textSource = textLocationI
		}
		textMultiple = true	
	} else {
		textMultiple = false
	}
}



function wrapTextF(ttp, newx, newy, maxWidth, lineHeight) {
	let letteridx = 0
	let yIdx = newy
	let wordList = []
	let word = ''
	let curLineLength = 0
	let prevLetter = ''
	while (ttp.charAt(letteridx) !== '') {
		word = ''
		while (!(ttp.charAt(letteridx) == '' || ttp.charAt(letteridx) == ' ' || prevLetter == '~')) {
			if (ttp.charAt(letteridx) !== '~') {
				word += ttp.charAt(letteridx)
			} else {
				curLineLength--
			}
			prevLetter = ttp.charAt(letteridx)
			letteridx++
		}
			if (curLineLength + word.length >= maxWidth) {
			curLineLength = 0
			yIdx += lineHeight
			
		}
		for (let i = 0; i < word.length; i++) {
			ctx.fillText(word.charAt(i), newx + (curLineLength * 10), yIdx)
			curLineLength++
		}
		if (prevLetter == '~') {
			if (ttp.charAt(letteridx) == 'i') {
				ctx.font = 'italic 18px monospace'
			} else if (ttp.charAt(letteridx) == 'b') {
				ctx.font = 'bold 18px monospace'
			}
			prevLetter = ''
		}
		letteridx++
		curLineLength++
	}
}
