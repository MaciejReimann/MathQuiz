<script>
  import Quiz from "../Quiz.v2";
  import { generateEquationsForARange } from "../MultiplicationEquation";
  import { equationQuizAdapter } from "../equationQuizAdapter";
  import SingleEquation from "../MultiplicationEquations/SingleEquation.svelte";

  $: currentEquation = quiz.getCurrentQuestion();

  const onSubmitAnswer = i => {
    quiz.incrementIndex();
    currentEquation = quiz.getCurrentQuestion();
  };
  const onSubmitCorrectAnswer = i => {
    console.log("correct:  ", i);
  };
  const onSubmitIncorrectAnswer = i => {
    console.log("incorrect!  ", i);
  };

  const equations = generateEquationsForARange({ x: 10, y: 10 }).map(eq =>
    eq.formatEqResultRHS()
  );

  const quizQuestions = equations.map(eq =>
    equationQuizAdapter(eq, 0, {
      onSubmitAnswer,
      onSubmitCorrectAnswer,
      onSubmitIncorrectAnswer
    })
  );

  const quiz = new Quiz(quizQuestions, 9);
</script>

<div class="wrapper">
  <SingleEquation
    equation={currentEquation}
    onSubmit={currentEquation.listeners.onSubmitAnswer} />
</div>
