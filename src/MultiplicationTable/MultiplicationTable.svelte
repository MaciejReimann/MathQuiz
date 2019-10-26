<script>
  import Quiz from "../Quiz.ts";
  import NumericInput from "../GenericComponents/NumericInput.svelte";
  import MultiplicationTable from "../MultiplicationTable";
  import { NavigationHandler } from "./NavigationHandler";
  import {
    parseIndex,
    getXCoord,
    getYCoord,
    checkIfRowFieldShouldBeHighlighted
  } from "./helpers";

  let currentFieldIndex;
  let firstFieldIndex = 11;
  let lastFieldIndex = 100;
  let focusedFieldIndex = firstFieldIndex;
  let fieldsAnsweredCorrectly = [];
  let fieldsAnsweredInorrectly = [];

  const multiplicationTableQuiz = new Quiz(
    new MultiplicationTable(10).getQAPair(),
    "mt",
    {
      onSubmitAnswer: () => {
        goRight();
      },
      onSubmitCorrectAnswer: id => {
        fieldsAnsweredCorrectly = [...fieldsAnsweredCorrectly, id];
      },
      onSubmitIncorrectAnswer: id => {
        fieldsAnsweredInorrectly = [...fieldsAnsweredInorrectly, id];
      }
    }
  );

  const navigationHandler = new NavigationHandler({
    firstFieldIndex,
    lastFieldIndex,
    listener: val => {
      focusedFieldIndex = val;
    }
  });

  $: allAnsweredFieldsIndexes = [
    ...fieldsAnsweredCorrectly,
    ...fieldsAnsweredInorrectly
  ].map(parseIndex);

  $: focusedFieldIndex;
</script>

<style>
  .table-wrapper {
    padding: 2rem;
    display: grid;
    grid-template-rows: repeat(10, 4rem);
    grid-template-columns: repeat(10, 4rem);
    column-gap: 8px;
    row-gap: 8px;
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

  .highlightedColumn {
    border-left: 4px solid black;
    border-right: 4px solid black;
  }

  .highlightedRow {
    border-top: 4px solid black;
    border-bottom: 4px solid black;
  }

  .correct {
    outline: 5px solid green;
    outline-offset: -7px;
  }

  .incorrect {
    outline: 5px solid red;
    outline-offset: -7px;
  }
</style>

<div class="table-wrapper">
  {#each multiplicationTableQuiz.getQuestions() as question (question.index)}
    <div
      class={'cell'}
      class:correct={fieldsAnsweredCorrectly.includes(question.index)}
      class:incorrect={fieldsAnsweredInorrectly.includes(question.index)}
      class:highlightedRow={checkIfRowFieldShouldBeHighlighted(question.index, focusedFieldIndex)}>

      {#if parseIndex(question.index) < 10 || parseIndex(question.index) % 10 == 0}
        <div class={'visible'}>{question.correctAnswers[0]}</div>
      {:else}
        <div>
          <NumericInput
            isFocused={parseIndex(question.index) == focusedFieldIndex}
            onSubmit={answer => multiplicationTableQuiz.submitAnswer(answer, question.index)}
            onNavigate={key => navigationHandler.handleKey(allAnsweredFieldsIndexes)(key)} />
        </div>
      {/if}

    </div>
  {/each}
</div>
