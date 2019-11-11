<script>
  import NumericInput from "../GenericComponents/NumericInput.svelte";
  import { NavigationHandler } from "./NavigationHandler";
  import {
    parseIndex,
    getXCoord,
    getYCoord,
    checkIfRowFieldShouldBeHighlighted,
    checkIfColumnFieldShouldBeHighlighted
  } from "./helpers";

  export let setup;

  let firstFieldIndex = 11;
  let lastFieldIndex = 100;
  let fieldsAnsweredCorrectly = [];
  let fieldsAnsweredInorrectly = [];

  $: focusedFieldIndex = firstFieldIndex;
  $: allAnsweredFieldsIndexes = [
    ...fieldsAnsweredCorrectly,
    ...fieldsAnsweredInorrectly
  ].map(parseIndex);

  const navigationHandler = new NavigationHandler({
    firstFieldIndex,
    lastFieldIndex,
    listener: val => {
      focusedFieldIndex = val;
    }
  });

  function handleFocus(index) {
    navigationHandler.set(index);
  }

  function isCellLast(questionIndex) {
    return parseIndex(questionIndex) === setup.getAllQuestions().length - 1;
  }
</script>

<style>
  .table-wrapper {
    display: grid;
    grid-template-rows: repeat(10, 3rem);
    grid-template-columns: repeat(10, 3rem);
    column-gap: 8px;
    row-gap: 8px;
    padding: 15px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 10px 10px 10px 5px #8e9b9c;
  }
  .cell {
    border: 1px solid black;
    border-radius: 2px;
    width: 100%;
    height: 100%;
    font-size: 1.5rem;
  }

  .cell-last {
    font-size: 1.1rem;
  }
  .title {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid black;
  }

  .highlighted-column {
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.7);
  }

  .highlighted-row {
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.7);
  }

  .focused-field {
    transform: scale(1.05);
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
  {#each setup.getAllQuestions() as question (question.ID)}
    <div
      class={'cell'}
      class:title={parseIndex(question.ID) < 10 || parseIndex(question.ID) % 10 == 0}
      class:correct={fieldsAnsweredCorrectly.includes(question.ID)}
      class:incorrect={fieldsAnsweredInorrectly.includes(question.ID)}
      class:highlighted-column={checkIfColumnFieldShouldBeHighlighted(question.ID, focusedFieldIndex)}
      class:highlighted-row={checkIfRowFieldShouldBeHighlighted(question.ID, focusedFieldIndex)}
      class:focused-field={parseIndex(question.ID) === focusedFieldIndex}
      class:cell-last={isCellLast(question.ID)}>

      {#if parseIndex(question.ID) < 10 || parseIndex(question.ID) % 10 == 0}
        <div>{question.correctAnswers[0]}</div>
      {:else}
        <NumericInput
          index={parseIndex(question.ID)}
          maxLength={isCellLast(question.ID) ? 3 : 2}
          isFocused={parseIndex(question.ID) == focusedFieldIndex}
          onFocus={el => handleFocus(parseIndex(question.ID), el)}
          onSubmit={answer => question.submitAnswer(answer)}
          onNavigate={key => navigationHandler.handleKey(allAnsweredFieldsIndexes)(key)} />
      {/if}

    </div>
  {/each}
</div>
