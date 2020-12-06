<template>
  <div>
    <!-- <span class="img img-fallback" style="border-width: 1px">
      <i class="fa fa-user-o"></i>
    </span> -->
    <span
      class="img img-photo"
      :class="{
        small: size === 'small',
        medium: size === 'medium',
      }"
      :data-alt="nameNumber"
    />
    <img
      v-if="photo"
      class="img img-photo"
      :class="{
        small: size === 'small',
        medium: size === 'medium',
      }"
      :src="$cacheImg(photo)"
      onload="this.style.display = 'inline-block'"
      onerror="this.style.display = 'none'"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.img {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 0 solid $row_color;
  box-sizing: border-box;
  border-radius: 50%;
  background: 50% 50% no-repeat;
  background-size: cover;
  position: absolute;
  top: 2px;
  left: 0;
  text-align: center;
  line-height: 26px;
  vertical-align: top;
  &-fallback {
    .fa-user-o {
      font-size: 20px;
      vertical-align: top;
    }
  }
  &-photo {
    text-indent: -32px;
    overflow: hidden;
    background-color: #fff;
    &:after {
      content: attr(data-alt);
      line-height: 32px;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: $row_color;
      color: #fff;
      border-radius: 50%;
      text-align: center;
      text-indent: 0;
      font-size: 12px;
    }
  }
  &.medium {
    width: 28px;
    height: 28px;
    top: 2px;
    line-height: 22px;
    .fa-user-o {
      font-size: 18px;
    }
    &.img-photo {
      text-indent: -28px;
      &:before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: $row_color;
        border-radius: 50%;
      }
      &:after {
        line-height: 28px;
        transform: scale(0.9);
        transform-origin: center;
      }
    }
  }
  &.small {
    width: 24px;
    height: 24px;
    top: 1px;
    line-height: 18px;
    .fa-user-o {
      font-size: 16px;
    }
    &.img-photo {
      text-indent: -24px;
      &:before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: $row_color;
        border-radius: 50%;
      }
      &:after {
        line-height: 24px;
        transform: scale(0.7);
        transform-origin: center;
      }
    }
  }
}
</style>

<script>
import { getNameNumber } from '../libs/utils';

export default {
  props: ['name', 'number', 'photo', 'size'],
  computed: {
    nameNumber() {
      return getNameNumber({ name: this.name, number: this.number });
    },
  },
};
</script>
