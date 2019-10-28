<template>
  <div class="outer-container">
    <coordination fixedSize="300" />
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.outer-container {
  width: 300px;
  height: 180px;
  position: relative;
  overflow: hidden;
  display: inline-block;
  > :first-child {
    position: absolute;
    top: -118px;
    left: 0;
  }
}
</style>

<script></script>
