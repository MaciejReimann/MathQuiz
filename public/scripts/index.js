const helper = require("./helper");

window.addEventListener("click", () => helper());

helper();

console.log("Hello from index.js!")



/*
HELPERS

function generateEquations(settings) {
} // 
// 

const currentEquation = generateEquations(initialState.equationsShape)[counter].elements // ["1", "*", "1", "=", "_"]
const currentEquation = generateEquations(initialState.equationsShape)[counter].solution // 1

0. Initial state

const equationsShape = {
    operation: "*",
    singleTerm: "right",
    blank: "last",
    rangeStart: 0,
    rangeEnd: 100,
    length: 10
}

const currentEquation = generateEquation(equationShape);

const user = null;

const score = 0;

const counter = 0;

const initialState = {
    equationsShape, 
    currentEquation,
    user,
    score
};



1.Walidation & evaluation of user's input:

const answer = document.querySelector("blank").value


function isAnswerValid(input) {
}



function isAnswerCorrect(input) {
    currentEquation.solution === input ? 
}

const solvedEquation = isAnswerCorrect(answer) ? currentEquation.concat({answered: })




isAnswerCorrect(inputValue)

state.equationsSolved.concat(currentEquation)


*/

