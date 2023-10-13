<script lang="ts">
  import "../app.css";
</script>

<header>
  <link
    href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap"
    rel="stylesheet"
  />
</header>

<body
  class="text-white font-audiowide bg-[color:var(--yellow,#0B041F)] bg-grid"
/>
<!-- <body class="text-white font-audiowide bg-[color:var(--yellow,#0B041F)]" /> -->

<slot />

<style>
  .bg-grid::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/BackgroundDefault.svg");
    background-size: cover;
    background-position: top-center;
    animation: pulse 4s infinite;
    z-index: -1;
  }

  /* .pong-page::before {
    background-image: url("/BackgroundPong.svg");
  } */

  @keyframes pulse {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.4;
    }
  }
</style>
