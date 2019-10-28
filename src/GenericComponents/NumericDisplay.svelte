<script>
  export let text;
  export let numbers;
</script>

<style>
  .timer-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    /* border: 3px solid black; */
    font-size: 2rem;
  }
  .text {
    font-size: 1rem;
  }
  .numbers {
    margin-left: 20px;
    font-size: 1.5rem;
  }
</style>

<div class="timer-wrapper">

  <span class="text">{text}</span>
  <span class="numbers">{numbers}</span>

</div>
