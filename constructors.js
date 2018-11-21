const controller = function() {
	const score = model.score;
	const activePageIndex = model.sidebar.activePageIndex;

	const arrayStates = [
		(function() {return model.array.getOrdered()}),
		(function() {return model.array.getShuffled()}),
		(function() {return model.array.getOrdered()}),
		(function() {return model.array.getShuffled()}),
	];
	function getActiveArray() { return arrayStates[getActivePageIndex()]};
	function getIndexOfCurrentElementinActiveArray() {return model.currentIndexes[getActivePageIndex()]};
	function setIndexOfCurrentElementinActiveArray(n) {model.currentIndexes[getActivePageIndex()] = n};
	function incrementIndexOfCurrentElementinActiveArray(n) {model.currentIndexes[getActivePageIndex()] ++};

	function getActiveEquation() {return getActiveArray()[getIndexOfCurrentElementinActiveArray()]}

	const pageOptions = [
		(function(array) {return insertTable(array) }),
		(function(array) {return insertEquationParagraph(array) }),
		(function(array) {return insertPhoto(array) }),
		(function(array) {return test()   }),
	];
	function getActivePageIndex() { return activePageIndex.get()};
	function getActivePage() {return pageOptions[getActivePageIndex()] (getActiveArray())};	
	return {
		score: score,
		getActivePageIndex: getActivePageIndex,
		getActivePage: getActivePage,
		getActiveEquation: getActiveEquation,
	};
}


(function drawArea(rows, columns) {
  		for (let i = 0; i < rows; i ++) {
      		for (let j = 0; j < columns; j ++) {
        	ctx.rect(canvasWidth / rows * i, canvasHeight / columns * j,
                 canvasWidth / rows, canvasHeight / columns
        	); // ctx.rect(x, y, width, height);
        	ctx.stroke();
        	
        	ctx.lineWidth = 1;
        	// ctx.fillStyle = "grey";
        	// ctx.fill();
      		};
    	};
  	}) (activeEquation.x, activeEquation.y)