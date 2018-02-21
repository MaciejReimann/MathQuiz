const SidebarComponent = function(content, attachedFunction) {
	this.content = content;
	this.attachedFunction = attachedFunction;
};

SidebarComponent.prototype.render = function(parentElement, contentContainer) {
	contentContainer.appendChild(this.content);
	parentElement.appendChild(contentContainer);	
};

SidebarComponent.prototype.fireAttachedFunction = function(function) {
	attachedFunction
};

