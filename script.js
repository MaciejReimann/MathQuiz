
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
      obj.valueX = arrayOfPairs[key][0]
      obj.valueY = arrayOfPairs[key][1]
      obj.valueZ =  obj.valueX * obj.valueY
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
}

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
  
  number: function() {
    return {
      x: model.equations.getGlobalCurrent().valueX,
      y: model.equations.getGlobalCurrent().valueY,
      z: model.equations.getGlobalCurrent().valueZ,
      checkAnswer: function(inputValue) {
        const answer = parseInt(inputValue);
        const correctAnswer = this[controller.correctAnswer.is];
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
    const inputField = this.createEl("input", "equationElements");
    const givenNumber = function(n) { createEl ("div", "equationElements", n ) }
    const xSign = function(n) { createEl ("div", "equationElements", "x" ) }
    const equationArray = [
    this.createEl ("div", "equationElements", this.number().x ),
    this.createEl ("div", "equationElements", "x"),
    this.createEl ("div", "equationElements", this.number().y ),
    this.createEl ("div", "equationElements", "=" ),
    this.createEl ("input", "input"),
    ]
    
    return {
      leftHand: function() {
        return {
          blankFirst: function() {
            equationArray[0] = inputField;
            equationArray[4] = givenNumber( number().z );
            controller.correctAnswer = Object.create( { is : "x" } );
            return equationArray;
          },
          blankSecond: function() {
            equationArray[2] = inputField;
            equationArray[4] = givenNumber( number().z );
            controller.correctAnswer = Object.create( { is : "y" });
            return equationArray;
          },
          blankThird: function() {
            controller.correctAnswer = Object.create( { is : "z" });
            return equationArray;
          },
        }
      },
      rightHand: function(n) { // z = y * x
        equationArray[0] = givenNumber( number().z );
        equationArray[1] = createEl("div", "equationElements", "=" );
        equationArray[3] = createEl("div", "equationElements", "x" );
        equationArray[4] = givenNumber( number().x );
        if (n === "blankFirst") {
            equationArray[0] = inputField;
            (function() { controller.correctAnswer = Object.create( { is : "z" } )   })()
        };
        if (n === "blankSecond") { 
            equationArray[2] = inputField;            
            (function() { controller.correctAnswer = Object.create( { is : "y" } )   })()
        } else
            equationArray[4] = inputField;
            (function() { controller.correctAnswer = Object.create( { is : "x" } )   })()
        return equationArray;
      },
    }
  },
  wrapInParagraph: function(equationType) {
      const equationParagraph = controller.createEl("DIV", "equationParagraph");
      for (let i = 0; i < equationType.length; i ++) {           
        equationParagraph.appendChild( equationType[i] );
      };
      return equationParagraph;
    },

  
  equationsToShow: function(t) {
    const listOfEquations = []
    for (let i = 0; i < t; i++) {
      listOfEquations[i] = this.wrapInParagraph( this.equationType().leftHand().blankThird() );
      model.equations.setNextAsGlobalCurrent();
    }
    model.equations.setGlobalCurrent(0);
    return listOfEquations;
  },

  createEl: function(tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
  },
}

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const view = {
  main: document.querySelector('.main'),
  init: function () {
    this.render();
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
    list: controller.equationsToShow(22),
    counter: new Counter(),
    maxAllowed: 7,
    render: function() {
      console.log( this.counter.getGlobal() )
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

controller.init();
