<template>
  <div class="player" @click="select">
    <span class="name">
      <span class="avatar">
        <!-- <span class="img img-fallback" style="border-width: 1px">
          <i class="fa fa-user-o"></i>
        </span> -->
        <span
          class="img img-photo"
          :data-alt="`${player.name.slice(0, 1)}${player.number}`"
        />
        <img
          v-if="player.photo"
          class="img img-photo"
          :src="$cacheImg(player.photo)"
          onerror="this.style.display = 'none'"
        />
      </span>
      <span class="number">{{ player.number || '?' }}</span>
      <input
        v-if="isEditMode"
        type="text"
        class="input"
        v-model="name"
        ref="input"
      />
      <span v-else class="text">{{ player.name }}</span>
      <i v-if="isEditMode" class="fa fa-check" @click="confirm"></i>
      <i
        v-if="editable"
        class="fa"
        :class="{ 'fa-pencil': !isEditMode, 'fa-times': isEditMode }"
        @click="toggleMode"
      ></i>
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
    margin: 0 15px 0 5px;
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
      &-fallback {
        .fa-user-o {
          font-size: 20px;
          vertical-align: middle;
        }
      }
      &-photo {
        text-indent: -32px;
        overflow: hidden;
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
    }
    .number {
      display: inline-block;
      width: 16px;
      text-align: center;
      flex: 0 0 16px;
    }
    .input {
      border: 0;
      outline: none;
      width: 0;
      flex: 1 1 auto;
      margin-right: auto;
      padding: 0;
      font-size: $input_font_size;
      height: 36px;
      line-height: normal;
      display: flex;
      align-items: center;
    }
    .text {
      margin-right: auto;
      font-size: $input_font_size;
      line-height: normal;
      display: flex;
      align-items: center;
    }
    > .fa {
      line-height: 36px;
      font-size: 18px;
      cursor: pointer;
      margin: 0 5px;
    }
  }
}
</style>

<script>
export default {
  props: ['player', 'editable'],
  emits: ['click', 'edit'],
  data() {
    return {
      name: this.player.name || '',
      isEditMode: false,
    };
  },
  methods: {
    select() {
      this.$emit('click', this.player);
    },
    confirm() {
      this.$emit('edit', { name: this.name });
    },
    toggleMode() {
      this.isEditMode = !this.isEditMode;
      if (this.isEditMode) {
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      } else {
        this.name = this.player.name || '';
      }
    },
  },
};
</script>
