<script>
  import Quiz from "../Quiz.ts";
  import ScoreService from "../Score.service.ts";
  import NumericInput from "../GenericComponents/NumericInput.svelte";
  import MultiplicationTable from "../MultiplicationTable";
  import { NavigationHandler } from "./NavigationHandler";
  import {
    parseIndex,
    getXCoord,
    getYCoord,
    checkIfRowFieldShouldBeHighlighted,
    checkIfColumnFieldShouldBeHighlighted
  } from "./helpers";

  let firstFieldIndex = 11;
  let lastFieldIndex = 100;
  let fieldsAnsweredCorrectly = [];
  let fieldsAnsweredInorrectly = [];

  $: focusedFieldIndex = firstFieldIndex;
  $: allAnsweredFieldsIndexes = [
    ...fieldsAnsweredCorrectly,
    ...fieldsAnsweredInorrectly
  ].map(parseIndex);

  const score = new ScoreService({ strikeThreshhold: 5 });

  const navigationHandler = new NavigationHandler({
    firstFieldIndex,
    lastFieldIndex,
    listener: val => {
      focusedFieldIndex = val;
    }
  });

  const multiplicationTableQuiz = new Quiz(
    new MultiplicationTable(10).getQAPair(),
    "mt",
    {
      onSubmitAnswer: () => {
        navigationHandler.handleKey(allAnsweredFieldsIndexes)("ArrowRight");
      },
      onSubmitCorrectAnswer: id => {
        fieldsAnsweredCorrectly = [...fieldsAnsweredCorrectly, id];
        score.increment();
      },
      onSubmitIncorrectAnswer: id => {
        fieldsAnsweredInorrectly = [...fieldsAnsweredInorrectly, id];
        score.resetStrike();
      }
    }
  );

  function handleFocus(index) {
    navigationHandler.set(index);
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
  {#each multiplicationTableQuiz.getQuestions() as question (question.index)}
    <div
      class={'cell'}
      class:title={parseIndex(question.index) < 10 || parseIndex(question.index) % 10 == 0}
      class:correct={fieldsAnsweredCorrectly.includes(question.index)}
      class:incorrect={fieldsAnsweredInorrectly.includes(question.index)}
      class:highlighted-column={checkIfColumnFieldShouldBeHighlighted(question.index, focusedFieldIndex)}
      class:highlighted-row={checkIfRowFieldShouldBeHighlighted(question.index, focusedFieldIndex)}
      class:focused-field={parseIndex(question.index) === focusedFieldIndex}>

      {#if parseIndex(question.index) < 10 || parseIndex(question.index) % 10 == 0}
        <div>{question.correctAnswers[0]}</div>
      {:else}
        <NumericInput
          index={parseIndex(question.index)}
          isFocused={parseIndex(question.index) == focusedFieldIndex}
          onFocus={el => handleFocus(parseIndex(question.index), el)}
          onSubmit={answer => multiplicationTableQuiz.submitAnswer(answer, question.index)}
          onNavigate={key => navigationHandler.handleKey(allAnsweredFieldsIndexes)(key)} />
      {/if}

    </div>
  {/each}
</div>
