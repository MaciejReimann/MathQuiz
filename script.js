
/*   TO DO LIST:
0. Attach a Bonus! module; 
1. Add saveCurrentState() to model.table.currentState
2. Add saveCurrentState() to model.equations.currentState
3. Add a message/instruction field;
4. Add model.save().toLocalStorage
*/
const shuffle = function(array) {
   for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  return array;
};
const Equation = function(i, j, counter) {
  this.x = i;
  this.y = j;
  this.z = this.x * this.y;
  this.inputPosition = "";
  this.index = counter;
  this.userAnswer = "";
  this.numberOfTimesAnsweredCorrectly = 0;
};
const ArrayOfEquations = function(givenArray) {
  let loopCounter = 0;
  let globalIndex = 0; 
  let tempIndex = 0;
  let array;
  let currentArray;
  if (givenArray) {
   array = givenArray
  } else {
    array = new Array;
    for (let i = 1; i < 10; i++ ) {       
      for (let j = 1; j < 10; j++ ) {
        loopCounter++
        let equation = new Equation(i, j, loopCounter);
        array.push(equation);
      };
    };
  };
  const temp = array.slice();
  const shuffledArray = shuffle(temp);
  this.getShuffled = function() {currentArray = shuffledArray; return currentArray }; 
  this.getInOrder = function() {currentArray = array; return currentArray };
  this.setInputPositionForAll = function(n) {
    currentArray.map(function(value) {
      value.inputPosition = n;
    });
  };
  this.setUserAnswer = function(n) {
   currentArray [ globalIndex ].userAnswer = n;
  };
  // this.getOne = function(n) {return allShuffled [n] };
  this.setGlobalCurrent = function(n) { globalIndex = n }
  this.setNextAsGlobalCurrent = function() { globalIndex ++;  }
  this.getGlobalCurrent = function() {return currentArray [ globalIndex ] };
  this.getGlobalIndex = function() {return globalIndex };
};
const Counter = function(k) {
  let counter;
  if (k) { counter = k } else { counter = 0 };  
  this.set = function(n) { counter = n ;  return counter };
  this.get = function(n) { return counter };
  this.increment = function(n) { counter ++ ; return counter };
};
const Score = function(initialValue) {
  let globalScore = 0;
  let strike = 0;
  this.strikeIncrement = function() { strike ++ };
  this.strikeReset = function() { strike = 0 };
  this.globalIncrement = function() { globalScore = globalScore + strike * 2  }
  this.getGlobal = function() { return globalScore };
  // this.getBaseFrom = function(n) { localBase = n }; // How to define parameteras an anonymous function?""
};
const StoredValue = function(k) {
  let value;
  if (k) { value = k }
  this.set = function(n) { value = n };
  this.get = function() { return value};
};
const Array2D = function() {
  let topLevelArrays = new Array;
  this.addTopLevelArray = function() {
    topLevelArrays.push(new Array)
  };
  this.addItem = function(n, item) {
    topLevelArrays[n].push(item);
  };
  this.getArray = function(n) {
    return topLevelArrays[n];
  };
  this.create = function(n, m) {
    const array = new Array(n);
    for (let i = 0; i < n ; i++) {
        array[i] = new Array(m);
    }
    return array;
  };
};
const createEl = function(tag, className, textContent) {
    const newElement = document.createElement(tag);
    newElement.className = className;
    newElement.textContent = textContent;
    return newElement;
  };
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// *** M O D E L *** ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const model = {
  init: function() {},
  footballersPictures: {
    Bale: "https://yt3.ggpht.com/a-/AK162_4EG4Spkjbr82hhwOApAIzQIoF6uHtwILpsqQ=s900-mo-c-c0xffffffff-rj-k-no",
    Griezmann: "http://www.latidoalatido.com/wp-content/uploads/2016/06/Griezmann-gol-Francia-Albania.-jpg-1.jpg",
    Ronaldo: "https://pbs.twimg.com/media/DCbOiadU0AATYRF.jpg",
  inArray: function (n) {
    const array = [];
    for (key in this) { 
      array.push(this.key) 
    };
    return this.array[n]
  },
},
  array: new ArrayOfEquations().getInOrder(),
  userData: {
      answers: {
        correct: [],
        incorrect: new Array2D, // add a functions that fires when this.length = 0;
      },
      score: new StoredValue(),
    },
};
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// *** C O N T R O L L E R *** ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const controller = {
  init: function() {
      model.init();
      view.init();
  },
  currentArray: new StoredValue(),
  score: new Score(),
  equations: {
    array: new ArrayOfEquations(),
    batchCounter: new Counter(),
    number: function() {      
      if (controller.currentArray.get() === undefined) {
        controller.currentArray.set( controller.equations.array );
      }
        let currentItem = controller.currentArray.get().getGlobalCurrent();        
        const currentBatch = controller.equations.batchCounter.get();
        return {
          x: currentItem.x,
          y: currentItem.y,
          z: currentItem.z,
          inputPosition: currentItem.inputPosition,
          checkAnswer: function(inputValue) {
            let index = currentItem.index
            const answer = parseInt(inputValue);
            const correctAnswer = this[this.inputPosition];
            controller.currentArray.get().setUserAnswer(answer);
            model.array [ index - 1 ].numberOfTimesAnsweredCorrectly ++;
            if (answer === correctAnswer) {
              controller.equations.proceed().ifCorrect( this );
              return true;
            } else {
              controller.equations.proceed().ifIncorrect( currentBatch, this );
              return false;
            };
          }, 
        };
      
    },
    checkIfInputIsValid: function(answer, element) {
      if ( isNaN( answer ) ) {
        this.proceed().ifInvalid( element );
        return false;
      } else {
        this.proceed().ifValid( element );
        return true;
      };
    },
    proceed: function() {
      const currentBatch = controller.equations.batchCounter.get();
      return {
        ifCorrect: function(item) {
          model.userData.answers.correct.push(item);
          controller.score.strikeIncrement();
          controller.score.globalIncrement();
        },
        ifIncorrect: function(currentBatch, item) {
          model.userData.answers.incorrect.addItem(currentBatch, item);
          controller.score.strikeReset()
        },
        ifInvalid: function(inputField) {
          inputField.className = "invalid";
        },
        ifValid: function(inputField) {
          inputField.className = "input-fields";
        },
        ifDone: function(inputField) {
          inputField.className = "done";
          inputField.disabled = true;
        },
      };
    },
    counter: new Counter(-1),
    type: function() {
      let number = this.number;
      const array = this.array.getShuffled();
      const counter = this.counter;
     
      const inputField = createEl("input", "equationElements");
      const equationArray = [
        createEl ("div", "equationElements", number().x ),
        createEl ("div", "equationElements", "x"),
        createEl ("div", "equationElements", number().y ),
        createEl ("div", "equationElements", "=" ),
        createEl ("input", "input"),
      ];    
      return {
        leftHand: function() { // x * y = z
          return {
            blankFirst: function() {
              equationArray[0] = inputField;
              equationArray[4] = createEl ("div", "equationElements",  number().z );
              array[ counter.increment() ].inputPosition = "x";
              return equationArray;
            },
            blankSecond: function() {
              equationArray[2] = inputField;
              equationArray[4] = createEl ("div", "equationElements",  number().z );
              array[ counter.increment() ].inputPosition = "y";
              return equationArray;
            },
            blankThird: function() {
              array[ counter.increment() ].inputPosition = "z";              
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
              array[ counter.increment() ].inputPosition = "z"; 
              return equationArray;
            },
            blankSecond: function() {
              equationArray[2] = inputField;
              equationArray[4] = createEl ("div", "equationElements",  number().x );
              array[ counter.increment() ].inputPosition = "y";
              return equationArray;
            },
            blankThird: function() {
              array[ counter.increment() ].inputPosition = "x";
              return equationArray;
            },
          };
        },
      };    
    },
    wrapInParagraph: function(equationType) {
      const equationParagraph = createEl("DIV", "equationParagraph");
      for (let i = 0; i < equationType.length; i ++) {           
        equationParagraph.appendChild( equationType[i] );
      };
      return equationParagraph;
    },
    display: function([a, b, c, d, e, f]) {
      const listOfEquations = []
       if (a !== undefined ) { 
        for (let i = 0; i < a; i ++) {
          listOfEquations[i] = this.wrapInParagraph( this.type().leftHand().blankThird() );
          this.array.setNextAsGlobalCurrent();
        };
      };
      if (b !== undefined ) { 
        for (let i = a; i < a + b; i ++) {
          listOfEquations[i] = this.wrapInParagraph( this.type().leftHand().blankFirst() );
          this.array.setNextAsGlobalCurrent();
        };
      };
      if (c !== undefined ) { 
        for (let i = b + a; i < a + b + c; i ++) {
          listOfEquations[i] = this.wrapInParagraph( this.type().leftHand().blankSecond() );
          this.array.setNextAsGlobalCurrent();
        };
      };
      if (d !== undefined ) {
        for (let i = c + b + a; i < a + b + c + d; i ++) {
          listOfEquations[i] = this.wrapInParagraph( this.type().rightHand().blankThird() );
          this.array.setNextAsGlobalCurrent();
        };
      };
      if (e !== undefined ) {
        for (let i = d + c + b + a; i < a + b + c + d + e; i ++) {
          listOfEquations[i] = this.wrapInParagraph( this.type().rightHand().blankSecond() );
          this.array.setNextAsGlobalCurrent();
        };
      };
      if (f !== undefined ) {
        for (let i = e + d + c + b + a; i < a + b + c + d + e + f; i ++) {
          listOfEquations[i] = this.wrapInParagraph( this.type().rightHand().blankFirst() );
          this.array.setNextAsGlobalCurrent();
        };
      };
      this.array.setGlobalCurrent(0);
      model.userData.answers.incorrect.addTopLevelArray();
      return listOfEquations;
    },
  distributeEvenly: function(number) {    
    let list = new Array;
    let quotient = Math.floor(number / 5);
    let remainder = number % 5;
    if (number < 5) {
      for (let i = 0; i < remainder; i ++ ) {
        list [ i ] = 1;
      };
    } else {
      for (let i = 0; i < 5; i ++ ) {
        list [ i ] = quotient;
      };
      list[5] = remainder;
    };    
    return list;
    },
  generateList: function() {
    let arrayLength =  this.array.getShuffled().length;
    const distributionPattern = controller.equations.distributeEvenly( arrayLength );
    const list = controller.equations.display( distributionPattern );
    return list;
   },

 },
 table: {
  array: new ArrayOfEquations,
 },
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// *** V I E W *** //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const view =  {
  main: document.querySelector('.main'),
  init: function () {
    this.currentMainContent.set( 0 )
    this.render()
  },
  currentMainContent: new StoredValue (),
  render: function() {
    let index = 4;
    // let index = this.currentMainContent.get()
    this.clear();
    this.sidebar.functionsAttached [ index ] .fire(); // decide oun variable name (index / currentMainContent)
    this.results.render()
    this.score.render();
    this.sidebar.render();
  },
  clear: function() { // make a new ClearParent() constructor for all clear() functions and pass DOM elements as parameters
    if (this.main.children) {
      const allElements = this.main.children;
      for (let i = allElements.length-1; i >= 0; i--) {
        view.main.removeChild( allElements[i] )
      };
    };
  },
  results: {
    parent: document.querySelector('.results'),
    render: function() {

      this.clear();
      this.parent.appendChild( createEl("DIV", "resultsDiv", "results") );
      this.events();
    },
    clear: function() {
       if (this.parent.children.length > 0) {
        this.parent.removeChild( this.parent.firstElementChild );
      };
    },
    events: function() {
      this.parent.addEventListener("click", function() {
      view.equations.checkIfDone()
      view.clear();
      view.table.render().results()
      })
    },
  },
  score: {
    scoreParent: document.querySelector('.score'),
    render: function() {
      let score = controller.score.getGlobal()
      this.clear();
      this.scoreParent.appendChild( createEl("DIV", "scoreDiv", score) );
    },
    clear: function() {
      if (this.scoreParent.children.length > 0) {
        this.scoreParent.removeChild( this.scoreParent.firstElementChild );
      };
    },    
  },
  /*
-----------------------------------------v i e w-----------------------------------------------------
-------------------------------------- s i d e b a r  -----------------------------------------------
-----------------------------------------------------------------------------------------------------
*/
  sidebar: {
    parent: document.querySelector('.sidebar'),
    children: document.querySelector('.sidebar').children,
    functionsAttached: [
      {
        name: "Fill the gap",
        fire: function() {
         
          view.equations.checkIfDone()

          controller.currentArray.set( controller.equations.array )
          view.currentMainContent.set( 0 );
          view.clear();
          view.equations.render();
        }
      },
      {
        name: "Complete the table",
        fire: function() {
         

          controller.currentArray.set( controller.table.array )
          view.currentMainContent.set( 1 );
          view.clear();
          view.table.render().empty();
        }
      },
      {
        name: "Practice again",
        fire: function() {
          console.log(this.name + " fired");

        }
      },
      {
        name: "Count fast",
        fire: function() {
          console.log(this.name + " fired");
        }
      },
      {
        name: "Bonus!",
        fire: function() {
          view.currentMainContent.set( 4 );
          view.clear();
          view.photo.render();
        }
      },
    ],
    render: function() {
      this.clear();
      this.functionsAttached.map(function(el) {
        const list = createEl("p", "inactive", el.name);
        view.sidebar.parent.appendChild(list);
      });
      this.events();
    },
    clear: function() {
      if (this.children) {
        const allElements = this.children; 
        for (let i = allElements.length-1; i >= 0; i--) {
          this.parent.removeChild( allElements[i] )
        };        
      };  
    },    
    displayAs: function() {
      let children = Array.from(view.sidebar.children);
      return {
        active: function(element) {
          children.map(function(el) { el.className = "inactive" });
          element.className = "active";
        },
        completed: function() {},
      }
    },
    events: function() {
      let children = this.children;
      for (let i = 0; i < children.length; i++) {
        children[ i ].addEventListener("click", function (event) {

          view.sidebar.displayAs().active( children[ i ] );
          view.sidebar.functionsAttached[i].fire();
        })
      }       
    },

  }, 
/*
-----------------------------------------v i e w-----------------------------------------------------
------------------------------------ e q u a t i o n s ----------------------------------------------
-----------------------------------------------------------------------------------------------------
*/
  equations: {
    inputFields: function() { return document.getElementsByTagName('INPUT') } ,
    list: controller.equations.generateList(),
    pageCounter: new Counter(), 
    maxAllowedOnPage: 7,
    batchLength: function() {return this.list.length },
    batchCounter: controller.equations.batchCounter.get(),    
    displayedOnPage: new Counter,
    displayedUntilNow: new Counter(),


    //add start from square ONE !!!! zero all counters and generate new array

    render: function() {
      let maxAllowedOnPage = this.maxAllowedOnPage;
      let displayedOnPage = this.displayedOnPage;
      let currentBatch = this.pageCounter.get() * maxAllowedOnPage;
      
      if ( this.isNotDone.get() ) { 
        displayedOnPage.set ( displayedOnPage.get() - 1 );
      }

      if ( this.isFinished() ) {
        // proceed().toNextFunction();
      } else { //rendernextequation?
        if (displayedOnPage.get() === maxAllowedOnPage - 1) {
          this.pageCounter.increment();
        }; // this happens when the last (maxallowed) equation has been displayed;

        if (displayedOnPage.get() === maxAllowedOnPage) {
          view.clear();
          displayedOnPage.set(0);
        } // this happens when the last (maxallowed) equation has been displayed and enter hit;
      
        if (displayedOnPage.get() >= 0 ) {
          view.clear();
          for (let i = currentBatch ; i <= displayedOnPage.get() + currentBatch ; i ++ ) {
              view.main.appendChild( this.list[ i ] );
          };          
        };
        displayedOnPage.increment();
        this.displayedUntilNow.increment();
        
        if ( displayedOnPage.get() <= this.batchLength() && ! this.isNotDone.get() ) {
          this.events ( displayedOnPage.get() );
        }; // this assigns event to the input field on the last equation when there is at least one on the page
      };
      this.inputFields() [ this.inputFields().length - 1 ].focus()
    },
    isFinished: function() {
      if (this.displayedUntilNow.get() === this.batchLength() ) {
        return true;
      } else {
        return false;
      };            
    },
    checkIfDone: function() {
      if (this.inputFields().length > 0) {
        if (this.inputFields() [ this.inputFields().length - 1].className !== "done") {
          this.isNotDone.set(true);
          return true;
        };
      }
    },
    isNotDone: new StoredValue(),
    // startNewBatch: function() {
    //   let batchCounter = controller.equations.batchCounter.getLocal();      
    //   controller.counter.setGlobal(0);
    //   controller.counter.setLocal(0);
    //   view.equations.pageCounter.setLocal(0);
    //   model.equations = new ArrayOfEquations( model.userData.answers.incorrect.getArray( batchCounter ) );  // MODEL
    //   this.list = controller.generateList();
    //   model.equations.setGlobalCurrent(-1);   // MODEL
    //   console.log(  model.userData.answers.incorrect.getArray( batchCounter ) )
    //   console.log(  model.equations.getShuffled() )
    //   controller.equations.batchCounter.incrementLocal();
    // }, 
    
    events: function(i) {
      let currentBatch = view.equations.batchCounter;
      const inputFields = this.inputFields();      
      // let currentItem = controller.array.getGlobalCurrent();
      let lastElement = inputFields[ i-1 ];
       
      lastElement.addEventListener("input", function () {
        const lastAnswer = lastElement.value;
        const inputIsValid = controller.equations.checkIfInputIsValid ( lastAnswer, lastElement );
        if ( inputIsValid ) {
            lastElement.focus();
        };
      });
      lastElement.addEventListener("keypress", function onEnter (e) {        
        let lastAnswer = lastElement.value;
        const inputIsValid = controller.equations.checkIfInputIsValid ( lastAnswer, lastElement );
        let key = e.keyCode;
        if ( key === 13 && inputIsValid ) {          
          controller.equations.number().checkAnswer( lastAnswer );
          controller.equations.proceed().ifDone( lastElement );
          controller.equations.array.setNextAsGlobalCurrent();
          view.equations.isNotDone.set(false); // a flag to control adding one more eqation while rendering 
          view.render();
          if ( inputFields.length > 1) {
            lastElement.removeEventListener("keypress", onEnter);
          };
        };       
      });
      
    },

  },
/*
----------------------------------------- v i e w ---------------------------------------------------
---------------------------------------- t a b l e --------------------------------------------------
-----------------------------------------------------------------------------------------------------
*/

  table: {
    tableSquares: function() {return document.getElementsByClassName('table')[0].children },
    parentEl: createEl("div", "table"),
    render: function() {  
      this.clear();
      const parentEl = view.main.appendChild(this.parentEl);
        return {
          results: function() {
            model.array.map(function(equation) {     
              if (equation.x === 1 || equation.y === 1 ) { 
                let square = createEl("div", "first-rows", equation.z );
                parentEl.appendChild(square);
              } else if ( equation.numberOfTimesAnsweredCorrectly > 2 ) {
                let square = createEl("div", "excellent", equation.z );
                parentEl.appendChild(square);
              } else if ( equation.numberOfTimesAnsweredCorrectly > 1 ) {
                let square = createEl("div", "very-good", equation.z );
                parentEl.appendChild(square);
              } else if ( equation.numberOfTimesAnsweredCorrectly > 0 ) {
                let square = createEl("div", "good", equation.z );
                parentEl.appendChild(square);
              } else {
                let square = createEl("div", "the-rest");
                parentEl.appendChild(square);
              };                 
            });
          },
          empty: function() {            
            controller.table.array.getInOrder().map(function( equation ) {
              if (equation.x === 1 || equation.y === 1 ) { 
                let square = createEl("div", "first-rows", equation.z );
                parentEl.appendChild(square);
              } else {
                let square = createEl("div", "the-rest");
                parentEl.appendChild(square);
                const inputfields = createEl("input", "input-fields" );
                square.appendChild(inputfields);
                inputfields.value = equation.userAnswer; // if there is one entered previously;
                if (inputfields.value !== "") { // marked as "done"; otherwise it would be editable
                  controller.equations.proceed().ifDone(inputfields)
                };                
              };
            });
          controller.table.array.setInputPositionForAll("z");
          view.table.events();
        },

      }
    },
    clear: function() {
      const allElements = this.parentEl.children;
      if (allElements.length > 0) {
        for (let i = allElements.length-1; i >= 0; i--) {
          this.parentEl.removeChild( allElements[i] )
        };        
      };
    },
    events: function() {
      const tableSquares = this.tableSquares();      
      tableSquares[ 10 ].firstElementChild.focus();
      controller.table.array.setGlobalCurrent(10);

      for (let i = 0; i < tableSquares.length; i++) {
        tableSquares[ i ].addEventListener("input", function () {
          const lastElement = tableSquares[ i ].firstElementChild;
          const lastAnswer = lastElement.value;
          const inputIsValid = controller.equations.checkIfInputIsValid ( lastAnswer, lastElement );
          if ( ! inputIsValid ) {
            tableSquares[ i ].firstElementChild.focus() 
          };
        });
        tableSquares[ i ].addEventListener("keydown", function onEnter (e) {
          const lastElement = tableSquares[ i ].firstElementChild;
          const lastAnswer = lastElement.value;
          const inputIsValid = controller.equations.checkIfInputIsValid ( lastAnswer, lastElement );
          const focusOnClosestEmptyField = function() {
            for (let j = 0; j < tableSquares.length; j ++) {
              if (tableSquares[ j ].firstElementChild !== null && tableSquares[ j ].firstElementChild.value === "") {
                tableSquares[ j ].firstElementChild.focus();
              };
            };
          };
          let key = e.keyCode; // DEPRECATED !?!

          if ( key === 13 && inputIsValid ) { // enter key
            controller.table.array.setGlobalCurrent( i ); //!!!!!!!!!!!!!!!!!!!!!!!!!!!
            if (lastAnswer !== "") { // not an empty field
              controller.equations.number().checkAnswer( lastAnswer );
              controller.equations.proceed().ifDone( lastElement );
            };
            if ( !tableSquares[ i + 1 ] ) { // last field
              focusOnClosestEmptyField();
            } else if ( !tableSquares[ i + 1 ].firstElementChild ) { // need to skip one
              tableSquares[ i + 2 ].firstElementChild.focus(); // skip one forward
            } else {
              tableSquares[ i + 1 ].firstElementChild.focus();
            };            
            view.score.render();

          } else if (key === 39) { // arrow right
            if (!tableSquares[ i + 1 ] ) { // last field
              focusOnClosestEmptyField();
            } else if ( !tableSquares[ i + 1 ].firstElementChild ) { // need to skip one
              tableSquares[ i + 2 ].firstElementChild.focus(); // skip one forward
            } else {
              console.log("right")
              tableSquares[ i + 1 ].firstElementChild.focus();
            };

          } else if (key === 37) { // arrow left
            if (!tableSquares[ i - 11 ] ) { // last field
              focusOnClosestEmptyField();
            } else if ( !tableSquares[ i - 1 ].firstElementChild ) { // need to skip one
              tableSquares[ i - 2 ].firstElementChild.focus(); // skip one back
            } else {
              console.log("left")
              tableSquares[ i - 1 ].firstElementChild.focus();
            };

          } else if (key === 38) { // arrow top
            if (!tableSquares[ i - 9 ] ) { // last field
              focusOnClosestEmptyField();
            } else if ( !tableSquares[ i - 9 ].firstElementChild ) { // need to skip one
              focusOnClosestEmptyField();
            } else {
              console.log("top")
              tableSquares[ i - 9 ].firstElementChild.focus();
            };

          } else if (key === 40) { // arrow down
            if (!tableSquares[ i + 9 ] ) { // last field
              focusOnClosestEmptyField();
            } else if ( !tableSquares[ i + 9 ].firstElementChild ) { // need to skip one
              focusOnClosestEmptyField();
            } else {
              console.log("down")
              tableSquares[ i + 9 ].firstElementChild.focus();
            };
          };
        });

      };
    },

  },
/*-------------------------------------------------------------------------------------------------------------*/

  photo: {
    parentEl: createEl("div", "photo"),
    array: new ArrayOfEquations(),
    correctAnswers: function() {return view.photo.array.getInOrder().slice( 0, view.photo.array.getGlobalCurrent().index )}  ,

    create: function(canvasWidth, canvasHeight) {
      
      const parentEl = view.main.appendChild(this.parentEl);

      const canvas = document.createElement('CANVAS');
      this.parentEl.appendChild(canvas);
         
      canvas.setAttribute('width', canvasWidth)
      canvas.setAttribute('height', canvasHeight)
      canvas.style.border = 'dotted 1px black';
      const ctx = canvas.getContext('2d');

      const picture = document.createElement('img');
      picture.src = model.footballersPictures.Bale;      

      picture.addEventListener("load", () => {
        let pictureWidth = picture.naturalWidth;
        let pictureHeight = picture.naturalHeight;
        // let divideBy = 10;
        let numbers;
        for (let i = 0; i < 10; i ++) {
          for (let j = 0; j < 10; j ++) {
            ctx.rect( canvasWidth / 10 * i, canvasHeight / 10 * j, 
                      canvasWidth / 10, canvasHeight / 10
            ); // ctx.rect(x, y, width, height);
            ctx.lineWidth="1";
            ctx.stroke();
          };
        };
        view.photo.correctAnswers().map( function(equation) {
          let x = equation.x;
          let y = equation.y;
          ctx.drawImage( picture,
                         pictureWidth / 10 * x, pictureHeight / 10 * y, // sx, sy (crop starting point coords)
                         pictureWidth / 10, pictureHeight / 10, // sWidth, sHeight (crop dimensions)
                         canvasWidth / 10 * x, canvasHeight / 10 * y, // ?
                         canvasWidth / 10, canvasHeight / 10 // ?
          );
        });
      });
    },

    render: function() {
 
      this.clear()
      this.create(500, 500);
      this.events();
      console.log("rendered")
    },
    clear: function() {
      const allElements = this.parentEl.children;
      if (allElements.length > 0) {
        for (let i = allElements.length-1; i >= 0; i--) {
          this.parentEl.removeChild( allElements[i] )
        };        
      };
    }, 
    events: function() {
      // view.photo.array.setNextAsGlobalCurrent()
      window.addEventListener("keypress", (event) => {
        if (event.keyCode === 13) {
          console.log("ok");
          view.render();
        };
      });
      
    },
  },

};

controller.init()

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