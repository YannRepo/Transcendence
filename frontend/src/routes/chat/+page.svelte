<script lang="ts">
  // @ts-nocheck
  import { goto } from "$app/navigation";
  import { logOut } from "$lib/services/Api";
  import io, { Socket } from "socket.io-client";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import API, { getMe } from "$lib/services/Api";
  // import { Modal, Content, Trigger} from "sv-popup";
  import Modal from "$lib/modal/Modal.svelte";
  import Content from "$lib/modal/Content.svelte";
  import Trigger from "$lib/modal/Trigger.svelte";
  import { PUBLIC_API_URL } from "$env/static/public";

  let socket: Socket;

  // User variables
  let prp_user: User = {};
  let prp_channelUser: ChannelUser = {};
  let prp_punishmentDetails: Sourcebans = {};

  // Channel variables
  let b_isUserInChannel: boolean = false;
  let prp_actualChannel: Channel = {};

  let arr_usersList: User[] = [];
  let arr_channelList: Channel[] = [];
  let arr_conversationList: Channel[] = [];

  // Modal Variables
  let str_modalChannelName: string = "";
  let str_modalChannelDescription: string = "";
  let str_modalChannelPassword: string = "";
  let str_modalChannelType: string = "";
  let b_isCreateChannelModalClosed: boolean = true;

  let prp_userToUnblock: User = {};
  let b_isCreateConversationModalClosed: boolean = true;

  let str_modalPrivChannelPassword: string = "";
  let b_isProtectedChannelModalClosed: boolean = true;

  let str_modalOwnerChannelName: string = "";
  let str_modalOwnerChannelDescription: string = "";
  let str_modalOwnerChannelPassword: string = "";
  let b_isOwnerChannelModalClosed: boolean = true;

  let str_modalPunishmentType: string = "";
  let str_modalPunishmentReason: string = "";
  let str_modalPunishmentTime: string = "";
  let b_isPunishmentDetailsShown: boolean = false;
  let b_isUserListModalClosed: boolean = true;

  let b_isUnblockModalClosed: boolean = true;

  // Chat variables
  let str_messageToSend: string = "";
  let arr_channelUsersList: ChannelUser[] = [];
  let arr_channelMessages: ChannelMessage[] = [];

  onMount(async () => {
    await goto("/");

    socket = io(PUBLIC_API_URL, {
      auth: {
        token: `Bearer ${localStorage.getItem(
          "access_token"
        )}, ${localStorage.getItem("refresh_token")}`,
        socketType: "chat",
      },
    });

    socket.on("refreshToken", async () => {
      await getMe();
    });

    socket.on("errorOmmited", (error: string) => {
      alert(`Error: ${error}`);
    });

    // Channel events
    socket.on("event_updateChannelList", () => {
      getChannelList();
    });
    socket.on("event_updateConversationList", async () => {
      prp_user = await getMe();
      getConversationList();
    });

    socket.on("event_joinChannel", (channel: Channel) => {
      handleJoinChannel(channel);
    });

    socket.on("event_disconnectChannel", () => {
      b_isUserInChannel = false;
      resetChannelVariables();
    });

    socket.on("event_updateChannel", async () => {
      if (!b_isUserInChannel) return;

      prp_user = await getMe();
      getChannelInfos();
      getChannelUserInfos();
      getChannelUserList();
    });

    socket.on(
      "event_getMessagesFromChannel",
      async (allMessages: ChannelMessage[]) => {
        prp_user = await getMe();
        arr_channelMessages = allMessages;
      }
    );

    socket.on("listenForMessage", (newMessage: ChannelMessage) => {
      arr_channelMessages.push(newMessage);
      arr_channelMessages = arr_channelMessages;
    });

    socket.on("kickedMessage", (adminUsername: string, channelId: string) => {
      if (b_isUserInChannel && prp_actualChannel.id !== channelId)
        return socket.emit("event_disconnectFromChannel", {
          channelId: channelId,
        });

      resetChannelVariables();
      alert(`You have been kicked from the channel by ${adminUsername}!`);
    });

    socket.on("banned", (banDetails, channelId: string) => {
      if (b_isUserInChannel && prp_actualChannel.id !== channelId)
        return socket.emit("event_disconnectFromChannel", {
          channelId: channelId,
        });

      resetChannelVariables();
      alert(`You have been banned from the channel by ${
        banDetails.adminUsername
      }!\n\n
Reason: ${banDetails.reason}
Duration: ${
        banDetails.duration === 0
          ? "Permanent"
          : `${banDetails.duration} minutes`
      }`);
    });

    socket.on("event_confirmJoinChannel", async (channel: Channel) => {
      await resetChannelVariables();
      prp_actualChannel = channel;
      b_isUserInChannel = true;
      b_isProtectedChannelModalClosed = true;
    });

    socket.on("event_invitationToPlay", (userId: number, socketId: string) => {
      socket.emit("event_acceptInvitationToPlay", {
        fromUserId: userId,
        fromSocket: socketId,
      });
    });

    socket.on("event_joinPong", () => {
      socket.disconnect();
      goto("/pong");
    });

    socket.on("event_achievementChatDone", () => {
      // console.log('5 messages sent. Well done! hahaha');
    });

    prp_user = await getMe();
    getChannelList();
    getConversationList();
  });

  async function getChannelList() {
    try {
      arr_channelList = await API.get(`/chat/channel`);
    } catch (err) {
      console.log("Error", err);
    }
  }

  async function getConversationList() {
    try {
      arr_conversationList = await API.get(
        `/chat/channel/conversations/${prp_user.id}`
      );
    } catch (err) {
      console.log("Error", err);
    }
  }

  async function getUsersList() {
    try {
      arr_usersList = await API.get(`/user/list`);
    } catch (err) {
      console.log("Error", err);
    }
  }

  function onChange(event) {
    str_modalChannelType = event.currentTarget.value;
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
      if (user.userId === prp_user.id) return true;

    return false;
  }

  function isChannelNameAlreadyExists(name: string) {
    for (let channel of arr_channelList) if (channel.name === name) return true;

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
      userId: prp_user.id,
    });
    b_isCreateChannelModalClosed = true;
  }

  async function handleJoinChannel(channel: Channel) {
    if (channel.type === "PRIVATE")
      if (!(await isActualUserInChannel(channel)))
        return alert(`You can't join the private channel \'${channel.name}\'.`);

    if (
      await isUserPunished(
        { channelId: channel.id, userId: prp_user.id },
        "ban"
      )
    )
      return alert(`You have been banned by the administrator ${
        prp_punishmentDetails.adminUsername
      }.\n\n\
Reason of the ban: ${prp_punishmentDetails.reason}\n\
Date: ${prp_punishmentDetails.createdAt}\n\
Expire at: ${
        prp_punishmentDetails.duration === 0
          ? "Never"
          : `${prp_punishmentDetails.expireAt}`
      }\n\
Duration: ${
        prp_punishmentDetails.duration === 0
          ? "Permanent"
          : `${prp_punishmentDetails.duration} minutes`
      }\n\n\
Don't piss off the admins!`);

    socket.emit("event_joinChannel", {
      password: str_modalPrivChannelPassword,
      channel: channel,
    });
  }

  async function handleDisconnectChannel(channelId: numbers) {
    socket.emit("event_disconnectFromChannel", {
      channelId: Number(channelId),
    });
  }

  async function getChannelInfos() {
    try {
      prp_actualChannel = await API.get(
        `/chat/channel/id/${prp_actualChannel.id}`
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function getChannelUserInfos() {
    try {
      prp_channelUser = await API.get(
        `/chat/channel/${prp_actualChannel.id}/getUser/${prp_user.id}`
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function getChannelUserList() {
    try {
      arr_channelUsersList = await API.get(
        `/chat/channel/${prp_actualChannel.id}/getUsers`
      );
    } catch (err) {
      console.log(err);
    }
  }

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

  async function handleSendNewMessage() {
    if (await isUserPunished(prp_channelUser, "mute")) {
      alert(`You have been muted by the administrator ${
        prp_punishmentDetails.adminUsername
      }.\n\n\
Reason of the mute: ${prp_punishmentDetails.reason}\n\
Date: ${prp_punishmentDetails.createdAt}\n\
Expire at: ${
        prp_punishmentDetails.duration === 0
          ? "Never"
          : `${prp_punishmentDetails.expireAt}`
      }\n\
Duration: ${
        prp_punishmentDetails.duration === 0
          ? "Permanent"
          : `${prp_punishmentDetails.duration} minutes`
      }\n\n\
Don't piss off the admins!`);
      return;
    }

    socket.emit("event_newMessage", {
      userId: Number(prp_user.id),
      channelId: Number(prp_actualChannel.id),
      message: str_messageToSend,
    });
    str_messageToSend = "";
  }

  async function resetChannelVariables() {
    b_isUserInChannel = false;
    str_messageToSend = "";
    prp_actualChannel = {};
    arr_channelMessages.splice(0, arr_channelMessages.length);
    arr_channelUsersList.splice(0, arr_channelUsersList.length);
  }

  function onKeyDown(key, submitType: string, userToPunish: ChannelUser) {
    if (key.key !== "Enter") return;

    if (submitType === "message") handleSendNewMessage();

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

    if (submitType === "punishment") {
      handlePunishment(userToPunish);
      b_isUserListModalClosed = true;
    }
  }

  function handleChangeChannelPrivateStatus() {
    socket.emit("event_changeChannelPrivateStatus", {
      status: prp_actualChannel.type === "PRIVATE" ? false : true,
      channelId: prp_actualChannel.id,
    });
  }

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

  async function isUserIdBlocked(userId: number) {
    const blockedUserIds = prp_user.blockedIds;

    if (blockedUserIds.length === 0) return false;

    for (let id of blockedUserIds) if (id === userId) return true;

    return false;
  }
</script>

<div class="sticky top-0 flex p-3 justify-between">
  <div>
    <button
      on:click={() => {
        goto("/");
        socket.disconnect();
      }}
    >
      <img src="/arrow-back.svg" alt="arrow-back" class="w-10 h-10" />
    </button>
  </div>
  <div class="text-right">
    <button on:click={() => logOut()}>
      <p class=" text-red-600 text-xl">Log out</p>
    </button>
  </div>
</div>

<div class="flex flex-row w-full p-14 h-screen">
  <!-- ####################
		Channel part
	#################### -->
  <div class="border w-auto p-5">
    <div class="text-center flex flex-col">
      <h2 class="text-2xl pb-5">CHANNELS</h2>
      <Modal basic small close={b_isCreateChannelModalClosed}>
        <Content class="text-black text-center flex flex-col items-center">
          <h2 class="text-xl pb-5">New channel</h2>

          <div class="pb-5">
            <label for="public">
              <input
                name="channelType"
                id="public"
                type="radio"
                checked={str_modalChannelType === "PUBLIC"}
                on:change={onChange}
                value="PUBLIC"
              />
              Public
            </label>
            <label for="protected">
              <input
                name="channelType"
                id="protected"
                type="radio"
                checked={str_modalChannelType === "PROTECTED"}
                on:change={onChange}
                value="PROTECTED"
              />
              Protected
            </label>
            <label for="private">
              <input
                name="channelType"
                id="private"
                type="radio"
                checked={str_modalChannelType === "PRIVATE"}
                on:change={onChange}
                value="PRIVATE"
              />
              Private
            </label>
          </div>

          <input
            class="border w-4/6"
            name="Channel name"
            bind:value={str_modalChannelName}
            placeholder="Channel name"
          />
          <input
            class="border w-4/6"
            name="Channel description"
            bind:value={str_modalChannelDescription}
            placeholder="Channel description"
          />
          {#if str_modalChannelType === "PROTECTED"}
            <input
              type="password"
              name="password"
              class="border w-4/6"
              bind:value={str_modalChannelPassword}
              placeholder="Channel password"
            />
          {/if}

          <button type="button" class="mt-5" on:click={handleCreateChannel}>
            Create channel
          </button>
        </Content>
        <Trigger>
          <button
            class="border border-transparent rounded-xl p-2 mb-2 text-black bg-white"
            on:click={() => {
              str_modalChannelName = "";
              str_modalChannelDescription = "";
              str_modalChannelPassword = "";
              str_modalChannelType = "PUBLIC";
              b_isCreateChannelModalClosed = false;
            }}
          >
            Create new channel
          </button>
        </Trigger>
      </Modal>
      <Modal basic small close={b_isCreateConversationModalClosed}>
        <Content class="text-black tet-center flex flex-col items-center">
          {#if b_isUnblockModalClosed}
            <h2 class="text-xl pb-5">Users list</h2>
            {#each arr_usersList as user}
              {#if user.id !== prp_user.id}
                {#await isUserIdBlocked(user.id) then isBlocked}
                  {#if isBlocked}
                    <button
                      class="mx-2 text-red-500"
                      on:click={() => {
                        b_isUnblockModalClosed = false;
                        prp_userToUnblock = user;
                      }}
                    >
                      {user.username}
                    </button>
                  {:else}
                    <button
                      class="mx-2"
                      on:click={() => {
                        b_isCreateConversationModalClosed = true;
                        socket.emit("event_createOrJoinConversation", {
                          withUserId: user.id,
                        });
                      }}
                    >
                      {user.username}
                    </button>
                  {/if}
                {/await}
              {/if}
            {/each}
          {:else}
            <p>{prp_userToUnblock.username} is actually blocked.</p>
            <p>Do you want to unblock him?</p>
            <div class="mt-5">
              <button
                type="button"
                class="border border-black rounded-lg p-1 text-green-500"
                on:click={() => {
                  socket.emit("event_unblockUser", {
                    userIdToUnblock: prp_userToUnblock.id,
                  });
                  socket.emit("event_createOrJoinConversation", {
                    withUserId: prp_userToUnblock.id,
                  });
                  b_isCreateConversationModalClosed = true;
                }}
              >
                Yes
              </button>
              <button
                type="button"
                class="border border-black rounded-lg p-1 text-red-500"
                on:click={() => {
                  b_isCreateConversationModalClosed = true;
                }}
              >
                No
              </button>
            </div>
          {/if}
        </Content>
        <Trigger>
          <button
            class="border border-transparent rounded-xl p-2 text-black bg-white"
            on:click={async () => {
              await getUsersList();
              b_isUnblockModalClosed = true;
              b_isCreateConversationModalClosed = false;
            }}
          >
            Send private message
          </button>
        </Trigger>
      </Modal>
    </div>

    {#if arr_conversationList.length !== 0}
      <div class="text-lg w-64 flex flex-col items-start mt-5">
        {#each arr_conversationList as conversation}
          {#if conversation.channelUsers.at(0).userId === prp_user.id}
            {#await isUserIdBlocked(conversation.channelUsers.at(1).userId) then isBlocked}
              {#if isBlocked}
                <Modal close={b_isUnblockModalClosed}>
                  <Content class="text-black">
                    <p>
                      {conversation.channelUsers.at(1).user?.username} is actually
                      blocked.
                    </p>
                    <p>Do you want to unblock him?</p>
                    <div class="mt-5">
                      <button
                        type="button"
                        class="border border-black rounded-lg p-1 text-green-500"
                        on:click={() => {
                          socket.emit("event_unblockUser", {
                            userIdToUnblock:
                              conversation.channelUsers.at(1).userId,
                            channelId: prp_actualChannel.id,
                          });
                          handleJoinChannel(conversation);
                          b_isUnblockModalClosed = true;
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        class="border border-black rounded-lg p-1 text-red-500"
                        on:click={() => {
                          b_isUnblockModalClosed = true;
                        }}
                      >
                        No
                      </button>
                    </div>
                  </Content>
                  <Trigger>
                    <button
                      type="button"
                      on:click={() => {
                        b_isUnblockModalClosed = false;
                      }}
                    >
                      <p>❗ {conversation.channelUsers.at(1).user?.username}</p>
                    </button>
                  </Trigger>
                </Modal>
              {:else}
                <button
                  on:click={() => {
                    handleJoinChannel(conversation);
                  }}
                >
                  <p>💬 {conversation.channelUsers.at(1).user?.username}</p>
                </button>
              {/if}
            {/await}
          {:else}
            {#await isUserIdBlocked(conversation.channelUsers.at(0).userId) then isBlocked}
              {#if isBlocked}
                <Modal basic small close={b_isUnblockModalClosed}>
                  <Content class="text-black text-center">
                    <p>
                      {conversation.channelUsers.at(0).user?.username} is actually
                      blocked.
                    </p>
                    <p>Do you want to unblock him?</p>
                    <div class="mt-5">
                      <button
                        type="button"
                        class="border border-black rounded-lg p-1 text-green-500"
                        on:click={() => {
                          socket.emit("event_unblockUser", {
                            userIdToUnblock:
                              conversation.channelUsers.at(0).userId,
                            channelId: prp_actualChannel.id,
                          });
                          handleJoinChannel(conversation);
                          b_isUnblockModalClosed = true;
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        class="border border-black rounded-lg p-1 text-red-500"
                        on:click={() => {
                          b_isUnblockModalClosed = true;
                        }}
                      >
                        No
                      </button>
                    </div>
                  </Content>
                  <Trigger>
                    <button
                      type="button"
                      on:click={() => {
                        b_isUnblockModalClosed = false;
                      }}
                    >
                      <p>❗ {conversation.channelUsers.at(0).user?.username}</p>
                    </button>
                  </Trigger>
                </Modal>
              {:else}
                <button
                  on:click={() => {
                    handleJoinChannel(conversation);
                  }}
                >
                  <p>💬 {conversation.channelUsers.at(0).user?.username}</p>
                </button>
              {/if}
            {/await}
          {/if}
        {/each}
      </div>
    {/if}

    <div class="mt-8 text-lg w-64">
      {#each arr_channelList as channel}
        {#if channel.type === "PUBLIC" || channel.type === "PRIVATE"}
          <button
            class="flex text-left pb-2"
            on:click={() => {
              handleJoinChannel(channel);
            }}
          >
            {#if channel.type === "PUBLIC"}
              <p>🔓</p>
            {:else}
              <p>🚫</p>
            {/if}
            <p class="pl-2">{channel.name}</p>
          </button>
        {:else if channel.name !== prp_actualChannel.name}
          <Modal basic small close={b_isProtectedChannelModalClosed}>
            <Content class="text-black text-center flex flex-col items-center">
              <h2 class="text-xl pb-5">Enter the password of the channel</h2>

              <input
                name="password"
                class="border w-4/6"
                type="password"
                bind:value={str_modalPrivChannelPassword}
                placeholder="Password"
              />

              <button
                type="button"
                class="mt-5"
                on:click={() => {
                  handleJoinChannel(channel);
                }}
              >
                Join channel
              </button>
            </Content>
            <Trigger>
              <button
                class="flex text-left pb-2"
                on:click={() => {
                  (str_modalPrivChannelPassword = ""),
                    (b_isProtectedChannelModalClosed = false);
                }}
              >
                <p>🔐</p>
                <p class="pl-2">{channel.name}</p>
              </button>
            </Trigger>
          </Modal>
        {:else}
          <button class="flex text-left pb-2">
            <p>🔐</p>
            <p class="pl-2">{channel.name}</p>
          </button>
        {/if}
      {/each}
    </div>
  </div>

  <!-- ####################
		Chat part
	#################### -->
  <div class="border w-4/6 text-center flex-1 pt-5">
    {#if b_isUserInChannel}
      <div class="text-right pr-5">
        <!-- Settings for owner (managment of the channel as name, password...) -->
        {#if prp_channelUser.role === "OWNER"}
          <button
            class="border-2 p-1 rounded-l-md"
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
          <Modal basic small close={b_isOwnerChannelModalClosed}>
            <Content class="text-black">
              <h2 class="text-xl pb-5 text-center">Owner Panel</h2>

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
                class="border-2 p-1 rounded-r-md"
                on:click={() => {
                  b_isOwnerChannelModalClosed = false;
                }}
              >
                ⚙️
              </button>
            </Trigger>
          </Modal>
        {/if}

        {#if prp_actualChannel.type !== "CONVERSATION"}
          <button
            class="text-red-600 border-2 w-40 p-1 rounded-md"
            type="button"
            on:click={() => {
              handleDisconnectChannel(prp_actualChannel.id);
            }}
          >
            Disconnect
          </button>
        {/if}
      </div>

      {#if prp_actualChannel.type === "CONVERSATION"}
        <div class="mb-12 mt-5">
          {#if prp_actualChannel.channelUsers.at(0).userId === prp_user.id}
            <h2 class="text-3xl">
              Conversation with {prp_actualChannel.channelUsers.at(1).user
                ?.username}
            </h2>
          {:else}
            <h2 class="text-3xl">
              Conversation with {prp_actualChannel.channelUsers.at(0).user
                ?.username}
            </h2>
          {/if}
        </div>
      {:else}
        <div class="mt-5">
          {#if prp_actualChannel.description !== null && String(prp_actualChannel.description).length > 0}
            <h2 class="text-3xl">{prp_actualChannel.name}</h2>
          {:else}
            <h2 class="mb-12 text-5xl">{prp_actualChannel.name}</h2>
          {/if}
          {#if prp_actualChannel.description !== null && String(prp_actualChannel.description).length > 0}
            <h3 class="mb-12 text-xl">{prp_actualChannel.description}</h3>
          {/if}
        </div>
      {/if}

      {#each arr_channelMessages as message}
        <div transition:fade>
          {#if message.fromUserId !== prp_user?.id}
            {#await isUserIdBlocked(message.fromUserId) then isBlocked}
              {#if !isBlocked}
                <p
                  class="bg-yellow-400 rounded-xl rounded-bl-none p-2 mt-2"
                  transition:fade
                >
                  {message.fromUser.username}: {message.message}
                </p>
              {:else}
                <p
                  class="bg-gray-500 rounded-xl rounded-bl-none p-2 mt-2"
                  transition:fade
                >
                  {message.fromUser.username}: User blocked, you can't see his
                  messages.
                </p>
              {/if}
            {/await}
          {:else}
            <p
              class="bg-purple-400 rounded-xl rounded-br-none p-2 mt-2"
              transition:fade
            >
              {message.message}
            </p>
          {/if}
        </div>
      {/each}

      <input
        name="message"
        class="rounded-md text-black mt-2 pl-1"
        type="text"
        bind:value={str_messageToSend}
        placeholder="Your message"
        on:keydown={(key) => {
          onKeyDown(key, "message");
        }}
      />
      <button class="pl-2" type="button" on:click={handleSendNewMessage}>
        Send
      </button>
    {/if}
  </div>

  <!-- ####################
		Users part
	#################### -->
  <div class="border w-1/6 p-5 flex flex-col">
    {#if b_isUserInChannel}
      <h2 class="text-2xl pb-5 text-center">USERS</h2>
      {#each arr_channelUsersList as userInChannel}
        {#if prp_user.id !== userInChannel.userId}
          <Modal basic small close={b_isUserListModalClosed}>
            <Content class="text-black text-center">
              {#if !b_isPunishmentDetailsShown}
                <h2 class="text-xl">{userInChannel.user.username}</h2>
                {#if userInChannel.role !== "NORMAL"}
                  <h2 class="text-red-600 text-xs">{userInChannel.role}</h2>
                {/if}
                <div class="flex flex-col mt-5">
                  <button> Show profile </button>
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
                  <button
                    type="button"
                    on:click={() => {
                      socket.emit("event_sendInvitationToPlay", {
                        toUser: userInChannel,
                      });
                    }}
                  >
                    Invite to play
                  </button>

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
            </Content>
            <Trigger>
              <button
                on:click={() => {
                  str_modalPunishmentTime = "";
                  str_modalPunishmentReason = "";
                  b_isUserListModalClosed = false;
                  b_isPunishmentDetailsShown = false;
                }}
              >
                {userInChannel.user?.username}
              </button>
            </Trigger>
          </Modal>
        {/if}
      {/each}
    {/if}
  </div>
</div>
