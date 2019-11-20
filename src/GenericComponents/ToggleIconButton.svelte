<script>
  export let turnOn;
  export let turnOff;

  let isSelectedMicrophone = false;

  const onClick = () => {
    isSelectedMicrophone ? turnOff() : turnOn();
    isSelectedMicrophone = !isSelectedMicrophone;
  };
</script>

<style>
  .button {
    border: 1px solid rgb(10, 7, 7);
    border-radius: 30px;
    min-width: 60px;
    min-height: 60px;
    display: flex;

    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .button:hover {
    background-color: white;
    transform: scale(1.05);
    transition: ease-in-out;
  }

  .isSelected {
  }
</style>

<div class="button" on:click={onClick}>
  {#if !isSelectedMicrophone}
    <i class="fas fa-microphone" />
  {:else}
    <i class="fas fa-keyboard" />
  {/if}
</div>
