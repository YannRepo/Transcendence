<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import axios from "axios";
  import API, { getMe } from "$lib/services/Api";
  import { PUBLIC_API_URL } from "$env/static/public";
  import Navbar from "../../components/Navbar.svelte";
  import UserAvatar from "../../components/UserAvatar.svelte";
  import { io, type Socket } from "socket.io-client";
  import { Confetti } from "svelte-confetti";
  import { DateTime } from "luxon";

  let newUsername = "";
  let user: User;
  let isLogged = false;

  let is2FA: boolean = false;
  let errorImage = ".";
  let errorUsername = ".";

  async function activate2FA() {
    if (!user?.IstwoFactorAuth) {
      goto("/welcome/verification2fa");
    } else {
      try {
        const res = API.put("/auth/activate2FA", {});
        user.IstwoFactorAuth = res.data;
      } catch (error) {
        console.error("Erreur lors du changement de nom d'utilisateur", error);
      }
    }
  }

  async function changeUsername() {
    try {
      const response = await axios.put(
        `${PUBLIC_API_URL}/user/updateUsername`,
        { username: newUsername },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem(
              "access_token"
            )}, ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      user.username = newUsername;
      errorUsername = ".";
    } catch (error) {
      errorUsername = error.response.data.message;
      // console.error("Erreur lors du changement de nom d'utilisateur", error);
    }
  }
  let selectedFile: string | Blob | null = null;
  let imageUrl = null;

  function handleFileChange(event) {
    selectedFile = event.target.files[0];

    if (selectedFile) {
      imageUrl = URL.createObjectURL(selectedFile);
    } else {
      imageUrl = null;
    }
  }

  async function uploadAvatar() {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        const response = await axios.post(
          `${PUBLIC_API_URL}/avatar/uploadAvatar`,
          formData,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem(
                "access_token"
              )}, ${localStorage.getItem("refresh_token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        user = await getMe();
        selectedFile = null;
        imageUrl = null;
        errorImage = ".";
      } catch (error) {
        errorImage = error.response.data.message;
        console.log(error);
      }
    }
  }

  async function onKeyDown(key, submitType: string, userToPunish: ChannelUser) {
    if (key.key !== "Enter") return;

    if (newUsername !== "") {
      await changeUsername();
      newUsername = "";
    }
  }

  onMount(async () => {
    if (browser) {
      try {
        user = await getMe();
        API.post("/auth/firstLogin", {});
        is2FA = user?.IstwoFactorAuth;
        if (user) isLogged = true;
        else goto("/auth");
      } catch (error) {
        console.log(error);
      }
    }
  });
</script>

{#if isLogged}
  <Navbar backPath="/" />

  <div
    class="w-2/3 h-[86vh] mx-auto rounded-[18px] p-8 border-2 border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md"
    style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
  >
    <div class="text-center flex flex-col h-full overflow-auto">
      <div class="col-span-1 flex flex-col justify-center items-center">
        <h1
          class="text-[#ffffff] text-6xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
        >
          Welcome {user?.username}!
        </h1>
        <p class="text-[#ffffff] m-2 text-2xl font-audiowide">
          {user?.email}
        </p>
      </div>

      <div class="flex m-5 items-center justify-between">
        <div class="inputbox w-full">
          <input
            required="required"
            id="username_textbox"
            type="text"
            maxlength="15"
            bind:value={newUsername}
            on:keydown={(key) => {
              onKeyDown(key);
            }}
          />
          <span>New username (Press enter to save)</span>
          <i />
        </div>
        <div>
          <button
            on:click={async () => {
              await changeUsername();
              newUsername = "";
            }}
            class="relative inline-flex items-center px-8 py-1 ml-3 overflow-hidden text-md font-medium text-[#f7ed14] border-2 border-[#f7ed14] rounded-md hover:text-black group hover:bg-gray-50"
          >
            <span
              class="absolute left-0 block w-full h-0 transition-all bg-[#f7ed14] opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
            />
            <span
              class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
            >
              +
            </span>
            <span class="relative">Change username</span>
          </button>
        </div>
      </div>
      {#if errorUsername === "."}
        <div class="">
          <p class="text-red-500 opacity-0">{errorUsername}</p>
        </div>
      {:else}
        <div class="">
          <p class="text-red-500">{errorUsername}</p>
        </div>
      {/if}

      <div class="flex justify-around mt-5">
        <div class="  ">
          <div
            class="flex justify-center items-center h-[200px] w-[200px] mx-auto my-auto rounded-full overflow-hidden border-2 border-gray-300"
          >
            <UserAvatar avatarId={user?.avatarId} />
          </div>
        </div>
        <div class=" flex flex-col items-center justify-center">
          <label for="file" class="custum-file-upload">
            {#if !imageUrl}
              <div class="icon">
                <svg
                  viewBox="0 0 24 24"
                  fill=""
                  xmlns="http://www.w3.org/2000/svg"
                  ><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  /><g id="SVGRepo_iconCarrier">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                      fill=""
                    />
                  </g></svg
                >
              </div>
              <div class="text p-2">
                <span>Click to upload a new avatar</span>
              </div>
            {:else}
              <img
                src={imageUrl}
                alt="avatar"
                class=" text-center rounded-full h-[24vh] w-[24vh]"
              />
            {/if}
            <input
              id="file"
              type="file"
              accept=".jpg, .jpeg"
              on:change={handleFileChange}
            />
          </label>
          <div class="">
            <p class="text-white">Only .jpg and .jpeg</p>
            <p class="text-white">max size 5MB</p>
          </div>
          <div class="flex w-full justify-center">
            <div class=" ">
              {#if errorImage === "."}
                <div class="mb-2">
                  <p class="text-red-500 opacity-0">{errorImage}</p>
                </div>
              {:else}
                <div class="mb-2">
                  <p class="text-red-500">{errorImage}</p>
                </div>
              {/if}
              <button
                on:click={async () => {
                  await uploadAvatar();
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
                <span class="relative">Upload avatar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {#if !user?.IsSigninWith42}
        <div class="flex flex-col w-full mt-16 items-center justify-center">
          <label class="switch-button mb-7" for="switch">
            <p class="text-2xl mr-5">2FA</p>
            <div class="switch-outer">
              <input
                id="switch"
                type="checkbox"
                checked={is2FA}
                on:click={async () => activate2FA()}
              />
              <div class="button">
                <span class="button-toggle" />
                <span class="button-indicator" />
              </div>
            </div>
          </label>
        </div>
      {/if}
      <div class="flex flex-col w-full h-full items-center justify-center">
        <button
          on:click={async () => {
            goto("/");
          }}
          class="relative inline-flex items-center px-8 py-1 overflow-hidden text-md font-medium text-[#f7ed14] border-2 border-[#f7ed14] rounded-md hover:text-black group hover:bg-gray-50"
        >
          <span
            class="absolute left-0 block w-full h-0 transition-all bg-[#f7ed14] opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
          />
          <span
            class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
          >
            {"<"}
          </span>
          <span class="relative">Go Home!</span>
        </button>
      </div>
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

  /* Input */
  .inputbox {
    position: relative;
    /* width: 70%; */
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
    color: #f7ed14;
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

  .switch-button {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    justify-content: center;
    /* margin: auto; */
    height: 40px;
  }

  .switch-button .switch-outer {
    height: 100%;
    background: #252532;
    /* width: 115px; */
    width: 84px;
    border-radius: 120px;
    -webkit-box-shadow: inset 0px 5px 10px 0px #16151c, 0px 3px 6px -2px #403f4e;
    box-shadow: inset 0px 5px 10px 0px #16151c, 0px 3px 6px -2px #403f4e;
    border: 1px solid #32303e;
    padding: 6px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .switch-button .switch-outer input[type="checkbox"] {
    opacity: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    position: absolute;
  }

  .switch-button .switch-outer .button-toggle {
    height: 27px;
    width: 27px;
    background: -webkit-gradient(
      linear,
      left top,
      left bottom,
      from(#3b3a4e),
      to(#272733)
    );
    background: -o-linear-gradient(#3b3a4e, #272733);
    background: linear-gradient(#3b3a4e, #272733);
    border-radius: 100%;
    -webkit-box-shadow: inset 0px 5px 4px 0px #424151, 0px 4px 15px 0px #0f0e17;
    box-shadow: inset 0px 5px 4px 0px #424151, 0px 4px 15px 0px #0f0e17;
    position: relative;
    z-index: 2;
    -webkit-transition: left 0.3s ease-in;
    -o-transition: left 0.3s ease-in;
    transition: left 0.3s ease-in;
    left: 0;
  }

  .switch-button
    .switch-outer
    input[type="checkbox"]:checked
    + .button
    .button-toggle {
    left: 58%;
  }

  .switch-button
    .switch-outer
    input[type="checkbox"]:checked
    + .button
    .button-indicator {
    -webkit-animation: indicator 1s forwards;
    animation: indicator 1s forwards;
  }

  .switch-button .switch-outer .button {
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    position: relative;
    -webkit-box-pack: justify;
    justify-content: space-between;
  }

  .switch-button .switch-outer .button-indicator {
    height: 18px;
    width: 18px;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    border-radius: 50%;
    border: 3px solid #ef565f;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    right: 10px;
    position: relative;
  }

  @-webkit-keyframes indicator {
    30% {
      opacity: 0;
    }

    0% {
      opacity: 1;
    }

    100% {
      opacity: 1;
      border: 3px solid #60d480;
      left: -68%;
    }
  }

  @keyframes indicator {
    30% {
      opacity: 0;
    }

    0% {
      opacity: 1;
    }

    100% {
      opacity: 1;
      border: 3px solid #60d480;
      left: -68%;
    }
  }

  /* file-upload */
  .custum-file-upload {
    height: 200px;
    width: 200px;
    display: flex;
    flex-direction: column;
    align-items: space-between;
    gap: 20px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: 2px dashed #8f8f8f;
    background-color: rgba(43, 39, 66, 0.5);
    /* padding: 1.5rem; */
    border-radius: 100%;
    /* box-shadow: -3px 3px 20px 5px #f7ed14; */
  }

  .custum-file-upload .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custum-file-upload .icon svg {
    height: 80px;
    fill: #e8e8e8;
  }

  .custum-file-upload .text {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custum-file-upload .text span {
    font-weight: 400;
    color: #e8e8e8;
  }

  .custum-file-upload input {
    display: none;
  }
</style>
