<template>
  <modal
    :name="name"
    :adaptive="true"
    :maxWidth="260"
    :maxHeight="282"
    class="modal-wrapper"
  >
    <div class="player-modal">
      <div class="two-column">
        <div class="label-container current">
          <label>{{ current_label }}</label>
          <div class="delete-wrapper">
            <player v-if="current" :player="current" />
            <i
              v-if="typeof clear === 'function' && current"
              class="fa fa-times"
              @click="clear_"
            ></i>
          </div>
        </div>
        <div
          v-if="second && second.name !== (current || {}).name"
          class="label-container single"
        >
          <label>{{ second_label }}</label>
          <player :player="second" @click="select_" />
        </div>
      </div>
      <div
        v-if="Array.isArray(third) && third.length"
        class="label-container multiple"
        style="max-height: 101px;"
      >
        <label>{{ third_label }}</label>
        <div class="player-list-container">
          <player
            v-for="player in third.filter(
              player => player.name !== (current || {}).name,
            )"
            :key="player.name"
            :player="player"
            @click="select_"
          />
        </div>
      </div>
      <div
        v-if="Array.isArray(fourth) && fourth.length"
        class="label-container multiple"
      >
        <label>{{ fourth_label }}</label>
        <div class="player-list-container">
          <player
            v-for="player in fourth.filter(
              player => player.name !== (current || {}).name,
            )"
            :key="player.name"
            :player="player"
            @click="select_"
          />
        </div>
      </div>
    </div>
  </modal>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.player-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 10px 10px;
  box-sizing: border-box;
}

.two-column {
  display: flex;
}

.label-container {
  border-top: 1px solid $input_border;
  position: relative;
  padding: 10px 0 0;
  flex: 1;
  height: 60px;
  box-sizing: border-box;
  label {
    position: absolute;
    background-color: #fff;
    color: $input_font;
    font-size: 12px;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 4px;
    line-height: 14px;
    white-space: nowrap;
  }
  &.current .player {
    cursor: initial;
    color: #777;
    border-color: #777;
    background-color: transparent;
    &::v-deep .img {
      border-color: #777;
    }
  }
  .delete-wrapper {
    position: relative;
    .fa-times {
      cursor: pointer;
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      line-height: 20px;
      background-color: $request_bgcolor;
      color: #fff;
      text-align: center;
      border-radius: 50%;
    }
  }
  &.single {
    margin-left: 5px;
  }
  &.multiple {
    flex: 1;
    display: flex;
    height: 0;
    margin-top: 5px;
    position: relative;
    &:after {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 10px;
      background: linear-gradient(
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 1)
      );
    }
    .player {
      flex: 0 1 calc(50% - 4px);
    }
  }
}

.player-list-container {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow-y: auto;
}

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
  &:nth-child(even) {
    margin-right: 0;
  }
  &::v-deep {
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
}

.modal-wrapper {
  background-color: rgba(0, 0, 0, 0.5);
}

@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 60px !important;
    bottom: 60px !important;
    height: auto !important;
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 20px !important;
    bottom: 20px !important;
    height: auto !important;
  }
}
</style>

<script>
export default {
  props: [
    'name',
    'current',
    'current_label',
    'clear',
    'second',
    'second_label',
    'third',
    'third_label',
    'fourth',
    'fourth_label',
    'select',
  ],
  data() {
    return {};
  },
  methods: {
    clear_() {
      if (typeof this.clear === 'function') {
        this.clear();
      }
    },
    select_(player) {
      if (typeof this.select === 'function') {
        this.select(player);
      }
    },
  },
  components: {
    player: {
      template: `<div class="player" @click="select">
            <span class="name">
              <span class="avatar">
                <span class="img" style="border-width: 1px">
                  <i class="fa fa-user-o"></i>
                </span>
                <img
                  v-if="player.photo"
                  class="img"
                  :src="$cacheImg(player.photo)"
                />
              </span>
              <span class="number">{{ player.number || '?' }}</span>
              <span>{{ player.name }}</span>
            </span>
          </div>`,
      props: ['player'],
      methods: {
        select() {
          this.$emit('click', this.player);
        },
      },
    },
  },
};
</script>
