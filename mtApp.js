function appendAllTo(elementType, array) {
	const parent = document.createElement(elementType)
	array.map(function(item) {parent.appendChild(item)})		
	return parent;
};
function enterPressed() { 
	if(event.code==="Enter") {return true} else {return false} 
};
function isEmpty(input) { 
	if(input==="") {return true} else {return false} 
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
		// inputIsValid = true;
				// inputFields.map(function(item) {item.disabled = false});
		input.setAttribute("valid", true);
	};
	const isIncorrect = function() {
		console.log("incorrect")
		score.strikeReset();
		isDone();
		view.update( controller().activeFunctionIndex.get() )
	};
	const isCorrect = function() {
		console.log("correct")
		score.strikeIncrement();
		score.increment();
		isDone();
		view.update( controller().activeFunctionIndex.get() )
	};
	const isDone = function() {
		input.disabled = true;
		input.setAttribute("done", true)
		
	};	 
	return {
		isInvalid: isInvalid,
		isValid: isValid,
		isIncorrect: isIncorrect,
		isCorrect: 	isCorrect,
		isDone: isDone,
	};
};		
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// *** M O D E L *** ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
const InputField = function(value) {
	this.element = document.createElement("INPUT");
	this.value = value;
	this.userAnswer = "";
};
InputField.prototype.getElement = function() {
	return this.element;
};
// setup


InputField.prototype.checkIfValid = function() {
	if(!isNaN(this.value)) {proceedWhen(this).isValid()} else {proceedWhen(this).isInvalid()}
};
InputField.prototype.onKeydown = function(event, input) {	
	 {
		this.checkIfCorrect(input.element)
}
	// return this.checkIfValid(this.element);
};

// InputField.prototype.checkIfValid = function(input) {
// 	if(!isNaN(input.value)) {proceedWhen(input).isValid()} else {proceedWhen(input).isInvalid()}
// };
InputField.prototype.checkIfCorrect = function(input) {
	this.userAnswer = parseInt(input.value);
	if(this.userAnswer === this.value) {
		proceedWhen(input).isCorrect()
	} else {
		proceedWhen(input).isIncorrect()
	}
};
InputField.prototype.isActive = function() {
	if (this.userAnswer !== "") { this.isDone() } else {
		this.element.value = "";
		this.element.addEventListener("input", this.checkIfValid) //passes the target element to the handler, NICE!
		this.element.addEventListener("keydown", function onKeydown (event) {
			if( enterPressed() && !isEmpty(this.element)) {
				this.checkIfCorrect(this.element)
			}
			this.element.removeEventListener("keydown", onKeydown)
		}.bind(this));

	}
	return this.element;
};
InputField.prototype.isInactive = function(className) {
	this.element.value = this.value;
	this.element.disabled = true;
	this.element.className = className;
	return this.element;
}
InputField.prototype.isDone = function(className) {
	console.log("saodfn")
	// this.element.removeEventListener("input", validate)
// 	this.element.removeEventListener("input", checkIfCorrect)
// 	this.element.disabled = true;
// 	this.element.className = className;
// 	return this.element;
}
// USERANSWER, DONE, REMOVE EVENT LISTENERS I WSZYSTKIE ZMIANY DANYCH PRZEZ USERA
// MUSI BYĆ ZAPISANE W MODELU - CZYLI PRZECHODZI DO FUNKCJI PROCEED,
// KTÓRA ZACIĄGA PARAMETR ARRAY (MODEL.ARRAY), I MOŻE W NIM ZAPISYWAĆ TE DANE. (GETCURRENTEEMENT)
// CAŁA RESZTA JEST TWORZONA OD ZERA PO VIEW.UPDATE, 
// CZYLI GENERALNY SETUP POWSTAJE W CONSTRUKTORACH, SETUP DLA SESJI I UZYTKOWNIKA ODTWARZA SIE Z MODELU. 

const EquationParagraph = function(x,y,index) {
this.x = x;
  this.y = y;
  this.z = this.x * this.y;
  this.index = index;
  this.elementX = new InputField(this.x)
  this.elementY = new InputField(this.y)
  this.elementZ = new InputField(this.z)
  this.elementMultiplication = new InputField("*")
  this.elementEqual = new InputField("=")
   // [ 2, 6, 12, 64 ]
};
// EquationParagraph.prototype.setBlankPosition = function(p) {
// 	this.blankPosition = p;
// };
EquationParagraph.prototype.isDone = function() {
	if (this.userAnswer !=="") {return true} else {return false}
}

EquationParagraph.prototype.setUpOptions = function(i) {
	this.options = [
		(function() {
			// this.elementZ.create()
			("first-rows")
			// console.log(this.elementZ instanceof InputField)
			// this.elementBlank.setAttribute("position", "z")
			return [ this.elementZ.setUpActive() ]
		}.bind(this)),

		(function() { console.log(this)
			return [this.elementX, this.elementMultiplication, this.elementY, this.elementEqual, this.elementBlank]
		}.bind(this)),
		(function() { console.log(this)
			return [this.elementX]
		}.bind(this)),

	]
	return appendAllTo("DIV", this.options[i]() );
}

// EquationParagraph.prototype.checkAnswer = function(answer) {
// 	// console.log( this.elementZ.value )
// 	this.correctAnswer = this[this.blankPosition];
// 	// console.log( this.elementBlank.getAttribute("position") )
// 	this.userAnswer = answer;
// 	if (answer=== this.correctAnswer) {return true} else {return false};
// };

const test = function() {
	const equationParagraph = controller().getCurrentElement().setUpOptions(0);
	console.log(controller().getCurrentElement())
	return equationParagraph
};

function insertTable (array) {
	const containerElement = createEl( "DIV", "table");
	array.map(function(equation) {
		containerElement.appendChild(equation.elementZ.getElement());
		if (equation.x === 1 || equation.y === 1 ) { 
			equation.elementZ.isInactive(("given-number"));	
 		} else { equation.elementZ.isActive() }
      // inputField.value = equation.userAnswer; // if there is one entered previously;
      // if (inputField.value !== "") { // marked as "done"; otherwise it would be editable
      //   inputField.setAttribute("done", true);
      // };    
    	// };
	})
	return containerElement;
};

const ArrayOfEquations = function(givenArray) {
	this.index = 0;
	this.array = [];
	let loopCounter = -1;
	for (let i = 1; i < 10; i++ ) {
		for (let j = 1; j < 10; j++ ) {
	  	loopCounter ++;
	  	let equation = new EquationParagraph(i, j, loopCounter);
	  	this.array.push(equation);
		};
	};
	this.copiedArray = this.array.slice()
	this.shuffledArray = shuffle(this.copiedArray);
};
ArrayOfEquations.prototype.setBlankPositionForAll = function(p) {
	this.array.map(function(equation) {
		equation.blankPosition = p;
	})
};
ArrayOfEquations.prototype.getOrdered = function() { 
	for (let i = 0; i < this.array.length; i++ ) {
		this.array[i].displayIndex = i;
	}
	return this.array 
};
ArrayOfEquations.prototype.getShuffled = function() {
	for (let i = 0; i < this.shuffledArray.length; i++ ) {
		this.shuffledArray[i].displayIndex = i;
	}
	return this.shuffledArray 
};





const Equation = function(x, y, index) {
  this.x = x;
  this.y = y;
  this.z = this.x * this.y;
  this.index = index;
  this.displayIndex = this.index;
  this.blankPosition;  
  this.userAnswer = "";
  // this.numberOfTimesAnsweredCorrectly = 0;

  this.input = new InputField
};
Equation.prototype.checkAnswer = function(answer) {
	let correctAnswer = this[this.blankPosition];
	this.userAnswer = answer;
	if (answer===correctAnswer) {return true} else {return false};
};
Equation.prototype.setBlankPosition = function(p) {
	this.blankPosition = p;
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
const EquationsArray = function(givenArray) {
	this.index = 0;
	this.array = new Array();
	let loopCounter = -1;
	for (let i = 1; i < 10; i++ ) {       
		for (let j = 1; j < 10; j++ ) {
	  	loopCounter ++;
	  	let equation = new Equation(i, j, loopCounter);
	  	this.array.push(equation);
		};
	};
	this.copiedArray = this.array.slice()
	this.shuffledArray = shuffle(this.copiedArray);
	
};
EquationsArray.prototype.getOrdered = function() { 
	for (let i = 0; i < this.array.length; i++ ) {
		this.array[i].displayIndex = i;
	}
	return this.array 
};
EquationsArray.prototype.getShuffled = function() {
	for (let i = 0; i < this.shuffledArray.length; i++ ) {
		this.shuffledArray[i].displayIndex = i;
	}
	return this.shuffledArray 
};
EquationsArray.prototype.setBlankPositionForAll = function(p) {
	this.array.map(function(equation) {
		equation.blankPosition = p;
	})
};
EquationsArray.prototype.getCurrentElement = function() { return this.array[this.index] };


const StoredValue = function(value) {
  this.value = value;
};
StoredValue.prototype.set = function(n) {this.value = n};
StoredValue.prototype.get = function(n) {return this.value};
StoredValue.prototype.noChange = function() {
	return this.set(this.get())
};


const Score = function(initialValue) {
	if (initialValue) {
		this.globalScore = initialValue;
	} else { this.globalScore = 0 };  
  this.strike = 0;
  // this.getBaseFrom = function(n) { localBase = n }; // How to define parameteras an anonymous function?""
};
Score.prototype.strikeIncrement = function() { this.strike ++ };
Score.prototype.strikeReset = function() { this.strike = 0 };
Score.prototype.increment = function() { this.globalScore = this.globalScore + 1 + this.strike * 2; return this.globalScore };
Score.prototype.get = function() { return this.globalScore };

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
	array: new ArrayOfEquations(),
	activeFunctionIndex: new StoredValue(),
	currentIndexes:[-1,0,0,0],
	score: new Score(),
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = function() {
	const score = model.score;
	const activeFunctionIndex = model.activeFunctionIndex;
	const array = [
		(function() {
			// model.array.setBlankPositionForAll("z");
			return model.array.getOrdered();
		}),
		(function() {
			model.array.setBlankPositionForAll("z");
			return model.array.getShuffled();
		}),
		(function() {
			model.array.setBlankPositionForAll("z");
			return model.array.getOrdered();
		}),
		(function() {
			return model.array.getShuffled();
		}),

	];
	getCurrentArrayState = function() { return array[ activeFunctionIndex.get() ] () };
	getCurrentElement = function() { return getCurrentArrayState()[ getCurrentArrayIndex() ] };
	// getPreviousElement = function() { return getCurrentArrayState()[ getCurrentArrayIndex() -1 ] };
	setCurrentArrayIndex = function(n) { model.currentIndexes[ activeFunctionIndex.get() ] = n};
	getCurrentArrayIndex = function() { return model.currentIndexes[ activeFunctionIndex.get() ] };	
	incrementCurrentArrayIndex = function(n) { model.currentIndexes[ activeFunctionIndex.get() ] ++};
	return {
		score: score,
		activeFunctionIndex: activeFunctionIndex,
		getCurrentArrayState: getCurrentArrayState,		
		getCurrentElement: getCurrentElement,
		// getPreviousElement: getPreviousElement,
		setCurrentArrayIndex: setCurrentArrayIndex,
		getCurrentArrayIndex: getCurrentArrayIndex,	
		incrementCurrentArrayIndex: incrementCurrentArrayIndex,	
	};
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
const createEl = function(tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
};
const SidebarComponent = function(content, attachedFunction) {
	this.divElement = createEl( "DIV", "sidebarChildren", content);	
	this.divElement.addEventListener("click", attachedFunction.bind(this) )
};
SidebarComponent.prototype.setActiveAttribute = function() {
	this.divElement.setAttribute("active", true);
};
const createSidebar = function() {
	const containerElement = createEl( "DIV", "sidebarContainer");
	const sidebarComponents = [
			new SidebarComponent("Fill the table", (function() { view.update(0) }) ),
			new SidebarComponent("Fill the gaps", (function() { view.update(1) }) ),
			new SidebarComponent("Reveal the photo", (function() { view.update(2) }) ),
			new SidebarComponent("Fast counting", (function() { view.update(3) }) ),
	];
	sidebarComponents.forEach(function(item) {
		containerElement.appendChild( item.divElement );
	})
	const setActiveAttribite = function() {
		sidebarComponents[ controller().activeFunctionIndex.get() ].setActiveAttribute();
	}();
	return containerElement;
};
const createResults = function() {
	const content = function() {
		return "RESULTS"
	}
	return createEl( "DIV", "resultsDiv", content()); 
}
const createScore = function() {
	return createEl( "DIV", "scoreDiv", controller().score.get());
}
const createMain = function() {
	active = (function() {return controller().activeFunctionIndex.get() });
	currentArray = (function() { return controller().getCurrentArrayState() });
	const pages = [
			(function(n) {return insertTable(n) }),
			(function(n) {return insertEquationParagraph() }),
			(function(n) {return insertPhoto(n) }),
			(function(n) {return test()   }),
	];
	return pages[active()]( currentArray() )
};
// const insertTable = function(array) {
// 	const containerElement = createEl( "DIV", "table");
// 	let id = 0;
// 	array.map(function(equation) {
// 		const inputField = createEl("INPUT", "table-input");
// 		const inputFieldDiv = createEl("DIV", "table-squares");
// 		containerElement.appendChild(inputFieldDiv);
// 		inputFieldDiv.appendChild(inputField);
// 		inputField.setAttribute("displayIndex", equation.displayIndex)
// 		// console.log(equation.index)
// 		if (equation.x === 1 || equation.y === 1 ) { 
// 			inputField.value = equation.z;
// 			inputField.setAttribute("disabled", true)
// 			inputField.className = "first-rows";
//  		} else {
//  			inputField.id = id; id++
//       inputField.value = equation.userAnswer; // if there is one entered previously;
//       if (inputField.value !== "") { // marked as "done"; otherwise it would be editable
//         inputField.setAttribute("done", true);
//       };    
//     };
// 	})
// 	return containerElement;
// };
const insertEquationParagraph = function() {
	const containerElement = createEl( "DIV", "equationParagraph")
	const currentEquation = controller().getCurrentElement()
	
	const assignElementValues = function(arrayOfElements) {
		const equationElements = [];
		for (let i = 0; i<5; i++) {
			let inputField = createEl ("INPUT", "equationElements");
			equationElements.push(inputField)
			containerElement.appendChild(inputField);
			inputField.id = i;
			inputField.value = arrayOfElements[i];			
		}
		for (let i = 0; i<5; i++) {
			equationElements[i].disabled = true;
			if (arrayOfElements[i] === "") {
				equationElements[i].setAttribute("displayIndex", currentEquation.displayIndex);
				equationElements[i].setAttribute("blankposition", arrayOfElements[5]);
				console.log("for equation par displayindex is " + currentEquation.displayindex)
				console.log("for equation par z is " + currentEquation.z)
				equationElements[i].className = "table-input";
				equationElements[i].disabled = false;
					// console.log(equationElements[key])
			}		
		}		
	}

	let equationTypes = [
		assignElementValues([currentEquation.x, "*", currentEquation.y, "=", ""									, "z"]),
		// assignElementValues([currentEquation().x, "*",  ""								, "=", currentEquation().z]),
	]
	// equationTypes[1]
	return containerElement
};

const insertPhoto = function(array) {
	const containerElement = createEl( "DIV", "photo");

	const canvas = document.createElement('CANVAS');
	let [canvasWidth, canvasHeight] = [9*48, 9*48];
 	canvas.setAttribute('width', canvasWidth);
  canvas.setAttribute('height', canvasHeight);
  const ctx = canvas.getContext("2d");

  const drawGrid = function(lineWidth, rows, columns) {
  	console.log("draw")
    for (let i = 0; i < rows; i ++) {
      for (let j = 0; j < columns; j ++) {
        ctx.rect(canvasWidth / rows * i, canvasHeight / columns * j,
                 canvasWidth / rows, canvasHeight / columns
        ); // ctx.rect(x, y, width, height);
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };
    };
  }(1, 9, 9);
//   array.map( function(equation) {
//   let x = equation.x;
//   let y = equation.y;
//   ctx.drawImage(picture,
//                 pictureWidth / 10 * x, pictureHeight / 10 * y, // sx, sy (crop starting point coords)
//                 pictureWidth / 10, pictureHeight / 10, // sWidth, sHeight (crop dimensions)
//                 canvasWidth / 10 * x, canvasHeight / 10 * y, // ?
//                 canvasWidth / 10, canvasHeight / 10 // ?
//   );
// });
  containerElement.appendChild(canvas);
  containerElement.appendChild(insertEquationParagraph());

  return containerElement;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
const ViewComponent = function(parentElement, attachedFunction) {
	this.parentElement = parentElement;
	this.attachedFunction = attachedFunction;
};
ViewComponent.prototype.clear = function() {
	if (this.parentElement.firstChild) {
 		this.parentElement.removeChild(this.parentElement.firstChild);
 	};
};
ViewComponent.prototype.render = function() {
	this.clear();
  this.parentElement.appendChild( this.attachedFunction() );
};

const view = {}
view.components = {}
view.components.sidebar = new ViewComponent(document.querySelector('.sidebar'), createSidebar );
view.components.results = new ViewComponent(document.querySelector('.results'), createResults );
view.components.score = new ViewComponent(document.querySelector('.score'), createScore );
view.components.main = new ViewComponent(document.querySelector('.main'), createMain );

view.update = function(v) {
	
	// const getActiveElement = function() { return document.activeElement }
	if(!v) { controller().activeFunctionIndex.noChange() };
	controller().activeFunctionIndex.set(v);
	for (component in this.components) {this.components[component].render() };
	inputFocus();
	

	// controller().setCurrentArrayIndex( getActiveElement().getAttribute("displayindex") );

	// console.log(" on update function current equation is " + controller().getCurrentArrayIndex() )
	// console.log(" on update function active element index is " + getActiveElement().getAttribute("displayindex"));

	// events( controller().getCurrentElement(), getActiveElement() );
		controller().incrementCurrentArrayIndex();
};
const inputFocus = function () {
	const inputFields = Array.from(document.querySelectorAll("input"));
	for (let i = 0; i < inputFields.length; i ++) {
		if (inputFields[i].value === "") {
			inputFields[i].focus();
			break;
		} 
	}
};
// const events = function(currentEquation, activeInput) {
// 	const inputFields = Array.from(document.querySelectorAll("input"));
// 	// let activeInput;
// 	const answer = function() {return parseInt(activeInput.value)};
// 	let isValid = false;
// 	console.log(activeInput.value)

// 	const inputEvents = function () {
// 		inputFields.map(function(item) {
// 			item.addEventListener("input", function() { console.log(activeInput.valueu); checkIfValid(this) })			
// 			item.addEventListener("keydown", function() { keydown(event.code).fireHandler() })
// 		})
// 	}();
// 	function checkIfValid (inputField) {
// 		if (isNaN( answer() )) { proceedWhen(inputField).isInvalid(); 		
// 		} else { isValid = true; proceedWhen(inputField).isValid(); 
// 		}
// 	};
// 	function checkIfCorrect(value) {
// 		const isCorrect = function() {
// 			console.log( currentEquation.checkAnswer(value) )
// 			console.log( currentEquation )
// 			return currentEquation.checkAnswer(value) // returns true / false
// 			}
//  		if (isCorrect()) {proceedWhen().isCorrect()} else { proceedWhen().isIncorrect() }		
// 	};

// 	function keydown (keyName) { // keypress controller; reads the ID of input elements
// 		let currentID = function() {return activeInput.id};
// 		const keys = {
// 			Enter: (function() { accept() }),
// 			ArrowRight: (function() { move().right() }),
// 			ArrowLeft: (function() { move().left() }),
// 			ArrowDown: (function() { move().down() }),
// 			ArrowUp: (function() { move().up() }),		
// 		};
// 		const move = function() {
// 			const oneRight = function() {return document.getElementById(currentID()+1)};
// 			const oneLeft = function() {return document.getElementById(currentID()-1)};
// 			const oneDown = function() {return document.getElementById(currentID()+8)};
// 			const oneUp = function() {return document.getElementById(currentID()-8)};
// 			return {
// 				right: function() {if (oneRight()) {oneRight().focus()}},
// 				left: function() {if (oneLeft()) {oneLeft().focus()}},
// 				down: function() {if (oneDown()) {oneDown().focus()}},
// 				up: function() {if (oneUp()) {oneUp().focus()}},
// 			};
// 		};
// 		const accept = function() { console.log( answer() ); if (answer()!=="" && isValid) {checkIfCorrect( answer() )} };
// 		const fireHandler = function() {
// 			for (key in keys) {
// 				if (key === keyName) { keys[key]() }
// 			};
// 		};
// 		return {
// 			fireHandler: fireHandler,
// 		}
// 	};
	
// };

view.update(0)
