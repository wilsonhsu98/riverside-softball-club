<template>
  <div class="loading-mask">
    <iframe
      class="loading-iframe"
      :srcdoc="iframeContent"
      frameborder="0"
    ></iframe>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.loading-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(50, 122, 129, 0.2);
  z-index: 2;
}

.loading-iframe {
  width: 100vw;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
</style>

<script>
import baseballLottieData from '../images/baseballLottieData.json';
export default {
  computed: {
    iframeContent() {
      return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" \/>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: transparent;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            #baseball {
              width: 320px;
              height: 320px;
            }
          <\/style>
        <\/head>
        <body>
          <div id="baseball"><\/div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.13.0/lottie.min.js"><\/script>
          <script>
            lottie.loadAnimation({
              container: document.getElementById('baseball'),
              renderer: 'svg',
              loop: true,
              autoplay: true,
              animationData: ${JSON.stringify(baseballLottieData)},
            });
          <\/script>
        <\/body>
      <\/html>`;
    },
  },
};
</script>
