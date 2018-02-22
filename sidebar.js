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
			new SidebarComponent("Fill the table", (function() { console.log(this.containerElement.firstChild) }) ),
			new SidebarComponent("Fill the gaps", (function() { console.log(this) }) ),
			new SidebarComponent("Reveal the photo", (function() { console.log(this) }) ),
			new SidebarComponent("Fast counting", (function() { console.log(this) }) ),
	]

	sidebarComponents.forEach(function(item) {
		sidebarContainer.appendChild( item.containerElement )
	});
	document.querySelector(".sidebar").appendChild (sidebarContainer);
})();

