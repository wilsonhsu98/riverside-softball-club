<template>
  <header>
    <i v-if="back" class="fa fa-arrow-left" @click="back_"></i>
    <span v-else></span>
    <img class="icon" :src="$cacheImg(icon) || $cacheImg(defaultIcon)" />
    <div
      v-if="save"
      :class="['save-btn', { disabled: disabled, focus: focus }]"
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

@media only screen and (max-width: 760px) {
  header {
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
  props: ['back', 'icon', 'save', 'save_label', 'disabled', 'focus'],
  data() {
    return {
      defaultIcon,
    };
  },
  methods: {
    back_() {
      if (typeof this.back === 'function') {
        this.back();
      }
    },
    save_() {
      if (typeof this.save === 'function' && this.disabled !== true) {
        this.save();
      }
    },
  },
};
</script>
