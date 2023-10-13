<script lang="ts">
  import type { Socket } from "socket.io-client";
  import { Modal, Content, Trigger } from "sv-popup";

  let b_isOwnerChannelModalClosed: boolean = true;
  let str_modalOwnerChannelName: string = "";
  let str_modalOwnerChannelDescription: string = "";
  let str_modalOwnerChannelPassword: string = "";

  export let socket: Socket;
  export let prp_actualChannel: Channel;

  function handleRemoveChannelComponent(component: string) {
    if (component === "description")
      socket.emit("event_changeChannelDescription", {
        description: null,
        channelId: prp_actualChannel.id,
      });
    else if (component === "password")
      socket.emit("event_changeChannelPassword", {
        password: null,
        channelId: prp_actualChannel.id,
      });
  }

  function onKeyDown(key, submitType: string) {
    if (key.key !== "Enter") return;

    if (submitType === "updateChannel") {
      if (str_modalOwnerChannelName !== "") {
        if (str_modalOwnerChannelName.trim().length !== 0) {
          socket.emit("event_changeChannelName", {
            name: str_modalOwnerChannelName,
            channelId: prp_actualChannel.id,
          });
          str_modalOwnerChannelName = "";
        } else
          alert(
            "Channel name must not be empty! (or containing only whitespaces)"
          );
      }
      if (str_modalOwnerChannelDescription !== "") {
        socket.emit("event_changeChannelDescription", {
          description: str_modalOwnerChannelDescription,
          channelId: prp_actualChannel.id,
        });
        str_modalOwnerChannelDescription = "";
      }
      if (str_modalOwnerChannelPassword !== "") {
        socket.emit("event_changeChannelPassword", {
          password: str_modalOwnerChannelPassword,
          channelId: prp_actualChannel.id,
        });
        str_modalOwnerChannelPassword = "";
      }
      b_isOwnerChannelModalClosed = true;
    }
  }

  function handleChangeChannelPrivateStatus() {
    socket.emit("event_changeChannelPrivateStatus", {
      status: prp_actualChannel.type === "PRIVATE" ? false : true,
      channelId: prp_actualChannel.id,
    });
  }
</script>

<Modal basic small close={b_isOwnerChannelModalClosed}>
  <Content class="text-black">
    <h2 class="text-xl pb-5 text-center">Owner Panel</h2>

    <div class="justify-center flex items-center pb-2">
      <button
        class="border-2 p-1 rounded-full"
        type="button"
        name="Toto"
        on:click={handleChangeChannelPrivateStatus}
      >
        {#if prp_actualChannel.type === "PRIVATE"}
          🔓
        {:else}
          🔒
        {/if}
      </button>
    </div>

    <input
      name="channel name"
      class="rounded-md text-black border border-black text-center mb-1 ml-16"
      type="text"
      placeholder="New channel name"
      bind:value={str_modalOwnerChannelName}
      on:keydown={(key) => {
        onKeyDown(key, "updateChannel");
      }}
    />

    <input
      name="channel description"
      class="rounded-md text-black border border-black text-center mb-1 ml-16"
      type="text"
      placeholder="New channel description"
      bind:value={str_modalOwnerChannelDescription}
      on:keydown={(key) => {
        onKeyDown(key, "updateChannel");
      }}
    />
    <button
      class="ml-1"
      type="button"
      on:click={() => {
        handleRemoveChannelComponent("description");
      }}
    >
      ❌
    </button>

    <input
      name="channel password"
      class="rounded-md text-black border border-black text-center ml-16"
      type="password"
      placeholder="New channel password"
      bind:value={str_modalOwnerChannelPassword}
      on:keydown={(key) => {
        onKeyDown(key, "updateChannel");
      }}
    />
    <button
      class="ml-1"
      type="button"
      on:click={() => {
        handleRemoveChannelComponent("password");
      }}
    >
      ❌
    </button>

    <div class="text-center">
      <button
        class="rounded-md mt-5"
        type="button"
        on:click={() => {
          onKeyDown({ key: "Enter" }, "updateChannel");
        }}
      >
        Update channel
      </button>
    </div>
  </Content>
  <Trigger>
    <button
      class="pr-3 items-center justify-center flex"
      on:click={() => {
        b_isOwnerChannelModalClosed = false;
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 512 512"
      >
        <style>
          svg {
            fill: #ffffff;
          }
        </style><path
          d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
        /></svg
      >
    </button>
  </Trigger>
</Modal>
