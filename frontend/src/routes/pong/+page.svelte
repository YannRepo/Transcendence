<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import io from "socket.io-client";
  import { goto } from "$app/navigation";
  import API, { getMe } from "$lib/services/Api";
  import { PUBLIC_API_URL } from "$env/static/public";

  //THEMES
  let isHardMode = false;
  let lightAmbient = isHardMode
    ? "rgba(219, 58, 58, 0.5)"
    : "rgba(60, 121, 216, 0.5)";
  let solidAmbient = isHardMode
    ? "rgba(219, 58, 58, 1)"
    : "rgba(60, 121, 216, 1)";

  //DIMENSIONS
  const REFERENCE_WIDTH_PLAYGROUND = 700;
  const REFERENCE_HEIGHT_PLAYGROUND = 500;
  const REFERENCE_PADDLE_PLAYGROUNDEDGE = 20;
  const REFERENCE_PADDLE_HEIGHT = 100;
  const REFERENCE_PADDLE_WIDTH = 15;
  const REFERENCE_BALL_DIAMETER = 18;

  //RULES
  let coefficient = 1;
  let WINDOW_HEIGHT = 0;
  let WINDOW_WIDTH = 0;
  const PLAYGROUND_RATIO = 1.4;
  const PLAYGROUND_MAX_WIDTH_RATIO = 0.7;
  const PLAYGROUND_MAX_HEIGHT_RATIO = 0.5;

  /* ******************************************************************** */
  /*                             PLAYGROUND                               */
  /* ******************************************************************** */

  if (typeof window !== "undefined") {
    WINDOW_HEIGHT = window.innerHeight;
    WINDOW_WIDTH = window.innerWidth;
  }

  let playground = {
    x: 0,
    y: 0,
    height: REFERENCE_HEIGHT_PLAYGROUND,
    width: REFERENCE_WIDTH_PLAYGROUND,
    backcolor: "#03070b",
    edgecolor: "#26dd1e",
  };

  function updatePlayground() {
    playground.width = WINDOW_WIDTH * PLAYGROUND_MAX_WIDTH_RATIO;
    playground.height = playground.width / PLAYGROUND_RATIO;
    if (WINDOW_HEIGHT * PLAYGROUND_MAX_HEIGHT_RATIO <= playground.height) {
      playground.height = WINDOW_HEIGHT * PLAYGROUND_MAX_HEIGHT_RATIO;
      playground.width = playground.height * PLAYGROUND_RATIO;
    }

    playground.x = (WINDOW_WIDTH - playground.width) / 2;
    playground.y = (WINDOW_HEIGHT - playground.height) / 2;

    coefficient = playground.width / REFERENCE_WIDTH_PLAYGROUND;
  }

  if (typeof window !== "undefined") {
    updatePlayground();
    window.addEventListener("resize", () => {
      WINDOW_WIDTH = window.innerWidth;
      WINDOW_HEIGHT = window.innerHeight;
      updatePlayground();
    });
  }

  /* ******************************************************************** */
  /*                               PLAYER                                 */
  /* ******************************************************************** */
  let usernamePlayer1 = "Player 1";
  let usernamePlayer2 = "Player 2";

  /* ******************************************************************** */
  /*                               PADDLE                                 */
  /* ******************************************************************** */

  let paddle1 = {
    x: REFERENCE_PADDLE_PLAYGROUNDEDGE * coefficient,
    y: playground.height / 2,
    height: REFERENCE_PADDLE_HEIGHT * coefficient,
    width: REFERENCE_PADDLE_WIDTH * coefficient,
    color: "#AE6AF2",
    moveUp: 0,
    moveDown: 0,
  };

  let paddle2 = {
    x: playground.width - REFERENCE_PADDLE_PLAYGROUNDEDGE * coefficient,
    y: playground.height / 2,
    height: REFERENCE_PADDLE_HEIGHT * coefficient,
    width: REFERENCE_PADDLE_WIDTH * coefficient,
    color: "#00f0fe",
    moveUp: 0,
    moveDown: 0,
  };

  function updatePaddles() {
    paddle1.x = REFERENCE_PADDLE_PLAYGROUNDEDGE * coefficient;
    paddle1.y = playground.height / 2;
    paddle1.height = REFERENCE_PADDLE_HEIGHT * coefficient;
    paddle1.width = REFERENCE_PADDLE_WIDTH * coefficient;

    paddle2.x =
      playground.width - REFERENCE_PADDLE_PLAYGROUNDEDGE * coefficient;
    paddle2.y = playground.height / 2;
    paddle2.height = REFERENCE_PADDLE_HEIGHT * coefficient;
    paddle2.width = REFERENCE_PADDLE_WIDTH * coefficient;
  }

  if (typeof window !== "undefined") {
    updatePaddles();
    window.addEventListener("resize", updatePaddles);
  }

  /* ******************************************************************** */
  /*                               BALL                                   */
  /* ******************************************************************** */

  let ball = {
    x: playground.width / 2,
    y: playground.height / 2,
    diameter: REFERENCE_BALL_DIAMETER * coefficient,
    color: "#fe9600",
    direction_radian: 0,
  };

  let score = { p1: 0, p2: 0 };
  let socket = null;
  let middleScreenMessage = "";

  function updateBall() {
    ball.x = playground.width / 2;
    ball.y = playground.height / 2;
    ball.diameter = REFERENCE_BALL_DIAMETER * coefficient;
  }

  if (typeof window !== "undefined") {
    updateBall();
    window.addEventListener("resize", updateBall);
  }

  onMount(async () => {
    document.body.classList.add("pong-page");
    const user = await getMe();
    socket = io(PUBLIC_API_URL, {
      auth: {
        token: `Bearer ${localStorage.getItem(
          "access_token"
        )}, ${localStorage.getItem("refresh_token")}`,
        socketType: "pong",
      },
    });
    socket.on("updateGame", handleUpdateGame);
    socket.on("message", handleMessage);
    socket.on("endOfTheGame", handleEndOfTheGame);
    socket.on("disconnected", handleDisconnected);
    //console.log(`Ready to start`);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

  });

  onDestroy(() => {
    //console.log("on destroy called");
    // document.body.classList.remove("pong-page");
    closeWebSocket();
  });

  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function handleUpdateGame(gameData) {
    if (gameData) {
      //  console.log(`handleUpdateGame`);
      paddle1.y = gameData.yPaddle1 * coefficient;
      paddle1.height = gameData.heightPaddle1 * coefficient;
      paddle2.y = gameData.yPaddle2 * coefficient;
      paddle2.height = gameData.heightPaddle2 * coefficient;
      ball.x = gameData.xBall * coefficient;
      ball.y = gameData.yBall * coefficient;
      score.p1 = gameData.scoreP1;
      score.p2 = gameData.scoreP2;
      isHardMode = gameData.isHardMode;
      usernamePlayer1 = gameData.usernameP1;
      usernamePlayer2 = gameData.usernameP2;

      lightAmbient = isHardMode
        ? "rgba(219, 58, 58, 0.5)"
        : "rgba(60, 121, 216, 0.5)";
      solidAmbient = isHardMode
        ? "rgba(219, 58, 58, 1)"
        : "rgba(60, 121, 216, 1)";
    }
    document.body.classList.remove("pong-page");
  }

  function handleMessage(message) {
    middleScreenMessage = message;
  }

  async function handleEndOfTheGame(message) {
    //console.log(`end of the game`);
    // time to let the message of the winner on the screen before going to waiting room
    // add a button to go to 'matchhistory page' when the game is over would be better
    await delay(2000);
	window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
	closeWebSocket();
    goto("/ranking");
  }

  async function handleDisconnected(message) {
    //console.log(`disconnected`);
	window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
	closeWebSocket();
    goto("/ranking");
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowUp") {
      socket.emit("ArrowUpPressed", {});
    } else if (event.key === "ArrowDown") {
      socket.emit("ArrowDownPressed", {});
    }
  }
  function handleKeyUp(event) {
    if (event.key === "ArrowUp") {
      socket.emit("ArrowUpReleased", {});
    } else if (event.key === "ArrowDown") {
      socket.emit("ArrowDownReleased", {});
    }
  }

  function closeWebSocket() {
    if (socket) {
      socket.close();
      socket = null;
    }
  }
</script>

<!-- Cover -->
<div
  style="background-color: #0b041f; background-image: url('{isHardMode
    ? '/BackgroundPongHard.svg'
    : '/BackgroundPong.svg'}'); width: 100%; height: 100vh; max-width: 100%; max-height: 100%; min-height: 100px; min-width: 60px; animation: pulse 4s inifnite;"
/>

<!--Playground-->
<div
  style="position: absolute; top: calc(50% - {playground.height /
    2}px); left: calc(50% - {playground.width /
    2}px); width: {playground.width}px; height: {playground.height}px; border-radius: {playground.height / 40}px; border: 1px solid {solidAmbient}; background: var(--background, #0B041F); box-shadow: 0px 0px 64px 12px {lightAmbient}; overflow: auto;"
>
  <div
    style="position: absolute; width: 4px; height: 100%; background: transparent; border-left: 2px dashed {lightAmbient}; left: 50%; top: 0; transform: translateX(-50%);"
  />

  <div
    style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: {playground.height *
      0.25}px; height: {playground.height *
      0.25}px; border-radius: 50%; border: 2px solid {lightAmbient}; background: var(--background, #0B041F);"
  />
</div>

<!-- Paddle 1 -->
<div
  style="position: absolute; top: {playground.y +
    paddle1.y}px; left: {playground.x +
    paddle1.x}px; width: {paddle1.width}px; height: {paddle1.height}px; background-color: #AE6AF2; transform: translate(-50%, -50%); border-radius: 10px; box-shadow: 0px 0px 14px rgba(249, 50, 173, 0.5); border: 1px solid rgba(255, 255, 255, 0.20);"
/>

<!-- Paddle 2 -->
<div
  style="position: absolute; top: {playground.y +
    paddle2.y}px; left: {playground.x +
    paddle2.x}px; width: {paddle2.width}px; height: {paddle2.height}px; background-color: #6AF2C1; transform: translate(-50%, -50%); border-radius: 10px; box-shadow: 0px 0px 14px rgba(78, 255, 182, 0.5); border: 1px solid rgba(255, 255, 255, 0.20);"
/>

<!--Ball-->
<div
  style="position: absolute; top: {playground.y +
    ball.y}px; left: {playground.x +
    ball.x}px; width: {ball.diameter}px; height: {ball.diameter}px; background-color: {'#F7ED14'}; transform: translate(-50%, -50%); border-radius: 50%; fill: var(--yellow, #F7ED14); stroke-width: 1px; stroke: rgba(255, 255, 255, 0.50); filter: drop-shadow(0px 0px 14px rgba(247, 237, 20, 0.50));"
/>

<!--Hard mode-->
{#if isHardMode}
  <p
    class="player-name text-[#F7ED14] font-audiowide"
    style="font-size: {playground.y /
      16}px; text-align: center; position: absolute; top: {playground.y /
      8}px; left: 50%; transform: translateX(-50%);"
  >
    Hard Mode
  </p>
{/if}

<!--Score-->
<p
  class="text-[#F7ED14] font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
  style="position: fixed; left: 50%; transform: translateX(-50%); top: {playground.y /
    4}px; font-size: {playground.y / 4}px;"
>
  {score.p1} : {score.p2}
</p>

<!-- Player Names Row -->
<div
  style="position: absolute; width: {playground.width}px; top: {playground.y +
    playground.height}px; top: calc({playground.y +
    playground.height * 1.1}px); left: calc(50% - {playground.width /
    2}px); display: flex; justify-content: space-between;"
>
  <p
    class="player-name text-[#AE6AF2] font-audiowide"
    style="font-size: {playground.y /
      8}px; text-align: left; margin-left: 20px;"
  >
    {usernamePlayer1}
  </p>
  <p
    class="player-name text-[#6AF2C1] font-audiowide"
    style="font-size: {playground.y /
      8}px; text-align: right; margin-right: 20px;"
  >
    {usernamePlayer2}
  </p>
</div>

<!--Message-->
<p
  class="font-audiowide"
  style="font-size: {playground.y /
    8}px; position: absolute; top: {playground.y +
    playground.height}px; top: calc({playground.y +
    playground.height *
      1.25}px); text-align: center; left: 50%; transform: translateX(-50%); color: {solidAmbient};"
>
  {middleScreenMessage}
</p>
