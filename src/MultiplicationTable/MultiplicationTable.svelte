<script>
  import Quiz from "../Quiz.ts";
  import NumericInput from "../GenericComponents/NumericInput.svelte";
  import MultiplicationTable from "../MultiplicationTable.ts";

  let correctAnswers = [];
  let incorrectAnswers = [];

  const submitHandlers = {
    onSubmitCorrectAnswer: id => {
      correctAnswers = [...correctAnswers, id];
    },
    onSubmitIncorrectAnswer: id => {
      incorrectAnswers = [incorrectAnswers, id];
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

  let focusedInputIndex = 13;

  function handleNavigate(key) {
    switch (key) {
      case "ArrowUp":
        focusedInputIndex = focusedInputIndex - 10;
        break;
      case "ArrowLeft":
        focusedInputIndex = focusedInputIndex - 1;
        break;
      case "ArrowRight":
        focusedInputIndex = focusedInputIndex + 1;
        break;
      case "ArrowDown":
        focusedInputIndex = focusedInputIndex + 10;
        break;
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
      class:correct={correctAnswers.includes(question.index)}
      class:incorrect={incorrectAnswers.includes(question.index)}>
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
