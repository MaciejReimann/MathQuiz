<script>
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import ScoreService from "./Score.service";

  import Header from "./Header.svelte";
  import ControlBar from "./ControlBar/ControlBar.svelte";
  import AppletWindow from "./AppletWindow/AppletWindow.svelte";

  const scoreService = new ScoreService();
  setContext("scoreService", scoreService);

  const appletsID = ["x * y = _", "_ * y = z", "x * _ = z", "table"];
  let currentAppletID;

  const appStore = writable(appletsID[0]);
  setContext("appStore", appStore);

  $: currentAppletID = appStore;
  // $: console.log(currentAppletID);

  appStore.subscribe(value => {
    currentAppletID = value;
  });
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

  .footer {
    height: 20vh;
    width: 100%;
  }
</style>

<div class="app">

  <header class="header">
    <Header />
  </header>

  <main class="main">

    <AppletWindow />

  </main>

  <footer class="footer">
    <ControlBar options={appletsID} />
  </footer>

</div>
