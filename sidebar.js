////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// *** M O D E L *** ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
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
	currentIndexes:[],
	// activeFunctionIndex: new StoredValue(0),
	// currentState: new Array(),
	score: new Score(),
};
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = function() {
	const array = [
		(function() {
			model.array.setBlankPositionForAll("z");
			return model.array.getOrdered();
		}),		
	];
	let getActiveFunctionIndex = model.activeFunctionIndex.get();
	return {
		setActiveFunctionIndex: function(n) { activeFunctionIndex.set(n) },
		getActiveFunctionIndex: function() { return getActiveFunctionIndex },

		getCurrentArrayState: function() { return array[getActiveFunctionIndex] () },
		getCurrentElement: function() { return this.getCurrentArrayState()[ this.getCurrentArrayIndex() ] },

		setCurrentArrayIndex: function(n) {model.currentIndexes[ getActiveFunctionIndex ] = n},
		getCurrentArrayIndex: function() { return model.currentIndexes[ getActiveFunctionIndex ] },
	};
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const createTable = function(array) {
	const containerElement = document.createElement("DIV");
  containerElement.className = "table";
	array.map(function(equation) {
		if (equation.x === 1 || equation.y === 1 ) { 
	  	let square = createEl("div", "first-rows", equation.z );
	    containerElement.appendChild(square);
 		} else {
			let square = createEl("div", "the-rest");
      containerElement.appendChild(square);
      const inputField = createEl("input", "input-fields" );
      inputField.id = equation.index - 10;
      inputField.setAttribute("index", equation.index);
      square.appendChild(inputField);
      inputField.value = equation.userAnswer; // if there is one entered previously;
      if (inputField.value !== "") { // marked as "done"; otherwise it would be editable
         // controller.equations.proceed().ifDone(inputfields)
      };    
    };
	})
	return containerElement;
};
const createEl = function(tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
  };

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
const view = {}
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
	activeFunctionIndex: controller().getActiveFunctionIndex(),
	currentArrayState: controller().getCurrentArrayState(),

	pages: [
			(function(n) {return createTable(n)}),
	],
	events: [

	],
	render: function() {
		this.clear();
		// view.score.render()
		this.parentElement.appendChild(this.pages[this.activeFunctionIndex](this.currentArrayState));
		// eventHandlers().inputFields.focusOnFirst();			
	},
	clear: function() {
		if (this.parentElement.firstChild) {
			this.parentElement.removeChild(this.parentElement.firstChild);
		}
	},
};


const updateView = function() {
	for (component in view) { view[component].render() }
	
};


// console.log( keypressController.events.Enter())

const events = function() {
	const inputFields = Array.from(document.querySelectorAll("input"));
	const tableEvents = function() {
		inputFields.map(function(item) {
			eventHandlers().inputFields.focusOnFirst();
			item.addEventListener("input", function() { console.log(this.value) })
			item.addEventListener("keydown", function() { keypressController.fireHandler(event.code) })
			// item.addEventListener("change", function() { updateView() })
		})
	}
	return {
		tableEvents: tableEvents,
	}
};

keypressController = {
	events: {
		Enter: (function() {console.log("enter") } ),
		ArrowDown: (function() {console.log("down") } ),
		ArrowUp: (function() {console.log("up") } ),
		ArrowLeft: (function() {console.log("left") } ),
		ArrowRight: (function() {console.log("right") } ),
	},
	fireHandler: function(name) {
		for (key in this.events) {
			if (key === name) { this.events[key]() }
		}
	},		
}

inputController = {
	validate: 
}



const checkInput = function() {
	const setCurrentEquation = function() {
		let activeElementIndex = parseInt(document.activeElement.getAttribute("index"))
		controller().setCurrentArrayIndex(activeElementIndex);
	}();
	const getCurrentEquation =  function() {return controller().getCurrentElement() };
	return {
		validate: function(inputValue) {
			if ( isNaN( inputValue ) ) {
        proceed().ifInvalid( element );
      } else {
        proceed().ifValid( element );
      };
		},
		ifCorrect: function(inputValue) {
			if ( getCurrentEquation().checkAnswer(parseInt(inputValue)) ) {
				model.score.strikeIncrement();
        model.score.increment();
			} else {
				model.score.strikeReset();
			};
			// console.log(getCurrentEquation().checkAnswer(inputValue))
		},
	}
}



const eventHandlers = function() {
	const inputFields = document.querySelectorAll("input");
	const activeID = function(){ return parseInt(document.activeElement.id) } 
	return {
		onEnter: function(event) {
			if(event.keyCode = 13) {console.log("enter")}
		},
		onChange: function(inputValue) {
				checkInput().ifCorrect(inputValue);
				updateView();
		},
		inputFields: {

			focusOnFirst: function() {
				inputFields[0].focus()
				// console.log(activeID() )
			},
			moveFocus: function() {
				return {
					right: function() { document.getElementById(activeID() + 1).focus() },
					
					
					left: function() {
					},
					up: function() {},
					down: function() {},
				}
			},

		},

	};
}


updateView()
// view.render()
events().tableEvents()

const SidebarComponent = function(content, attachedFunction) {
	this.content = content;
	this.attachedFunction = attachedFunction;
	this.containerElement = document.createElement("DIV");
	this.containerElement.className = "sidebarChildren";
	this.containerElement.textContent = content;
	
	this.containerElement.addEventListener("click", this.attachedFunction.bind(this) )
};

(function() {
	const sidebarContainer = document.createElement("DIV");
	sidebarContainer.className = "sidebarContainer";
	const sidebarComponents = [
			new SidebarComponent("Fill the table", (function() { controller().setActiveFunctionIndex(0) }) ),
			new SidebarComponent("Fill the gaps", (function() { controller().setActiveFunctionIndex(1) }) ),
			new SidebarComponent("Reveal the photo", (function() { controller().setActiveFunctionIndex(2) }) ),
			new SidebarComponent("Fast counting", (function() { controller().setActiveFunctionIndex(3) }) ),
	]

	sidebarComponents.forEach(function(item) {
		sidebarContainer.appendChild( item.containerElement )
	})
	document.querySelector(".sidebar").appendChild (sidebarContainer)
})();





