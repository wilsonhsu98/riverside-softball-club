<template>
  <modal
    name="players"
    :adaptive="true"
    :maxWidth="400"
    :minHeight="400"
    @closed="closed"
    class="modal-wrapper"
  >
    <div class="player-modal">
      <div class="two-column">
        <div
          v-if="Array.isArray(first) && first.length"
          class="label-container"
        >
          <label>{{ first_label }}</label>
          <div class="player-list-container">
            <player
              v-for="player in first"
              :key="player.name"
              :player="player"
              @click="add_"
            />
          </div>
        </div>
        <div class="label-container current">
          <label>{{ current_label }}</label>
          <div class="player-list-container">
            <div
              class="delete-wrapper"
              v-for="(player, i) in current"
              :key="`${player.name}${i}`"
            >
              <player :player="player" />

              <i
                v-if="$listeners.delete && current"
                class="fa fa-times"
                @click="() => delete_(player)"
              ></i>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="Array.isArray(second) && second.length"
        class="label-container multiple"
        style="max-height: 98px;"
      >
        <label>{{ second_label }}</label>
        <div class="player-list-container">
          <div class="add-source" v-if="!!enable_extra">
            <input
              type="text"
              v-model="extra"
              :placeholder="$t('pla_add_extra')"
            />
            <i class="fa fa-plus-circle" @click="selectExtra"></i>
          </div>
          <player
            v-for="player in second"
            :key="player.name"
            :player="player"
            @click="add_"
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
  flex: 1;
  height: 0;
}

.label-container {
  border-top: 1px solid $input_border;
  position: relative;
  padding: 10px 0 0;
  flex: 1;
  box-sizing: border-box;
  &:after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 10px;
    background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  }
  label {
    position: absolute;
    background-color: var(--card-bg);
    color: $input_font;
    font-size: 12px;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 4px;
    line-height: 14px;
    white-space: nowrap;
  }
  &.current {
    margin-left: 10px;
    .player {
      cursor: initial;
      color: $dark_gray;
      border-color: $dark_gray;
      background-color: transparent;
      &::v-deep .img {
        border-color: $dark_gray;
      }
    }
  }
  .delete-wrapper {
    position: relative;
    width: 100%;
    margin-right: 5px;
    .fa-times {
      cursor: pointer;
      position: absolute;
      top: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      line-height: 20px;
      background-color: $request_bgcolor;
      color: #fff;
      text-align: center;
      border-radius: 50%;
    }
  }
  &.multiple {
    flex: 1;
    display: flex;
    margin-top: 5px;
    position: relative;
    .player,
    .add-source {
      flex: 0 1 calc(33% - 4px);
      &:nth-child(3n) {
        margin-right: 0;
      }
    }
  }
  .add-source {
    height: 40px;
    line-height: 36px;
    border: 2px solid $active_bgcolor;
    border-radius: 5px;
    outline: none;
    text-align: left;
    color: $active_bgcolor;
    padding-left: 5px;
    margin-right: 5px;
    box-sizing: border-box;
    > input[type='text'] {
      background-color: var(--card-bg);
      color: $gray;
      font-size: 16px;
      border: none;
      outline: none;
      width: calc(100% - 36px);
      padding: 0;
      height: 32px;
      line-height: 16px;
      &::placeholder {
        color: $active_bgcolor;
      }
    }
    > i.fa {
      width: 28px;
      height: 36px;
      line-height: 36px;
      vertical-align: top;
      margin-right: 3px;
      float: right;
      cursor: pointer;
      font-size: 28px;
    }
  }
}

.player-list-container {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow-y: auto;
  height: 100%;
}

.modal-wrapper {
  background-color: rgba(0, 0, 0, 0.5);
  ::v-deep .v--modal-box {
    background-color: var(--card-bg);
    border-radius: 10px;
  }
}

@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 80px !important;
    bottom: 80px !important;
    height: auto !important;
    left: 20px !important;
    right: 20px !important;
    width: auto !important;
  }
  .label-container.multiple {
    .player,
    .add-source {
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
    'first',
    'first_label',
    'second',
    'second_label',
    'current',
    'current_label',
    'enable_extra',
  ],
  emits: ['clear', 'select'],
  data() {
    return {
      extra: '',
    };
  },
  methods: {
    add_(player) {
      this.$emit('add', player);
    },
    delete_(player) {
      this.$emit('delete', player);
    },
    selectExtra() {
      if (
        this.extra &&
        !this.second.map(({ name }) => name).includes(this.extra)
      ) {
        this.$emit('add', { name: this.extra });
      }
    },
    closed() {
      this.extra = '';
    },
  },
};
</script>
