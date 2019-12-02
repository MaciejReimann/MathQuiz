<script>
  import { getContext } from "svelte";
  import SingleEquation from "./SingleEquation.svelte";

  import { fade, fly } from "svelte/transition";
  const quizStore = getContext("quizStore");

  let quizQuestion;
  let answeredEquations;

  quizStore.subscribe(val => {
    quizQuestion = quizStore.getCurrentQuestion();
    answeredEquations = quizStore.getCurrentQuiz().getAnsweredQuestions();
    console.log(answeredEquations);
  });
</script>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    overflow: hidden;
  }
  .answered {
    /* display: flex;
    flex-direction: column; */
    /* justify-content: flex-end;
    border: 1px solid black; */
    /* position: relative; */

    /* filter: blur(2px); */
  }

  .current {
    margin-bottom: 25%;
    /* position: absolute; */

    /* top: 100px; */
    /* position: relative; */
    /* top: 200px; */
  }
</style>

<div class="wrapper">
  <div class="answered">
    {#each answeredEquations as answeredEquation (answeredEquation.getAsString())}
      <SingleEquation quizQuestion={answeredEquation} answered={true} />
    {/each}
  </div>
  <div class="current">
    <SingleEquation {quizQuestion} />
  </div>

</div>
