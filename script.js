
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
