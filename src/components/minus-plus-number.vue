<template>
  <div class="wrapper" :class="disabled && 'disabled'">
    <div class="dec button" @click="minus"></div>
    <input
      type="number"
      pattern="\d*"
      :min="min_"
      :max="max_"
      class="input"
      :disabled="disabled"
      @input="checkNumber"
      v-model.number.lazy="num"
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
  outline: none;
  border: 2px solid rgb(166, 166, 166);
  background-color: var(--card-bg);
  color: var(--input-color);
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
  height: 30px;
  box-sizing: border-box;
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
    background-color: var(--card-bg);
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
    background-color: var(--card-bg);
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
  props: ['value', 'disabled', 'min', 'max'],
  emits: ['change'],
  data() {
    return {
      val: this.value,
      min_: this.min === undefined ? 1 : this.min,
      max_: this.max,
    };
  },
  methods: {
    plus() {
      if (!this.disabled) {
        if (typeof this.val === 'number') {
          if (typeof this.max_ === 'number') {
            this.val += this.val < this.max_ ? 1 : 0;
          } else {
            this.val += 1;
          }
        } else {
          this.val = 1;
        }
      }
    },
    minus() {
      if (!this.disabled) {
        this.val -= this.val > this.min_ ? 1 : 0;
      }
    },
    checkNumber(e) {
      if (!e.target.validity.valid) {
        e.target.value = '';
      }
    },
  },
  computed: {
    num: {
      get() {
        return this.val;
      },
      set(newValue) {
        // this.val = newValue || this.min_;
        this.val = newValue;
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
