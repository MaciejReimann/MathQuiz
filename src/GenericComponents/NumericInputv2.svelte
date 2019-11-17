<script>
  import { onMount } from "svelte";
  import { VoiceInput } from "../speech/VoiceInput";
  export let onSubmit;
  export let onNavigate;
  export let onFocus;
  export let maxLength;

  const initializeVoiceInput = () => {
    const voiceInput = new VoiceInput();
    voiceInput.startAfter(50);
    voiceInput.onResult(res => {
      handleInput(res, "voice");
    });
  };

  onMount(() => {
    initializeVoiceInput();
  });

  let inputNode;
  let displayedInputValue;
  let isFocused;

  $: inputNode && inputNode.focus();

  const handleFocus = () => {
    isFocused = true;
  };

  const handleBlur = () => {
    isFocused = false;
  };

  const handleInput = (inputData, src) => {
    if (src === "voice") {
      const includeAnyNumbers = inputData.match(/\d+/g) !== null;
      if (includeAnyNumbers) {
        displayedInputValue = inputData.match(/\d+/g).map(Number)[0];
      }
    } else if (isNaN(parseInt(inputData))) {
      displayedInputValue = displayedInputValue.slice(
        0,
        displayedInputValue.length - 1
      );
    }
  };

  const handleSubmit = () => {
    onSubmit(inputNode.value);
    displayedInputValue = "";
    initializeVoiceInput();
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
  on:input={e => handleInput(e.data)}
  bind:value={displayedInputValue}
  on:keydown={handleKeydown}
  bind:this={inputNode}
  maxlength={maxLength}
  type="text" />
