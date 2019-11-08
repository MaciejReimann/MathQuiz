<script>
  export let name;
  import { getContext } from "svelte";

  const quizStore = getContext("quizStore");

  let selectedAppletID;
  $: isSelected = selectedAppletID === name;

  quizStore.subscribe(value => {
    selectedAppletID = value;
  });

  const handleClick = () => {
    quizStore.goTo(name);
  };
</script>

<style>
  .wrapper {
    width: 150px;
    height: 70px;

    display: flex;
    justify-content: center;
    align-items: center;

    border: 1px solid black;
    background-color: transparent;
  }

  .wrapper:hover {
    cursor: pointer;
    background-color: white;
  }

  .selected {
    background-color: white;
  }
</style>

<div on:click={handleClick} class:selected={isSelected} class="wrapper">
  {name}
</div>
