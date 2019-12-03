<script>
  import { beforeUpdate, afterUpdate } from "svelte";
  import { getContext } from "svelte";

  export let onNavigate;
  export let onFocus;
  export let maxLength;
  export let disabled;

  const inputStore = getContext("inputStore");
  const quizStore = getContext("quizStore");
  const controllerStore = getContext("controllerStore");

  let inputNode;
  let isFocused;
  let displayedInputValue;
  $: inputNode && inputNode.focus();

  inputStore.subscribe(val => {
    displayedInputValue = inputStore.getValue();
    inputNode && inputNode.focus();
  });

  beforeUpdate(() => {
    displayedInputValue && inputStore.onInput(displayedInputValue);
  });

  afterUpdate(() => {
    displayedInputValue = inputStore.getValue();
  });

  const handleSubmit = () => {
    quizStore.onSubmitAnswer(displayedInputValue);
    inputStore.resetValue();
    controllerStore.resetMicrophone();
  };

  const handleKeydown = e => {
    if (e.code === "Enter") handleSubmit();
    if (typeof onNavigate === "function") onNavigate(e.key);
  };

  const handleFocus = () => {
    isFocused = true;
  };

  const handleBlur = () => {
    isFocused = false;
  };
</script>

<style>
  input {
    border: none;
    width: 100%;
    height: 100%;
    text-align: center;
    margin: 0;
    color: blue;
  }
  input:focus {
    outline: none;
  }

  .focused {
    transform: scale(1.05);
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.7);
  }

  .blurred {
    background-color: transparent;
  }
</style>

<input
  class:focused={isFocused}
  class:blurred={!isFocused}
  on:focus={handleFocus}
  on:blur={handleBlur}
  on:keydown={handleKeydown}
  bind:value={displayedInputValue}
  bind:this={inputNode}
  maxlength={maxLength}
  type="text"
  {disabled} />
