const arrowGUI = {
	activeIndex : -1,
	arrowList : [],
	currentKeys : [false, false, false, false],
	//             up      right down    left
	update : function (newInputCodes) {
		arrowGUI.currentKeys = newInputCodes
		if (arrowGUI.arrowList[arrowGUI.activeIndex] !== undefined) {
			arrowGUI.arrowList[arrowGUI.activeIndex].update()
		}
	}
}
class ArrowSelector {
	constructor(x, y, dimX, dimY, xSeparation, ySeparation, names, arrowOrient) {
		this.x = x
		this.y = y
		this.dimX = dimX
		this.dimY = dimY
		this.ySeparation = ySeparation
		this.xSeparation = xSeparation
		this.names = names
		this.arrowOrient = arrowOrient
		this.arrowLocation = 0
		this.id = arrowGUI.arrowList.length
	}
	draw() {
		for (let i = 0; i < this.dimY; i++) {
			for (let j = 0; j < this.dimX; j++) {
				let arrowBoolean = (i * this.dimX + j == this.arrowLocation && this.arrowOrient !== -1)
				if (this.names[(i * this.dimX) + j] !== undefined) {
					ctx.fillText(this.names[(i * this.dimX) + j], this.x + (this.xSeparation * j) + ((arrowBoolean && this.arrowOrient == 0 && this.dimX == 1) * 23), this.y + (this.ySeparation * i))
				}
				if (arrowBoolean) {
					let y = this.y + (this.ySeparation * i) - 14
					if (this.arrowOrient == 0) {
						let x = this.x + (this.xSeparation * j) + ((this.dimX !== 1) * 20)
						ctx.beginPath()
						ctx.moveTo(19 + x, 8 + y)
						ctx.lineTo(x, 16 + y)
						ctx.lineTo(x, y)
						ctx.lineTo(19 + x, 8 + y)
						ctx.closePath()
						ctx.fill()
					} else if (this.arrowOrient == 1){
						let x = this.x + (this.xSeparation * (j + 1)) + 20 + this.xSeparation
						ctx.beginPath()
						ctx.moveTo(-19 + x, 8 + y)
						ctx.lineTo(x, 16 + y)
						ctx.lineTo(x, y)
						ctx.lineTo(-19 + x, 8 + y)
						ctx.closePath()
						ctx.fill()
					} else {
						let x = this.x + (this.xSeparation * j)
						ctx.strokeRect(x - 2, y - 6, Math.ceil(ctx.measureText(this.names[this.arrowLocation]).width) + 4, newFontSize)
					}
				}
			}
		}
	
	}
	update() {
		if (arrowGUI.currentKeys.indexOf(true) !== -1) {
				if (arrowGUI.currentKeys[0] && this.arrowLocation - this.dimX >= 0) {
					this.arrowLocation -= this.dimX
				}
				if (arrowGUI.currentKeys[2] && this.arrowLocation + this.dimX < this.dimX * this.dimY) {
					this.arrowLocation += this.dimX
				}
				if (arrowGUI.currentKeys[3] && this.arrowLocation % this.dimX !== 0) {
					this.arrowLocation--
				}
				if (arrowGUI.currentKeys[1] && this.arrowLocation % this.dimX !== this.dimX - 1) {
					this.arrowLocation++
				}
		}
	}
}