<script>
  export let names;
  import QuizIcon from "./QuizIcon.svelte";
  console.log(names);
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
    <QuizIcon {name} />
  {/each}

</div>
