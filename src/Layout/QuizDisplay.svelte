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
    width: 50%;
    height: 50%;
    /*  display: flex; */
    border: 1px solid black;
  }
</style>

<div class="wrapper">
  <EquationsDisplay />
</div>
