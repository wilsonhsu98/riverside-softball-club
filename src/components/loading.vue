<template>
  <div class="loading-mask">
    <div class="logo">
      <div class="img" ref="baseball" />
    </div>
    <span v-if="text" class="text">{{ text }}</span>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.text {
  text-align: center;
  line-height: calc(100vh + 73px);
  line-height: calc(var(--vh, 1vh) * 100 + 73px);
  color: #fff;
  font-size: 24px;
  display: block;
}

.logo {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  text-align: center;
  .img {
    width: 320px;
    height: 320px;
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.loading-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(50, 122, 129, 0.2);
  z-index: 2;
}
</style>

<script>
import Lottie from 'lottie-web';
import baseballLottieData from '../images/baseballLottieData.json';
export default {
  props: ['text', 'img'],
  mounted() {
    Lottie.loadAnimation({
      container: this.$refs.baseball,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: baseballLottieData,
    });
  },
};
</script>
