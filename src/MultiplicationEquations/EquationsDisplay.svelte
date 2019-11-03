<script>
  import { createEventDispatcher } from "svelte";

  import Quiz from "../Quiz.v2";
  import { generateEquationsForARange } from "../MultiplicationEquation";
  import { equationQuizAdapter } from "../equationQuizAdapter";
  import SingleEquation from "../MultiplicationEquations/SingleEquation.svelte";

  $: currentEquation = quiz.getCurrentQuestion();

  const dispatch = createEventDispatcher();

  const onSubmitAnswer = i => {
    quiz.incrementIndex();
    currentEquation = quiz.getCurrentQuestion();
  };
  const onSubmitCorrectAnswer = i => {
    dispatch("answerSubmitted", { correct: true, index: `${i}` });
  };
  const onSubmitIncorrectAnswer = i => {
    dispatch("answerSubmitted", { correct: false, index: `${i}` });
  };

  const equations = generateEquationsForARange({ x: 10, y: 10 }).map(eq =>
    eq.formatEqResultRHS()
  );

  const quizQuestions = equations.map((eq, i) =>
    equationQuizAdapter(`[["_*y=z"], [${i}]]`, eq, 0, {
      onSubmitAnswer,
      onSubmitCorrectAnswer,
      onSubmitIncorrectAnswer
    })
  );

  const quiz = new Quiz(quizQuestions, 9, { shuffled: true });
</script>

<div class="wrapper">
  {#each quiz.getAnsweredQuestions() as answeredEquation (answeredEquation.ID)}
    <SingleEquation equation={answeredEquation} />
  {/each}
  <SingleEquation equation={currentEquation} onSubmit={quiz.onSubmitAnswer} />
</div>
