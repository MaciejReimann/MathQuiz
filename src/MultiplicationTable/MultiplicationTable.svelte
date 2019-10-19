<script>
  import Quiz from "../Quiz.ts";
  import QuizQuestion from "../GenericComponents/QuizQuestion.svelte";
  import MultiplicationTable from "../MultiplicationTable.ts";

  const multiplicationTable = new MultiplicationTable(10);
  const results = multiplicationTable
    .getResults()
    .map((result, index) => ({ result, index }));
  const multiplicationTableQuiz = new Quiz();

  function onSubmitAnswer(answer) {
    console.log("testing correctness of answer:", answer);
  }
</script>

<style>
  .table-wrapper {
    padding: 2rem;
    display: grid;
    grid-template-rows: repeat(10, 4rem);
    grid-template-columns: repeat(10, 4rem);
    column-gap: 5px;
    row-gap: 5px;
    border: 3px solid blue;
  }
  .cell {
    border: 2px solid black;
    width: 100%;
    height: 100%;
  }
  .visible {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="table-wrapper">
  {#each results as cell (cell.index)}
    <div class={'cell'}>
      {#if cell.index < 10 || cell.index % 10 == 0}
        <div class={'visible'}>{cell.result}</div>
      {:else}
        <div class={'invisible'}>
          <QuizQuestion submitAnswerHandler={onSubmitAnswer} />
        </div>
      {/if}

    </div>
  {/each}
</div>
