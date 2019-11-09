<script>
  import { getContext } from "svelte";
  import MultiplicationTable from "../MultiplicationTable/MultiplicationTable.svelte";
  import EquationsDisplay from "./EquationsDisplay.svelte";

  const quizStore = getContext("quizStore");

  let currentAppletID;

  quizStore.subscribe(value => {
    currentAppletID = value.quizID;
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
  <EquationsDisplay />
</div>
