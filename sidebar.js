////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// *** M O D E L *** ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const Equation = function(x, y, index) {
  this.x = x;
  this.y = y;
  this.z = this.x * this.y;
  this.index = index;
  this.blankPosition;  
  this.userAnswer = "";
  this.numberOfTimesAnsweredCorrectly = 0;
};
Equation.prototype.checkAnswer = function(answer) {
	let correctAnswer = this[this.blankPosition];
	this.userAnswer = answer;
	if (answer===correctAnswer) {return true} else {return false};
};
Equation.prototype.setBlankPosition = function(p) {
	this.blankPosition = p;
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
};
EquationsArray.prototype.getOrdered = function() { return this.array };
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

const Score = function(initialValue) {
	if (initialValue) {
		this.globalScore = initialValue;
	} else { this.globalScore = 0 };  
  this.strike = 0;
  // this.getBaseFrom = function(n) { localBase = n }; // How to define parameteras an anonymous function?""
};
Score.prototype.strikeIncrement = function() { this.strike ++ };
Score.prototype.strikeReset = function() { this.strike = 0 };
Score.prototype.increment = function() { this.globalScore = this.globalScore + this.strike * 2 };
Score.prototype.get = function() { return this.globalScore };

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
	array: new EquationsArray(),
	activeFunctionIndex: new StoredValue(0),
	currentIndexes:[0,0,0,0],
	// activeFunctionIndex: new StoredValue(0),
	// currentState: new Array(),
	score: new Score(),
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = function() {
	const array = [
		(function() {
			model.array.setBlankPositionForAll("z");
			return model.array.getOrdered();
		}),
		(function() {
			// model.array.setBlankPositionForAll("z");
			return model.array.getOrdered();
		}),
		(function() {
			model.array.setBlankPositionForAll("z");
			return model.array.getOrdered();
		}),

	];
	let getActiveFunctionIndex = model.activeFunctionIndex.get();
	return {
		setActiveFunctionIndex: function(n) { model.activeFunctionIndex.set(n) },
		getActiveFunctionIndex: function() { return getActiveFunctionIndex },

		getCurrentArrayState: function() { return array[getActiveFunctionIndex] () },
		getCurrentElement: function() { return this.getCurrentArrayState()[ this.getCurrentArrayIndex() ] },

		setCurrentArrayIndex: function(n) { model.currentIndexes[ getActiveFunctionIndex ] = n},
		getCurrentArrayIndex: function() { return model.currentIndexes[ getActiveFunctionIndex ] },
		
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
	this.content = content;
	this.attachedFunction = attachedFunction;
	this.divElement = document.createElement("DIV");
	this.divElement.className = "sidebarChildren";
	this.divElement.textContent = content;
	
	this.divElement.addEventListener("click", this.attachedFunction.bind(this) )
};
SidebarComponent.prototype.setActiveAttribute = function() {
	this.divElement.setAttribute("active", true);
};
const createSidebar = function() {
	const containerElement = createEl( "DIV", "sidebarContainer");
	const sidebarComponents = [
			new SidebarComponent("Fill the table", (function() {controller().setActiveFunctionIndex(0); updateView() }) ),
			new SidebarComponent("Fill the gaps", (function() {controller().setActiveFunctionIndex(1); updateView() }) ),
			new SidebarComponent("Reveal the photo", (function() {controller().setActiveFunctionIndex(2); updateView() }) ),
			new SidebarComponent("Fast counting", (function() {controller().setActiveFunctionIndex(3); updateView() }) ),
	];
	sidebarComponents.forEach(function(item) {
		containerElement.appendChild( item.divElement );
	})
	const setActiveAttribite = function() {
		sidebarComponents[ controller().getActiveFunctionIndex() ].setActiveAttribute();
	}();
	return containerElement;
};


const createResults = function() {
	const content = function() {
		return "RESULTS"
	}
	const containerElement = createEl( "DIV", "rrrresults", content());
	return containerElement;	 
}

const createTable = function(array) {
	const containerElement = createEl( "DIV", "table");
	let id = 0;
	array.map(function(equation) {
		const inputField = createEl("INPUT", "table-input");
		const inputFieldDiv = createEl("DIV", "table-squares");
		containerElement.appendChild(inputFieldDiv);
		inputFieldDiv.appendChild(inputField);
		inputField.setAttribute("index", equation.index)
		if (equation.x === 1 || equation.y === 1 ) { 
			inputField.value = equation.z;
			inputField.setAttribute("disabled", true)
			inputField.className = "first-rows";
 		} else {
 			inputField.id = id; id++
      inputField.value = equation.userAnswer; // if there is one entered previously;
      if (inputField.value !== "") { // marked as "done"; otherwise it would be editable
        inputField.setAttribute("done", true);
      };    
    };
	})
	return containerElement;
};
const createEquationParagraph = function() {
	const containerElement = createEl( "DIV", "equationParagraph")
	const currentEquation = function() {return controller().getCurrentElement()}
	
	const assignElementValues = function(arrayOfElements) {
		const equationElements = [];
		for (let i = 0; i<5; i++) {
			let inputField = createEl ("INPUT", "equationElements");
			equationElements.push(inputField)
			containerElement.appendChild(inputField);
			inputField.id = i;
			inputField.value = arrayOfElements[i];			
		}
		
			for (key in arrayOfElements) {
			equationElements[key].disabled = true;
				if (arrayOfElements[key] === "") {
					equationElements[key].setAttribute("index", currentEquation().index);
					equationElements[key].className = "table-input";
					equationElements[key].disabled = false;
						// console.log(equationElements[key])
				}
			}
		
	}

	let equationTypes = [
		assignElementValues([currentEquation().x, "*", currentEquation().y, "=", ""									]),
		// assignElementValues([currentEquation().x, "*",  ""								, "=", currentEquation().z]),
	]
	// equationTypes[1]
	return containerElement
};

const createPhotoContent = function(array) {
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
  containerElement.appendChild(createEquationParagraph());

  return containerElement;
};






////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const view = {}

view.sidebar = {
	parentElement: document.querySelector('.sidebar'),
  render: function() {
  	// console.log ( createResults().toString() )
    this.clear();
    this.parentElement.appendChild( createSidebar() );
    },
   clear: function() {
    if (this.parentElement.firstChild) {
        this.parentElement.removeChild(this.parentElement.firstChild);
      };
    }, 
}

view.results = {
	parentElement: document.querySelector('.results'),
  render: function() {
  	// console.log ( createResults().toString() )
    this.clear();
    this.parentElement.appendChild( createResults() );
    },
   clear: function() {
    if (this.parentElement.firstChild) {
        this.parentElement.removeChild(this.parentElement.firstChild);
      };
    }, 
}
view.score = {
	parentElement: document.querySelector('.score'),
  render: function() {
    let content = model.score.get();
    this.clear();
    this.parentElement.appendChild( createEl("DIV", "scoreDiv", content) );
    },
   clear: function() {
    if (this.parentElement.firstChild) {
        this.parentElement.removeChild(this.parentElement.firstChild);
      };
    }, 
}
view.main = {
	parentElement: document.querySelector(".main"),
	activeFunctionIndex: function() {return controller().getActiveFunctionIndex() },
	currentArrayState: function() { return controller().getCurrentArrayState() },

	pages: [
			(function(n) {return createTable(n) }),
			(function(n) {return createEquationParagraph() }),
			(function(n) {return createPhotoContent(n) }),
			(function(n) {   }),
	],
	events: [

	],
	render: function() {
			this.clear();
			this.parentElement.appendChild(this.pages[this.activeFunctionIndex()](this.currentArrayState()));
	},
	clear: function() {
		if (this.parentElement.firstChild) {
			this.parentElement.removeChild(this.parentElement.firstChild);
		}
	},
};

const updateView = function() {
	for (component in view) { view[component].render() }
	events().tableEvents();
	events().focus(); //to należy równiez wrzucić do array
};

const events = function() {
	const inputFields = Array.from(document.querySelectorAll("input"));
	const nextID = parseInt(controller().getCurrentArrayIndex()) + 1;

	const focus = (function() {
			if (controller().getCurrentArrayIndex() === undefined) {
				controller().setCurrentArrayIndex( 10 )
				inputFields[10].focus()
			} else {
				inputFields [ nextID ].focus()
			}
	});
	
	const tableEvents = function() {
		inputFields.map(function(item) {
			item.addEventListener("input", function() { input().checkIfValid() })			
			item.addEventListener("keydown", function() { keypress(event.code).fireHandler() })
		})
	}

	return {
		focus: focus, 
		tableEvents: tableEvents,
	}
};

const keypress = function(keyName) { // keypress controller; reads the ID of input elements

	let lastActive;
	let inputField = function() {lastActive = document.activeElement; return document.activeElement };
	// let inputValue = function() {return inputField().value};
	let currentID = function() {return parseInt(inputField().id)};
	const events = {
		Enter: (function() { accept() }),
		ArrowRight: (function() { move().right() }),
		ArrowLeft: (function() { move().left() }),
		ArrowDown: (function() { move().down() }),
		ArrowUp: (function() { move().up() }),		
	};
	const getIDFromIndex = function(indexAtrribute) {
		const inputFields = document.querySelectorAll("input");
		const pairs = {};
		for (i=0; i<inputFields.length; i++) {
			pairs [ inputFields[i].getAttribute("index") ] = inputFields[i].id;			
		}
		return pairs[indexAtrribute];
	}

	const move = function() {
		const oneRight = function() {return document.getElementById(currentID()+1)};
		const oneLeft = function() {return document.getElementById(currentID()-1)};
		const oneDown = function() {return document.getElementById(currentID()+8)};
		const oneUp = function() {return document.getElementById(currentID()-8)};
		return {
			right: function() {if (oneRight()) {oneRight().focus()}},
			left: function() {if (oneLeft()) {oneLeft().focus()}},
			down: function() {if (oneDown()) {oneDown().focus()}},
			up: function() {if (oneUp()) {oneUp().focus()}},
		};
	};
	const accept = function() {
		if (inputField().value!=="" && input().checkIfValid()) {
			input().checkIfCorrect();
		}
	};
	const fireHandler = function() {
		for (key in events) {
			if (key === keyName) { events[key]() }
		}
	};
	return {
		fireHandler: fireHandler,
		getIDFromIndex: getIDFromIndex,
	}
}

const input = function() { // input controller; reads the INDEX attribute of input elements
	// index attribute needs to be equal to currentEquation.index
	const inputFields = Array.from(document.querySelectorAll("input"));
	let lastActive;
	let inputField = function() {lastActive = document.activeElement; return document.activeElement };
	let inputValue = function() {return parseInt(inputField().value)};	
	let activeElementIndex = function() { return parseInt(document.activeElement.getAttribute("index"))};	
	let currentEquation = function() {return controller().getCurrentElement() };
	let isCorrect = function() {return currentEquation().checkAnswer(inputValue())}

	controller().setCurrentArrayIndex(activeElementIndex())
	

	const checkIfValid = function() {
		if (isNaN( inputValue() )) {proceedWhen().isInvalid(); return false} else {proceedWhen().isValid(); return true}
	};
	const checkIfCorrect = function() {
		if (isCorrect()) {proceedWhen().isCorrect()} else { proceedWhen().isIncorrect()}		
	};
	const proceedWhen = function() {
		return {
			isInvalid: function() {
				inputFields.map(function(item) {item.disabled = true});
				lastActive.disabled = false;
				lastActive.setAttribute("valid", false);
				// lastActive.focus();
			},
			isValid: function() {
				inputFields.map(function(item) {item.disabled = false});
				inputField().setAttribute("valid", true);
			},
			isIncorrect: function() {
				model.score.strikeReset();
				this.isDone();
				updateView();
			},
			isCorrect: 	function() {
			 	model.score.strikeIncrement();
		    model.score.increment();
		    this.isDone();
		    updateView();
			},
			isDone: function() {
				inputField().setAttribute("done", true)
		    inputField().disabled = true;
			},
		};
	};
	return {
		checkIfValid: checkIfValid,
		checkIfCorrect: checkIfCorrect,
	}
}



updateView()








