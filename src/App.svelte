<script>
  import { setContext } from "svelte";
  import Header from "./Header.svelte";
  import MultiplicationTable from "./MultiplicationTable/MultiplicationTable.svelte";
  import EquationsDisplay from "./MultiplicationEquations/EquationsDisplay.svelte";
  import ScoreService from "./Score.service";

  const scoreService = new ScoreService();
  setContext("scoreService", scoreService);

  const handleAnswerSubmitted = e => {
    if (e.detail.correct) {
      scoreService.incrementScore();
    } else {
      scoreService.resetStrike();
    }
  };
</script>

<style>
  :global(body, html) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: #e8ebeb;
  }

  .header {
    /* margin-top: 10px; */
  }

  .main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>

<div class="app">
  <div class="header">
    <Header />
  </div>

  <main class="main">
    <EquationsDisplay on:answerSubmitted={handleAnswerSubmitted} />

  </main>

</div>
