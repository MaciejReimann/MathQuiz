<script>
  import { getContext } from "svelte";
  import SingleEquation from "./SingleEquation.svelte";

  const quizStore = getContext("quizStore");

  quizStore.subscribe(val => {
    console.log(val);
  });

  $: currentEquation = quizStore.getCurrentQuestion();
</script>

<div class="wrapper">
  <!-- {#each quizStore.getAnsweredQuestions() as answeredEquation (answeredEquation.ID)}
    <SingleEquation equation={answeredEquation} />
  {/each} -->
  <SingleEquation
    equation={currentEquation}
    onSubmit={quizStore.onSubmitAnswer} />
</div>
