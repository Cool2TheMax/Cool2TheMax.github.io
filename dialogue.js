var dialogue = false;
var text;
var alreadyPrinted = "";
var letter = 1;


function dialogueStuff() {
	printRect('red')
	typeText();
}

function printRect(fill) {
	ctx.fillStyle = fill
	ctx.fillRect(10, 100, 280, 60)
}

function typeText() {
	ctx.fillStyle = 'black';
	ctx.fillText(alreadyPrinted, 15, 115);
	if (tick % 4 == 3) {
		alreadyPrinted = alreadyPrinted + text.charAt(letter-1)
		if (letter < text.length + 1) {
			letter++
		}
	}
	if (isKeyPressed('x')) {
		letter = text.length + 1
		alreadyPrinted = text
	}
	if (isKeyPressed('z') && letter == text.length + 1) {
		dialogue = false
	}
}

function newDialogue() {
	if (tick == 1) {console.log('hi')}
	dialogue = true;
	text = 'this is a sign'
	alreadyPrinted = "";
	letter = 1;
	dialogueStuff()
}


