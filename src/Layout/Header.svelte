<script>
  import { getContext } from "svelte";
  import NumericDisplay from "../GenericComponents/NumericDisplay.svelte";

  let score;
  let strikeLength;
  let strikeText;

  const scoreStore = getContext("scoreStore");

  scoreStore.subscribe(val => {
    score = val;
  });

  scoreStore.subscribeToStrike(val => {
    strikeLength = val;
    strikeText = "strike";
  });

  let timer = "00:00";
</script>

<style>
  .title {
    font-size: 2em;
  }
  .wrapper {
    position: relative;
    display: flex;
    justify-content: space-between;
    padding: 0 2rem;
    background-color: white;
    box-shadow: 0px 10px 10px 5px #8e9b9c;
    border-radius: 0 0 5px 5px;
    z-index: 10;
  }

  .strike {
    position: absolute;
    top: 8px;
    right: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .text {
    font-size: 0.5rem;
    text-decoration: underline;
  }

  .number {
    font-size: 1rem;
    margin-left: 0.5rem;
  }
</style>

<div class="wrapper">

  <NumericDisplay text="timer" numbers={timer} />

  <h1 class="title">Count Fast!</h1>

  <NumericDisplay text="score" numbers={score}>
    <div class="strike">
      <div class="text">{strikeText}</div>
      <div class="number">{strikeLength}</div>
    </div>
  </NumericDisplay>

</div>
