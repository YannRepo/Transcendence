<script lang="ts">
  import API, { getMe } from "$lib/services/Api";
  import { onMount } from "svelte";
  // import { Modal, Content, Trigger } from "sv-popup";
  import Modal from "$lib/modal/Modal.svelte";
  import Content from "$lib/modal/Content.svelte";
  import Trigger from "$lib/modal/Trigger.svelte";
  import type { Socket } from "socket.io-client";
  import { blur, fade } from "svelte/transition";

  let user: User[];
  let channels: Channel[];

  let str_modalChannelName: string = "";
  let str_modalChannelDescription: string | null = null;
  let str_modalChannelPassword: string = "";
  let str_modalChannelType: string = "PUBLIC";
  let b_isCreateChannelModalClosed: boolean = true;

  export let socket: Socket;

  async function getChannels() {
    try {
      const res = await API.get(`/chat/channel`);
      channels = res;
    } catch (err) {
      console.log(err);
    }
  }

  function isChannelNameAlreadyExists(name: string) {
    for (let channel of channels) if (channel.name === name) return true;

    return false;
  }

  async function handleCreateChannel() {
    if (
      str_modalChannelName === null ||
      str_modalChannelName.trim().length === 0
    )
      return alert("Channel name must not be empty!");

    str_modalChannelName = str_modalChannelName.trim();
    if (str_modalChannelName.length > 40)
      return alert("Channel name must not exceed 40 characters");

    if (isChannelNameAlreadyExists(str_modalChannelName))
      return alert(`Channel \'${str_modalChannelName}\'' already exists!`);

    if (
      str_modalChannelType === "PROTECTED" &&
      (str_modalChannelPassword === null ||
        str_modalChannelPassword.trim().length === 0)
    )
      return alert("Channel password must not be empty!");

    if (
      str_modalChannelDescription !== null &&
      str_modalChannelDescription.trim().length === 0
    )
      str_modalChannelDescription = null;

    if (str_modalChannelDescription !== null)
      str_modalChannelDescription = str_modalChannelDescription.trim();

    if (
      str_modalChannelDescription !== null &&
      str_modalChannelDescription.length > 100
    )
      return alert("Channel description must not exceed 100 characters.");

    socket.emit("event_createChannel", {
      name: str_modalChannelName,
      description:
        str_modalChannelDescription === "" ? null : str_modalChannelDescription,
      password:
        str_modalChannelPassword === "" ? null : str_modalChannelPassword,
      type: str_modalChannelType,
      userId: user.id,
    });
    getChannels();
    b_isCreateChannelModalClosed = true;
  }

  function onChange(event) {
    str_modalChannelType = event.currentTarget.value;
  }

  onMount(async () => {
    user = await getMe();
    getChannels();
  });
</script>

<Modal small close={b_isCreateChannelModalClosed}>
  <Content class=" text-black text-center ">
    <div class="content" transition:blur>
      <div class="text">New channel</div>
      <label>
        <div class="radio-inputs">
          <label>
            <input
              class="radio-input"
              type="radio"
              checked={str_modalChannelType === "PUBLIC"}
              on:change={onChange}
              name="channelType"
              value="PUBLIC"
            />
            <span class="radio-tile">
              <span class="radio-icon"> 🔓 </span>
              <span class="radio-label">Public</span>
            </span>
          </label>
          <label>
            <input
              class="radio-input"
              type="radio"
              checked={str_modalChannelType === "PROTECTED"}
              on:change={onChange}
              name="channelType"
              value="PROTECTED"
            />
            <span class="radio-tile">
              <span class="radio-icon"> 🔐 </span>
              <span class="radio-label">Protected</span>
            </span>
          </label>
          <label>
            <input
              class="radio-input"
              type="radio"
              checked={str_modalChannelType === "PRIVATE"}
              on:change={onChange}
              name="channelType"
              value="PRIVATE"
            />
            <span class="radio-tile">
              <span class="radio-icon"> 🚫 </span>
              <span class="radio-label">Private</span>
            </span>
          </label>
        </div>
      </label>
      <form>
        <div class="field my-3">
          <input
            required
            type="text"
            class="input"
            id="name"
            placeholder="Name"
            bind:value={str_modalChannelName}
          />
        </div>
        <div class="field mb-3">
          <input
            type="description"
            class="input"
            id="description"
            placeholder="Description"
            bind:value={str_modalChannelDescription}
          />
        </div>
        {#if str_modalChannelType === "PROTECTED"}
          <div class="field" in:fade>
            <input
              type="password"
              autocomplete="on"
              class="input"
              id="password"
              placeholder="Password"
              bind:value={str_modalChannelPassword}
            />
          </div>
        {:else}
          <div class="field opacity-0">
            <input
              type="password"
              autocomplete="on"
              class="input"
              id="password"
              placeholder="Password"
              bind:value={str_modalChannelPassword}
            />
          </div>
        {/if}
        <button
          class="button"
          on:click={async () => {
            await handleCreateChannel();
            str_modalChannelName = "";
            str_modalChannelDescription = null;
            str_modalChannelPassword = "";
            str_modalChannelType = "PUBLIC";
            b_isCreateChannelModalClosed = true;
          }}
          >Create channel
        </button>
      </form>
    </div>
  </Content>
  <Trigger>
    <button
      on:click={() => {
        getChannels();
        b_isCreateChannelModalClosed = false;
      }}
      class="relative inline-flex items-center px-6 py-1 overflow-hidden text-md font-medium text-yellow-300 border-2 border-yellow-300 rounded-md hover:text-black group hover:bg-gray-50"
    >
      <span
        class="absolute left-0 block w-full h-0 transition-all bg-yellow-300 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
      />
      <span
        class=" absolute right-0 flex items-center justify-start w-4 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
      >
        +
      </span>
      <span class="relative">New Channel</span>
    </button>
  </Trigger>
</Modal>

<style>
  .radio-inputs {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 350px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .radio-inputs > * {
    margin: 6px;
  }

  .radio-input:checked + .radio-tile {
    border-color: #2260ff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    color: #2260ff;
  }

  .radio-input:checked + .radio-tile:before {
    transform: scale(1);
    opacity: 1;
    background-color: #2260ff;
    border-color: #2260ff;
  }

  .radio-input:checked + .radio-tile .radio-label {
    color: #2260ff;
  }

  .radio-input:focus + .radio-tile {
    border-color: #2260ff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1), 0 0 0 4px #b5c9fc;
  }

  .radio-input:focus + .radio-tile:before {
    transform: scale(1);
    opacity: 1;
  }

  .radio-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90px;
    min-height: 80px;
    border-radius: 0.5rem;
    border: 2px solid #b5bfd9;
    background-color: #fff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    transition: 0.15s ease;
    cursor: pointer;
    position: relative;
  }

  .radio-tile:before {
    content: "";
    position: absolute;
    display: block;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid #b5bfd9;
    background-color: #fff;
    border-radius: 50%;
    top: 0.25rem;
    left: 0.25rem;
    opacity: 0;
    transform: scale(0);
    transition: 0.25s ease;
  }

  .radio-tile:hover {
    border-color: #2260ff;
  }

  .radio-tile:hover:before {
    transform: scale(1);
    opacity: 1;
  }

  .radio-label {
    color: #707070;
    transition: 0.375s ease;
    text-align: center;
    font-size: 13px;
  }

  .radio-input {
    clip: rect(0 0 0 0);
    -webkit-clip-path: inset(100%);
    clip-path: inset(100%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  /* ----------------------------------- */

  .content {
    width: full;
    padding: 40px 30px;
    background: #dde1e7;
    border-radius: 10px;
    border-width: 2px;
    border-color: #dde1e7;
    box-shadow: -3px -3px 20px #dde1e7, 2px 2px 20px #dde1e7;
  }

  .content .text {
    font-size: 33px;
    font-weight: 600;
    color: #595959;
  }

  .field {
    height: 50px;
    width: 100%;
    display: flex;
    position: relative;
  }

  .field .input {
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
  }

  .field .input:focus {
    box-shadow: inset 1px 1px 2px #babecc, inset -1px -1px 2px #ffffff73;
  }

  .button {
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
  }

  .button:focus {
    color: #3498db;
    box-shadow: inset 2px 2px 5px #babecc, inset -5px -5px 10px #ffffff73;
  }
</style>
