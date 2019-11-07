<script>
  import { getContext } from "svelte";
  import MultiplicationTable from "../MultiplicationTable/MultiplicationTable.svelte";
  import EquationsDisplay from "../MultiplicationEquations/EquationsDisplay.svelte";

  const appStore = getContext("appStore");
  const scoreStore = getContext("scoreStore");
  let currentAppletID;

  appStore.subscribe(value => {
    currentAppletID = value;
  });

  const handleAnswerSubmitted = e => {
    if (e.detail.correct) {
      scoreStore.increment();
    } else {
      scoreStore.resetStrike();
    }
  };
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
  <EquationsDisplay on:answerSubmitted={handleAnswerSubmitted} />
</div>
