<script>
  import NumericDisplay from "./GenericComponents/NumericDisplay.svelte";

  let timer = "00:00";
  let score = 1000;
</script>

<style>
  .title {
    font-size: 2em;
  }
  .header {
    display: flex;
    justify-content: space-between;
    padding: 0 2rem;
    background-color: white;
    box-shadow: 0px 10px 10px 5px #8e9b9c;
    border-radius: 0 0 5px 5px;
    z-index: 10;
  }
</style>

<header class="header">

  <NumericDisplay text="timer" numbers={timer} />

  <h1 class="title">Count Fast!</h1>

  <NumericDisplay text="score" numbers={score} />

</header>
