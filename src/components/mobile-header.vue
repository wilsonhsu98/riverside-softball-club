<template>
  <header>
    <i v-if="$listeners.back" class="fa fa-arrow-left" @click="back_"></i>
    <span v-else></span>
    <img class="icon" :src="$cacheImg(icon) || $cacheImg(defaultIcon)" />
    <div
      v-if="$listeners.save"
      :class="['save-btn', { disabled, focus }]"
      @click="save_"
    >
      {{ save_label || $t('btn_update') }}
    </div>
    <span v-else></span>
  </header>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

header {
  display: none;
  color: #fff;

  .fa {
    height: 50px;
    line-height: 50px;
    font-size: 28px;
    vertical-align: middle;
    cursor: pointer;
    padding: 0 14px;
  }
  .save-btn {
    height: 50px;
    line-height: 50px;
    padding: 0 14px;
    cursor: pointer;
    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    &.focus {
      animation: blink 0.8s linear infinite;
    }
    @keyframes blink {
      0% {
        text-shadow: 0 0 15px white;
      }
      50% {
        text-shadow: none;
      }
      100% {
        text-shadow: 0 0 15px white;
      }
    }
  }
}

@media only screen and (max-width: 760px), (max-height: 480px) {
  header {
    padding-left: calc(constant(safe-area-inset-left));
    /* iOS 11.0 */
    padding-left: calc(env(safe-area-inset-left));
    /* iOS 11.2 */

    padding-right: calc(constant(safe-area-inset-right));
    /* iOS 11.0 */
    padding-right: calc(env(safe-area-inset-right));
    /* iOS 11.2 */

    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $header_bgcolor;
    height: 50px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.13), 0 0 2px 0 rgba(0, 0, 0, 0.2);
    text-align: center;
    .icon {
      max-height: 45px;
      position: absolute;
      top: 50%;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      transform: translateY(-50%);
    }
  }
}
</style>

<script>
import defaultIcon from '../images/icon.png';

export default {
  props: ['icon', 'save_label', 'disabled', 'focus'],
  emits: ['back', 'save'],
  data() {
    return {
      defaultIcon,
    };
  },
  methods: {
    back_() {
      this.$emit('back');
    },
    save_() {
      if (this.disabled !== true) {
        this.$emit('save');
      }
    },
  },
};
</script>
