<script>
  import Quiz from "../Quiz.ts";
  import QuizQuestion from "../GenericComponents/QuizQuestion.svelte";
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
    new MultiplicationTable(10).formatForQuiz(),
    "mt",
    submitHandlers
  );

  const quizQuestions = multiplicationTableQuiz.getQuestions();

  function onSubmitAnswer(answer, index) {
    multiplicationTableQuiz.submitAnswer(answer, index);
  }

  function parseIndex(string) {
    const numberPattern = /\d+/g;
    return string.match(numberPattern)[0];
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
    border: 3px solid green;
  }

  .incorrect {
    border: 3px solid red;
  }
</style>

<div class="table-wrapper">
  {#each quizQuestions as question (question.index)}
    <div
      class={'cell'}
      class:correct={correctAnswers.includes(question.index)}
      class:incorrect={incorrectAnswers.includes(question.index)}>
      {#if parseIndex(question.index) < 10 || parseIndex(question.index) % 10 == 0}
        <div class={'visible'}>{question.answers[0]}</div>
      {:else}
        <div class={'invalid'}>
          <QuizQuestion
            submitAnswerHandler={answer => onSubmitAnswer(answer, question.index)} />
        </div>
      {/if}

    </div>
  {/each}
</div>
