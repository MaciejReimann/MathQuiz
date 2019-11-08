<script>
  import { getContext } from "svelte";
  // import { createEventDispatcher } from "svelte";

  // import Quiz from "../Quiz.v2";
  import { MultiplicationEquationBuilder } from "../MultiplicationEquation";
  import { equationQuizAdapter } from "../equationQuizAdapter";
  import SingleEquation from "../MultiplicationEquations/SingleEquation.svelte";

  const quizStore = getContext("quizStore");

  quizStore.subscribe(val => {
    console.log(val);
  });

  // const dispatch = createEventDispatcher();

  $: currentEquation = quizStore.getCurrentQuestion();

  // const onSubmitAnswer = i => {
  //   quiz.incrementIndex();
  //   currentEquation = quiz.getCurrentQuestion();
  // };
  // const onSubmitCorrectAnswer = i => {
  //   dispatch("answerSubmitted", { correct: true, index: `${i}` });
  // };
  // const onSubmitIncorrectAnswer = i => {
  //   dispatch("answerSubmitted", { correct: false, index: `${i}` });
  // };

  // const equations = MultiplicationEquationBuilder.getFromRangeRHS({
  //   xMax: 10,
  //   yMax: 10
  // });

  // const quizQuestions = equations.map((eq, i) =>
  //   equationQuizAdapter(`[["_*y=z"], [${i}]]`, eq, 0, {
  //     onSubmitAnswer,
  //     onSubmitCorrectAnswer,
  //     onSubmitIncorrectAnswer
  //   })
  // );

  // const quiz = new Quiz(quizQuestions, 9, { shuffled: true });
</script>

<div class="wrapper">
  <!-- {#each quizStore.getAnsweredQuestions() as answeredEquation (answeredEquation.ID)}
    <SingleEquation equation={answeredEquation} />
  {/each} -->
  <SingleEquation
    equation={currentEquation}
    onSubmit={quizStore.onSubmitAnswer} />
</div>
