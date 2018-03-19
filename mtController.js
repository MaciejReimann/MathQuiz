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
	const index = function() {
		if (activePageIndex.get() === undefined) {
			return 0;
		} else {
			return activePageIndex.get();		
		}
	};
	const getActiveData = function() {return pages[index()] }
	const getSequence = function() {return getActiveData()[0]}
	const getSequenceIndex = function() {return getActiveData() [1] }	
	const getArrayIndex = function() {return getSequence()[getSequenceIndex()]}
	const getActiveEquation = function() {return array[ getArrayIndex() ] };
	const setArrayIndex = function(n) {pages[index()][1] = n};
	const incrementArrayIndex = function() { pages[index()][1]++ };

	const getMainContent = function(n) {
		let options = [insertTable, insertEquationParagraph, insertPhoto, insertArea];
		return options[n]();
	};

	function informed() {
		function whenViewUpdated(v) {
			// if (activePageIndex.get() === v) { incrementArrayIndex() };
			incrementArrayIndex()
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
	function insertEquationParagraph (activeEquation) {
		console.log(getActiveEquation())
		const containerElement = createElement( "DIV", "equationParagraph")
		getActiveEquation().createLeftSide(4).map(function(item) {
			containerElement.appendChild(item)
		})
	return containerElement;
	};

	function insertArea (activeEquation) {
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

const insertPhoto = function(activeEquation) {
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
		getMainIndex: index,
		informed: informed,
		
		setArrayIndex: setArrayIndex,
		getArrayIndex: getArrayIndex,
	};
}



