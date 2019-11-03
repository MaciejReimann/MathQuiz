<script>
  export let options;
  import AppletIcon from "./AppletIcon.svelte";
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

  {#each options as option (option)}
    <AppletIcon name={option} />
  {/each}

</div>
