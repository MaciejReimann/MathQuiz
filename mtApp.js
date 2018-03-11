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
	};
	const isCorrect = function() {
		console.log("correct")
		score.strikeIncrement();
		score.increment();
		viewModule().update( controller().activePageIndex.get() )
	};	 
	return {
		isInvalid: isInvalid,
		isValid: isValid,
		isIncorrect: isIncorrect,
		isCorrect: 	isCorrect,
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
	this.hasListeners = false;
};
InputField.prototype.getElement = function() {
	return this.element;
};
InputField.prototype.checkIfValid = function() {
	if(!isNaN(this.element.value) && isNotEmpty()) {
		proceedWhen(this.element).isValid();
		return true;
	} else {
		proceedWhen(this.element).isInvalid()}
		return false;
};
InputField.prototype.checkIfCorrect = function(answer) {
	this.userAnswer = parseInt(answer);
	if(this.userAnswer === this.value) {
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
	for (name in keys) {
		if (event.key === name) {keys[name]()}
	}		
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
	if (this.userAnswer !== "") {
		this.removeListeners()
		this.isDone()
	} else {
		this.element.value = "";
		if (this.hasListeners===false) {this.addListeners()};				
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
	this.element.className = className;
	this.element.disabled = true;
	this.element.setAttribute("done", true)
	return this.element;
}
InputField.prototype.addListeners = function() {
	this.inputHandler = this.checkIfValid.bind(this);
	this.keydownHandler = this.checkKeyPressed.bind(this);
	this.element.addEventListener("input", this.inputHandler)
	this.element.addEventListener("keydown",this.keydownHandler)
	this.hasListeners = true;
}
InputField.prototype.removeListeners = function() {
	this.element.removeEventListener("input", this.inputHandler);
	this.element.removeEventListener("keydown", this.keydownHandler)
}
///////////////////////////////////////////////////////////////////////

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

EquationParagraph.prototype.isDone = function() {
	if (this.userAnswer !=="") {return true} else {return false}
}

EquationParagraph.prototype.setUpOptions = function(i) {
	this.options = [
		(function() { return [ this.elementZ.setUpActive() ] }.bind(this)), // 1st view; the default option;

		(function() { console.log(this)
			return [this.elementX, this.elementMultiplication, this.elementY, this.elementEqual, this.elementBlank]
		}.bind(this)),
		(function() { console.log(this)
			return [this.elementX]
		}.bind(this)),

	]
	return appendAllTo("DIV", this.options[i]() );
}

const test = function() {
	const equationParagraph = controller().getCurrentElement().setUpOptions(0);
	console.log(controller().getCurrentElement())
	return equationParagraph
};

function insertTable (array) {
	const containerElement = createElement( "DIV", "table");
	let id = 0;
	array.map(function(equation) {		
		containerElement.appendChild(equation.elementZ.getElement());
		if (equation.x === 1 || equation.y === 1 ) { 
			equation.elementZ.isInactive(("inactive"));	
 		} else { 
 			equation.elementZ.isActive();
 			equation.elementZ.element.id = id; id++;
 		}
	})
	return containerElement;
};

const insertEquationParagraph = function(activeEquation) {
	const containerElement = createElement( "DIV", "equationParagraph")
	const currentEquation = activeEquation;
	
	const assignElementValues = function(arrayOfElements) {
		const equationElements = [];
		for (let i = 0; i<5; i++) {
			let inputField = createElement ("INPUT", "equationElements");
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

const insertPhoto = function(activeEquation) {
	const containerElement = createElement( "DIV", "photo");

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
  containerElement.appendChild(insertEquationParagraph(activeEquation));

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
function shuffle (array) {
   for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  return array;
};

const StoredValue = function() {
  	this.value;
};
StoredValue.prototype.set = function(n) {this.value = n};
StoredValue.prototype.get = function(n) {return this.value};


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

const model = {
	score: new Score(),
	sidebar: {
		options: [ "Fill the table", "Fill the gaps", "Reveal the photo", "Fast counting" ],
		activePageIndex: new StoredValue(), // stores the index value of the currenttly displayed option in .main
	},
	array: new ArrayOfEquations(),	
	currentIndexes:[-1,0,0,0],	
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = function() {
	const score = model.score;
	const activePageIndex = model.sidebar.activePageIndex;
	let i = activePageIndex.get();

	const arrayStates = [
		(function() {return model.array.getOrdered()}),
		(function() {return model.array.getShuffled()}),
		(function() {return model.array.getOrdered()}),
		(function() {return model.array.getShuffled()}),
	];
	function getActiveArray() { return arrayStates[i] () };

	const args = [ 
		(function() {return getActiveArray() }),
		(function() {return getActiveEquation() }),
		(function() {return getActiveEquation() }),
		(function() {return model.array.getShuffled()}),
	];
	function getActiveArgument() { return args[i] () };

	const pageOptions = [
		(function(arg) {return insertTable(arg) }),
		(function(arg) {return insertEquationParagraph(arg) }),
		(function(arg) {return insertPhoto(arg) }),
		(function(arg) {return test()   }),
	];
	function getActivePage() {return pageOptions[i] (getActiveArgument())};	
	function getIndexOfCurrentElementinActiveArray() {return model.currentIndexes[i]};
	function setIndexOfCurrentElementinActiveArray(n) {model.currentIndexes[i] = n};
	function incrementIndexOfCurrentElementinActiveArray() {model.currentIndexes[i]++};
	function getActiveEquation() {return getActiveArray()[getIndexOfCurrentElementinActiveArray()]};

	function informed() {
		function whenViewUpdated(v) {
			activePageIndex.set(v);
			console.log("upsakfdniasonfnasokdgnoaing")
		}
		return {
			 whenViewUpdated:  whenViewUpdated,
		}
	}

	getCurrentArrayState = function() { return arrayStates[ activePageIndex.get() ] () };
	getCurrentElement = function() { return getCurrentArrayState()[ getCurrentArrayIndex() ] };
	// getPreviousElement = function() { return getCurrentArrayState()[ getCurrentArrayIndex() -1 ] };
	setCurrentArrayIndex = function(n) { model.currentIndexes[ activePageIndex.get() ] = n};
	getCurrentArrayIndex = function() { return model.currentIndexes[ activePageIndex.get() ] };	
	incrementCurrentArrayIndex = function(n) { model.currentIndexes[ activePageIndex.get() ] ++};
	return {
		informed: informed,
		score: score,
		getActivePage: getActivePage,
		activePageIndex: activePageIndex,
	};
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
function viewModule() {
	const scoreContent = function() {return controller().score.get()}
	const mainContent = function() {return controller().getActivePage()}  
	const mainIndex = function() {return controller().activePageIndex.get()} 
	// let sidebarComponents = []
	const SidebarComponent = function(content, attachedFunction) {
		this.divElement = createElement( "DIV", "sidebarChildren", content);	
		this.divElement.addEventListener("click", attachedFunction.bind(this) )
	};
	SidebarComponent.prototype.setActiveAttribute = function() {
		this.divElement.setAttribute("active", true);
	};
	function createSidebar() {
		const containerElement = createElement( "DIV", "sidebarContainer");
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
			sidebarComponents[mainIndex()].setActiveAttribute(); // calling controller HERE!
		}();
		return containerElement;
	};
	function createResults() {
		const content = function() {
			return "RESULTS"
		}
		return createElement( "DIV", "resultsDiv", content()); // calling controller HERE!
	}
	function createScore() {
		return createElement( "DIV", "scoreDiv", scoreContent()); // calling controller HERE!
	}
	function createMain() { return mainContent() }; // calling controller HERE!

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

	const view = {
		components: {
			sidebar: new ViewComponent(document.querySelector('.sidebar'), createSidebar ),
			results: new ViewComponent(document.querySelector('.results'), createResults ),
			score: new ViewComponent(document.querySelector('.score'), createScore ),
			main: new ViewComponent(document.querySelector('.main'), createMain ),
		},
		update: function(v) {
			controller().informed().whenViewUpdated(v) // calling controller HERE!
			
			for (component in this.components) {this.components[component].render() };
			find().firstEmptyInputAnd().focus()
			
		},
	};
	function find () {
		const firstEmptyInputAnd = function() {
			const inputFields = Array.from(document.querySelectorAll("input"));
			for (let i = 0; i < inputFields.length; i ++) {
				if (inputFields[i].value === "") {return inputFields[i]} 
			}
		};
		return {
			firstEmptyInputAnd: firstEmptyInputAnd,
		}
	};
	const update = function(n) {return view.update(n)} 
	return {
		update: update,
	}
};

viewModule().update(0)
