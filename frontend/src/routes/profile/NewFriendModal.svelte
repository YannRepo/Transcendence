<script lang="ts">
  import API from "$lib/services/Api";
  import Modal from "$lib/modal/Modal.svelte";
  import Content from "$lib/modal/Content.svelte";
  import Trigger from "$lib/modal/Trigger.svelte";
  import { onMount } from "svelte";
  import { blur, fade } from "svelte/transition";
  import UserAvatar from "../../components/UserAvatar.svelte";

  let isNewFriendModalClosed: boolean = true;
  let arr_nonFriendsList: User[];

  export let arr_friendList: User[];

  async function addFriend(id: string) {
    try {
      const res = await API.put(`/user/friends/addFriend`, {
        friendId: id,
      });
    } catch (err) {
      console.log("Error", err);
    }
  }

  async function getNonFriends() {
    try {
      arr_nonFriendsList = await API.get(`/user/friends/getNonFriends`);
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
    await getNonFriends();
    // console.log("arr_nonFriendsList", arr_nonFriendsList);
  });
</script>

<Modal small close={isNewFriendModalClosed}>
  <Content class=" text-black text-center ">
    <div class="content" transition:blur>
      {#if arr_nonFriendsList.length === 0}
        <p class="text-black text-2xl">No new friends to add</p>
      {:else}
        {#each arr_nonFriendsList as friend}
          <button
            class="px-3 w-full flex items-center bg-grey-light"
            on:click={async () => {
              await addFriend(friend?.id);
              await getNonFriends();
              await getFriends();
              isNewFriendModalClosed = true;
            }}
          >
            <div class="border-2 rounded-full border-black w-12 h-12">
              <UserAvatar avatarId={friend?.avatarId} />
            </div>

            <div class="ml-4 flex-1 py-4">
              <div class="flex items-bottom justify-between">
                <div class="text-left">
                  <p class="text-grey-darkest">
                    {friend?.username}
                  </p>
                </div>
              </div>
            </div>
          </button>
        {/each}
      {/if}
    </div>
  </Content>
  <Trigger>
    <button
      on:click={async () => {
        await getNonFriends();
        isNewFriendModalClosed = false;
      }}
      class="relative inline-flex items-center px-8 py-1 overflow-hidden text-md font-medium text-[#f7ed14] border-2 border-[#f7ed14] rounded-md hover:text-black group hover:bg-gray-50"
    >
      <span
        class="absolute left-0 block w-full h-0 transition-all bg-[#f7ed14] opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
      />
      <span
        class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
      >
        +
      </span>
      <span class="relative">Add new friends</span>
    </button>
  </Trigger>
</Modal>

<style>
  .content {
    width: full;
    padding: 40px 30px;
    background: #dde1e7;
    border-radius: 10px;
    border-width: 2px;
    border-color: #dde1e7;
    box-shadow: -3px -3px 20px #dde1e7, 2px 2px 20px #dde1e7;
  }

  /* .content .text {
    font-size: 33px;
    font-weight: 600;
    color: #595959;
  } */

  /* .field {
    height: 50px;
    width: 100%;
    display: flex;
    position: relative;
  } */

  /* .field:nth-child(2) {
    margin-top: 20px;
  } */

  /* .field .input {
    height: 100%;
    width: 100%;
    padding-left: 45px;
    padding-right: 45px;
    outline: none;
    border: none;
    font-size: 18px;
    background: #dde1e7;
    color: #595959;
    border-radius: 25px;
    box-shadow: inset 2px 2px 5px #babecc, inset -5px -5px 10px #ffffff73;
  } */

  /* .field .input:focus {
    box-shadow: inset 1px 1px 2px #babecc, inset -1px -1px 2px #ffffff73;
  } */

  /* .field .span {
    position: absolute;
    color: #595959;
    width: 50px;
    line-height: 55px;
  } */

  /* .field .label {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 45px;
    pointer-events: none;
    color: #666666;
  } */

  /* .field .input:valid ~ label {
    opacity: 0;
  } */

  /* .forgot-pass {
    text-align: left;
    margin: 10px 0 10px 5px;
  } */

  /* .forgot-pass a {
    font-size: 16px;
    color: #666666;
    text-decoration: none;
  } */

  /* .forgot-pass:hover a {
    text-decoration: underline;
  } */

  /* .button {
    margin: 15px 0;
    width: 100%;
    height: 50px;
    font-size: 18px;
    line-height: 50px;
    font-weight: 600;
    background: #dde1e7;
    border-radius: 25px;
    border: none;
    outline: none;
    cursor: pointer;
    color: #595959;
    box-shadow: 2px 2px 5px #babecc, -5px -5px 10px #ffffff73;
  } */

  /* .button:focus {
    color: #3498db;
    box-shadow: inset 2px 2px 5px #babecc, inset -5px -5px 10px #ffffff73;
  } */

  /* .sign-up {
    margin: 10px 0;
    color: #595959;
    font-size: 16px;
  } */

  /* .sign-up a {
    color: #3498db;
    text-decoration: none;
  } */

  /* .sign-up a:hover {
    text-decoration: underline;
  } */
</style>
