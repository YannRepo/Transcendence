<!-- ############################################################################################################### -->
<!-- ###################################################  Waiting Room  ############################################ -->
<!-- ############################################################################################################### -->
<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import io from "socket.io-client";
  import { goto } from "$app/navigation";
  import Navbar from "../../components/Navbar.svelte";
  import API, { getMe } from "$lib/services/Api";
  import { PUBLIC_API_URL } from "$env/static/public";

  let isPlayerReady = false;
  let isHardModeSelected = false;

  let socket = null;

  let connectedClientsMap = {};

  onMount(async () => {
    const user = await getMe();
    socket = io(PUBLIC_API_URL, {
      auth: {
        token: `Bearer ${localStorage.getItem(
          "access_token"
        )}, ${localStorage.getItem("refresh_token")}`,
        socketType: "waitingroom",
      },
    });
    socket.on("updateWaitingRoomState", handleUpdateWaitingRoomState);
    socket.on("startGame", handleStartGame);
    socket.on("ReadyStatus", handlePlayerReadyStatus);
    socket.on("modeStatus", handlePlayermodeStatus);
    socket.on(
      "disconnectedBecauseDoubleSocket",
      handleDisconnectedBecauseDoubleSocket
    );

    // socket.on('updateGame', handleUpdateGame);
  });

  onDestroy(() => {
    closeWebSocket();
  });

  function handleUpdateWaitingRoomState(connectedClients) {
    // console.log(connectedClients);
    // console.log(connectedClients(0));
    connectedClientsMap = connectedClients;
    // connectedClientsMap = MapObject.entries(connectedClients);
  }

  function handlePlayerReadyStatus(status) {
    //console.log("answer receive i am ready", status);
    isPlayerReady = status;
  }

  function handlePlayermodeStatus(status) {
    //console.log("answer receive hard mode", status);
    isHardModeSelected = status;
  }

  function handleStartGame(gameName) {
    //console.log("gameName:", gameName);
    if (socket) {
      socket.disconnect(); // Close the socket connection
    }
    goto("/pong");
  }

  function handleDisconnectedBecauseDoubleSocket() {
    goto("/");
  }

  function handleReadyButton() {
    //console.log(`Button was ready clicked`);
    socket.emit("playerReady");
  }

  function handleModeButton() {
    // console.log(`Button mode was clicked`);
    socket.emit("changeMode");
  }

  function closeWebSocket() {
    if (socket) {
      socket.close();
      socket = null;
    }
  }
</script>

<!-- Page title -->
<Navbar />

<!-- Global div -->
<div
  class="w-2/3 h-[86vh] mx-auto rounded-[18px] p-8 border-2 border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md"
  style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
>
  <div style="display: flex; flex-direction: column; height: 100%;">
    <h1
      class="text-[#ffffff] text-6xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)] text-center"
    >
      Waiting Room
    </h1>
    <br />

    <!-- Selection + client list + ready action -->
    <div
      style="display: flex; flex-direction: column; justify-content: space-between; height: 90%;"
    >
      <!-- List of client -->
      <div>
        {#each Object.keys(connectedClientsMap) as clientId}
          <div class="mb-4 mx-2">
            <div class="flex justify-between">
              <div>{connectedClientsMap[clientId].username}</div>
              <div class="flex justify-between items-center">
                <div class="text-[#ffffff]">
                  {connectedClientsMap[clientId].hardModeSelected
                    ? "Hard mode"
                    : "Classic mode"}
                </div>
                <div class="ml-8">
                  <div
                    class={connectedClientsMap[clientId].isReady
                      ? "text-green-600"
                      : "text-orange-600"}
                    style="display: inline;"
                  >
                    {connectedClientsMap[clientId].isReady
                      ? "Ready"
                      : "Not Ready"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Ready action -->
      <div class="flex flex-col items-center">
        {#if !isPlayerReady}
          <div class="flex items-center mb-4">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="{isHardModeSelected
                ? 'selected'
                : 'unselected'} mr-2 cursor-pointer relative"
              on:click={handleModeButton}
            >
              {#if isHardModeSelected}
                <div class="absolute inset-y-0 left-0 flex items-center">
                  <img
                    src="icon_check.svg"
                    alt="Check Mark"
                    class="w-12 h-12"
                  />
                </div>
              {/if}
            </div>
            <div class="text-[#ffffff] ml-2">
              {isHardModeSelected
                ? "Hard mode selected"
                : "Hard mode unselected"}
            </div>
          </div>
        {/if}

        <button
          class=" border-2 w-52 p-1 rounded-md text-[#f7ed14] border-[#f7ed14] justify-center"
          on:click={handleReadyButton}
        >
          {isPlayerReady ? "Cancel" : "Click when ready"}
        </button>

        <readystatus
          class={isPlayerReady
            ? "isPlayerReadyActive mt-4"
            : "isPlayerReadyNotActive mt-4"}
          style="text-align: center;"
        >
          {isPlayerReady
            ? "ready"
            : "not ready (Player cannot be ready if already playing a game)"}
        </readystatus>
      </div>
    </div>
  </div>
</div>

<!-- Color for states-->
<style>
  .isPlayerReadyActive {
    color: #27ae60;
  }
  .isPlayerReadyNotActive {
    color: #bb5b01;
  }
  .isHardcoreModeActive {
    color: #ad1227;
  }
  .isHardcoreModeNotActive {
    color: #27ae60;
  }

  .selected {
    width: 24px;
    height: 24px;
    border: 2px solid #4effb6; /* Couleur de bordure verte */
    border-radius: 4px;
    box-shadow: 0px 0px 4px 0px #4effb6; /* Ombre verte */
  }
  .unselected {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.5); /* Rouge */
    border-radius: 4px;
    box-shadow: 0px 0px 4px 0px #fff;
  }
</style>
