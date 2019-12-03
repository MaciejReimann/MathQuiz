<script>
  import { getContext } from "svelte";
  import SingleEquation from "./SingleEquation.svelte";

  import { fade, fly } from "svelte/transition";
  const quizStore = getContext("quizStore");

  // let quizQuestion;
  // let answeredEquations;
  let allQuizQuestions;
  let position;

  quizStore.subscribe(val => {
    // quizQuestion = quizStore.getCurrentQuestion();
    // answeredEquations = quizStore.getCurrentQuiz().getAnsweredQuestions();
    allQuizQuestions = quizStore.getAllQuestions();

    position = 4800 - quizStore.getCurrentQuestionNo() * 100;
    console.log("position", position);
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
    /* overflow: hidden; */
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
    border: 2px solid red;
    /* position: absolute; */

    /* top: 100px; */
    /* position: relative; */
    /* top: 200px; */
  }
  .equations {
  }
  .dupa {
    border: 2px solid blue;
  }

  .moving {
    position: relative;
    /* top: 4800px; */
  }
</style>

<div class="wrapper">
  <div class="moving" style="top: {position}px">
    {#each allQuizQuestions as quizQuestion (quizQuestion.getAsString())}
      <div class="equations">
        {#if quizQuestion.getID() === quizStore.getCurrentQuestion().getID()}
          <div class="current">
            <SingleEquation {quizQuestion} />
          </div>
        {:else}
          <div class="dupa">
            <SingleEquation {quizQuestion} disabled />
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- <div class="current">
    <SingleEquation {quizQuestion} />
  </div> -->

</div>
