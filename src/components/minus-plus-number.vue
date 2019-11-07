<template>
  <div class="wrapper" :class="disabled && 'disabled'">
    <div class="dec button" @click="minus"></div>
    <input
      type="number"
      pattern="\d*"
      oninput="validity.valid||(value='');"
      class="input"
      v-model.number="num"
      min="1"
      :disabled="disabled"
    />
    <div class="inc button" @click="plus"></div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  z-index: 0;
  display: inline-block;
}
.disabled {
  .input,
  .button {
    opacity: 0.5;
    cursor: default;
  }
}
.input {
  width: 44px;
  text-align: center;
  height: 30px;
  box-sizing: border-box;
  border: 2px solid rgb(166, 166, 166);
  background-color: rgb(248, 248, 248);
  vertical-align: top;
  border-radius: 0;
  position: relative;
  z-index: 1;
}

.button {
  position: relative;
  z-index: 0;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: inline-block;
  border: 2px solid black;
  vertical-align: top;
  &:before,
  &:after {
    content: '';
    position: absolute;
    background-color: rgb(166, 166, 166);
  }
  &.dec {
    border-radius: 5px 0 0 5px;
    border-right: none;
    border-color: rgb(166, 166, 166);
    background-color: #f8f8f8;
    &:after {
      top: 50%;
      left: 8px;
      width: calc(100% - 16px);
      height: 2px;
      margin-top: -1px;
    }
  }
  &.inc {
    border-radius: 0 5px 5px 0;
    border-left: none;
    border-color: rgb(166, 166, 166);
    background-color: #f8f8f8;
    &:before {
      top: 8px;
      left: 50%;
      width: 2px;
      height: calc(100% - 16px);
      margin-left: -1px;
    }
    &:after {
      top: 50%;
      left: 8px;
      width: calc(100% - 16px);
      height: 2px;
      margin-top: -1px;
    }
  }
}
</style>

<script>
export default {
  props: ['value', 'disabled'],
  data() {
    return {
      val: this.value,
    };
  },
  methods: {
    plus() {
      if (!this.disabled) {
        this.val += 1;
      }
    },
    minus() {
      if (!this.disabled) {
        this.val -= this.val > 1 ? 1 : 0;
      }
    },
  },
  computed: {
    num: {
      get() {
        return this.val;
      },
      set(newValue) {
        this.val = newValue || 1;
      },
    },
  },
  watch: {
    val() {
      this.$emit('change', this.val);
    },
    value() {
      this.val = this.value;
    },
  },
};
</script>
