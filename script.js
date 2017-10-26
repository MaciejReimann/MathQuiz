const basic = {
  createArray: function(n) {
    const array = [];
    for (let i = 0; i < n ; i++) { array[i] = i };
    return array;
  },
  create2DArray: function(n, m) {
    const array = [];
    for (let i = 0; i < m ; i++) { array[i] = this.createArray(n) };
    return array;
  },
  createAndAppendEl: function(el, tag) {
    const appended = document.createElement(tag);
    el.appendChild(appended);
    return appended;
  }
}

const messages = {
  fillAsFast: "Fill the whole table as fast as you can!",
  fillHighlighted: "Fill in the correct number in the highlighted field"
}



const mainElements = {
  container: document.querySelector('#main-container'),
  messages: document.querySelector('#messages'),  
  test: document.querySelector('#test'),
  keyboard: document.querySelector('#keyboard'),  
  table: document.querySelector('#table'), 
  graph: document.querySelector('#graph'), 
}; 

const tablePiece = function(x,y) { 
  return {
    valueX: x,
    valueY: y,
    valueZ: x*y,
    selected: false,
    showAllFilled: function () {
      const squares = basic.createAndAppendEl(mainElements.table, "div");
      squares.textContent = this.valueZ;
//      if (this.valueY === 10) { basic.createAndAppendEl(mainElements.table, "br") }
      if (this.valueX === 1 ||this.valueY === 1 ) { squares.className = "first-rows" }
//        else { squares.className = "the-rest" }
//        squares.id = "n" + [this.valueX] + "n" + [this.valueY]
    },
    showAllEmpty: function() {
      const squares = basic.createAndAppendEl(mainElements.table, "div");
      if (this.valueX === 1 || this.valueY === 1) {        
        squares.textContent = this.valueZ;
        squares.className = "first-rows";
      } else { 
        const inputfields = basic.createAndAppendEl(squares, "input");
        }
      return [this.valueX, this.valueY];
    },
    highlight: function() {
      
    }
    
  };
}

const table = function(x,y) {
  const table = basic.create2DArray(10,10);
  const coords = [x,y]
  for (let i = 0; i < 10 ; i++) {
    for (let j = 0; j < 10 ; j++) {
    table[i][j] = tablePiece(i+1, j+1).showAllEmpty();
    };
  };
  if (coords.length > 0) {return coords}
  else {return table}
  
};



const selectRandomTablePiece = function () {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  return [x, y];
}
