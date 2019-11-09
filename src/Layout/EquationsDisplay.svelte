<script>
  import { getContext } from "svelte";
  import SingleEquation from "./SingleEquation.svelte";

  const quizStore = getContext("quizStore");

  let quizQuestion;
  let answeredEquations;

  quizStore.subscribe(val => {
    quizQuestion = quizStore.getCurrentQuestion();
    answeredEquations = quizStore.getCurrentQuiz().getAnsweredQuestions();
  });
</script>

<style>
  .wrapper {
    width: 100%;
    /* height: 100%; */
  }
  .answered {
    /* display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border: 1px solid black; */
    /* bottom: -40px; */
    filter: blur(2px);
  }

  .current {
    position: relative;
    top: 200px;
  }
</style>

<div class="wrapper">
  <div class="answered">
    {#each answeredEquations as answeredEquation (answeredEquation.ID)}
      <SingleEquation quizQuestion={answeredEquation} />
    {/each}
  </div>
  <div class="current">
    <SingleEquation {quizQuestion} onSubmitAnswer={quizStore.onSubmitAnswer} />
  </div>

</div>
