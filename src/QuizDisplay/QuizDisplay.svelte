<script>
  import { getContext } from "svelte";
  import MultiplicationTable from "../MultiplicationTable/MultiplicationTable.svelte";
  import EquationsDisplay from "../MultiplicationEquations/EquationsDisplay.svelte";

  const appStore = getContext("appStore");
  const quizStore = getContext("quizStore");

  let currentAppletID;

  appStore.subscribe(value => {
    currentAppletID = value;
  });
</script>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    display: flex;
  }
</style>

<div class="wrapper">
  {currentAppletID}
  <EquationsDisplay on:answerSubmitted={quizStore.handleAnswerSubmitted} />
</div>
