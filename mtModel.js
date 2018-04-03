
const setSequenceIndex = function(n) {controller().setSequenceIndex(n)}
const mainIndex = function() {return controller().getMainIndex()}
const proceedWhen = function(input) {return controller().proceedWhen(input)}
const logActiveEquation = function() {return controller().logActiveEquation()}

function enterPressed() { 
	if(event.code==="Enter") {return true} else {return false} 
};
function isNotEmpty() { 
	if(event.target.value!=="") {return true} else {return false} 
};
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
const InputField = function(value, index) {
	this.index = index;
	this.value = value;
	this.element = document.createElement("INPUT");	
	this.answers = []
	this.hasListeners = false;
	this.isValid = false;
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
	console.log(this.index)

	// setSequenceIndex(this.index); 
	if(!isNaN(this.element.value) && isNotEmpty()) {
		this.isValid = true;
		proceedWhen(this).isValid();
	} else {
		proceedWhen(this).isInvalid()}
};
InputField.prototype.checkIfCorrect = function(answer) {
	this.saveAnswer(answer);
	if(this.showAnswer() === this.value) {		
		proceedWhen(this.element, this.index).isCorrect()
	} else {
		proceedWhen(this.element, this.index).isIncorrect()
	}
};
InputField.prototype.checkKeyPressed = function() { //  reads the ID of input elements
	this.keyPressed = event.key;
	let currentID = function() {return parseInt(this.element.id)}.bind(this);
	const accept = function () {
		if (this.isValid) {
			this.checkIfCorrect(this.element.value);
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
InputField.prototype.setAs = function(className) {
	this.element.className = className;
	this.element.value = this.value;
	this.element.disabled = true;

	if (className === "active") {
		this.element.value = "";
		this.element.disabled = false;
		if (this.hasListeners===false) { this.addListeners() };
		if (this.hasFocusListener===true) {this.removeFocusListener()}
	} else if (className === "done") {
		this.element.value = this.showAnswer();
		this.removeListeners();
	}
	return this.element;
};
InputField.prototype.setAsFocused = function() { setSequenceIndex(this.index)};
InputField.prototype.addFocusListener = function() {
	this.focusHandler = this.setAsFocused.bind(this);
	this.element.addEventListener("focus", this.focusHandler);
	this.hasFocusListener = true;
};
InputField.prototype.removeFocusListener = function() {
	this.element.removeEventListener("focus", this.focusHandler);
	this.hasFocusListener = false;
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
	this.element.removeEventListener("keydown", this.keydownHandler);
	this.hasListeners = false;
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
EquationParagraph.prototype.checkTimesAnswered = function() {
	return {
		correctly: this.answeredCorrectly.filter(correct => correct === true).length,
		incorrectly: this.answeredCorrectly.filter(correct => correct === false).length,
	}
};
EquationParagraph.prototype.createLeftSide = function(n) {
	let equationElements = [
		this.elementX, this.elementMultiplication, this.elementY, this.elementEqual, this.elementZ
	];
	let equationElementsSetUp = []
	for (i=0; i<equationElements.length; i++) {
		if (i===n) {equationElementsSetUp.push( equationElements[i].setAs("active"))} else {
			equationElementsSetUp.push( equationElements[i].setAs("inactive") )
		};
    };
	return equationElementsSetUp;
};
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
ArrayOfEquations.prototype.get = function() { 
	return this.array 
};
ArrayOfEquations.prototype.getElementByIndex = function(i) {
	return this.array.find( element => element.index === i )
}
ArrayOfEquations.prototype.getElementByXYValues = function(x,y) {
	return this.array.find( element => element.x === x &&  element.y === y)
}
ArrayOfEquations.prototype.getMirrorElement = function(x,y) {
	return this.array.find( element => element.x === y &&  element.y === x)
}
ArrayOfEquations.prototype.getElementByIndexValue = function(n) {
	return this.array.find( element => element.index === n)
}
ArrayOfEquations.prototype.getSumOfAnswersForMirrorElements = function(x,y) {
	let firstElement = this.array.find( element => element.x === x &&  element.y === y);
	let mirrorElement = this.array.find( element => element.x === y &&  element.y === x);
	return {
		correct: firstElement.checkTimesAnswered().correctly + mirrorElement.checkTimesAnswered().correctly,
		incorrect: firstElement.checkTimesAnswered().incorrectly + mirrorElement.checkTimesAnswered().incorrectly,
	}
}
ArrayOfEquations.prototype.getAllEquationsAnsweredIncorrectly = function() {
	let incorrectlyAnswered = [];
	this.array.map(function(equation) {
		if (equation.checkTimesAnswered().incorrectly > 0) {
			incorrectlyAnswered.push(equation);
		}
	})
	return incorrectlyAnswered;
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
StoredValue.prototype.get = function() {return this.value};
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
Score.prototype.updateWhenCorrect = function() { this.strikeIncrement(); this.increment() };
Score.prototype.updateWhenIncorrect = function() { this.strikeReset() };
Score.prototype.increment = function() { this.globalScore = this.globalScore + 1 + this.strike * 2; return this.globalScore };
Score.prototype.get = function() { return this.globalScore };

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// *** M O D E L *** ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
	score: new Score(),
	array: new ArrayOfEquations(),
	page: [
		{
			name: "Fill the table", 
			sequence: new Sequence(80).getOrdered(),
			index: 0,
		},
		{
			name: "Fill the gaps", 
			sequence: [],
			index: 0,
		},
		{
			name: "Reveal the photo", 
			sequence: new Sequence(80).getShuffled(),
			index: 0,
		},
		{
			name: "Fast counting", 
			sequence:new Sequence(80).getShuffled(),
			index: 0,
		},
		{
			name: "Results", 
			sequence:new Sequence(80).getOrdered(),
			index: 0,
		},
	],
	activePageIndex: new StoredValue(),
};

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
