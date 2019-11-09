<script>
  import { getContext } from "svelte";
  import SingleEquation from "./SingleEquation.svelte";

  const quizStore = getContext("quizStore");

  let quizQuestion;

  quizStore.subscribe(val => {
    quizQuestion = quizStore.getCurrentQuestion();
  });
</script>

<div class="wrapper">
  <!-- {#each quizStore.getAnsweredQuestions() as answeredEquation (answeredEquation.ID)}
    <SingleEquation equation={answeredEquation} />
  {/each} -->
  <SingleEquation {quizQuestion} onSubmitAnswer={quizStore.onSubmitAnswer} />
</div>
