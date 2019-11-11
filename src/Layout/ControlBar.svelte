<script>
  export let appPrefix;

  import QuizIcon from "./QuizIcon.svelte";
  import { getContext } from "svelte";

  let selectedQuizName;
  const quizStore = getContext("quizStore", quizStore);

  const names = quizStore.getAllQuizNames();

  const handleIconClick = name => {
    quizStore.goTo(name);
  };

  quizStore.subscribe(value => {
    selectedQuizName = value.quizName;
  });

  const noPrefix = name =>
    name.includes(appPrefix) && name.slice(appPrefix.length + 1, name.length);
</script>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;
  }
</style>

<div class="wrapper">

  {#each names as name (name)}
    <QuizIcon
      name={noPrefix(name)}
      id={name}
      handleClick={handleIconClick}
      isSelected={selectedQuizName === name} />
  {/each}

</div>
