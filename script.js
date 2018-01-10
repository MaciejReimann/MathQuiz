
const naturalNumbers = {
  getRandomOfRange: function(min,max) { 
    return Math.floor(Math.random() * (max + 1 - min) ) + min 
  },
  getAll: function() {
    const array = [];
    for (let i = 1; i < 10 ; i++) { array[i-1] = i };
    return array;
  },
  shuffle: function(array) {   
   for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  },
  getAllShuffled: function() {
    return this.shuffle( this.getAll() )
  },
  allPaired: function() {
    const arrayOfPairs = []; 
    const arrayOfEquations = [];
    for (let i = 1; i < 10; i++ ) {       
      for (let j = 1; j < 10; j++ ) {
          let pair = [];
          pair.push(i)
          pair.push(j)
          arrayOfPairs.push(pair)
        }
      }
    for (key in arrayOfPairs) {
      let obj = {};
      obj.valueX = arrayOfPairs[key][0];
      obj.valueY = arrayOfPairs[key][1];
      obj.valueZ =  obj.valueX * obj.valueY;
      obj.inputPosition = "";
      arrayOfEquations.push( obj );
    }
    return arrayOfEquations;
  },
  allPairsShuffled: function() {
    const newArray = this.shuffle( this.allPaired() )
    for (let i = 0; i < newArray.length; i++) {
      newArray[i].index = i;
    };
    return newArray;
  },
 
};

const ShuffledEquations = function() {
  const allShuffled = naturalNumbers.allPairsShuffled();
  let globalIndex = 0; 
  let tempIndex = 0;

  this.getAll = function() {return allShuffled };
  this.getOne = function(n) {return allShuffled [n] };

  this.setGlobalCurrent = function(n) { globalIndex = n }
  this.setNextAsGlobalCurrent = function() { globalIndex ++; }
  this.getGlobalCurrent = function() {return allShuffled [ globalIndex ] };

  this.setTempCurrent = function(n) { tempIndex = n }
  this.setNextAsTempCurrent = function() { tempIndex ++ }
  this.getTempCurrent = function() {return allShuffled [ tempIndex ] };
};

const Counter = function() {
  let globalCounter = 0;
  let localCounter = 0;
  this.setGlobal = function(n) { globalCounter = n; return globalCounter };
  this.getGlobal = function(n) { return globalCounter };
  this.incrementGlobal = function(n) { globalCounter ++ ;  return globalCounter };

  this.setLocal = function(n) { localCounter = n ;  return localCounter };
  this.getLocal = function(n) { return localCounter };
  this.incrementLocal = function(n) { localCounter ++ ; return localCounter };
};

const Drawer = function() {
  let drawer = "";
  this.set = function(n) { drawer = n };
  this.get = function() { return drawer};
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// *** M O D E L *** ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
  init: function() {},
  equations: new ShuffledEquations(),

  userData: {
    currentSession: {
      correctAnswers: [],
      incorrectAnswers: [],
      getScore: function() {
        return this.correctAnswers.length * 2;
      }
    },
  },

};
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = {
  init: function() {
      model.init();
      view.init();

  },
  getScore: function() {return model.userData.currentSession.getScore() },
  setScore: function() {
  },
  counter: new Counter(),
  
  // counter: function() { let x = view.equations.counter.getLocal(); return  },
  
  number: function() {
    return {
      x: model.equations.getGlobalCurrent().valueX,
      y: model.equations.getGlobalCurrent().valueY,
      z: model.equations.getGlobalCurrent().valueZ,
      inputPosition: model.equations.getGlobalCurrent().inputPosition,
      checkAnswer: function(inputValue) {

        const answer = parseInt(inputValue);
        const correctAnswer = this[this.inputPosition];

        // console.log(correctAnswer)
        if (answer === correctAnswer) {
          model.userData.currentSession.correctAnswers.push(this);
        } else 
          model.userData.currentSession.incorrectAnswers.push(this);
      },
      
     };
  },

  equationType: function() {

    let number = this.number;
    const createEl = this.createEl;
    const inputField = createEl("input", "equationElements");
    const equationArray = [
      createEl ("div", "equationElements", this.number().x ),
      createEl ("div", "equationElements", "x"),
      createEl ("div", "equationElements", this.number().y ),
      createEl ("div", "equationElements", "=" ),
      createEl ("input", "input"),
    ]
    
    return {
      leftHand: function() { // x * y = z
        return {
          blankFirst: function() {
            equationArray[0] = inputField;
            equationArray[4] = createEl ("div", "equationElements",  number().z );
            model.equations.getAll()[ controller.counter.getLocal() ].inputPosition = "x";
            controller.counter.incrementLocal();
            return equationArray;
          },
          blankSecond: function() {
            equationArray[2] = inputField;
            equationArray[4] = createEl ("div", "equationElements",  number().z );
            model.equations.getAll()[controller.counter.getLocal()].inputPosition = "y";
            controller.counter.incrementLocal();
            return equationArray;
          },
          blankThird: function() {
            model.equations.getAll()[controller.counter.getLocal()].inputPosition = "z";
            controller.counter.incrementLocal();
            return equationArray;
          },
        };
      },
      rightHand: function(n) { // z = y * x
        equationArray[0] = createEl("div", "equationElements",  number().z );
        equationArray[1] = createEl("div", "equationElements", "=" );
        equationArray[2] = createEl("div", "equationElements", number().y );
        equationArray[3] = createEl("div", "equationElements", "x" );
        equationArray[4] = inputField;
        return {
          blankFirst: function() {
            equationArray[0] = inputField;
            equationArray[4] = createEl ("div", "equationElements",  number().x );
            model.equations.getAll()[ controller.counter.getLocal() ].inputPosition = "z";    
            controller.counter.incrementLocal();
            return equationArray;
          },
          blankSecond: function() {
            equationArray[2] = inputField;
            equationArray[4] = createEl ("div", "equationElements",  number().x );
            model.equations.getAll()[ controller.counter.getLocal() ].inputPosition = "y";
            controller.counter.incrementLocal();
            return equationArray;
          },
          blankThird: function() {
            model.equations.getAll()[ controller.counter.getLocal() ].inputPosition = "x";
            controller.counter.incrementLocal();
            return equationArray;
          },
        };
      },
    };    
  },
  wrapInParagraph: function(equationType) {
      const equationParagraph = controller.createEl("DIV", "equationParagraph");
      for (let i = 0; i < equationType.length; i ++) {           
        equationParagraph.appendChild( equationType[i] );
      };
      return equationParagraph;
    },
  
  equationsToShow: function(a, b, c, d, e, f) {
    const listOfEquations = []
    for (let i = 0; i < a; i ++) {
      listOfEquations[i] = this.wrapInParagraph( this.equationType().leftHand().blankThird() );
      model.equations.setNextAsGlobalCurrent();
    };
    for (let i = a; i < a + b; i ++) {
      listOfEquations[i] = this.wrapInParagraph( this.equationType().leftHand().blankFirst() );
      model.equations.setNextAsGlobalCurrent();
    };
    for (let i = b + a; i < a + b + c; i ++) {
      listOfEquations[i] = this.wrapInParagraph( this.equationType().leftHand().blankSecond() );
      model.equations.setNextAsGlobalCurrent();
    };
    for (let i = c + b + a; i < a + b + c + d; i ++) {
      listOfEquations[i] = this.wrapInParagraph( this.equationType().rightHand().blankThird() );
      model.equations.setNextAsGlobalCurrent();
    };
    for (let i = d + c + b + a; i < a + b + c + d + e; i ++) {
      listOfEquations[i] = this.wrapInParagraph( this.equationType().rightHand().blankSecond() );
      model.equations.setNextAsGlobalCurrent();
    };
    for (let i = e + d + c + b + a; i < a + b + c + d + e + f; i ++) {
      listOfEquations[i] = this.wrapInParagraph( this.equationType().rightHand().blankFirst() );
      model.equations.setNextAsGlobalCurrent();
    };
    model.equations.setGlobalCurrent(0);
    controller.counter.setLocal(0);
    return listOfEquations;
  },

  createEl: function(tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
  },
};

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const view =  {
  main: document.querySelector('.main'),
  init: function () {
    this.render()
  },
  render: function() {
    this.equations.render();
    this.score.render();   
  },
  score: {
    scoreParent: document.querySelector('.score'),
    render: function() {
      let score = controller.getScore()
      this.clear();
      this.scoreParent.appendChild( controller.createEl("DIV", "scoreDiv", score) )
    },
    clear: function() {
      if (this.scoreParent.children.length > 0) {
        this.scoreParent.removeChild( this.scoreParent.firstElementChild );
      };
    },    
  },

  equations: {
    inputFields: document.getElementsByTagName('INPUT'),
    list: controller.equationsToShow(2, 2, 2, 2, 2, 2),
    counter: controller.counter,
    maxAllowed: 7,
    render: function() {
      // console.log( controller.correctAnswer.is );
      console.log( this.counter.getLocal() )
      let batch = view.equations.counter.getGlobal() * this.maxAllowed;
      if (this.counter.getLocal() === this.maxAllowed - 1) {
        this.counter.incrementGlobal();
      };
      if (this.counter.getLocal() === this.maxAllowed) {
        this.clearAll();
        this.counter.setLocal(0);
      };
      if (this.counter.getLocal() >= 0 && this.counter.getLocal() < this.maxAllowed ) {
        this.clearAll();
        this.counter.incrementLocal();
        for (let i = batch ; i < this.counter.getLocal() + batch ; i ++ ) {
            view.main.appendChild( this.list[ i ] );          
        };
      };
      this.inputFieldEvents( this.counter.getLocal() );      
    },
    clearAll: function() {
      const allElements = view.main.children;     
      if (allElements.length > 0) {
        for (let i = allElements.length-1; i >= 0; i--) {
          view.main.removeChild( allElements[i] )
        };        
      };
    },
    update: function() {
      model.equations.setNextAsGlobalCurrent()
      view.render();
    },
    
    inputFieldEvents: function(i) {
      let inputFields = this.inputFields;
      inputFields [ this.counter.getLocal() - 1 ].focus();
      inputFields[ i-1 ].addEventListener("keypress", function onEnter (e) {
        let key = e.keyCode;
        if (key === 13) {
          controller.number().checkAnswer(inputFields[ i-1 ].value);
          view.equations.update();
          if ( inputFields.length > 1) {
            inputFields[ i-1 ].removeEventListener("keypress", onEnter);
          };
        };       
      });      
    },
  },
};

controller.init()

// const table = function(x,y) {
//   const table = basic.create2DArray(10,10);  
//   return {
//     valueX: x,
//     valueY: y,
//     valueZ: x*y,
//     selectedNumbers: [],
//     showAllFilled: function () {
//       for (let i = 0; i < 10 ; i++) {
//         for (let j = 0; j < 10 ; j++) {
//           table[i][j] = function () {
//             const square = basic.createAndAppendEl(mainElements.table, "div");
//             square.textContent = (i+1) * (j+1);
//             if (i === 0 || j === 0 ) { square.className = "first-rows" }
//           }();
//         };
//       };
//       return true;
//     },
//     showAllEmpty: function() {
//        for (let i = 0; i < 10 ; i++) {
//         for (let j = 0; j < 10 ; j++) {
//           table[i][j] = function () {
//             const square = basic.createAndAppendEl(mainElements.table, "div");
//             square.id = i + 'n' + j;
//               if (i=== 0 || j === 0) {        
//               square.textContent = (i+1) * (j+1);
//               square.className = "first-rows";
//             } else { 
//               square.className = "the-rest";
//               const inputfields = basic.createAndAppendEl(square, "input");
// //              inputfields.className = "input-fields";
//             };
//           }();
//         };
//       };
//       return true;
//     },
//     highlight: function() {
//       if (x && y) { 
//         document.getElementById(basic.printId(x,y)).className = "highlighted";
//       } else { return "no arguments" }
//     },
//     selectRandomSquare: function () {
//       const x = Math.floor(Math.random() * 10);
//       const y = Math.floor(Math.random() * 10);
//       const selectedNumbers = this.selectedNumbers;
//       const checkIfAlreadySelected = function (x,y) {
//         for (let i = 0; i < selectedNumbers.length; i++) {
//           for (let j = 0; j < selectedNumbers.length; j++) {
//             if ( selectedNumbers[i] === x && selectedNumbers[j] === y) {
//               console.log(x,y)
//             }
//           }          
//         }
        
//         selectedNumbers.join([x,y])
//       }();
//       return [x, y];
//     },    
//   };
// }



// //let a = table().showAllFilled();
 





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
