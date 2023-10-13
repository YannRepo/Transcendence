<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import axios from "axios";
  import API, { getMe, getUserById } from "$lib/services/Api";
  import { Confetti } from "svelte-confetti";

  //   import Navbar from "../../../components/Navbar.svelte";
  import { page } from "$app/stores";
  import UserAvatar from "./UserAvatar.svelte";

  //   export let data: PageData;

  let prp_user: User;
  let prp_friend: User;
  let isLogged = false;

  let showHistory: boolean = true;
  let showAchievements: boolean = false;
  let showFriends: boolean = false;
  let gameHistory: GameHistory[] = [];
  let arr_friendList: User[] = [];

  export let friendId: string;

  onMount(async () => {
    if (browser) {
      try {
        prp_user = await getMe();
        prp_friend = await getUserById(friendId);
        if (!prp_friend) await goto("/profile")
        if (prp_user) isLogged = true;
        else await goto("/auth");
      } catch (error) {
        console.log(error);
      }
    }
    gameHistory = await API.get(`/matchhistory/matchhistory/${prp_friend?.id}`);
  });
</script>

{#if isLogged}
  <div
    class="w-2/3 h-[86vh] mx-auto rounded-[18px] p-8 border-2 border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md"
    style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
  >
    <div class="text-center flex flex-col h-full">
      <div class="grid grid-cols-3">
        <div class="col-span-1 flex flex-col items-start justify-center">
          <div class="text-[#ffffff] font-audiowide text-2xl">
            Score: {prp_friend?.score}
          </div>
        </div>
        <div class="col-span-1 flex flex-col items-center">
          <h1
            class="text-[#ffffff] text-6xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
          >
            {prp_friend?.username}
          </h1>
        </div>
        <div class="col-span-1 flex flex-col items-end justify-center">
          <div class="text-[#ffffff] font-audiowide text-2xl opacity-0">
            Classement:
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center">
        {#if prp_friend?.isLogged}
          {#if prp_friend?.inGame}
            <p class="text-orange-600 mt-1 text-sm">In Game</p>
          {:else if prp_friend?.inChat}
            <p class="text-green-600 mt-1 text-sm">In Chat</p>
          {:else}
            <p class="text-green-300 mt-1 text-sm">Online</p>
          {/if}
        {:else}
          <p class="text-red-600 mt-1 text-sm">Disconnect</p>
        {/if}
      </div>
      <div class="pt-4 flex flex-col items-center space-y-4">
        <div
          class="flex justify-center items-center h-[24vh] w-[24vh] mx-auto my-auto rounded-full overflow-hidden border-2 border-gray-300"
        >
          <UserAvatar avatarId={prp_friend?.avatarId} />
        </div>
      </div>

      <label>
        <div class="my-5">
          <div class="mydict">
            <div class="">
              <label>
                <input
                  type="radio"
                  name="radio"
                  checked={showHistory}
                  on:click={() => {
                    showHistory = true;
                    showAchievements = false;
                    showFriends = false;
                  }}
                />
                <span>History</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="radio"
                  checked={showAchievements}
                  on:click={() => {
                    showHistory = false;
                    showAchievements = true;
                    showFriends = false;
                  }}
                />
                <span>Achievements</span>
              </label>
              <!-- <label>
              <input
                type="radio"
                name="radio"
                checked={showFriends}
                on:click={() => {
                  showHistory = false;
                  showAchievements = false;
                  showFriends = true;
                }}
              />
              <span>Friends</span>
            </label> -->
            </div>
          </div>
        </div>
      </label>

      {#if showHistory}
        <div class="flex-1 items-center overflow-auto h-full">
          {#if gameHistory.length === 0}
            <div class="flex items-center justify-center my-5">
              <div class="text-3xl">No game history yet!</div>
            </div>
          {:else}
            {#each gameHistory as game}
              {#if game.idPlayer1 !== prp_friend.id}
                {#await getUserById(game.idPlayer1) then user}
                  <div class="flex items-center justify-between my-5">
                    <div class="flex justify-center items-center">
                      <div
                        class="flex border-2 rounded-full w-12 h-12 items-center justify-center mr-4"
                      >
                        <UserAvatar avatarId={user?.avatarId} />
                      </div>
                      <div class="text-3xl">
                        {user.username}
                      </div>
                    </div>
                    <div class="">
                      {#if user.id !== game.idWinner}
                        <div class="text-green-500">
                          Win ({game.scorePlayer2} - {game.scorePlayer1})
                        </div>
                      {:else}
                        <div class="text-red-500">
                          Defeat ({game.scorePlayer2} - {game.scorePlayer1})
                        </div>
                      {/if}
                    </div>
                  </div>
                {/await}
              {:else}
                {#await getUserById(game.idPlayer2) then user}
                  <div class="flex items-center justify-between my-5">
                    <div class="flex justify-center items-center">
                      <div
                        class="flex border-2 rounded-full w-12 h-12 items-center justify-center mr-4"
                      >
                        <UserAvatar avatarId={user?.avatarId} />
                      </div>
                      <div class="text-3xl">
                        {user.username}
                      </div>
                    </div>
                    <div class="">
                      {#if user.id !== game.idWinner}
                        <div class="text-green-500">
                          Win ({game.scorePlayer2} - {game.scorePlayer1})
                        </div>
                      {:else}
                        <div class="text-red-500">
                          Defeat ({game.scorePlayer2} - {game.scorePlayer1})
                        </div>
                      {/if}
                    </div>
                  </div>
                {/await}
              {/if}
            {/each}
          {/if}
        </div>
      {:else if showAchievements}
        <div class="flex-1 items-center overflow-auto h-full">
          {#if prp_friend?.achievementChat}
            <div
              class="flex border-2 border-gray-400 rounded-lg items-center justify-start"
            >
              <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
              <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />

              <div class="border-2 rounded-lg border-gray-400 p-3 m-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  class="h-12 fill-[#f7ed14]"
                >
                  <style>
                    svg {
                      fill: #f7ed14;
                    }
                  </style><path
                    d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
                  /></svg
                >
              </div>
              <div>
                <div
                  class=" text-left text-3xl pt-2 px-1 text-[#f7ed14] [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
                >
                  Chat Maestro!
                </div>
                <div class=" text-left pb-2 px-1">
                  You've sent over 5 messages in our chat, showcasing your
                  exceptional communication skills and dedication. Keep the
                  conversation flowing and continue to connect with others!
                </div>
              </div>
              <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />
              <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
            </div>
          {:else}
            <div
              class="flex border-2 border-gray-600 rounded-lg items-center justify-start"
            >
              <div class="border-2 rounded-lg border-gray-600 p-3 m-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  class="h-12 fill-[#4b5563]"
                >
                  <style>
                    svg {
                      fill: #4b5563;
                    }
                  </style><path
                    d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
                  /></svg
                >
              </div>
              <div>
                <div class=" text-left text-3xl pt-2 px-1 text-[#4b5563]">
                  Chat Maestro!
                </div>
                <div class=" text-left pb-2 px-1 text-gray-600">
                  You've to send over 5 messages in our chat, showcasing your
                  exceptional communication skills and dedication. Keep the
                  conversation flowing and continue to connect with others!
                </div>
              </div>
            </div>
          {/if}
          {#if prp_friend?.achievementAvatar}
            <div
              class="flex border-2 border-gray-400 rounded-lg items-center justify-start my-2"
            >
              <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
              <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />

              <div class="border-2 rounded-lg border-gray-400 p-3 m-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  class="h-12 fill-[#f7ed14]"
                >
                  <style>
                    svg {
                      fill: #f7ed14;
                    }
                  </style><path
                    d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
                  /></svg
                >
              </div>
              <div>
                <div
                  class=" text-left text-3xl pt-2 px-1 text-[#f7ed14] [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
                >
                  Picture Perfect Profile!
                </div>
                <div class=" text-left pb-2 px-1">
                  Congratulations on adding a profile picture! Your personal
                  touch adds warmth to our community and helps others get to
                  know you better. Keep customizing and making your mark!
                </div>
              </div>
              <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />
              <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
            </div>
          {:else}
            <div
              class="flex border-2 border-gray-600 rounded-lg items-center justify-start my-2"
            >
              <div class="border-2 rounded-lg border-gray-600 p-3 m-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  class="h-12 fill-[#4b5563]"
                >
                  <style>
                    svg {
                      fill: #4b5563;
                    }
                  </style><path
                    d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
                  /></svg
                >
              </div>
              <div>
                <div class=" text-left text-3xl pt-2 px-1 text-[#4b5563]">
                  Picture Perfect Profile!
                </div>
                <div class=" text-left pb-2 px-1 text-gray-600">
                  Add a profile picture! Your personal touch adds warmth to our
                  community and helps others get to know you better. Keep
                  customizing and making your mark!
                </div>
              </div>
            </div>
          {/if}
          {#if prp_friend?.achievementPong}
            <div
              class="flex border-2 border-gray-400 rounded-lg items-start justify-start"
            >
              <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
              <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />

              <div class="border-2 rounded-lg border-gray-400 p-3 m-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  class="h-12 fill-[#f7ed14]"
                >
                  <style>
                    svg {
                      fill: #f7ed14;
                    }
                  </style><path
                    d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
                  /></svg
                >
              </div>
              <div>
                <div
                  class=" text-left text-3xl pt-2 px-1 text-[#f7ed14] [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
                >
                  Pong Pro Champion!
                </div>
                <div class=" text-left pb-2 px-1">
                  You've conquered the virtual Pong arena and emerged as the
                  ultimate champion! Your precision, timing, and strategic moves
                  have led you to victory. Keep aiming for success in all your
                  endeavors!
                </div>
              </div>
              <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />
              <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
            </div>
          {:else}
            <div
              class="flex border-2 border-gray-600 rounded-lg items-center justify-start"
            >
              <div class="border-2 rounded-lg border-gray-600 p-3 m-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  class="h-12 fill-[#4b5563]"
                >
                  <style>
                    svg {
                      fill: #4b5563;
                    }
                  </style><path
                    d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
                  /></svg
                >
              </div>
              <div>
                <div class=" text-left text-3xl pt-2 px-1 text-[#4b5563]">
                  Pong Pro Champion!
                </div>
                <div class=" text-left pb-2 px-1 text-gray-600">
                  You were an aspiring Pong player, refining your skills and
                  strategy in the virtual arena, on the path to becoming a Pong
                  master.
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class=" flex justify-center pt-52">
    <img src="../loading.svg" alt="loading" class=" h-72 w-72" />
  </div>
{/if}

<style>
  :focus {
    outline: 0;
    box-shadow: 0 0 0 4px #f7ed1414;
  }

  .mydict div {
    display: flex;
    flex-wrap: wrap;
    /* margin-top: 0.5rem; */
    justify-content: center;
    color: #f7ed14;
  }

  .mydict label {
    flex: 1; /* Make labels take up equal width */
    display: flex;
    align-items: center; /* Center content vertically */
    justify-content: center; /* Center content horizontally */
    /* margin: 0.25rem; Add spacing between labels */
  }

  .mydict input[type="radio"] {
    clip: rect(0 0 0 0);
    clip-path: inset(100%);
    /* height: 1px; */
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    /* width: 1px; */
  }

  .mydict input[type="radio"]:checked + span {
    /* box-shadow: 0 0 0 0.0625em #f7ed1414; */
    background-color: #f7ed14;
    z-index: 1;
    color: black;
    /* border-radius: 30.5em; Increase the border radius for rounded corners */
  }

  label span {
    cursor: pointer;
    background-color: #f7ed1414;
    padding: 0em 0.75em;
    position: relative;
    /* box-shadow: 0 0 0 0.0625em #f7ed1414; */
    /* letter-spacing: 0.05em; */
    color: #f7ed14;
    text-align: center;
    transition: background-color 0.5s ease;
    flex: 1; /* Make spans take up equal width */
    /* border-radius: 30.5em; Increase the border radius for rounded corners */
  }

  label:first-child span {
    border-radius: 1em 0 0 1em;
  }

  label:last-child span {
    border-radius: 0 1em 1em 0;
  }
</style>
