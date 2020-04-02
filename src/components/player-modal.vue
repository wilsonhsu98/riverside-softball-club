<template>
  <modal
    :name="name"
    :adaptive="true"
    :maxWidth="400"
    :minHeight="400"
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
        style="max-height: 146px;"
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
    color: $dark_gray;
    border-color: $dark_gray;
    background-color: transparent;
    &::v-deep .img {
      border-color: $dark_gray;
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
      flex: 0 1 calc(33% - 4px);
      &:nth-child(3n) {
        margin-right: 0;
      }
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

.modal-wrapper {
  background-color: rgba(0, 0, 0, 0.5);
}

@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 60px !important;
    bottom: 60px !important;
    height: auto !important;
    left: 20px !important;
    right: 20px !important;
    width: auto !important;
  }
  .label-container.multiple .player {
    flex: 0 1 calc(50% - 4px);
    &:nth-child(3n) {
      margin-right: 0;
    }
    &:nth-child(even) {
      margin-right: 0;
    }
    &:nth-child(odd) {
      margin-right: 5px;
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 20px !important;
    bottom: 20px !important;
    height: auto !important;
    left: 60px !important;
    right: 60px !important;
    width: auto !important;
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
};
</script>
