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
  this.userAnswer;
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

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
	array: new EquationsArray(),
	// activeFunctionIndex: new StoredValue(0),
	currentState: new Array(),
	update: function() {

	};
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
	currentState: new Array2D( new Array() )
	return {
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

const Page = function(array, containerClassName) {
	this.parentElement = document.querySelector(".main");
	this.containerElement = document.createElement("DIV");
	this.containerElement.className = containerClassName;
	this.array = array;
};
Page.prototype.render = function(first_argument) {
	this.create();
	this.parentElement.appendChild(this.containerElement);
};
Page.prototype.create = function(attachedFunction) {
	console.log ("create")
	// this.array.map ( function );
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const view = {
	activeFunctionIndex: new StoredValue(0),
	pages: [
		table = new Page(model.array.getOrdered(), "table")		
	],

}



const createTable = function(equation) {
	if (equation.x === 1 || equation.y === 1 ) { 
  	let square = createEl("div", "first-rows", equation.z );
    this.containerElement.appendChild(square);
  };
};
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





const createEl = function(tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
  };
