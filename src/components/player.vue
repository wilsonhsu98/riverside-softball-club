<template>
  <div class="player" @click="select">
    <span class="name">
      <span class="avatar">
        <span class="img" style="border-width: 1px">
          <i class="fa fa-user-o"></i>
        </span>
        <img
          v-if="player.photo"
          class="img"
          :src="$cacheImg(player.photo)"
          onerror="this.style.display='none'"
        />
      </span>
      <span class="number">{{ player.number || '?' }}</span>
      <span>{{ player.name }}</span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.player {
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  height: 40px;
  line-height: 40px;
  width: 100%;
  background-color: $row_odd_bgcolor;
  color: $row_color;
  border: 2px solid $row_color;
  border-radius: 5px;
  margin: 0 5px 5px 0;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  .name {
    margin-left: 5px;
    text-align: left;
    line-height: 36px;
    box-sizing: border-box;
    display: flex;
    .avatar {
      position: relative;
      display: inline-block;
      height: 32px;
      vertical-align: top;
      margin-right: 4px;
      flex: 0 0 32px;
    }
    .img {
      display: inline-block;
      width: 32px;
      height: 32px;
      border: 0 solid $row_color;
      box-sizing: border-box;
      border-radius: 50%;
      background: 50% 50% no-repeat;
      background-size: 32px auto;
      position: absolute;
      top: 2px;
      left: 0;
      text-align: center;
      line-height: 26px;
      .fa-user-o {
        font-size: 20px;
        vertical-align: middle;
      }
    }
    .number {
      display: inline-block;
      width: 16px;
      text-align: center;
      flex: 0 0 16px;
    }
  }
}
</style>

<script>
export default {
  props: ['player'],
  data() {
    return {};
  },
  methods: {
    select() {
      this.$emit('click', this.player);
    },
  },
};
</script>
