<script>
  export let equation;
  import NumericInputv2 from "../GenericComponents/NumericInputv2.svelte";
</script>

<style>
  .wrapper {
    /* background-color: white; */
    display: flex;
  }

  .cell {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    margin: 0 0.2rem;
  }

  .input {
    border: 1px solid black;
    border-radius: 2px;
    width: 3rem;
    height: 3rem;
  }

  .symbol {
  }
</style>

<div class="wrapper">
  {#each equation.getInArray() as element}
    <div class="cell">
      {#if element === '|_|'}
        <div class="input">
          <NumericInputv2
            maxLength={3}
            onSubmit={answer => equation.submitAnswer(answer)}
            submittedValue={equation.getLastSubmittedAnswer()} />
        </div>
      {:else}
        <div class="symbol">{element}</div>
      {/if}
    </div>
  {/each}

</div>
