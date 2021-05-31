<template>
  <div class="theme">
    <input
      type="radio"
      :name="`theme_${uid}`"
      :id="`theme_light_${uid}`"
      v-model="theme"
      value="light"
    />
    <input
      type="radio"
      :name="`theme_${uid}`"
      :id="`theme_auto_${uid}`"
      v-model="theme"
      value="auto"
    />
    <input
      type="radio"
      :name="`theme_${uid}`"
      :id="`theme_dark_${uid}`"
      v-model="theme"
      value="dark"
    />
    <label :for="`theme_light_${uid}`" />
    <label :for="`theme_auto_${uid}`" />
    <label :for="`theme_dark_${uid}`" />
    <span class="dot"
      ><template v-if="theme === 'auto'">{{ $t('auto') }}</template
      ><i
        v-else
        :class="[
          'fa',
          { 'fa-sun-o': theme === 'light', 'fa-moon-o': theme === 'dark' },
        ]"
      ></i
    ></span>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.theme {
  position: relative;
  display: inline-block;
  width: 98px;
  height: 33px;
  line-height: 33px;
  border-radius: calc(33px / 2);
  text-align: center;
  [type='radio'] {
    display: none;
    &:checked {
      &[value='light'] ~ .dot {
        background-color: $menu_active;
        left: 0;
        color: $nonpa;
      }
      &[value='auto'] ~ .dot {
        background-color: $gray;
        left: calc(100% / 3);
        color: #fff;
      }
      &[value='dark'] ~ .dot {
        background-color: $dark_black;
        left: calc(100% / 3 * 2);
        color: rgb(255, 238, 0);
      }
    }
  }
  label {
    display: inline-block;
    vertical-align: top;
    width: calc(100% / 3);
    height: 100%;
    cursor: pointer;
    &[for^='theme_light'] {
      background-color: $menu_active;
      border-radius: 50% 0 0 50%;
    }
    &[for^='theme_auto'] {
      background-color: $gray;
    }
    &[for^='theme_dark'] {
      background-color: $dark_black;
      border-radius: 0 50% 50% 0;
    }
  }
  .dot {
    display: inline-block;
    vertical-align: top;
    width: calc(100% / 3);
    height: 100%;
    position: absolute;
    top: 0;
    transition: all 0.5s;
    transform: scale(1.35);
    border-radius: 50%;
    font-size: 12px;
    i {
      font-size: 18px;
      top: 2px;
      position: relative;
    }
  }
}
</style>

<script>
export default {
  data() {
    return {
      uid: this._uid,
      theme: window.localStorage.getItem('pref_theme') || 'auto',
    };
  },
  mounted() {
    window.addEventListener('themeChange', this.setTheme);
  },
  beforeDestroy() {
    window.removeEventListener('themeChange', this.setTheme);
  },
  methods: {
    setTheme() {
      this.theme = window.localStorage.getItem('pref_theme');
    },
  },
  watch: {
    theme() {
      window.localStorage.setItem('pref_theme', this.theme);
      window.dispatchEvent(new Event('themeChange'));
    },
  },
};
</script>
