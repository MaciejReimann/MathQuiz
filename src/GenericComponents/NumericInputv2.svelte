<script>
  export let submittedValue;
  export let onSubmit;
  export let onNavigate;
  export let onFocus;
  export let maxLength;

  let inputNode;
  let inputValue = submittedValue;
  let isFocused;

  $: inputNode && !submittedValue && inputNode.focus();

  const handleFocus = () => {
    isFocused = true;
  };

  const handleBlur = () => {
    isFocused = false;
  };

  const handleInput = e => {
    if (isNaN(parseInt(e.data))) {
      inputValue = inputValue.slice(0, inputValue.length - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    inputValue = "";
  };

  const handleKeydown = e => {
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
  on:change={handleSubmit}
  on:keydown={handleKeydown}
  bind:value={inputValue}
  bind:this={inputNode}
  maxlength={maxLength}
  disabled={submittedValue}
  type="text" />
