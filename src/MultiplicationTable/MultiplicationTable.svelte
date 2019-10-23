<script>
  import Quiz from "../Quiz.ts";
  import NumericInput from "../GenericComponents/NumericInput.svelte";
  import MultiplicationTable from "../MultiplicationTable.ts";

  let fieldsAnsweredCorrectly = [];
  let fieldsAnsweredInorrectly = [];

  $: allAnsweredFieldsIndexes = [
    ...fieldsAnsweredCorrectly,
    ...fieldsAnsweredInorrectly
  ].map(parseIndex);

  let firstSquareIndex = 11;
  let lastSquareIndex = 100;

  const submitHandlers = {
    onSubmitCorrectAnswer: id => {
      fieldsAnsweredCorrectly = [...fieldsAnsweredCorrectly, id];
      goRight();
    },
    onSubmitIncorrectAnswer: id => {
      fieldsAnsweredInorrectly = [...fieldsAnsweredInorrectly, id];
    }
  };

  const multiplicationTableQuiz = new Quiz(
    new MultiplicationTable(10).getQAPair(),
    "mt",
    submitHandlers
  );

  const quizQuestions = multiplicationTableQuiz.getQuestions();

  function onSubmitAnswer(answer, index) {
    multiplicationTableQuiz.submitAnswer(answer, index);
  }

  let focusedInputIndex = firstSquareIndex;

  function handleNavigate(key) {
    switch (key) {
      case "ArrowUp":
        goUp();
        break;
      case "ArrowLeft":
        goLeft();
        break;
      case "ArrowRight":
        goRight();
        break;
      case "ArrowDown":
        goDown();
        break;
    }
  }

  function goRight() {
    if (focusedInputIndex + 1 === lastSquareIndex) {
      focusedInputIndex = firstSquareIndex - 1;
    }
    if ((focusedInputIndex + 1) % 10 === 0) {
      focusedInputIndex = focusedInputIndex + 2;
    } else {
      focusedInputIndex = focusedInputIndex + 1;
    }
    if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
      goRight();
    }
  }

  function goLeft() {
    if (focusedInputIndex === firstSquareIndex) {
      focusedInputIndex = lastSquareIndex;
    }
    if (focusedInputIndex % 10 === 1) {
      focusedInputIndex = focusedInputIndex - 2;
    } else {
      focusedInputIndex = focusedInputIndex - 1;
    }
    if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
      goLeft();
    }
  }

  function goDown() {
    if (focusedInputIndex + 10 > lastSquareIndex) {
      focusedInputIndex = (focusedInputIndex % 10) + 10;
    } else {
      focusedInputIndex = focusedInputIndex + 10;
    }
    if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
      goDown();
    }
  }

  function goUp() {
    if (focusedInputIndex - 10 < firstSquareIndex) {
      focusedInputIndex = lastSquareIndex + focusedInputIndex - 20;
    } else {
      focusedInputIndex = focusedInputIndex - 10;
    }
    if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
      goUp();
    }
  }

  function parseIndex(string) {
    const numberPattern = /\d+/g;
    return parseInt(string.match(numberPattern)[0]);
  }
</script>

<style>
  .table-wrapper {
    padding: 2rem;
    display: grid;
    grid-template-rows: repeat(10, 4rem);
    grid-template-columns: repeat(10, 4rem);
    column-gap: 5px;
    row-gap: 5px;
    border: 3px solid blue;
  }
  .cell {
    border: 2px solid black;
    width: 100%;
    height: 100%;
  }
  .visible {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .correct {
    outline: 5px solid green;
    outline-offset: -7px;
  }

  .incorrect {
    outline: 5px solid red;
    outline-offset: -7px;
  }
</style>

<div class="table-wrapper">
  {#each quizQuestions as question (question.index)}
    <div
      class={'cell'}
      class:correct={fieldsAnsweredCorrectly.includes(question.index)}
      class:incorrect={fieldsAnsweredInorrectly.includes(question.index)}>
      {#if parseIndex(question.index) < 10 || parseIndex(question.index) % 10 == 0}
        <div class={'visible'}>{question.correctAnswers[0]}</div>
      {:else}
        <NumericInput
          isFocused={parseIndex(question.index) == focusedInputIndex}
          onSubmit={answer => onSubmitAnswer(answer, question.index)}
          onNavigate={handleNavigate} />
      {/if}

    </div>
  {/each}
</div>
