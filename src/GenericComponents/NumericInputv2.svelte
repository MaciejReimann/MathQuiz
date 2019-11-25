<script>
  import { onDestroy, beforeUpdate, afterUpdate } from "svelte";
  import { getContext } from "svelte";

  import { onMount } from "svelte";
  import { VoiceInput } from "../speech/VoiceInput";
  export let onSubmit;
  export let onNavigate;
  export let onFocus;
  export let maxLength;
  // export let value;

  let displayedInputValue;
  $: displayedInputValue;

  const inputStore = getContext("inputStore");
  const quizStore = getContext("quizStore");

  // const initializeVoiceInput = () => {
  //   const voiceInput = new VoiceInput();
  //   voiceInput.startAfter(50);
  //   voiceInput.onResult(res => {
  //     handleInput(res, "voice");
  //   });
  // };

  // onMount(() => {
  //   initializeVoiceInput();
  // });

  let inputNode;
  let isFocused;

  beforeUpdate(() => {
    if (displayedInputValue) inputStore.onKeyboardInput(displayedInputValue);
  });

  afterUpdate(() => {
    displayedInputValue = inputStore.getInputValue();
  });

  $: inputNode && inputNode.focus();

  const handleFocus = () => {
    isFocused = true;
  };

  const handleBlur = () => {
    isFocused = false;
  };

  const handleSubmit = () => {
    quizStore.onSubmitAnswer(inputNode.value);
    inputStore.resetValue();
    displayedInputValue = inputStore.getInputValue();
    // initializeVoiceInput();
  };

  const handleKeydown = e => {
    if (e.code === "Enter") handleSubmit();
    if (typeof onNavigate === "function") onNavigate(e.key);
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
  type="text" />
