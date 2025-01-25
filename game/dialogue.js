let dialogue = false;
let text;
let alreadyPrinted = "";
let letter = 1;
let speaker;
let textSkipNext = false;
let textMultipleNum = -1
let textMultiple = false;
let TYPING = false;
let tpSleepTime = 0


function dialogueStuff() {
	printRect('rgb(43, 43, 43)')
	typeText();
}

function printRect(fill) {
	ctx.fillStyle = fill
	ctx.fillRect(80, 190, canvas.width - 160, 100)
}


var wrapWidth = 320

function typeText() {
	let x = 190
	let y = 210
	ctx.fillStyle = 'rgb(250, 255, 186)';

	ctx.drawImage(speaker, 80, 190 + ((speaker === tileImages[7]) * 10), 96, 96)
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
	
	wrapTextF(alreadyPrinted, x, y, 285, 15)
	if (isKeyPressed('x')) {
		letter = text.length + 1
		alreadyPrinted = text
	}
	if (isKeyPressed('z') && letter == text.length + 1) {
		if (textMultiple) {
			textMultipleNum++
		}
		dialogue = false
	}
	if (tpSleepTime !== 0) {
		tpSleepTime--
		return;
	}
	if (tick % 4 == 3) {
		alreadyPrinted = alreadyPrinted + text.charAt(letter-1)
		if (letter < text.length + 1) {
			letter++
		}
	}
	ctx.font = 'bold 18px monospace'
}


function newDialogue(textLocationI, newSpeaker) {
	dialogue = true;
	if (typeof newText === 'object') {
		textMultipleNum++
		text = newText[textMultipleNum]
		textMultiple = true
	}

	if (DIALOGUES[DialogueLocations.indexOf(textLocationI)] === undefined) {
		text = textLocationI
	} else {
		text = DIALOGUES[DialogueLocations.indexOf(textLocationI)]
	}
	
	selectedInputLocation = textLocationI

	speaker = newSpeaker;
	alreadyPrinted = "";
	letter = 1;
}

//function wrapTextF(ttp, newx, newy, maxWidth, lineHeight) {
//	let currentLine = ''
//	let x = newx
//	let y = newy
//	for (let i = 0; i < ttp.length; i++) {
//		if (ttp.charAt(i) == '~') {
//			i++
//			if (ttp.charAt(i) == 'i') {ctx.font = 'italic 18px monospace'} else 
//			if (ttp.charAt(i) == 'b') {ctx.font = 'bold 18px monospace'}
//			i++
//		} else if (ttp.charAt(i) == ' ') {
//			for (let j = 1; j < ttp.length - i + 1; j++) {
//				if (ttp.charAt(i + j) == ' ') {
//					if ((currentLine.length + j) * 10 > maxWidth + newx) {
//						x = newx
//						y += lineHeight
//						i++
//						currentLine = ''
//						break;
//					}
//				}
//			}
//		}
//		ctx.fillText(ttp.charAt(i), x, y)
//		currentLine = currentLine + ttp.charAt(i)
//		x += 10
//	}
//}


//if anyone can help me
//please do
//how do I wrap the text better
function wrapTextF(ttp, newx, newy, maxWidth, lineHeight) {
	let currentLine = '';
	let x = newx;
	let y = newy;
	for (let i = 0; i < ttp.length; i++) {
		if (ttp.charAt(i) === '~') {
			i++
			if (ttp.charAt(i) === 'i') {
				ctx.font = 'italic 18px monospace'
			} else if (ttp.charAt(i) === 'b') {
				ctx.font = 'bold 18px monospace'
			}
			i++
		}
		if ((currentLine.length * 10) > maxWidth && ttp.charAt(i) === ' ') {
			x = newx
			y += lineHeight
			currentLine = ''
			i++
		}
		if (ttp.charAt(i) === ' ') {
			let j = i + 1
			let checkcl = currentLine.lenght + 1
			while (checkcl * 10 < maxWidth) {
				if (ttp.charAt(j) === ' ') {
					break;
				
				
					if (checkcl * 10 >= maxWidth) {
						x = newx
						y += lineHeight
						currentLine = ''
						i++
					}
				}
				j++
				checkcl++
			}
		}
		ctx.fillText(ttp.charAt(i), x, y);
		currentLine += ttp.charAt(i)
		x += 10
	}
}





