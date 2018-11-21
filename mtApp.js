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
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
const controller = function() {
	const score = model.score;
	const array = model.array;
	const pages = model.pages
	const activePageIndex = model.activePageIndex;
	let i = activePageIndex.get();

	function getActiveEquation() { console.log(array[ pages[i][0][1] ]); return array[ pages[i][0][1] ] };
	const getMainContent = function(n) {
		let options = [insertTable, insertEquationParagraph, insertPhoto, insertArea];
		return options[n]()
	};

	function setIndex(n) {model.pages[1] = n};
	function incrementIndex() {model.pages[1]++};

	function informed() {
		function whenViewUpdated(v) {
			// if (activePageIndex.get() === v) { incrementIndex() };
			activePageIndex.set(v);			
		}
		return {
			 whenViewUpdated:  whenViewUpdated,
		}
	}

	function getResults(array) {
		function getResults (array) {
			array.map(function(equation) {
			// console.log(equation.answeredCorrectly)
			})
		}
		// return {
		// 	get: getResults(n.array.getOrdered()),
		// }
	}

	function insertTable () {
		const containerElement = createElement( "DIV", "table");
		let id = 0;
		array.map(function(equation) {
			let tableSquare = equation.elementZ;
			containerElement.appendChild(tableSquare.getElement());		
			if (equation.x === 1 || equation.y === 1 ) {
				tableSquare.isInactive(("inactive"));	
	 		} else {
	 			if (tableSquare.showAnswer()!==undefined) {
	 				tableSquare.isDone();
					tableSquare.removeListeners()
	 			} else { 
	 				tableSquare.isActive() 
	 			}
	 			tableSquare.element.id = id; id++;
	 		}
		})
		return containerElement;
	};
	function insertEquationParagraph () {
		const containerElement = createElement( "DIV", "equationParagraph")
		getActiveEquation().createLeftSide(4).map(function(item) {
			containerElement.appendChild(item)
		})
	return containerElement;
	};

	function insertArea () {
		const containerElement = createElement( "DIV", "photo");
		let tableSquare = getActiveEquation().elementZ.isActive();
		const tableSquareContainer = createElement( "DIV", "equationParagraph");
		tableSquareContainer.appendChild(tableSquare)

		const canvas = document.createElement('CANVAS');
		let [canvasWidth, canvasHeight] = [9*48, 9*48];
	 	canvas.setAttribute('width', canvasWidth);
	  	canvas.setAttribute('height', canvasHeight);
	  	const ctx = canvas.getContext("2d");

	  	(function drawArea(rows, columns, x, y) {
	  		for (let i = 0; i < rows; i ++) {
	      		for (let j = 0; j < columns; j ++) {
	      			ctx.beginPath();
	        		ctx.rect(canvasWidth / rows * i, canvasHeight / columns * j,
	                 		 canvasWidth / rows, canvasHeight / columns
	        		); // ctx.rect(x, y, width, height);
	        		
	        		ctx.lineWidth = 1;
	       			ctx.stroke();
	      		};
	    	};
	  		for (let i = 0; i < x; i ++) {
	      		for (let j = 0; j < y; j ++) {
	      			ctx.beginPath();
	        		ctx.rect(canvasWidth / rows * i, canvasHeight / columns * j,
	                 canvasWidth / rows, canvasHeight / columns
		        	); // ctx.rect(x, y, width, height);
		        	ctx.lineWidth = 1;
		        	ctx.stroke();
		        	ctx.fillStyle = "grey";
		        	ctx.fill();
		        	
	      		};
	    	};
	  	}) (9, 9, getActiveEquation().x, getActiveEquation().y)
	  	containerElement.appendChild(canvas);
	  	containerElement.appendChild(tableSquareContainer);
	  	return containerElement;
	}

const insertPhoto = function() {
	const containerElement = createElement( "DIV", "photo");

	const canvas = document.createElement('CANVAS');
	let [canvasWidth, canvasHeight] = [9*48, 9*48];
 	canvas.setAttribute('width', canvasWidth);
  	canvas.setAttribute('height', canvasHeight);
  	const ctx = canvas.getContext("2d");

  const drawGrid = function(lineWidth, rows, columns) {
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
  containerElement.appendChild(insertEquationParagraph(getActiveEquation()));

  return containerElement;
};

	return {
		score: score,
		getResults: getResults,
		getMainContent: getMainContent,
		activePageIndex: activePageIndex,
		informed: informed,
		
		setIndex: setIndex,
	};
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
function viewModule() {
	const scoreContent = function() {return controller().score.get()}
	const resultsContent = function() {return controller().getResults()}	
	const mainIndex = function() {return controller().activePageIndex.get()} 
	const mainContent = function() {return controller().getMainContent(mainIndex())}  
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
		return createElement( "DIV", "resultsDiv", resultsContent()); // calling controller HERE!
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

