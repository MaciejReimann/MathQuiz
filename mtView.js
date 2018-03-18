////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function viewModule() {
	const scoreContent = function() {return controller().score.get()}
	const resultsContent = function() {return controller().getResults()}	
	const mainIndex = function() {return controller().getMainIndex()} 
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