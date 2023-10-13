<script lang="ts">
  import { goto } from "$app/navigation";
  import API from "$lib/services/Api";
  import type { Socket } from "socket.io-client";
  // import { Modal, Content, Trigger } from "sv-popup";
  import Modal from "$lib/modal/Modal.svelte";
  import Content from "$lib/modal/Content.svelte";
  import Trigger from "$lib/modal/Trigger.svelte";
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import UserAvatar from "../../components/UserAvatar.svelte";

  let b_isUserListModalClosed: boolean = true;
  let b_isPunishmentDetailsShown: boolean = false;
  let prp_punishmentDetails: Sourcebans;

  let str_modalPunishmentType: string = "";
  let str_modalPunishmentReason: string = "";
  let str_modalPunishmentTime: string = "";

  export let socket: Socket;
  export let userInChannel: ChannelUser;
  export let prp_user: User;
  export let prp_actualChannel: Channel;
  export let prp_channelUser: ChannelUser;

  async function isUserIdBlocked(userId: number) {
    const blockedUserIds = prp_user?.blockedIds;

    if (blockedUserIds?.length === 0) return false;

    for (let id of blockedUserIds) if (id === userId) return true;

    return false;
  }

  async function isUserPunished(user: prp_ChannelUser, punishmentType: string) {
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

  function handlePunishment(userToPunish: ChannelUser) {
    let time = Number(str_modalPunishmentTime);

    if (time === null || time < 0) time = 0;

    if (str_modalPunishmentReason === "")
      str_modalPunishmentReason = "No reason given.";

    socket.emit("event_punishUser", {
      userId: userToPunish.userId,
      adminUsername: prp_channelUser.user?.username,
      type: str_modalPunishmentType,
      duration: time,
      reason: str_modalPunishmentReason,
      channelId: prp_actualChannel.id,
    });
    b_isUserListModalClosed = true;
  }

  function onKeyDown(key, submitType: string, userToPunish: ChannelUser) {
    // if (key.key !== "Enter") return;

    if (submitType === "punishment") {
      handlePunishment(userToPunish);
      b_isUserListModalClosed = true;
    }
  }

  onMount(async () => {
    if (prp_actualChannel.type === "CONVERSATION") {
      str_modalPunishmentType = "mute";
      b_isPunishmentDetailsShown = true;
    }
  });
</script>

<Modal small close={b_isUserListModalClosed}>
  <Content class=" text-black text-center ">
    {#if !b_isPunishmentDetailsShown}
      <div class="content">
        <div class="text mb-5">{userInChannel.user?.username}</div>
        <!-- <form> -->
        <button
          class="button"
          on:click={() => {
            goto(`/wsp/${userInChannel.userId}`);
          }}
          >Show user profile
        </button>
        <br />
        <br />
        {#await isUserIdBlocked(userInChannel.userId)}
          <button class="button">... </button>
        {:then isBlocked}
          {#if !isBlocked}
            <button
              class="button"
              on:click={() => {
                socket.emit("event_blockUser", {
                  userIdToBlock: userInChannel.userId,
                  channelId: prp_actualChannel.id,
                });
                // if (prp_actualChannel.type === "CONVERSATION")
                // resetChannelVariables();

                b_isUserListModalClosed = true;
              }}
              >Block user
            </button>
          {:else}
            <button
              class="button"
              on:click={() => {
                socket.emit("event_unblockUser", {
                  userIdToUnblock: userInChannel.userId,
                  channelId: prp_actualChannel.id,
                });
                b_isUserListModalClosed = true;
              }}
              >Unblock user
            </button>
          {/if}
        {/await}
        <button
          class="button"
          on:click={() => {
            socket.emit("event_createOrJoinConversation", {
              withUserId: userInChannel.userId,
            });
            b_isUserListModalClosed = true;
          }}
        >
          Send private message
        </button>

        {#if userInChannel?.user?.inChat}
          <button
            class="button"
            on:click={() => {
              socket.emit("event_sendInvitationToPlay", {
                toUser: userInChannel,
              });
            }}
          >
            Invite to play
          </button>
        {:else}
          <button class="button opacity-0"> Invite to play </button>
        {/if}

        {#if prp_channelUser.role !== "NORMAL" && userInChannel.role !== "OWNER"}
          <br />
          <br />
          <button
            class="button mt-10"
            on:click={() => {
              socket.emit("event_kickUserFromChannel", {
                user: userInChannel,
                channelId: prp_actualChannel.id,
              });
              b_isUserListModalClosed = true;
            }}
          >
            Kick user
          </button>
          {#await isUserPunished(userInChannel, "mute")}
            <br />
          {:then isUserMuted}
            {#if isUserMuted}
              <button
                class="button"
                on:click={() => {
                  socket.emit("event_unmuteUser", {
                    user: userInChannel,
                  });
                }}
              >
                Unmute
              </button>
            {:else}
              <button
                class="button"
                on:click={() => {
                  str_modalPunishmentType = "mute";
                  b_isPunishmentDetailsShown = true;
                }}
              >
                Mute
              </button>
            {/if}
          {/await}
          <button
            class="button"
            on:click={() => {
              str_modalPunishmentType = "ban";
              b_isPunishmentDetailsShown = true;
            }}
          >
            Ban
          </button>
        {/if}
        <br />
        <br />
        {#if prp_channelUser.role === "OWNER"}
          <button
            class="button"
            on:click={() => {
              socket.emit("event_changeAdminStatus", { user: userInChannel });
              b_isUserListModalClosed = true;
            }}
          >
            {#if userInChannel.role !== "ADMIN"}
              Set user admin
            {:else}
              Remove user from admins
            {/if}
          </button>
        {/if}
        <!-- </form> -->
      </div>
    {:else}
      <div class="content">
        <div class="text">Punishment</div>
        <div class="field my-3">
          <input
            required
            type="number"
            class="input"
            id="name"
            placeholder="{str_modalPunishmentType} duration"
            bind:value={str_modalPunishmentTime}
          />
        </div>
        <div class="field my-3">
          <input
            required
            type="text"
            class="input"
            id="name"
            placeholder="{str_modalPunishmentType} reason"
            bind:value={str_modalPunishmentReason}
          />
        </div>
        <div>
          <button
            class="button"
            on:click={() => {
              handlePunishment(userInChannel);
            }}
            >Submit
          </button>
        </div>
      </div>
    {/if}
  </Content>
  <!-- <Content class="text-black text-center">
    {#if !b_isPunishmentDetailsShown}
      <h2 class="text-xl">{userInChannel.user?.username}</h2>
      {#if userInChannel.role !== "NORMAL"}
        <h2 class="text-red-600 text-xs">{userInChannel.role}</h2>
      {/if}
      <div class="flex flex-col mt-5">
        {#await isUserIdBlocked(userInChannel.userId)}
          <p>Block user</p>
        {:then isBlocked}
          {#if !isBlocked}
            <button
              type="button"
              on:click={() => {
                socket.emit("event_blockUser", {
                  userIdToBlock: userInChannel.userId,
                  channelId: prp_actualChannel.id,
                });
                if (prp_actualChannel.type === "CONVERSATION")
                  resetChannelVariables();

                b_isUserListModalClosed = true;
              }}
            >
              Block user
            </button>
          {:else}
            <button
              type="button"
              on:click={() => {
                socket.emit("event_unblockUser", {
                  userIdToUnblock: userInChannel.userId,
                  channelId: prp_actualChannel.id,
                });
                b_isUserListModalClosed = true;
              }}
            >
              Unblock user
            </button>
          {/if}
        {/await}
        {#if prp_actualChannel.type !== "CONVERSATION"}
          {#await isUserIdBlocked(userInChannel.userId) then isBlocked}
            {#if !isBlocked}
              <button
                type="button"
                on:click={() => {
                  socket.emit("event_createOrJoinConversation", {
                    withUserId: userInChannel.userId,
                  });
                }}
              >
                Send private message
              </button>
            {:else}
              <p>Unblock to send private message</p>
            {/if}
          {/await}
        {/if}
        <button> Invite to play </button>

        <div class="flex flex-col mt-5">
          {#if prp_channelUser.role !== "NORMAL" && userInChannel.role !== "OWNER"}
            <button
              type="button"
              on:click={() => {
                socket.emit("event_kickUserFromChannel", {
                  user: userInChannel,
                  channelId: prp_actualChannel.id,
                });
              }}
            >
              Kick user❗
            </button>
            {#await isUserPunished(userInChannel, "mute")}
              <br />
            {:then isUserMuted}
              {#if isUserMuted}
                <button
                  type="button"
                  on:click={() => {
                    socket.emit("event_unmuteUser", {
                      user: userInChannel,
                    });
                  }}
                >
                  Unmute 🔊
                </button>
              {:else}
                <button
                  type="button"
                  on:click={() => {
                    str_modalPunishmentType = "mute";
                    b_isPunishmentDetailsShown = true;
                  }}
                >
                  Mute 🔇
                </button>
              {/if}
            {/await}
            <button
              type="button"
              on:click={() => {
                str_modalPunishmentType = "ban";
                b_isPunishmentDetailsShown = true;
              }}
            >
              Ban ⛔
            </button>
          {/if}

          {#if prp_channelUser.role === "OWNER"}
            <button
              type="button"
              class="mt-5"
              on:click={() => {
                socket.emit("event_changeAdminStatus", {
                  user: userInChannel,
                });
              }}
            >
              {#if userInChannel.role !== "ADMIN"}
                Set user admin
              {:else}
                Remove user from admins
              {/if}
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center">
        <input
          name="duration"
          class="border"
          type="number"
          bind:value={str_modalPunishmentTime}
          min="0"
          placeholder="{str_modalPunishmentType} duration"
        />

        <input
          name="reason"
          class="border"
          type="text"
          bind:value={str_modalPunishmentReason}
          on:keydown={(key) => {
            onKeyDown(key, "punishment", userInChannel);
          }}
          placeholder="{str_modalPunishmentType} reason"
        />

        <button
          type="button"
          class="mt-5"
          on:click={() => {
            handlePunishment(userInChannel);
          }}
        >
          Submit {str_modalPunishmentType}
        </button>
      </div>
    {/if}
  </Content> -->
  <Trigger>
    <button
      class="px-5 w-full flex items-center bg-grey-light cursor-pointer"
      on:click={() => {
        str_modalPunishmentTime = "";
        str_modalPunishmentReason = "";
        b_isUserListModalClosed = false;
        b_isPunishmentDetailsShown = false;
      }}
    >
      <div class="w-12 h-12">
        <UserAvatar avatarId={userInChannel?.user?.avatarId} />
      </div>

      <div class="ml-4 flex-1 border-grey-lighter py-4">
        <div class="flex items-bottom justify-between">
          {#await isUserIdBlocked(userInChannel.userId)}
            <div class="text-left">{userInChannel?.user?.username}</div>
          {:then isBlocked}
            {#if !isBlocked}
              <div class="text-left">{userInChannel?.user?.username}</div>
            {:else}
              <div class="text-left text-red-600">
                {userInChannel?.user?.username}
              </div>
            {/if}
            <div>
              {#if userInChannel?.user?.isLogged}
                {#if userInChannel?.user?.inGame}
                  <p class="text-orange-600 mt-1 text-sm">In Game</p>
                {:else if userInChannel?.user?.inChat}
                  <p class="text-green-600 mt-1 text-sm">In Chat</p>
                {:else}
                  <p class="text-green-300 mt-1 text-sm">Online</p>
                {/if}
              {:else}
                <p class="text-red-600 mt-1 text-sm">Disconnect</p>
              {/if}
            </div>
          {/await}
          <!-- <div class="text-left">
            {userInChannel?.user?.username}
          </div> -->
        </div>
      </div>
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
    margin: 5px 0;
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
