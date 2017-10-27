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

const table = function(x,y) {
  const table = basic.create2DArray(10,10);  
  return {
    valueX: x,
    valueY: y,
    valueZ: x*y,
    selected: false,
    showAllFilled: function () {
      for (let i = 0; i < 10 ; i++) {
        for (let j = 0; j < 10 ; j++) {
          table[i][j] = function () {
            const squares = basic.createAndAppendEl(mainElements.table, "div");
            squares.textContent = (i+1) * (j+1);
            if (i === 0 || j === 0 ) { squares.className = "first-rows" }
            }();
          };
        };
      return true
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
//    highlight: function() {
//      const square = 
//    }
    
  };
}

//let a = table().showAllFilled();

const selectRandomTablePiece = function () {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  return [x, y];
}






//
//
//
//const footballersPictures = {
//  Bale: "http://img.bleacherreport.net/img/images/photos/002/622/520/hi-res-450218321-wales-striker-gareth-bale-in-action-during-the_crop_exact.jpg?w=1200&h=1200&q=75",
//  Griezmann: "http://www.latidoalatido.com/wp-content/uploads/2016/06/Griezmann-gol-Francia-Albania.-jpg-1.jpg",
//  Ronaldo: "https://pbs.twimg.com/media/DCbOiadU0AATYRF.jpg",
////  send: function (n) {
////    const array = [];
////    for (key in this) { array.push(this.key); }
////    return this.array[n]
////  }
//};
//
//
//
//
//
//const messages = {  
//  welcome: "Welcome Name",  
//  test1: "Fill in the blanks"  
//};  
//
//const userInput = {
//  name: '',
//  answersCounter: 0,
//  answersCorrect: 0,
//  correctNrStats: [0,0,0,0,0,0,0,0,0],
//  incorrectNrStats: [0,0,0,0,0,0,0,0,0],
//  numberX: 0,
//  numberY: 0,
//  numberZ: 0,
//  
//  correctAnswer: 0,
//  
//  numbersLearnedinPairs: [],
//  
//  pairRepeated: function () {
//    let x = this.numberX;
//    let y = this.numberY
//    for (let i = 0; i < userInput.numbersLearnedinPairs.length; i++) {
//      if (this.numbersLearnedinPairs[i][0] === x && this.numbersLearnedinPairs[i][1] === y) {
//        return true;
//      }
//    }
//    return false;
//
//  }
//  
//  answer: 0,
//    
//  checkAnswer: function(n) {
//    
//    
//    if (n===this.correctAnswer) { 
//      this.answersCorrect+=1 
//      this.correctNrStats[this.numberX-1] = parseInt(this.correctNrStats[this.numberX-1])+1;
//      this.correctNrStats[this.numberY-1] = parseInt(this.correctNrStats[this.numberY-1])+1;
//      this.numbersLearnedinPairs.push([this.numberX, this.numberY]);
//    };
//    this.answersCounter+=1;
//    canvas(600, 600);
//  },
//  
//  scenarioController: function() {
//    const i = this.answersCounter;
//    if (i>2 && i<4) {return 2};
//    if (i>4 && i<6) {return 3};
//    if (i>6) {return 4};
//    return 1;
//  },
//};
//
//const canvas = function (n, m ) {
//  const canvas = document.createElement('CANVAS');
//  mainElements.graph.appendChild(canvas);
//    
//  canvas.setAttribute('width', n)
//  canvas.setAttribute('height', m)
//  canvas.style.border = 'solid 0.5px black';
//  const ctx = canvas.getContext('2d');
//
//  const pic = document.createElement('img');
//  pic.src = footballersPictures.Bale;
//  
//  pic.addEventListener ("load", () => {
//    const w = pic.naturalWidth;
//    const h = pic.naturalHeight;
//    let f = 10;
//    const nums = userInput.numbersLearnedinPairs;
//    
//    for (let i = 0; i <f; i++) {
//      for (let j = 0; j <f; j++) {
//        ctx.rect(n /f *i , m /f *j, n/f, m/f);
//        ctx.lineWidth="1";
//        ctx.stroke();
//        };
//    };
//    
//    for (let i = 0; i < nums.length; i++) {       
//       ctx.drawImage(pic, 
//                      w  / f * nums[i][0],      h / f * nums[i][1], //sx, sy
//                      w / f,      h  / f,       //s-width, s-height
//                      m/f*nums[i][0], m/f*nums[i][1],    n/f, m/f );                    //x,y   width, height
//    };
//    
//  });
////  context.drawImage(img,sx,sy,swidth,sheight,   x,y,width,height);  
//};
//
//const table = { 
//  rows: 10,
//  columns: 10,
//  grid: [],
//  
//  create: function() {
//    const m = this.rows;
//    const n = this.columns;
//    function createArray(n) {
//      const newArray = [];
//      for (let i=0; i<n; i++) { newArray[i] = i }; 
//      return newArray;
//    };
//    for (let i=0; i<m; i++) { this.grid[i] = createArray(n) };
//    for (let i=0; i<n; i++) {
//      for (let j=0; j<m; j++) {
//        this.grid[i][j] = this.show(i, j);
//      };
//    };
//  },
//  show: function(i,j) {
//    const x = parseInt(i)+1;
//    const y = parseInt(j)+1;
//    const span = document.createElement('SPAN');
//    const br = document.createElement('BR');
//    mainElements.table.appendChild(span);
//    span.textContent = x*y;
//    span.id = x + '*' + y;
//    
//    if (y === 10) { mainElements.table.appendChild(br) }
//    return true;
//  },
//  style: function(i,j) {
//    
//  },
//  
//  highlight: function(i,j) {    
//    const field = document.getElementById(coordsToID(i,j));
//    if (field) {field.style.color = 'red'};
//  },
//}
//
//
//
//function coordsToID(x,y) {
//  const ID = x + '*' + y;
//  return ID;
//}
//
//
//
////function showMessage(message){
////  const messageParagraph = document.createElement('p');
////  mainElements.messages.appendChild(messageParagraph);
////  messageParagraph.textContent = message;
////};
//
//
//const equationLine = {
//  createDefault: function(el) {
//    const p = document.createElement('p');
//    el.appendChild(p);
//    for (let i = 1; i<6; i+=1) {
//      const span = document.createElement('span');
//      span.className = 'equation-spans';
//      span.id = i;
//      p.appendChild(span);
//    };
//    const spanList = document.querySelectorAll('.equation-spans');
//    
//    return spanList;  
//  },
//  
//  writeRandomEquation: function(el, stage) {
//    const spanList = this.createDefault(el);
//    const inputField = document.createElement('input');
//    inputField.id = 'equation-input';
//    inputField.type = 'text';
//    inputField.size = '3';
//    
//    
//    const numberX = Math.floor(Math.random() * 10) + 1; 
//    const numberY = Math.floor(Math.random() * 10) + 1;
//    
//    const numberZ = numberX * numberY;
//   
//    userInput.numberX = numberX;
//    userInput.numberY = numberY;
//    userInput.numberZ = numberZ;
//      
//    function choseEqSignSide(side, n) {
//      if (side==='left') {
//        spanList[0].textContent = numberZ;
//        spanList[1].textContent = ' = ';
//        spanList[2].textContent = numberX;
//        spanList[3].textContent = ' x ';
//        spanList[4].textContent = numberY;
//        spanList[n].textContent = '';
//        spanList[n].appendChild(inputField);
//      };
//      if (side==='right') {
//        spanList[0].textContent = numberX;
//        spanList[1].textContent = ' x ';
//        spanList[2].textContent = numberY;
//        spanList[3].textContent = ' = ';
//        spanList[4].textContent = numberZ;
//        spanList[n].textContent = '';
//        spanList[n].appendChild(inputField);
//      };
//    };
//    
//    function inputFieldAtRandom() {
//      const n = parseInt(Math.floor(Math.random() * 3));
//        if (n===0) { userInput.correctAnswer = numberX; return 0 };
//        if (n===1) { userInput.correctAnswer = numberY; return 2 };
//        userInput.correctAnswer = numberZ;
//        return 4;
//    };
//    function inputFieldAsResult(side) {        
//        if (side==='left') { return 0 };
//      return 4;
//    };
//    function choseSideAtRandom() {
//      const n = parseInt(Math.floor(Math.random() * 2));
//        if (n===0) {return 'left'};
//      return 'right';
//    };
//    
//    function scenarioNr(m) {
//      if (m===1) { choseEqSignSide('right', inputFieldAsResult()) };
//      if (m===2) { choseEqSignSide('left', inputFieldAsResult('left')) };
//      if (m===3) { choseEqSignSide('right', inputFieldAtRandom()) };
//      if (m===4) { choseEqSignSide(choseSideAtRandom(), inputFieldAtRandom()) };
//    };
//    scenarioNr(3)
////    scenarioNr(userInput.scenarioController());
//},
//  
//  remove: function () {
//    const input = document.getElementById('equation-input')
//    input.parentElement.removeChild(input);
//  },  
//};
//
//const numericKeyboard = {
//  show: function(divName) {
//    for (let i=1; i<10; i+=1) {
//      let numericButtons = document.createElement('button');
//      numericButtons.className = 'numeric-keys';
//      numericButtons.id = 'button_' + i;
//      if (i===4 || i===7) { 
//        divName.appendChild(document.createElement('br'))
//      };
//      numericButtons.textContent = i;
//      divName.appendChild(numericButtons);
//    };
//    
//    divName.appendChild(document.createElement('br'))
//    
//    const deleteButton = document.createElement('button');
//    deleteButton.className = 'special-keys';
//    deleteButton.textContent = '<';
//    deleteButton.id = deleteButton.textContent;
//    divName.appendChild(deleteButton);
//
//    const zeroButton = document.createElement('button');
//    zeroButton.className = 'numeric-keys';
//    zeroButton.textContent = 0;
//    zeroButton.id = zeroButton.textContent;
//    divName.appendChild(zeroButton);
//  
//    const enterButton = document.createElement('button');
//    enterButton.className = 'special-keys';
//    enterButton.textContent = 'OK';
//    enterButton.id = enterButton.textContent;
//    divName.appendChild(enterButton); 
//        
//  },
//};
//
//mainElements.container.addEventListener('click', (e)=> {
//    const inputField = document.getElementById('equation-input');
//    if (e.target.className === 'numeric-keys') {        
//      inputField.value = inputField.value*10 + parseInt(e.target.textContent);
//    } else if (e.target.textContent === '<') {
//      inputField.value = Math.floor(inputField.value/10); 
//    } else if (e.target.textContent === 'OK') {
//      userInput.checkAnswer(parseInt(inputField.value));
//      equationLine.remove();
//      equationLine.writeRandomEquation(mainElements.test);
//      mainElements.graph.removeChild(document.querySelector('canvas'))
//    };
//})
//
//mainElements.container.addEventListener('sumbmit', (e)=> {
//    const inputField = document.getElementById('equation-input');
//    userInput.checkAnswer(parseInt(inputField.value));
//    equationLine.remove();
//    equationLine.writeRandomEquation(mainElements.test);
//    
//})
//
//function loadPage1() {
////  showMessage(messages.welcome);
//  equationLine.writeRandomEquation(mainElements.test);
//
//  canvas(600,600);
//
////  table.create();
//  numericKeyboard.show(mainElements.keyboard);
//  
//};
//
//loadPage1();
