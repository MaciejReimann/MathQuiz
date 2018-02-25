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

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
	array: new EquationsArray(),
	currentIndexes:[],
	// activeFunctionIndex: new StoredValue(0),
	currentState: new Array(),
	update: function() {

	},
};
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const StoredValue = function(value) {
  this.value = value;
};
StoredValue.prototype.set = function(n) {this.value = n};
StoredValue.prototype.get = function(n) {return this.value};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = function() {
	// currentState = new Array2D( new Array() )
	this.array = [
		(function() {
			model.array.setBlankPositionForAll("z");
			return model.array.getOrdered();
		}),		
	];
	const currentIndexes = model.currentIndexes;
	return {
		array: array,
		currentIndex: function() {
			return {
				set: function(i, n) {currentIndexes[i] = n },
				get: function(i) { return currentIndexes[i] }
			}
		},
		
		// setActiveFunctionIndex: function(n) { model.activeFunctionIndex.set(n) },
		// getActiveFunctionIndex: function() { return model.activeFunctionIndex.get() },
		setCurrentState: function() { },
		getCurrentState: function() { },
	}
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

const view = {
	parentElement: document.querySelector(".main"),
	activeFunctionIndex: new StoredValue(0).get() ,
	currentArray: controller().array[0](),
	pages: [
			(function(n) {return createTable(n)}),
	],
	render: function() {
		this.clear();
		this.parentElement.appendChild(this.pages[this.activeFunctionIndex](this.currentArray));
		eventHandlers().inputFields.focusOnFirst();			
	},
	clear: function() {
		if (this.parentElement.firstChild) {
			this.parentElement.removeChild(this.parentElement.firstChild);
		}
	},
}

const events = function() {
	const inputFields = Array.from(document.querySelectorAll("input"));

	const tableEvents = function() {
		inputFields.map(function(item) {
			eventHandlers().inputFields.focusOnFirst();
			// currentEquation = item.id !!!!!!!!!!!!!!!!!!!!!
			item.addEventListener("input", function() { eventHandlers().inputFields.validate(item.value) })
		})
	}
	return {
		table: function() {
				tableEvents()
		},
	}
};

const eventHandlers = function() {
	const inputFields = document.querySelectorAll("input");
	const activeID = function(){ return parseInt(document.activeElement.id) } 
	return {
		inputFields: {
			validate: function(inputValue) { console.log ( inputValue )},
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


view.render()
events().table()



keyEvents : {



}




  // controller.table.array.getInOrder().map(function( equation ) {
  //             if (equation.x === 1 || equation.y === 1 ) { 
  //               let square = createEl("div", "first-rows", equation.z );
  //               parentEl.appendChild(square);
  //             } else {
  //               let square = createEl("div", "the-rest");
  //               parentEl.appendChild(square);
  //               const inputfields = createEl("input", "input-fields" );
  //               square.appendChild(inputfields);
  //               inputfields.value = equation.userAnswer; // if there is one entered previously;
  //               if (inputfields.value !== "") { // marked as "done"; otherwise it would be editable
  //                 controller.equations.proceed().ifDone(inputfields)
  //               };                
  //             };
  //           });
  //         controller.table.array.setInputPositionForAll("z");
  //         view.table.events();

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





