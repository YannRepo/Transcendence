<script lang="ts">
  import API from "$lib/services/Api";
  import Modal from "$lib/modal/Modal.svelte";
  import Content from "$lib/modal/Content.svelte";
  import Trigger from "$lib/modal/Trigger.svelte";
  // import Modal from "svelte-simple-modal";
  import type { Socket } from "socket.io-client";
  // import { Modal, Content, Trigger } from "sv-popup";
  import { onMount } from "svelte";
  import { blur, fade } from "svelte/transition";
  import UserAvatar from "../../components/UserAvatar.svelte";

  let b_isCreateConversationModalClosed: boolean = true;
  let b_isUnblockModalClosed: boolean = true;
  let arr_usersList: User[];
  let prp_userToUnblock: User;

  let str_modalPrivChannelPassword: string = "";
  let prp_punishmentDetails: Sourcebans;

  export let socket: Socket;
  export let prp_user: User;

  // async function isUserIdBlocked(userId: number) {
  //   const blockedUserIds = prp_user?.blockedIds;

  //   if (blockedUserIds?.length === 0) return false;

  //   for (let id of blockedUserIds) if (id === userId) return true;

  //   return false;
  // }

  async function getUsersList() {
    try {
      arr_usersList = await API.get(`/user/list`);
    } catch (err) {
      console.log("Error", err);
    }
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
    await getUsersList();
    // console.log("NewPrivateMessage.svelte onMount");
    // console.log("socket", socket);
    // console.log("prp_user", prp_user);
  });
</script>

<Modal small close={b_isCreateConversationModalClosed}>
  <Content class=" text-black text-center ">
    <!-- <p class="text-white">toto</p> -->
    <div class="content" transition:blur>
      {#if arr_usersList.length === 1}
        <p class="text-black">
          Welcome to our community! You're the first member here. 🎉 While
          private messaging is currently unavailable since you're the only user,
          you can still explore the website's features and enjoy our content.
          Feel free to invite friends to join so you can start private
          conversations in the future. Happy exploring!
        </p>
      {:else}
        {#each arr_usersList as user}
          {#if user.id !== prp_user?.id}
            <button
              class="px-3 w-full flex items-center bg-grey-light"
              on:click={() => {
                b_isCreateConversationModalClosed = true;
                socket.emit("event_createOrJoinConversation", {
                  withUserId: user?.id,
                });
              }}
            >
              <div class="border-2 rounded-full border-black w-12 h-12">
                <UserAvatar avatarId={user?.avatarId} />
              </div>

              <div class="ml-4 flex-1 py-4">
                <div class="flex items-bottom justify-between">
                  <div class="text-left">
                    <p class="text-grey-darkest">
                      {user?.username}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  </Content>
  <Trigger>
    <!-- <button
      class="mt-4 px-2 py-1 border-2 rounded-md text-yellow-300 border-yellow-300"
      on:click={async () => {
        // await getUsersList();
        b_isUnblockModalClosed = true;
        b_isCreateConversationModalClosed = false;
      }}
    >
      + New Private Message
    </button> -->

    <button
      on:click={async () => {
        // await getUsersList();
        b_isUnblockModalClosed = true;
        b_isCreateConversationModalClosed = false;
      }}
      class="relative inline-flex items-center px-6 py-1 overflow-hidden text-md font-medium text-yellow-300 border-2 border-yellow-300 rounded-md hover:text-black group hover:bg-gray-50"
    >
      <span
        class="absolute left-0 block w-full h-0 transition-all bg-yellow-300 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
      />
      <span
        class="  absolute right-0 flex items-center justify-start w-4 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
      >
        +
      </span>
      <span class="relative">Private Message</span>
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
</style>
