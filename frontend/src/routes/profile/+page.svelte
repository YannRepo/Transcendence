<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Navbar from "../../components/Navbar.svelte";
  import axios from "axios";
  import API, { getAvatar, getMe, getUserById } from "$lib/services/Api";
  import { Confetti } from "svelte-confetti";
  import NewFriendModal from "./NewFriendModal.svelte";
  import UserAvatar from "../../components/UserAvatar.svelte";

  let avatarId = "";
  let newUsername = "";
  let user: User;
  let isLogged = false;

  let showHistory: boolean = true;
  let showAchievements: boolean = false;
  let showFriends: boolean = false;
  let gameHistory: GameHistory[] = [];
  let arr_friendList: User[] = [];

  async function deleteFriend(id: string) {
    try {
      const res = await API.delete(`/user/friends/deleteFriend`, {
        friendId: id,
      });
    } catch (err) {
      console.log("Error", err);
    }
  }

  async function getFriends() {
    try {
      arr_friendList = await API.get(`/user/friends/getFriends`);
    } catch (err) {
      console.log("Error", err);
    }
  }

  onMount(async () => {
    if (browser) {
      try {
        user = await getMe();
        if (user) isLogged = true;
        else goto("/auth");
      } catch (error) {
        console.log(error);
      }
    }

    gameHistory = await API.get(`/matchhistory/matchhistory/${user?.id}`);
    getFriends();
  });
</script>

<Navbar />

{#if isLogged}
  <div
    class="w-2/3 h-[86vh] mx-auto rounded-[18px] p-8 border-2 border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md"
    style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
  >
    <div class="text-center flex flex-col h-full">
      <div class="grid grid-cols-3">
        <div class="col-span-1 flex flex-col items-start justify-center">
          <div class="text-[#ffffff] font-audiowide text-2xl">
            Score: {user?.score}
          </div>
        </div>
        <div class="col-span-1 flex flex-col items-center">
          <h1
            class="text-[#ffffff] text-6xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
          >
            {user?.username}
          </h1>
        </div>
        <div class="col-span-1 flex flex-col items-end justify-center">
          <div class="text-[#ffffff] font-audiowide text-2xl opacity-0">
            Classement:
          </div>
        </div>
      </div>

      <div class="pt-4 flex flex-col items-center space-y-4">
        <div
          class="flex justify-center items-center h-[24vh] w-[24vh] mx-auto my-auto rounded-full overflow-hidden border-2 border-gray-300"
        >
          <UserAvatar avatarId={user?.avatarId} />
        </div>

        <button
          on:click={() => goto("/profile/personalProfil")}
          class="relative inline-flex items-center px-8 py-1 overflow-hidden text-md font-medium text-[#f7ed14] border-2 border-[#f7ed14] rounded-md hover:text-black group hover:bg-gray-50"
        >
          <span
            class="absolute left-0 block w-full h-0 transition-all bg-[#f7ed14] opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
          />
          <span
            class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 512 512"
            >
              <style>
                svg {
                  fill: #000000;
                }
              </style><path
                d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
              /></svg
            >
          </span>
          <span class="relative">Modify profile</span>
        </button>
      </div>
      <!-- <div class="my-4" /> -->

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
              <label>
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
              </label>
            </div>
          </div>
        </div>
      </label>

      {#if showHistory}
        <div class="flex-1 items-center overflow-auto h-full">
          {#if gameHistory.length === 0}
            <div class="flex items-center justify-center my-5">
              <div class="text-3xl">You have no game history yet!</div>
            </div>
          {:else}
            {#each gameHistory as game}
              {#if game.idPlayer1 !== user.id}
                {#await getUserById(game.idPlayer1) then user}
                  <div class="flex items-center justify-between my-5">
                    <div class="flex justify-center items-center">
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
          {#if user?.achievementChat}
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
          {#if user?.achievementAvatar}
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
          {#if user?.achievementPong}
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
      {:else if showFriends}
        <div class="flex-1 overflow-auto">
          <NewFriendModal bind:arr_friendList />
          {#if arr_friendList.length === 0}
            <div class="flex- items-center justify-center my-5">
              <div class="text-3xl">You have no friends yet</div>
            </div>
          {:else}
            {#each arr_friendList as friend}
              <div class="flex items-center justify-between my-5">
                <div class="flex justify-center items-center">
                  <div class="text-3xl">
                    {friend?.username}
                  </div>
                </div>
                <div class="">
                  <button
                    on:click={async () => {
                      await deleteFriend(friend?.id);
                      await getFriends();
                    }}
                    class="relative inline-flex items-center px-8 py-1 mr-2 overflow-hidden text-md font-medium text-red-600 border-2 border-red-600 rounded-md hover:text-black group hover:bg-gray-50"
                  >
                    <span
                      class="absolute left-0 block w-full h-0 transition-all bg-red-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
                    />
                    <span
                      class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
                    >
                      {">"}
                    </span>
                    <span class="relative"> Delete friend </span>
                  </button>
                  <button
                    on:click={() => {
                      isLogged = false;
                      goto(`/profile/${friend?.id}`);
                    }}
                    class="relative inline-flex items-center px-8 py-1 overflow-hidden text-md font-medium text-[#f7ed14] border-2 border-[#f7ed14] rounded-md hover:text-black group hover:bg-gray-50"
                  >
                    <span
                      class="absolute left-0 block w-full h-0 transition-all bg-[#f7ed14] opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
                    />
                    <span
                      class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
                    >
                      {">"}
                    </span>
                    <span class="relative">View profile </span>
                  </button>
                </div>
              </div>
            {/each}
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
