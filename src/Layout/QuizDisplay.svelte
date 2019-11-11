<script>
  import { getContext } from "svelte";
  import { MULTIPLICATION_TABLE } from "../quizzes/quiz-setup";
  import MultiplicationTable from "../MultiplicationTable/MultiplicationTable.svelte";
  import EquationsDisplay from "./EquationsDisplay.svelte";

  const quizStore = getContext("quizStore");

  let isMultiplicationTable;

  quizStore.subscribe(value => {
    isMultiplicationTable = value.quizName === MULTIPLICATION_TABLE;
  });
</script>

<style>
  .wrapper {
    width: 50%;
    height: 50%;
    /*  display: flex; */
    border: 1px solid black;
  }
</style>

<div class="wrapper">
  {#if isMultiplicationTable}
    <MultiplicationTable setup={quizStore.getCurrentQuiz()} />
  {:else}
    <EquationsDisplay />
  {/if}
</div>
