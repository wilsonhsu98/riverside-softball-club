<template>
	<header>
		<i v-if="back" class="fa fa-arrow-left" @click="back_"></i>
		<span v-else></span>
		<img class="icon" :src="icon || defaultIcon"/>
		<div v-if="save" class="save-btn" @click="save_">{{ $t('btn_update') }}</div>
	</header>
</template>

<style lang="scss" scoped>
@import "../scss/variable";

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
import defaultIcon from "../images/icon.png";

export default {
  props: ["back", "icon", "save"],
  data() {
    return {
      defaultIcon
    };
  },
  methods: {
    back_() {
      if (typeof this.back === "function") {
        this.back();
      }
    },
    save_() {
      if (typeof this.save === "function") {
        this.save();
      }
    }
  }
};
</script>
