
const setArrayIndex = function(n) {controller().setArrayIndex(n)}
const mainIndex = function() {return controller().getMainIndex()}


function createElement (tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
};
function appendAllTo(elementType, array) {
	const parent = document.createElementement(elementType)
	array.map(function(item) {parent.appendChild(item)})		
	return parent;
};
function enterPressed() { 
	if(event.code==="Enter") {return true} else {return false} 
};
function isNotEmpty() { 
	if(event.target.value!=="") {return true} else {return false} 
};
function proceedWhen(input) {
	const score = controller().score;
	const isInvalid = function() {
		console.log("invalid")
		input.setAttribute("valid", false);
		return
	};
	const isValid = function() {
		console.log("valid")
		input.setAttribute("valid", true);
	};
	const isIncorrect = function() {
		console.log("incorrect")
		score.strikeReset();
		// controller().getActiveEquation().answeredCorrectly.push(false)
		viewModule().update( mainIndex() )
	};
	const isCorrect = function() {
		console.log("correct")
		score.strikeIncrement();
		score.increment();
		// console.log(  )
		// controller().getActiveEquation().answeredCorrectly.push(true)
		viewModule().update( mainIndex() )
	};	 
	return {
		isInvalid: isInvalid,
		isValid: isValid,
		isIncorrect: isIncorrect,
		isCorrect: 	isCorrect,
	};
};		

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
const InputField = function(value, index) {
	this.index = index;
	this.value = value;
	this.element = document.createElement("INPUT");	
	this.userAnswer = "";
	this.answers = []
	this.hasListeners = false;
};
InputField.prototype.getElement = function() {
	return this.element;
};
InputField.prototype.saveAnswer = function(answer) {
	this.answers[ mainIndex() ] = parseInt(answer);
};
InputField.prototype.showAnswer = function() {
	return this.answers[ mainIndex() ];
};
InputField.prototype.checkIfValid = function() {
	setArrayIndex(this.index);
	if(!isNaN(this.element.value) && isNotEmpty()) {
		proceedWhen(this.element).isValid();
		return true;
	} else {
		proceedWhen(this.element).isInvalid()}
		return false;
};
InputField.prototype.checkIfCorrect = function(answer) {
	this.element.value = "";
	this.saveAnswer(answer);
	if(this.showAnswer() === this.value) {
		proceedWhen(this.element).isCorrect()
	} else {
		proceedWhen(this.element).isIncorrect()
	}
};
InputField.prototype.checkKeyPressed = function() { //  reads the ID of input elements
	this.keyPressed = event.key;
	let currentID = function() {return parseInt(this.element.id)}.bind(this);
	const accept = function () {
		if (this.checkIfValid()) {
			this.checkIfCorrect(this.element.value);
			console.log("accepted");
		} else {
			console.log("not-accepted")
		}			
	}.bind(this);
	const keys = {
		Enter: (function() {if (isNotEmpty()) {accept()} else {move().right()} }),
		ArrowRight: (function() { move().right() }),
		ArrowLeft: (function() { move().left() }),
		ArrowDown: (function() { move().down() }),
		ArrowUp: (function() { move().up() }),		
	};
	Object.keys(keys).forEach(function (name) {if(event.key === name) {keys[name]()} })

	function move () {
		const oneRight = function() {return document.getElementById(currentID()+1)};
		const oneLeft = function() {return document.getElementById(currentID()-1)};
		const oneDown = function() {return document.getElementById(currentID()+8)};
		const oneUp = function() {return document.getElementById(currentID()-8)};
		return {
			right: function() {if (oneRight()) {oneRight().focus()}},
			left: function() {if (oneLeft()) {oneLeft().focus()}},
			down: function() {if (oneDown()) {oneDown().focus()}},
			up: function() {if (oneUp()) {oneUp().focus()}},
		}
	}
};
InputField.prototype.isActive = function() {
	this.element.disabled = false;
	this.element.value = "";
	if (this.hasListeners===false) { this.addListeners() };
	return this.element;
};
InputField.prototype.isInactive = function(className) {
	this.element.value = this.value;
	this.element.disabled = true;
	this.element.className = className;
	return this.element;
};
InputField.prototype.isDone = function(className) {
	console.log("saodfn")
	this.element.value = this.showAnswer();
	this.element.className = className;
	this.element.disabled = true;
	this.element.setAttribute("done", true)
	return this.element;
};
InputField.prototype.addListeners = function() {
	this.inputHandler = this.checkIfValid.bind(this);
	this.keydownHandler = this.checkKeyPressed.bind(this);
	this.element.addEventListener("input", this.inputHandler)
	this.element.addEventListener("keydown",this.keydownHandler)
	this.hasListeners = true;
};
InputField.prototype.removeListeners = function() {
	this.element.removeEventListener("input", this.inputHandler);
	this.element.removeEventListener("keydown", this.keydownHandler)
};
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
const EquationParagraph = function(x,y,index) {
  this.x = x;
  this.y = y;
  this.z = this.x * this.y;
  this.index = index;
  this.answeredCorrectly = [];
  this.elementX = new InputField(this.x, this.index);
  this.elementY = new InputField(this.y, this.index);
  this.elementZ = new InputField(this.z, this.index);
  this.elementMultiplication = new InputField("*")
  this.elementEqual = new InputField("=")
};
EquationParagraph.prototype.createLeftSide = function(n) {
	let equationElements = [
		this.elementX, this.elementMultiplication, this.elementY, this.elementEqual, this.elementZ
	];
	let equationElementsSetUp = []
	for (i=0; i<equationElements.length; i++) {
		equationElementsSetUp.push( equationElements[i].isInactive("inactive") )
		if (i===n) {equationElementsSetUp.push( equationElements[i].isActive("active") )}
	}
	return equationElementsSetUp;
}
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
const ArrayOfEquations = function(givenArray) {
	this.array = [];
	let loopCounter = -1;
	for (let i = 1; i < 10; i++ ) {
		for (let j = 1; j < 10; j++ ) {
	  	loopCounter ++;
	  	let equation = new EquationParagraph(i, j, loopCounter);
	  	this.array.push(equation);
		};
	};	
};
ArrayOfEquations.prototype.get = function() { return this.array };
// ArrayOfEquations.prototype.getElementByIndex = function(i) {
// 	for (equation in this.array) {
// 		if (this.array[equation].index === i) {return this.array[equation]}
// 	}
// };

function showResults (array) {
	const containerElement = createElement( "DIV", "results");
	return containerElement;
}
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
const Sequence = function(n) {
	this.array = [];
	for (let i = 0; i <= n; i++) { this.array.push(i) }
};
Sequence.prototype.getOrdered = function() {return this.array};
Sequence.prototype.getShuffled = function() {
	this.copiedArray = this.array.slice()
	return shuffle(this.copiedArray);
};
function shuffle (array) {
   for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  return array;
};
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
const StoredValue = function() {
  	this.value;
};
StoredValue.prototype.set = function(n) {this.value = n};
StoredValue.prototype.get = function(n) {return this.value};
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
const Score = function(initialValue) {
	if (initialValue) {
		this.globalScore = initialValue;
	} else { this.globalScore = 0 };  
  this.strike = 0;

};
Score.prototype.strikeIncrement = function() { this.strike ++ };
Score.prototype.strikeReset = function() { this.strike = 0 };
Score.prototype.increment = function() { this.globalScore = this.globalScore + 1 + this.strike * 2; return this.globalScore };
Score.prototype.get = function() { return this.globalScore };

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// *** M O D E L *** ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
	score: new Score(),
	array: new ArrayOfEquations().get(),
	pages: [
		[new Sequence(80).getOrdered(), 0, "Fill the table",  ],
		[new Sequence(80).getShuffled(), 0, "Fill the gaps" ],
		[new Sequence(80).getShuffled(), 0, "Reveal the photo" ],
		[new Sequence(80).getShuffled(), 0, "Fast counting" ],
	],
	activePageIndex: new StoredValue(),
};

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////