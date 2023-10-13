<script lang="ts">
  import API, { getMe } from "$lib/services/Api";
  import type { Socket } from "socket.io-client";
  // import { Modal, Content, Trigger } from "sv-popup";
  import Modal from "$lib/modal/Modal.svelte";
  import Content from "$lib/modal/Content.svelte";
  import Trigger from "$lib/modal/Trigger.svelte";
  import { onMount } from "svelte";
  import { blur, fade } from "svelte/transition";

  let b_isProtectedChannelModalClosed: boolean = true;
  let str_modalPrivChannelPassword: string = "";
  let prp_punishmentDetails: Sourcebans;

  let prp_user: User;

  export let socket: Socket;
  export let conversation: Channel;

  async function isUserPunished(user: ChannelUser, punishmentType: string) {
    let punishments;

    try {
      punishments = await API.get(
        `/chat/channel/${user.channelId}/getUser/${user.userId}/punishments`
      );
    } catch (err) {
      console.log(err);
      return false;
    }
    for (let punishment of punishments) {
      if (punishment.type === punishmentType) {
        prp_punishmentDetails = punishment;
        return true;
      }
    }
    prp_punishmentDetails = null;
    return false;
  }

  async function isActualUserInChannel(channel: Channel) {
    let channelUserList: ChannelUser[] = [];

    try {
      channelUserList = await API.get(`/chat/channel/${channel.id}/getUsers`);
    } catch (err) {
      console.log(err);
      return false;
    }
    for (let user of channelUserList)
      if (user.userId === prp_user?.id) return true;

    return false;
  }

  async function handleJoinChannel(channel: Channel) {
    // b_showChannelInfo = false;
    if (channel.type === "PRIVATE")
      if (!(await isActualUserInChannel(channel)))
        return alert(`You can't join the private channel \'${channel.name}\'.`);
    // } else if (channel.type === "PROTECTED")
    //   if (str_modalPrivChannelPassword !== channel.password)
    //     return alert(`Password incorrect.`);

    if (
      await isUserPunished(
        { channelId: channel.id, userId: prp_user.id },
        "ban"
      )
    )
      return alert(`You have been banned by the administrator ${
        prp_punishmentDetails?.adminUsername
      }.\n\n\ Reason of the ban: ${prp_punishmentDetails?.reason}\n\
      Date: ${prp_punishmentDetails?.createdAt}\n\
      Expire at: ${
        prp_punishmentDetails?.duration === 0
          ? "Never"
          : `${prp_punishmentDetails?.expireAt}`
      }\n\
      Duration: ${
        prp_punishmentDetails?.duration === 0
          ? "Permanent"
          : `${prp_punishmentDetails?.duration} minutes`
      }\n\n\
      Don't piss off the admins!`);

    // await resetChannelVariables();
    // prp_actualChannel = channel;
    // socket.emit("event_joinChannel", { channelId: channel.id });
    // b_isUserInChannel = true;
    // b_isProtectedChannelModalClosed = true;

    socket.emit("event_joinChannel", {
      password: str_modalPrivChannelPassword,
      channel: channel,
    });
  }

  onMount(async () => {
    prp_user = await getMe();
    // getChannels();
  });
</script>

<Modal small close={b_isProtectedChannelModalClosed}>
  <Content class=" text-black text-center ">
    <div class="content" transition:blur>
      <form>
        <!-- <div class="field my-3">
          <input
            required
            type="text"
            class="input"
            id="name"
            placeholder="Name"
            bind:value={str_modalChannelName}
          />
        </div> -->
        <!-- <div class="field mb-3">
          <input
            type="password"
            class="input"
            id="description"
            placeholder="Description"
            bind:value={str_modalChannelDescription}
          />
        </div> -->
        <div class="field" in:fade>
          <input
            type="password"
            class="input"
            id="description"
            placeholder="Password"
            autocomplete="off"
            bind:value={str_modalPrivChannelPassword}
          />
        </div>

        <button
          class="button"
          on:click={async () => {
            await handleJoinChannel(conversation);
            str_modalPrivChannelPassword = "";
            b_isProtectedChannelModalClosed = true;
          }}
          >Join channel
        </button>
      </form>
    </div>
  </Content>
  <Trigger>
    <button
      class="flex text-left pb-2"
      on:click={() => {
        (str_modalPrivChannelPassword = ""),
          (b_isProtectedChannelModalClosed = false);
      }}
    >
      <p class="text-grey-darkest">
        🔐 {conversation.name}
      </p>
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

  .field {
    height: 50px;
    width: 100%;
    display: flex;
    position: relative;
  }

  .field:nth-child(2) {
    margin-top: 20px;
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
