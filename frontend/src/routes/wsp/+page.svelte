<script lang="ts">
  import { goto } from "$app/navigation";
  import { getUserById, logOut } from "$lib/services/Api";
  import API, { getMe } from "$lib/services/Api";
  import { afterUpdate, onMount, tick } from "svelte";
  import { DateTime } from "luxon";
  import { io, type Socket } from "socket.io-client";
  import { fade } from "svelte/transition";
  import NewChannel from "./NewChannel.svelte";
  import NewPrivateMessage from "./NewPrivateMessage.svelte";
  import UserOptions from "./UserOptions.svelte";
  import ChannelPasswordModal from "./ChannelPasswordModal.svelte";
  import ModalSvelte from "../../lib/modal/ModalSvelte.svelte";
  import AchievementChatModal from "./AchievementChatModal.svelte";
  import UserAvatar from "../../components/UserAvatar.svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  // import { DateTime } from "luxon/build/node/luxon";

  let socket: Socket;

  let arr_channelConversationList: Channel[] = [];
  let arr_privateConversationList: Channel[] = [];
  let arr_allConversationList: Channel[] = [];

  // // User variables
  let prp_user: User = null;
  let prp_channelUser: ChannelUser;
  let prp_punishmentDetails: Sourcebans;

  // // Channel variables
  let b_isUserInChannel: boolean = false;
  let prp_actualChannel: Channel | null = null;

  let str_modalPrivChannelPassword: string = "";
  let b_isProtectedChannelModalClosed: boolean = true;

  let str_modalOwnerChannelName: string = "";
  let str_modalOwnerChannelDescription: string = "";
  let str_modalOwnerChannelPassword: string = "";
  let b_isOwnerChannelModalClosed: boolean = true;

  let str_modalPunishmentType: string = "";
  let str_modalPunishmentReason: string = "";
  let b_isUserListModalClosed: boolean = true;
  let b_showChannelInfo: boolean = false;

  // let b_isUnblockModalClosed: boolean = true;

  // // Chat variables
  let str_messageToSend: string = "";
  let arr_channelUsersList: ChannelUser[] = [];
  let arr_channelMessages: ChannelMessage[] = [];

  let element;
  let isLogged = false;

  let showPongInviteModal = false;
  let invitedUserId;
  let invitedSocketId;
  let invitedUser: User;

  let showAchievementChatModal = false;

  async function getChannelConversationList() {
    try {
      arr_channelConversationList = await API.get(`/chat/channel`);
    } catch (err) {
      console.log("Error", err);
    }
  }

  async function getPrivateConversationList() {
    try {
      arr_privateConversationList = await API.get(
        `/chat/channel/conversations/${prp_user?.id}`
      );
    } catch (err) {
      console.log("Error", err);
    }
  }

  async function getAllConversationList() {
    await getChannelConversationList();
    await getPrivateConversationList();
    arr_allConversationList = [
      ...arr_channelConversationList,
      ...arr_privateConversationList,
    ];
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

  // async function resetChannelVariables() {
  //   b_isUserInChannel = false;
  //   str_messageToSend = "";
  //   prp_actualChannel = null;
  //   arr_channelMessages = null;
  //   arr_channelUsersList = null;
  //   // arr_channelMessages.splice(0, arr_channelMessages.length);
  //   // arr_channelUsersList.splice(0, arr_channelUsersList.length);
  // }

  async function resetChannelVariables() {
    b_isUserInChannel = false;
    str_messageToSend = "";
    prp_actualChannel = null;
    arr_channelMessages.splice(0, arr_channelMessages.length);
    arr_channelUsersList.splice(0, arr_channelUsersList.length);
    b_showChannelInfo = false;
  }

  async function handleJoinChannel(channel: Channel) {
    b_showChannelInfo = false;
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

  // cheack why it removes the input
  async function getChannelInfos() {
    try {
      prp_actualChannel = await API.get(
        `/chat/channel/id/${prp_actualChannel?.id}`
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function getChannelUserList() {
    try {
      arr_channelUsersList = await API.get(
        `/chat/channel/${prp_actualChannel?.id}/getUsers`
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function getChannelUserInfos() {
    try {
      prp_channelUser = await API.get(
        `/chat/channel/${prp_actualChannel?.id}/getUser/${prp_user?.id}`
      );
    } catch (err) {
      console.log(err);
    }
  }

  // async function getUsersList() {
  //   try {
  //     arr_usersList = await API.get(`/user/list`);
  //   } catch (err) {
  //     console.log("Error", err);
  //   }
  // }

  async function isUserIdBlocked(userId: number) {
    const blockedUserIds = prp_user?.blockedIds;

    if (blockedUserIds?.length === 0) return false;

    for (let id of blockedUserIds) if (id === userId) return true;

    return false;
  }

  async function handleSendNewMessage() {
    if (str_messageToSend.trim().length === 0) return;
    if (await isUserPunished(prp_channelUser, "mute")) {
      alert(
        `You have been muted by the administrator ${
          prp_punishmentDetails?.adminUsername
        }.\n\n\ Reason of the mute: ${prp_punishmentDetails?.reason}\n\ Date: ${
          prp_punishmentDetails?.createdAt
        }\n\ Expire at: ${
          prp_punishmentDetails?.duration === 0
            ? "Never"
            : `${prp_punishmentDetails?.expireAt}`
        }\n\ Duration: ${
          prp_punishmentDetails?.duration === 0
            ? "Permanent"
            : `${prp_punishmentDetails?.duration} minutes`
        }\n\n\ Don't piss off the admins!`
      );
      return;
    }

    socket.emit("event_newMessage", {
      userId: Number(prp_user?.id),
      channelId: Number(prp_actualChannel?.id),
      message: str_messageToSend,
    });
    str_messageToSend = "";
  }

  // function handlePunishment(userToPunish) {
  //   let time = Number(str_modalPunishmentTime);

  //   if (time === null || time < 0) time = 0;

  //   if (str_modalPunishmentReason === "")
  //     str_modalPunishmentReason = "No reason given.";

  //   socket.emit("event_punishUser", {
  //     userId: userToPunish.userId,
  //     adminUsername: prp_channelUser.username,
  //     type: str_modalPunishmentType,
  //     duration: time,
  //     reason: str_modalPunishmentReason,
  //     channelId: prp_actualChannel.id,
  //   });
  //   b_isUserListModalClosed = true;
  // }

  async function handleDisconnectChannel(channelId: numbers) {
    b_isUserInChannel = false;
    socket.emit("event_disconnectFromChannel", {
      channelId: Number(channelId),
    });
    // resetChannelVariables();
  }

  function onKeyDown(key, submitType: string, userToPunish: ChannelUser) {
    if (key.key !== "Enter") return;

    if (submitType === "message") handleSendNewMessage();

    if (submitType === "updateChannel") {
      if (str_modalOwnerChannelName !== "") {
        if (str_modalOwnerChannelName.trim().length !== 0) {
          socket.emit("event_changeChannelName", {
            name: str_modalOwnerChannelName,
            channelId: prp_actualChannel?.id,
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
          channelId: prp_actualChannel?.id,
        });
        str_modalOwnerChannelDescription = "";
      }
      if (str_modalOwnerChannelPassword !== "") {
        socket.emit("event_changeChannelPassword", {
          password: str_modalOwnerChannelPassword,
          channelId: prp_actualChannel?.id,
        });
        str_modalOwnerChannelPassword = "";
      }
      b_isOwnerChannelModalClosed = true;
    }

    // if (submitType === "punishment") {
    //   handlePunishment(userToPunish);
    //   b_isUserListModalClosed = true;
    // }
  }

  function handleChangeChannelPrivateStatus() {
    socket.emit("event_changeChannelPrivateStatus", {
      status: prp_actualChannel?.type === "PRIVATE" ? false : true,
      channelId: prp_actualChannel?.id,
    });
  }

  function handleRemoveChannelComponent(component: string) {
    if (component === "description")
      socket.emit("event_changeChannelDescription", {
        description: null,
        channelId: prp_actualChannel?.id,
      });
    else if (component === "password")
      socket.emit("event_changeChannelPassword", {
        password: null,
        channelId: prp_actualChannel?.id,
      });
  }

  afterUpdate(() => {
    if (arr_channelMessages) scrollToBottom(element);
  });

  $: if (arr_channelMessages && element) {
    scrollToBottom(element);
  }

  const scrollToBottom = async (node) => {
    if (!node) return;
    await tick();
    node.scroll({ top: node.scrollHeight, behavior: "auto" });
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onMount(async () => {
    try {
      let user = await getMe();
      if (user) isLogged = true;
      else goto("/auth");
    } catch (error) {
      console.log(error);
    }

    socket = io(PUBLIC_API_URL, {
      auth: {
        token: `Bearer ${localStorage.getItem(
          "access_token"
        )}, ${localStorage.getItem("refresh_token")}`,
        socketType: "chat",
      },
    });

    // socket.on("refreshToken", async () => {
    //   console.log("refreshToken");
    //   // await getMe();
    // });

    socket.on("errorOmmited", (error: string) => {
      // console.log("errorOmmited", error);
      alert(`Error: ${error}`);
    });

    // Channel events
    socket.on("event_updateChannelList", async () => {
      // console.log("event_updateChannelList");
      await getAllConversationList();
    });

    socket.on("event_updateConversationList", async () => {
      // console.log("event_updateConversationList");
      prp_user = await getMe();
      await getAllConversationList();
    });

    socket.on("event_joinChannel", (channel: Channel) => {
      // console.log("event_joinChannel");
      // str_modalPrivChannelPassword = channel.password;
      handleJoinChannel(channel);
    });

    socket.on("event_disconnectChannel", () => {
      // console.log("event_disconnectChannel");
      b_isUserInChannel = false;
      resetChannelVariables();
    });

    // Chat events
    socket.on("event_updateChannel", async () => {
      // console.log("event_updateChannel");
      if (!b_isUserInChannel) return;

      prp_user = await getMe();
      getChannelInfos();
      getChannelUserInfos();
      getChannelUserList();
      await getAllConversationList();
    });

    socket.on(
      "event_getMessagesFromChannel",
      async (allMessages: ChannelMessage[]) => {
        // console.log("event_getMessagesFromChannel");
        prp_user = await getMe();
        arr_channelMessages = allMessages;
      }
    );

    socket.on("listenForMessage", (newMessage: ChannelMessage) => {
      // console.log("listenForMessage");
      arr_channelMessages?.push(newMessage);
      arr_channelMessages = arr_channelMessages;
    });

    socket.on("kickedMessage", (adminUsername: string, channelId: string) => {
      // console.log("kickedMessage");
      if (b_isUserInChannel && prp_actualChannel?.id !== channelId)
        return socket.emit("event_disconnectFromChannel", {
          channelId: channelId,
        });
      resetChannelVariables();
      alert(`You have been kicked from the channel by ${adminUsername}!`);
    });

    socket.on("banned", (banDetails, channelId: string) => {
      // console.log("banned");
      if (b_isUserInChannel && prp_actualChannel?.id !== channelId)
        return socket.emit("event_disconnectFromChannel", {
          channelId: channelId,
        });

      resetChannelVariables();

      alert(`You have been banned from the channel by ${
        banDetails.adminUsername
      }!\n\n
    Reason: ${banDetails.reason}
    Duration: ${
      banDetails.duration === 0 ? "Permanent" : `${banDetails.duration} minutes`
    }`);
    });

    socket.on("event_confirmJoinChannel", async (channel: Channel) => {
      // console.log("event_confirmJoinChannel");
      await resetChannelVariables();
      prp_actualChannel = channel;
      b_isUserInChannel = true;
      b_isProtectedChannelModalClosed = true;
    });

    socket.on(
      "event_invitationToPlay",
      async (userId: number, socketId: string) => {
        // console.log("event_invitationToPlay");
        invitedUserId = userId;
        invitedSocketId = socketId;
        // console.log(invitedUserId, invitedSocketId);
        invitedUser = await getUserById(invitedUserId);
        // invitedUser = null;
        // console.log(invitedUser);
        showPongInviteModal = true;
        // socket.emit("event_acceptInvitationToPlay", {
        //   fromUserId: invitedUserId,
        //   fromSocket: invitedSocketId,
        // });
        // socket.emit("event_acceptInvitationToPlay", {
        //   fromUserId: userId,
        //   fromSocket: socketId,
        // });
      }
    );

    socket.on("event_joinPong", () => {
      // console.log("event_joinPong");
      socket.disconnect();
      goto("/pong");
    });

    socket.on("event_achievementChatDone", () => {
      // console.log("5 messages sent. Well done! hahaha");
      showAchievementChatModal = true;
    });

    prp_user = await getMe();
    await getAllConversationList();
    // getUsersList();
  });
</script>

{#if isLogged}
  <div class="sticky top-0 flex p-3 justify-between">
    <div>
      <button
        on:click={() => {
          socket.disconnect();
          goto("/");
        }}
      >
        <img src="/arrow-back.svg" alt="arrow-back" class="w-10 h-10" />
      </button>
    </div>
    <div class="text-right">
      <button
        on:click={() => {
          socket.disconnect();
          logOut();
        }}
      >
        <p class=" text-red-600 text-xl">Log out</p>
      </button>
    </div>
  </div>

  <!-- component -->
  <div>
    <div class="w-full h-24" />

    <div class="container mx-auto" style="margin-top: -128px;">
      <div class="py-6 h-[95vh]">
        <!-- <div
          class="w-2/3 h-[86vh] mx-auto rounded-[18px] p-8 border-2 border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md"
          style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
          > -->
        <div
          class="flex border-2 border-grey h-full rounded-[18px] border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md
          "
          style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
        >
          <!-- <div
          class="flex border-2 border-grey rounded-3xl h-full bg-black bg-opacity-50 border-[rgb(59,130,246,30%)] border-opacity-20 shadow [box-shadow:_0px_0px_40px_10px_rgb(59_130_246_/_50%)]
          "
        > -->
          <!-- Left -->
          <div class="w-1/3 flex flex-col">
            <!-- Header -->
            <div
              class="pb-5 mt-3 py-2 px-3 bg-grey-lighter flex flex-row items-center justify-center border-b-2 border-[rgb(59,130,246,50%)]"
            >
              <div class="text-center">
                <div class="text-4xl">Messages</div>
                <div class="py-2 opacity-50">
                  Converstions ({arr_allConversationList.length})
                </div>
                <div class="flex flex-wrap justify-center">
                  <div class="p-3">
                    <NewChannel {socket} />
                  </div>
                  <div class="p-3">
                    <NewPrivateMessage {socket} {prp_user} />
                  </div>
                </div>
              </div>
            </div>

            <!-- class="px-3 w-full flex items-center" + (conversation ===
            prp_actualChannel)
              ? 'bg-green-400'
              : 'bg-red-400'} -->
            <!-- Chat -->
            <!-- class="px-3 w-full flex items-center" -->
            <div class=" flex-1 overflow-auto">
              {#each arr_allConversationList as conversation}
                <button
                  class={conversation?.id !== prp_actualChannel?.id
                    ? " px-3 w-full flex items-center hover:bg-[#3b82f6] hover:bg-opacity-20"
                    : "bg-[#3b82f6] bg-opacity-30 px-3 w-full flex items-center"}
                  on:click={() => {
                    if (conversation.type !== "PROTECTED")
                      handleJoinChannel(conversation);
                  }}
                >
                  {#if conversation.type === "CONVERSATION"}
                    <div
                      class="flex border-2 rounded-full w-12 h-12 items-center justify-center"
                    >
                      {#if conversation.channelUsers[0].userId !== prp_user?.id}
                        <UserAvatar
                          avatarId={conversation.channelUsers[0].user?.avatarId}
                        />
                      {:else}
                        <UserAvatar
                          avatarId={conversation.channelUsers[1].user?.avatarId}
                        />
                      {/if}
                    </div>
                  {:else}
                    <div
                      class="flex border-2 rounded-full w-12 h-12 items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 640 512"
                      >
                        <style>
                          svg {
                            fill: #ffffff;
                          }
                        </style><path
                          d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112h32c24 0 46.2 7.5 64.4 20.3zM448 416V394.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176h32c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2V416c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3V261.7c-10 11.3-16 26.1-16 42.3zm144-42.3v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z"
                        /></svg
                      >
                    </div>
                  {/if}

                  <div class="ml-4 flex-1 py-4">
                    <div class="flex items-bottom justify-between">
                      <div class="text-left">
                        {#if conversation.type === "CONVERSATION"}
                          <p class="text-grey-darkest">
                            {#if conversation.channelUsers[0].userId !== prp_user?.id}
                              {#await isUserIdBlocked(conversation.channelUsers.at(0).userId) then isBlocked}
                                {#if isBlocked}
                                  ❗ {conversation.channelUsers[0].user
                                    ?.username}
                                {:else}
                                  💬 {conversation.channelUsers[0].user
                                    ?.username}
                                {/if}
                              {/await}
                            {:else}
                              {#await isUserIdBlocked(conversation.channelUsers.at(1).userId) then isBlocked}
                                {#if isBlocked}
                                  ❗ {conversation.channelUsers[1].user
                                    ?.username}
                                {:else}
                                  💬 {conversation.channelUsers[1].user
                                    ?.username}
                                {/if}
                              {/await}
                            {/if}
                          </p>
                        {:else if conversation.type === "PUBLIC"}
                          <p class="text-grey-darkest">
                            🔓 {conversation.name}
                          </p>
                        {:else if conversation.type === "PROTECTED"}
                          <ChannelPasswordModal {socket} {conversation} />
                        {:else}
                          <p class="text-grey-darkest">
                            🚫 {conversation.name}
                          </p>
                        {/if}
                        {#if conversation.type !== "CONVERSATION"}
                          {#if conversation.description !== null}
                            <p class="text-[#AE6AF2] mt-1 text-sm">
                              {conversation.description}
                            </p>
                          {:else}
                            <p class="text-[#AE6AF2] mt-1 text-sm opacity-0">
                              .
                            </p>
                          {/if}
                        {:else if conversation.type === "CONVERSATION"}
                          {#if conversation.channelUsers[0].userId !== prp_user?.id}
                            {#if conversation.channelUsers[0].user?.isLogged}
                              {#if conversation.channelUsers[0].user?.inGame}
                                <p class="text-orange-600 mt-1 text-sm">
                                  In Game
                                </p>
                              {:else if conversation.channelUsers[0].user?.inChat}
                                <p class="text-green-600 mt-1 text-sm">
                                  In Chat
                                </p>
                              {:else}
                                <p class="text-green-300 mt-1 text-sm">
                                  Online
                                </p>
                              {/if}
                            {:else}
                              <p class="text-red-600 mt-1 text-sm">
                                Disconnected
                              </p>
                            {/if}
                          {:else if conversation.channelUsers[0].userId === prp_user?.id}
                            {#if conversation.channelUsers[1].user?.isLogged}
                              {#if conversation.channelUsers[1].user?.inGame}
                                <p class="text-orange-600 mt-1 text-sm">
                                  In Game
                                </p>
                              {:else if conversation.channelUsers[1].user?.inChat}
                                <p class="text-green-600 mt-1 text-sm">
                                  In Chat
                                </p>
                              {:else}
                                <p class="text-green-300 mt-1 text-sm">
                                  Online
                                </p>
                              {/if}
                            {:else}
                              <p class="text-red-600 mt-1 text-sm">
                                Disconnected
                              </p>
                            {/if}
                          {/if}
                        {/if}
                      </div>
                      <!-- <div class="text-left">
                        <p class="text-xs text-grey-darkest opacity-0">
                          {DateTime.fromISO(conversation.updatedAt).toFormat(
                            "hh:mm"
                          )}
                        </p>
                        <p class=" opacity-0">.</p>
                      </div> -->
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Right -->
          {#if prp_actualChannel && !b_showChannelInfo}
            {#if prp_actualChannel.type === "CONVERSATION"}
              {#if prp_actualChannel.channelUsers[0].userId !== prp_user?.id}
                {#await isUserIdBlocked(prp_actualChannel.channelUsers.at(0).userId) then isBlocked}
                  {#if !isBlocked}
                    <div
                      class="w-2/3 flex flex-col border-l-2 border-[rgb(59,130,246,50%)]"
                    >
                      <!-- Header -->
                      <div
                        class="py-2 px-3 border-b-2 border-[rgb(59,130,246,50%)] flex flex-row justify-between items-center"
                      >
                        <div class="flex items-center">
                          {#if prp_actualChannel.type === "CONVERSATION"}
                            <div
                              class="flex border-2 rounded-full w-12 h-12 items-center justify-center"
                            >
                              <UserAvatar
                                avatarId={prp_actualChannel.channelUsers[0].user
                                  ?.avatarId}
                              />
                            </div>
                          {:else}
                            <div
                              class="flex border-2 rounded-full w-12 h-12 items-center justify-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
                                viewBox="0 0 640 512"
                              >
                                <style>
                                  svg {
                                    fill: #ffffff;
                                  }
                                </style><path
                                  d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112h32c24 0 46.2 7.5 64.4 20.3zM448 416V394.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176h32c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2V416c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3V261.7c-10 11.3-16 26.1-16 42.3zm144-42.3v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z"
                                /></svg
                              >
                            </div>
                          {/if}

                          <div class="ml-4">
                            {#if prp_actualChannel?.type === "CONVERSATION"}
                              <p class="text-grey-darkest">
                                {#if prp_actualChannel.channelUsers[0].userId !== prp_user?.id}
                                  {prp_actualChannel.channelUsers[0].user
                                    ?.username}
                                {:else}
                                  {prp_actualChannel.channelUsers[1].user
                                    ?.username}
                                {/if}
                              </p>
                              {#if prp_actualChannel.channelUsers[0].userId !== prp_user?.id}
                                {#if prp_actualChannel.channelUsers[0].user?.isLogged}
                                  {#if prp_actualChannel.channelUsers[0].user?.inGame}
                                    <p class="text-orange-600 mt-1 text-sm">
                                      In Game
                                    </p>
                                  {:else if prp_actualChannel.channelUsers[0].user?.inChat}
                                    <p class="text-green-600 mt-1 text-sm">
                                      In Chat
                                    </p>
                                  {:else}
                                    <p class="text-green-300 mt-1 text-sm">
                                      Online
                                    </p>
                                  {/if}
                                {:else}
                                  <p class="text-red-600 mt-1 text-sm">
                                    Disconnected
                                  </p>
                                {/if}
                              {:else if prp_actualChannel.channelUsers[0].userId === prp_user?.id}
                                {#if prp_actualChannel.channelUsers[1].user?.isLogged}
                                  {#if prp_actualChannel.channelUsers[1].user?.inGame}
                                    <p class="text-orange-600 mt-1 text-sm">
                                      In Game
                                    </p>
                                  {:else if prp_actualChannel.channelUsers[1].user?.inChat}
                                    <p class="text-green-600 mt-1 text-sm">
                                      In Chat
                                    </p>
                                  {:else}
                                    <p class="text-green-300 mt-1 text-sm">
                                      Online
                                    </p>
                                  {/if}
                                {:else}
                                  <p class="text-red-600 mt-1 text-sm">
                                    Disconnected
                                  </p>
                                {/if}
                              {/if}
                            {:else}
                              <p class="text-grey-darkest">
                                {prp_actualChannel?.name}
                              </p>
                              <p class="text-grey-darker text-xs mt-1">
                                {#if arr_channelUsersList}
                                  {#each arr_channelUsersList as user}
                                    {user.user?.username}
                                    {#if user !== arr_channelUsersList[arr_channelUsersList.length - 1]}
                                      {`, `}
                                    {/if}
                                  {/each}
                                {/if}
                              </p>
                            {/if}
                          </div>
                        </div>

                        <!-- Config buttons -->
                        <div class="flex">
                          <button
                            class="pr-3 items-center justify-center flex"
                            on:click={() => {
                              b_showChannelInfo = true;
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
                          {#if prp_actualChannel.type !== "CONVERSATION"}
                            <button
                              class="text-red-600 left-1"
                              type="button"
                              on:click={() => {
                                handleDisconnectChannel(prp_actualChannel?.id);
                              }}
                            >
                              Disconnect
                            </button>
                          {/if}
                        </div>
                      </div>

                      <div class="flex-1 overflow-auto" bind:this={element}>
                        <div class="py-2 px-3">
                          {#if arr_channelMessages}
                            {#each arr_channelMessages as message}
                              <div transition:fade>
                                <div>
                                  {#if message.fromUserId !== prp_user?.id}
                                    <div class="flex mb-2">
                                      <div
                                        class="rounded py-2 px-3 bg-purple-400"
                                      >
                                        <p class="text-sm mt-1 break-all">
                                          {message.message}
                                        </p>
                                        <p
                                          class="text-right text-xs text-grey-dark mt-1 pl-5 opacity-70"
                                        >
                                          {DateTime.fromISO(
                                            message.createdAt
                                          ).toFormat("hh:mm")}
                                        </p>
                                      </div>
                                    </div>
                                  {:else}
                                    <div class="flex justify-end mb-2">
                                      <div
                                        class="rounded py-2 px-3 bg-yellow-400"
                                      >
                                        <p class="text-sm mt-1 break-all">
                                          {message.message}
                                        </p>
                                        <p
                                          class="text-right text-xs text-grey-dark mt-1 opacity-70"
                                        >
                                          {DateTime.fromISO(
                                            message.createdAt
                                          ).toFormat("hh:mm")}
                                        </p>
                                      </div>
                                    </div>
                                  {/if}
                                </div>
                              </div>
                            {/each}
                          {/if}
                        </div>
                      </div>

                      <!-- Input -->
                      <div class="bg-grey-lighter px-4 py-4 flex items-center">
                        <div class="flex-1 mx-4">
                          <input
                            name="message"
                            class="flex input w-full"
                            type="text"
                            autocomplete="off"
                            bind:value={str_messageToSend}
                            maxlength="240"
                            placeholder="Your message"
                            on:keydown={(key) => {
                              onKeyDown(key, "message");
                            }}
                          />
                        </div>
                        {#if str_messageToSend.length < 240}
                          <div class="flex mr-3 text-xs w-16 justify-end">
                            {str_messageToSend.length}/240
                          </div>
                        {:else}
                          <div
                            class="flex mr-3 text-xs text-red-500 w-16 justify-end"
                          >
                            {str_messageToSend.length}/240
                          </div>
                        {/if}
                        <div>
                          <button type="button" on:click={handleSendNewMessage}>
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
                                d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                              /></svg
                            >
                          </button>
                        </div>
                      </div>
                    </div>
                  {:else}
                    <div
                      class="flex flex-col border-l-2 border-[rgb(59,130,246,50%)] w-2/3 items-center justify-center"
                    >
                      <div>
                        <p class="text-2xl">
                          {prp_actualChannel?.channelUsers.at(0)?.user
                            ?.username} is actually blocked.
                        </p>
                      </div>

                      <div>
                        <p class="text-2xl">Do you want to unblock him?</p>
                      </div>
                      <div class="pt-5">
                        <button
                          type="button"
                          class="border-2 border-white text-2xl rounded-lg p-1 text-green-500"
                          on:click={() => {
                            socket.emit("event_unblockUser", {
                              userIdToUnblock:
                                prp_actualChannel?.channelUsers.at(0)?.userId,
                              channelId: prp_actualChannel?.id,
                            });
                            handleJoinChannel(prp_actualChannel);
                            // b_isUnblockModalClosed = true;
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          class="border-2 border-white text-2xl rounded-lg p-1 text-red-500"
                          on:click={() => {
                            resetChannelVariables();
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  {/if}
                {/await}
              {:else}
                {#await isUserIdBlocked(prp_actualChannel.channelUsers.at(1).userId) then isBlocked}
                  {#if !isBlocked}
                    <div
                      class="w-2/3 border-l-2 border-[rgb(59,130,246,50%)] flex flex-col"
                    >
                      <!-- Header -->
                      <div
                        class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center border-b-2 border-[rgb(59,130,246,50%)]"
                      >
                        <div class="flex items-center">
                          {#if prp_actualChannel.type === "CONVERSATION"}
                            <div
                              class=" border-2 rounded-full w-12 h-12 items-center justify-center"
                            >
                              <UserAvatar
                                avatarId={prp_actualChannel.channelUsers[1].user
                                  ?.avatarId}
                              />
                            </div>
                          {:else}
                            <div
                              class="flex border-l-2 border-[rgb(59,130,246,50%)] rounded-full w-12 h-12 items-center justify-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
                                viewBox="0 0 640 512"
                              >
                                <style>
                                  svg {
                                    fill: #ffffff;
                                  }
                                </style><path
                                  d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112h32c24 0 46.2 7.5 64.4 20.3zM448 416V394.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176h32c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2V416c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3V261.7c-10 11.3-16 26.1-16 42.3zm144-42.3v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z"
                                /></svg
                              >
                            </div>
                          {/if}

                          <div class="ml-4">
                            {#if prp_actualChannel?.type === "CONVERSATION"}
                              <p class="text-grey-darkest">
                                {#if prp_actualChannel.channelUsers[0].userId !== prp_user?.id}
                                  {prp_actualChannel.channelUsers[0].user
                                    ?.username}
                                {:else}
                                  {prp_actualChannel.channelUsers[1].user
                                    ?.username}
                                {/if}
                              </p>
                            {:else}
                              <p class="text-grey-darkest">
                                {prp_actualChannel?.name}
                              </p>
                              <p class="text-grey-darker text-xs mt-1">
                                {#if arr_channelUsersList}
                                  {#each arr_channelUsersList as user}
                                    {user.user?.username}
                                    {#if user !== arr_channelUsersList[arr_channelUsersList.length - 1]}
                                      {`, `}
                                    {/if}
                                  {/each}
                                {/if}
                              </p>
                            {/if}
                          </div>
                        </div>

                        <!-- Config buttons -->
                        <div class="flex">
                          <button
                            class="pr-3 items-center justify-center flex"
                            on:click={() => {
                              b_showChannelInfo = true;
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
                          {#if prp_actualChannel.type !== "CONVERSATION"}
                            <button
                              class="text-red-600 left-1"
                              type="button"
                              on:click={() => {
                                handleDisconnectChannel(prp_actualChannel?.id);
                              }}
                            >
                              Disconnect
                            </button>
                          {/if}
                        </div>
                      </div>

                      <div class="flex-1 overflow-auto" bind:this={element}>
                        <div class="py-2 px-3">
                          {#if arr_channelMessages}
                            {#each arr_channelMessages as message}
                              <div transition:fade>
                                <div>
                                  {#if message.fromUserId !== prp_user?.id}
                                    <div class="flex mb-2">
                                      <div
                                        class="rounded py-2 px-3 bg-purple-400"
                                      >
                                        <p class="text-sm mt-1 break-all">
                                          {message.message}
                                        </p>
                                        <p
                                          class="text-right text-xs text-grey-dark mt-1 pl-5 opacity-70"
                                        >
                                          {DateTime.fromISO(
                                            message.createdAt
                                          ).toFormat("hh:mm")}
                                        </p>
                                      </div>
                                    </div>
                                  {:else}
                                    <div class="flex justify-end mb-2">
                                      <div
                                        class="rounded py-2 px-3 bg-yellow-400"
                                      >
                                        <p class="text-sm mt-1 break-all">
                                          {message.message}
                                        </p>
                                        <p
                                          class="text-right text-xs text-grey-dark mt-1 opacity-70"
                                        >
                                          {DateTime.fromISO(
                                            message.createdAt
                                          ).toFormat("hh:mm")}
                                        </p>
                                      </div>
                                    </div>
                                  {/if}
                                </div>
                              </div>
                            {/each}
                          {/if}
                        </div>
                      </div>

                      <!-- Input -->
                      <div class="bg-grey-lighter px-4 py-4 flex items-center">
                        <div class="flex-1 mx-4">
                          <input
                            name="message"
                            class=" input w-full"
                            type="text"
                            autocomplete="off"
                            bind:value={str_messageToSend}
                            maxlength="240"
                            placeholder="Your message"
                            on:keydown={(key) => {
                              onKeyDown(key, "message");
                            }}
                          />
                        </div>
                        {#if str_messageToSend.length < 240}
                          <div class="flex mr-3 text-xs w-16 justify-end">
                            {str_messageToSend.length}/240
                          </div>
                        {:else}
                          <div
                            class="flex mr-3 text-xs text-red-500 w-16 justify-end"
                          >
                            {str_messageToSend.length}/240
                          </div>
                        {/if}
                        <div>
                          <button type="button" on:click={handleSendNewMessage}>
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
                                d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                              /></svg
                            >
                          </button>
                        </div>
                      </div>
                    </div>
                  {:else}
                    <div
                      class="flex flex-col w-2/3 items-center justify-center border-l-2 border-[rgb(59,130,246,50%)]"
                    >
                      <div>
                        <p class="text-2xl">
                          {prp_actualChannel.channelUsers.at(1)?.user?.username}
                          is actually blocked.
                        </p>
                      </div>

                      <div>
                        <p class="text-2xl">Do you want to unblock him?</p>
                      </div>
                      <div class="pt-5">
                        <button
                          type="button"
                          class="border-2 border-white text-2xl rounded-lg p-1 text-green-500"
                          on:click={() => {
                            socket.emit("event_unblockUser", {
                              userIdToUnblock:
                                prp_actualChannel?.channelUsers.at(1)?.userId,
                              channelId: prp_actualChannel?.id,
                            });
                            handleJoinChannel(prp_actualChannel);
                            // b_isUnblockModalClosed = true;
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          class="border-2 border-white text-2xl rounded-lg p-1 text-red-500"
                          on:click={() => {
                            resetChannelVariables();
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  {/if}
                {/await}
              {/if}
            {:else}
              <div
                class="w-2/3 border-l-2 border-[rgb(59,130,246,50%)] flex flex-col"
              >
                <!-- Header -->
                <div
                  class="py-2 px-3 border-b-2 border-[rgb(59,130,246,50%)] flex flex-row justify-between items-center"
                >
                  <div class="flex items-center">
                    <div
                      class="flex border-2 rounded-full w-12 h-12 items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 640 512"
                      >
                        <style>
                          svg {
                            fill: #ffffff;
                          }
                        </style><path
                          d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112h32c24 0 46.2 7.5 64.4 20.3zM448 416V394.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176h32c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2V416c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3V261.7c-10 11.3-16 26.1-16 42.3zm144-42.3v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z"
                        /></svg
                      >
                    </div>

                    <div class="ml-4">
                      <p class="text-grey-darkest">
                        {prp_actualChannel?.name}
                      </p>
                      <p class="text-grey-darker text-xs mt-1">
                        {#if arr_channelUsersList}
                          {#each arr_channelUsersList as user}
                            {user.user?.username}
                            {#if user !== arr_channelUsersList[arr_channelUsersList.length - 1]}
                              {`, `}
                            {/if}
                          {/each}
                        {/if}
                      </p>
                    </div>
                  </div>

                  <!-- Config buttons -->
                  <div class="flex">
                    <button
                      class="pr-3 items-center justify-center flex"
                      on:click={() => {
                        b_showChannelInfo = true;
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
                    <button
                      class="text-red-600 left-1"
                      type="button"
                      on:click={() => {
                        handleDisconnectChannel(prp_actualChannel?.id);
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div class="flex-1 overflow-auto" bind:this={element}>
                  <div class="py-2 px-3">
                    {#if arr_channelMessages}
                      {#each arr_channelMessages as message}
                        <div transition:fade>
                          <div>
                            {#if message.fromUserId !== prp_user?.id}
                              {#await isUserIdBlocked(message.fromUserId) then isBlocked}
                                {#if !isBlocked}
                                  <div class="flex mb-2">
                                    <div
                                      class="rounded py-2 px-3 bg-purple-400"
                                    >
                                      <div class="flex items-center">
                                        <!-- <div
                                          class="w-4 h-4 border-[1px] rounded-full mr-2"
                                        >
                                          <UserAvatar
                                            avatarId={message.fromUser
                                              ?.avatarId}
                                          />
                                        </div> -->
                                        <p class="text-lg opacity-70">
                                          {message.fromUser?.username}
                                        </p>
                                      </div>
                                      <p class="text-sm mt-1 break-all">
                                        {message.message}
                                      </p>
                                      <p
                                        class="text-right text-xs text-grey-dark mt-1 pl-5 opacity-70"
                                      >
                                        {DateTime.fromISO(
                                          message.createdAt
                                        ).toFormat("hh:mm")}
                                      </p>
                                    </div>
                                  </div>
                                {:else}
                                  <div class="flex mb-2 opacity-70">
                                    <div class="rounded py-2 px-3 bg-gray-500">
                                      <p class="text-sm text-teal opacity-70">
                                        {message.fromUser?.username}
                                      </p>
                                      <p class="text-sm mt-1">
                                        User blocked, you can't see his
                                        messages.
                                      </p>
                                      <p
                                        class="text-right text-xs text-grey-dark mt-1 opacity-70"
                                      >
                                        {DateTime.fromISO(
                                          message.createdAt
                                        ).toFormat("hh:mm")}
                                      </p>
                                    </div>
                                  </div>
                                {/if}
                              {/await}
                            {:else}
                              <div class="flex justify-end mb-2">
                                <div class="rounded py-2 px-3 bg-yellow-400">
                                  <p class="text-sm mt-1 break-all">
                                    {message.message}
                                  </p>
                                  <p
                                    class="text-right text-xs text-grey-dark mt-1 opacity-70"
                                  >
                                    {DateTime.fromISO(
                                      message.createdAt
                                    ).toFormat("hh:mm")}
                                  </p>
                                </div>
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    {/if}
                  </div>
                </div>

                <!-- Input -->
                <div class="bg-grey-lighter px-4 py-4 flex items-center">
                  <div class="flex-1 mx-4">
                    <input
                      name="message"
                      class="input w-full"
                      type="text"
                      autocomplete="off"
                      bind:value={str_messageToSend}
                      maxlength="240"
                      placeholder="Your message"
                      on:keydown={(key) => {
                        onKeyDown(key, "message");
                      }}
                    />
                  </div>
                  {#if str_messageToSend.length < 240}
                    <div class="flex mr-3 text-xs w-16 justify-end">
                      {str_messageToSend.length}/240
                    </div>
                  {:else}
                    <div
                      class="flex mr-3 text-xs text-red-500 w-16 justify-end"
                    >
                      {str_messageToSend.length}/240
                    </div>
                  {/if}
                  <div>
                    <button type="button" on:click={handleSendNewMessage}>
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
                          d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                        /></svg
                      >
                    </button>
                  </div>
                </div>
              </div>
            {/if}
          {:else if prp_actualChannel && b_showChannelInfo && prp_actualChannel?.type !== "CONVERSATION"}
            <div
              class="w-2/3 border-l-2 border-[rgb(59,130,246,50%)] overflow-auto"
            >
              <button class="m-3" on:click={() => (b_showChannelInfo = false)}>
                <img src="/arrow-back.svg" alt="arrow-back" class="w-10 h-10" />
              </button>
              <div class="flex flex-col w-full items-center">
                <div class="flex text-7xl">
                  {prp_actualChannel.name}
                </div>
                {#if prp_actualChannel.description !== null}
                  <p class="flex text-2xl pt-2 text-[#AE6AF2]">
                    {prp_actualChannel.description}
                  </p>
                {/if}
                <div class="pt-5">
                  <div
                    class="flex border-2 rounded-full w-36 h-36 items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="120"
                      height="120"
                      viewBox="0 0 640 512"
                    >
                      <style>
                        svg {
                          fill: #ffffff;
                        }
                      </style><path
                        d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112h32c24 0 46.2 7.5 64.4 20.3zM448 416V394.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176h32c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2V416c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3V261.7c-10 11.3-16 26.1-16 42.3zm144-42.3v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z"
                      /></svg
                    >
                  </div>
                </div>
              </div>
              <div class="flex flex-col">
                {#if prp_channelUser?.role === "OWNER"}
                  <!-- <div class="justify-center flex items-center pb-2 pt-10">
                    <button
                      class="border-2 p-2 rounded-full"
                      type="button"
                      name="Toto"
                      on:click={handleChangeChannelPrivateStatus}
                    >
                      {#if prp_actualChannel?.type === "PRIVATE"}
                        🔓 Make this channel public
                      {:else}
                        🔒 Make this channel private
                      {/if}
                    </button>
                  </div> -->
                  <div class="flex p-5 justify-center">
                    <div class="justify-center p-2">
                      <button
                        class="btn"
                        type="button"
                        name="Toto"
                        on:click={handleChangeChannelPrivateStatus}
                      >
                        {#if prp_actualChannel?.type === "PRIVATE"}
                          🔓 Make this channel public
                        {:else}
                          🔒 Make this channel private
                        {/if}
                      </button>
                    </div>

                    <div class=" justify-center p-2">
                      <button
                        class="btn"
                        type="button"
                        on:click={() => {
                          handleRemoveChannelComponent("description");
                        }}
                      >
                        Remove channel description
                      </button>
                    </div>

                    <div class=" justify-center p-2">
                      <button
                        class="btn"
                        type="button"
                        on:click={() => {
                          handleRemoveChannelComponent("password");
                        }}
                      >
                        Remove channel passworld
                      </button>
                    </div>
                  </div>

                  <!-- <div class="flex justify-center">
                    <input
                      name="channel name"
                      class="rounded-md text-black border border-black text-center mb-1"
                      type="text"
                      placeholder="New channel name"
                      bind:value={str_modalOwnerChannelName}
                      on:keydown={(key) => {
                        onKeyDown(key, "updateChannel");
                      }}
                    />
                  </div>

                  <div class="flex justify-center">
                    <input
                      name="channel description"
                      class="rounded-md text-black border border-black text-center mb-1"
                      type="text"
                      placeholder="New channel description"
                      bind:value={str_modalOwnerChannelDescription}
                      on:keydown={(key) => {
                        onKeyDown(key, "updateChannel");
                      }}
                    />
                  </div>
                  <div class="flex justify-center">
                    <input
                      name="channel password"
                      class="rounded-md text-black border border-black text-center"
                      type="password"
                      placeholder="New channel password"
                      bind:value={str_modalOwnerChannelPassword}
                      on:keydown={(key) => {
                        onKeyDown(key, "updateChannel");
                      }}
                    />
                  </div> -->
                  <div class="flex flex-col px-5 justify-center">
                    <div class="inputbox mb-5 w-full">
                      <input
                        required="required"
                        type="text"
                        bind:value={str_modalOwnerChannelName}
                        on:keydown={(key) => {
                          onKeyDown(key, "updateChannel");
                        }}
                      />
                      <span>New channel name (Press enter to save)</span>
                      <i />
                    </div>
                    <div class="inputbox mb-5">
                      <input
                        required="required"
                        type="text"
                        bind:value={str_modalOwnerChannelDescription}
                        on:keydown={(key) => {
                          onKeyDown(key, "updateChannel");
                        }}
                      />
                      <span>New channel description (Press enter to save)</span>
                      <i />
                    </div>
                    <div class="inputbox">
                      <input
                        required="required"
                        type="text"
                        bind:value={str_modalOwnerChannelPassword}
                        on:keydown={(key) => {
                          onKeyDown(key, "updateChannel");
                        }}
                      />
                      <span>New channel password (Press enter to save)</span>
                      <i />
                    </div>
                  </div>
                {/if}
                <div class="pt-3">
                  {#each arr_channelUsersList as userInChannel}
                    {#if prp_user?.id !== userInChannel.userId}
                      <UserOptions
                        {socket}
                        {userInChannel}
                        {prp_user}
                        {prp_actualChannel}
                        {prp_channelUser}
                      />
                    {/if}
                  {/each}
                </div>
              </div>
            </div>
          {:else if prp_actualChannel && b_showChannelInfo && prp_actualChannel?.type === "CONVERSATION"}
            <div class="w-2/3 border-l-2 border-[rgb(59,130,246,50%)]">
              <button class="m-3" on:click={() => (b_showChannelInfo = false)}>
                <img src="/arrow-back.svg" alt="arrow-back" class="w-10 h-10" />
              </button>
              <div class="flex flex-col w-full pt-16 items-center">
                <div class="flex text-7xl">
                  {#if prp_actualChannel.channelUsers[0].userId !== prp_user?.id}
                    {prp_actualChannel.channelUsers[0].user?.username}
                  {:else}
                    {prp_actualChannel.channelUsers[1].user?.username}
                  {/if}
                </div>
                {#if prp_actualChannel.channelUsers[0].userId !== prp_user?.id}
                  <div class="m-5 border-2 rounded-full w-36 h-36">
                    <UserAvatar
                      avatarId={prp_actualChannel.channelUsers[0].user
                        ?.avatarId}
                    />
                  </div>
                {:else}
                  <div class="m-5 border-2 rounded-full w-36 h-36">
                    <UserAvatar
                      avatarId={prp_actualChannel.channelUsers[1].user
                        ?.avatarId}
                    />
                  </div>
                {/if}

                {#if prp_actualChannel.channelUsers[0].userId !== prp_user?.id}
                  {#if prp_actualChannel.channelUsers[0].user?.isLogged}
                    {#if prp_actualChannel.channelUsers[0].user?.inGame}
                      <p class="text-orange-600 mt-1 text-xl">In Game</p>
                    {:else if prp_actualChannel.channelUsers[0].user?.inChat}
                      <p class="text-green-600 mt-1 text-xl">In Chat</p>
                    {:else}
                      <p class="text-green-300 mt-1 text-xl">Online</p>
                    {/if}
                  {:else}
                    <p class="text-red-600 mt-1 text-xl">Disconnected</p>
                  {/if}
                {:else if prp_actualChannel.channelUsers[0].userId === prp_user?.id}
                  {#if prp_actualChannel.channelUsers[1].user?.isLogged}
                    {#if prp_actualChannel.channelUsers[1].user?.inGame}
                      <p class="text-orange-600 mt-1 text-xl">In Game</p>
                    {:else if prp_actualChannel.channelUsers[1].user?.inChat}
                      <p class="text-green-600 mt-1 text-xl">In Chat</p>
                    {:else}
                      <p class="text-green-300 mt-1 text-xl">Online</p>
                    {/if}
                  {:else}
                    <p class="text-red-600 mt-1 text-xl">Disconnected</p>
                  {/if}
                {/if}
                <div class="flex flex-col pt-36">
                  <button
                    on:click={() => {
                      if (
                        prp_actualChannel?.channelUsers[0].userId !==
                        prp_user?.id
                      ) {
                        socket.emit("event_blockUser", {
                          userIdToBlock:
                            prp_actualChannel?.channelUsers[0].userId,
                          channelId: prp_actualChannel?.id,
                        });
                      } else {
                        socket.emit("event_blockUser", {
                          userIdToBlock:
                            prp_actualChannel?.channelUsers[1].userId,
                          channelId: prp_actualChannel?.id,
                        });
                      }

                      if (prp_actualChannel?.type === "CONVERSATION")
                        resetChannelVariables();

                      b_isUserListModalClosed = true;
                    }}
                    class="relative inline-flex items-center justify-center px-8 py-1 m-1 overflow-hidden text-md font-medium text-red-600 border-2 border-red-600 rounded-md hover:text-black group hover:bg-gray-50"
                  >
                    <span
                      class="absolute left-0 block w-full h-0 transition-all bg-red-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
                    />
                    <span
                      class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
                    >
                      {"x"}
                    </span>
                    <span class="relative">Block user</span>
                  </button>
                  {#if prp_actualChannel.channelUsers[1].user?.inChat && prp_actualChannel.channelUsers[0].user?.inChat}
                    <button
                      on:click={() => {
                        if (
                          prp_actualChannel?.channelUsers[0].userId !==
                          prp_user?.id
                        ) {
                          // console.log(prp_actualChannel?.channelUsers[0]);
                          socket.emit("event_sendInvitationToPlay", {
                            toUser: prp_actualChannel?.channelUsers[0],
                          });
                        } else {
                          // console.log(prp_actualChannel?.channelUsers[1]);
                          socket.emit("event_sendInvitationToPlay", {
                            toUser: prp_actualChannel?.channelUsers[1],
                          });
                        }
                      }}
                      class="relative inline-flex items-center justify-center px-8 py-1 m-1 overflow-hidden text-md font-medium text-green-500 border-2 border-green-500 rounded-md hover:text-black group hover:bg-gray-50"
                    >
                      <span
                        class="absolute left-0 block w-full h-0 transition-all bg-green-500 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
                      />
                      <span
                        class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
                      >
                        {">"}
                      </span>
                      <span class="relative">Invite to Play</span>
                    </button>
                  {/if}
                  <button
                    on:click={() => {
                      isLogged = false;
                      if (
                        prp_actualChannel?.channelUsers[0].userId !==
                        prp_user?.id
                      ) {
                        goto(
                          `/wsp/${prp_actualChannel?.channelUsers[0].userId}`
                        );
                      } else {
                        goto(
                          `/wsp/${prp_actualChannel?.channelUsers[1].userId}`
                        );
                      }
                    }}
                    class="relative inline-flex items-center justify-center px-8 py-1 m-1 overflow-hidden text-md font-medium text-[#f7ed14] border-2 border-[#f7ed14] rounded-md hover:text-black group hover:bg-gray-50"
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
            </div>
          {:else}
            <div class="w-2/3 border-l-2 border-[rgb(59,130,246,50%)]" />
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class=" flex justify-center pt-52">
    <img src="loading.svg" alt="loading" class=" h-72 w-72" />
  </div>
{/if}

<ModalSvelte
  bind:showModal={showPongInviteModal}
  {socket}
  {invitedUserId}
  {invitedSocketId}
  {invitedUser}
/>

<AchievementChatModal bind:showAchievementChatModal />

<style>
  .input {
    border: none;
    padding: 1rem;
    border-radius: 1rem;
    background: #00000080;
    box-shadow: 6px 6px 15px #3b82f6, -6px -6px 15px #285aaa;
    transition: 0.3s;
  }

  .input:focus {
    outline-color: #00000080;
    background: #00000080;
    box-shadow: inset 6px 6px 15px #3b82f6, inset -6px -6px 15px #285aaa;
    transition: 0.3s;
  }

  .btn {
    position: relative;
    font-size: 12px;
    text-transform: uppercase;
    text-decoration: none;
    padding: 1em 2.5em;
    display: inline-block;
    border-radius: 6em;
    transition: all 0.2s;
    border: none;
    font-family: inherit;
    font-weight: 500;
    color: black;
    background-color: white;
  }

  .btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  .btn:active {
    transform: translateY(-1px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }

  .btn::after {
    content: "";
    display: inline-block;
    height: 100%;
    width: 100%;
    border-radius: 100px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    transition: all 0.4s;
  }

  .btn::after {
    background-color: #fff;
  }

  .btn:hover::after {
    transform: scaleX(1.4) scaleY(1.6);
    opacity: 0;
  }

  /* Input */
  .inputbox {
    position: relative;
    width: 100%;
  }

  .inputbox input {
    position: relative;
    width: 100%;
    padding: 20px 10px 10px;
    background: transparent;
    outline: none;
    box-shadow: none;
    border: none;
    color: #23242a;
    font-size: 1em;
    letter-spacing: 0.05em;
    transition: 0.5s;
    z-index: 10;
  }

  .inputbox span {
    position: absolute;
    left: 0;
    padding: 20px 10px 10px;
    font-size: 1em;
    color: #8f8f8f;
    letter-spacing: 00.05em;
    transition: 0.5s;
    pointer-events: none;
  }

  .inputbox input:valid ~ span,
  .inputbox input:focus ~ span {
    color: #facc15;
    transform: translateX(-10px) translateY(-34px);
    font-size: 0, 75em;
  }

  .inputbox i {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: #fff;
    border-radius: 4px;
    transition: 0.5s;
    pointer-events: none;
    z-index: 9;
  }

  .inputbox input:valid ~ i,
  .inputbox input:focus ~ i {
    height: 44px;
  }
</style>
