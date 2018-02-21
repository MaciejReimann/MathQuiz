const createElement = function(tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
  };

const View = function(name) {
	this.name = name;	
}


const view.sidebar = new View(sidebar);