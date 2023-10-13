<script lang="ts">
  import axios from "axios";
  import Navbar from "../../../components/Navbar.svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_URL } from "$env/static/public";

  let username = "";
  let email = "";
  let password = "";

  let successMessage = "";
  let errorMessage = "";

  async function handleSignup() {
    errorMessage = "";
    successMessage = "";
    try {
      const body = {
        username: username,
        email: email,
        password: password,
      };
      const res = await axios.post(`${PUBLIC_API_URL}/auth/local/signup`, body);
      if (res.data.message) {
        errorMessage = [res.data.message];
      } else {
        successMessage = "User registered successfully";
        await goto("/auth/login");
      }
    } catch (err) {
      errorMessage = err.response.data.message;
    }
  }
</script>

<Navbar backPath={"/auth"} logOutButton={false} />
<div class="login-box">
  <h2>Sign Up</h2>
  <form>
    <div class="user-box">
      <input
        type="text"
        name=""
        required={true}
        autocomplete="username"
        maxlength="15"
        bind:value={username}
      />
      <label for="">Username</label>
    </div>
    <div class="user-box">
      <input
        type="text"
        name=""
        required={true}
        autocomplete="email"
        bind:value={email}
      />
      <label for="">Email</label>
    </div>
    <div class="user-box">
      <input
        type="password"
        name=""
        required={true}
        autocomplete="new-password"
        bind:value={password}
      />
      <label for="">Password</label>
    </div>
    {#if errorMessage}
      {#each errorMessage as message}
        <p style="color: red;">{message}</p>
      {/each}
    {:else if successMessage}
      <p style="color: green;">{successMessage}</p>
    {:else}
      <p style="color:var(--yellow,#0B041F)">.</p>
    {/if}
    <button on:click={handleSignup}>
      <span />
      <span />
      <span />
      <span />
      Submit
    </button>
  </form>
</div>

<style>
  .login-box {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    padding: 40px;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
    border-radius: 10px;
  }

  .login-box h2 {
    margin: 0 0 30px;
    padding: 0;
    color: #fff;
    text-align: center;
  }

  .login-box .user-box {
    position: relative;
  }

  .login-box .user-box input {
    width: 100%;
    padding: 10px 0;
    font-size: 16px;
    color: #fff;
    margin-bottom: 30px;
    border: none;
    border-bottom: 1px solid #fff;
    outline: none;
    background: transparent;
  }
  .login-box .user-box label {
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px 0;
    font-size: 16px;
    color: #fff;
    pointer-events: none;
    transition: 0.5s;
  }

  .login-box .user-box input:focus ~ label,
  .login-box .user-box input:valid ~ label {
    top: -20px;
    left: 0;
    color: #f7ed14;
    font-size: 12px;
  }

  .login-box form button {
    position: relative;
    display: inline-block;
    padding: 10px 20px;
    color: #f7ed14;
    font-size: 16px;
    text-decoration: none;
    text-transform: uppercase;
    overflow: hidden;
    transition: 0.5s;
    margin-top: 40px;
    letter-spacing: 4px;
  }

  .login-box button:hover {
    background: #f7ed14;
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px #f7ed14, 0 0 25px #f7ed14, 0 0 50px #f7ed14,
      0 0 100px #f7ed14;
  }

  .login-box button span {
    position: absolute;
    display: block;
  }

  .login-box button span:nth-child(1) {
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #f7ed14);
    animation: btn-anim1 1s linear infinite;
  }

  @keyframes btn-anim1 {
    0% {
      left: -100%;
    }
    50%,
    100% {
      left: 100%;
    }
  }

  .login-box button span:nth-child(2) {
    top: -100%;
    right: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(180deg, transparent, #f7ed14);
    animation: btn-anim2 1s linear infinite;
    animation-delay: 0.25s;
  }

  @keyframes btn-anim2 {
    0% {
      top: -100%;
    }
    50%,
    100% {
      top: 100%;
    }
  }

  .login-box button span:nth-child(3) {
    bottom: 0;
    right: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(270deg, transparent, #f7ed14);
    animation: btn-anim3 1s linear infinite;
    animation-delay: 0.5s;
  }

  @keyframes btn-anim3 {
    0% {
      right: -100%;
    }
    50%,
    100% {
      right: 100%;
    }
  }

  .login-box button span:nth-child(4) {
    bottom: -100%;
    left: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(360deg, transparent, #f7ed14);
    animation: btn-anim4 1s linear infinite;
    animation-delay: 0.75s;
  }

  @keyframes btn-anim4 {
    0% {
      bottom: -100%;
    }
    50%,
    100% {
      bottom: 100%;
    }
  }
</style>
