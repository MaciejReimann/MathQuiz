<script>
  import { getContext } from "svelte";
  import { MULTIPLICATION_TABLE } from "../quizzes/constants";
  import MultiplicationTable from "../MultiplicationTable/MultiplicationTable.svelte";
  import EquationsDisplay from "./EquationsDisplay.svelte";

  const quizStore = getContext("quizStore");

  let isMultiplicationTable;

  quizStore.subscribe(value => {
    isMultiplicationTable = value.quizName.includes(MULTIPLICATION_TABLE);
  });
</script>

<style>
  .wrapper {
    width: 50%;
    height: 90%;
    /*  display: flex; */
    /* border: 1px solid black; */
  }
</style>

<div class="wrapper">
  {#if isMultiplicationTable}
    <MultiplicationTable setup={quizStore.getCurrentQuiz()} />
  {:else}
    <EquationsDisplay />
  {/if}
</div>
