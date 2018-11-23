function appendAllTo(elementType, array) {
	const parent = document.createElementement(elementType)
	array.map(function(item) {parent.appendChild(item)})		
	return parent;
};
function createElement (tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
};
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = function() {
	let incorrectAnswers = model.incorrectAnswers;
	const tempIncorrect = model.tempIncorrect;
	const score = model.score;
	const arr = model.array;
	const theArray = model.array.get();
	const page = model.page;
	const activePageIndex = model.activePageIndex;
	const index = function() {
		if (activePageIndex.get() === undefined) { return 0 } else {
			return activePageIndex.get();		
		}
	};
	const produceSequenceForIncorrect = function() {
		incorrectAnswers = arr.getAllEquationsAnsweredIncorrectly().map(equation=>equation.index);
		page[1].sequence = incorrectAnswers.concat(tempIncorrect);
		console.log(page[1].sequence)
	};
	const getActivePage = function() {return page[index()]}
	const getArrayIndex = function() {return getActivePage().sequence[getActivePage().index]}
	const getActiveEquation = theArray[getArrayIndex()]
	const setSequenceIndex = function(n) {getActivePage().index = n}; 
	const incrementSequenceIndex = function() { return getActivePage().index++};

	const getScore = function() {return score.get()}
	const getMainContent = function(n) {
		let options = [insertTable, insertEquations, insertPhoto, insertArea, insertResults];
		return options[n]();
	};
	const getActiveElement = function() {
		const firstActive = document.getElementsByClassName("active")[0]
		if (firstActive!==undefined) {return firstActive.value} else { return false }
	};
	const lastEquationAnswered = function() {
		if( getActiveElement() !== "" ) {return true} else { return false}
	};
	function informed() {
		function whenViewUpdated(v) {
			// setSequenceIndex();
			// logActiveEquation('informed')
			if (lastEquationAnswered()) { incrementSequenceIndex() };
			activePageIndex.set(v);			
		}
		return {
			 whenViewUpdated:  whenViewUpdated,
		}
	};
	function insertTable () {
		const containerElement = createElement( "DIV", "table");
		let id = 0;
		theArray.map(function(equation) {
			let tableSquare = equation.elementZ;
			containerElement.appendChild(tableSquare.getElement());
			if (equation.x === 1 || equation.y === 1 ) {
				tableSquare.setAs("inactive");
	 		} else {
	 			if (tableSquare.showAnswer()!==undefined) {
	 				tableSquare.setAs("done");
					// tableSquare.removeListeners()
	 			} else {
	 				
	 				tableSquare.setAs("active");
	 				tableSquare.addFocusListener()
	 			}
	 			tableSquare.element.id = id; id++;
	 		}
		})
		return containerElement;
	};
	function insertEquations () {
		const containerElement = createElement( "DIV", "equations");
		produceSequenceForIncorrect();
		for (let i=0; i<model.temp; i++) {
			let equation = theArray[page[1].sequence[i]];
			let activeField = equation.elementZ;
			let lastElement = insertEquationParagraph(equation);
			if (activeField.showAnswer()!==undefined) {
	 			activeField.setAs("done")
	 		};
	 		containerElement.appendChild(lastElement)
		}	
		model.temp++
		return containerElement;
	};
	function insertEquationParagraph (equation) {
		// logActiveEquation('insertEquationParagraph')
		const containerElement = createElement( "DIV", "equationParagraph");
		equation.createLeftSide(4).map(function(item) {
			containerElement.appendChild(item)
		})
		return containerElement;
	};

	function insertArea (activeEquation) {
		const containerElement = createElement( "DIV", "photo");
		let tableSquare = getActiveEquation.elementZ.setAs("active");
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
	  	}) (9, 9, getActiveEquation.x, getActiveEquation.y)
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
  containerElement.appendChild(insertEquationParagraph(getActiveEquation));
  return containerElement;
};
function insertResults() {
	const containerElement = createElement( "DIV", "table");
	theArray.map(function(equation) {
		let tableSquare = equation.elementZ;
		let sumOfCorrectAnswers = arr.getSumOfAnswersForMirrorElements(equation.x, equation.y).correct
		let sumOfIncorrectAnswers = arr.getSumOfAnswersForMirrorElements(equation.x, equation.y).incorrect
		if (equation.x > equation.y) { tableSquare.setAs("invisible") } else {
			let sum = sumOfCorrectAnswers;
			if (sum > 2) {
				tableSquare.setAs("excellent");
 			} else if (sum > 1) {
 				tableSquare.setAs("very-good");
 			} else if (sum > 0) {
 				tableSquare.setAs("good");
 			} else { 
 				tableSquare.setAs("not-answered");
 			}
		}	
		containerElement.appendChild(tableSquare.getElement());	
	})
	return containerElement;
};
function logActiveEquation (text) {
	console.log( text )
	console.log("active equation is: ", getActiveEquation )
	// console.log( "SEQUENCE INDEX IS: ", getSequenceIndex() )
	console.log( "ACTIVE FUNCTION IS: ", getActivePage() )
	
	
}
function proceedWhen(input) {
	// logActiveEquation('proceedWhen')
	let inputElement = input.element;
	function isInvalid() { inputElement.setAttribute("valid", false) };
	function isValid() { inputElement.setAttribute("valid", true) };
	function isIncorrect() {
		if (activePageIndex.get()===1) {tempIncorrect.push(getActiveEquation.index)};
		getActiveEquation.answeredCorrectly.push(false);
		score.updateWhenIncorrect();
		viewModule().update( mainIndex() )
	};
	function isCorrect() {		
		getActiveEquation.answeredCorrectly.push(true);
		score.updateWhenCorrect();
		viewModule().update( mainIndex() )
	};
	return {
		isInvalid: isInvalid,
		isValid: isValid,
		isIncorrect: isIncorrect,
		isCorrect: 	isCorrect,
	};
};		

	return {
		getScore: getScore,
		getMainContent: getMainContent,

		getMainIndex: index,
		informed: informed,
		proceedWhen: proceedWhen,
		
		setSequenceIndex: setSequenceIndex,
		getArrayIndex: getArrayIndex,

		logActiveEquation: logActiveEquation,
		getActivePage: getActivePage,

		getActiveEquation: getActiveEquation,

	};
}

// 1.dodać createRightSide()
// 2.sprawić, by fill the gaps wyświetlało więcej niż jedno rownanie. 

// UI - dodać podświetlanie jedności przy widoku tablicy

//Dodać wyskakujące okno na środku : imię, wiek, zakłada profil i zapisuje w local storage


// WHEN INPUT IS FILLED AND LOSSES FOCUS, THAT SHOULD FIRE THE SAME EVENT AS ENTER

