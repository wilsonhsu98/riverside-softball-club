<template>
  <div>
    <mobile-header
      :back="back_"
      :icon="currentTeamIcon"
      :save="edit"
      :save_label="$t('btn_start_game')"
    />
    <div class="container" ref="container">
      <h1>{{ $t('create_game') }}</h1>
      <div class="condition">
        <div class="condition__group">
          <div class="condition__label">{{ $t('col_period') }}</div>
          <div class="selectdiv" :class="{ disabled: sortBy_ === 'number' }">
            <select
              class="dropdown"
              :value="periodSelect"
              :disabled="sortBy_ === 'number'"
              @change="setPeriod($event.target.value)"
            >
              <option
                v-for="item in period"
                :value="item.period"
                :key="`period_${item.period}`"
                >{{
                  `${
                    item.period === 'period_all' ? $t(item.period) : item.period
                  }`
                }}</option
              >
            </select>
          </div>
        </div>
        <div class="condition__group">
          <div class="condition__label">{{ $t('col_sort') }}</div>
          <div class="selectdiv">
            <select
              class="dropdown"
              :value="sortBy_"
              @change="setSortBy_($event.target.value)"
            >
              <option value="number">{{ $t('number') }}</option>
              <option
                v-for="col in conditionCols"
                :value="col.name"
                :key="`col_${col.name}`"
                >{{ $t(col.name) }}</option
              >
            </select>
          </div>
        </div>
        <div class="condition__group">
          <div class="condition__label">{{ $t('col_latest') }}</div>
          <minus-plus-number
            :value="top"
            :disabled="unlimitedPA || sortBy_ === 'number'"
            @change="setTop"
          />
          <label for="unlimited_pa">
            <input
              id="unlimited_pa"
              type="checkbox"
              :checked="unlimitedPA"
              :disabled="sortBy_ === 'number'"
              @change="setUnlimitedPA($event.target.checked)"
            />{{ $t('col_unlimited') }}
          </label>
        </div>
      </div>
      <div class="draggable-container">
        <div class="sticky">
          <div
            class="fake-flex flex-container"
            :class="`layout-${divider % 4 === 1 ? -1 : divider % 2 ? 1 : 0}`"
          >
            <div class="flex"></div>
            <div class="separater">
              <i
                class="toggle-btn fa fa-info-circle"
                v-tooltip="{
                  content: `<ul><li>${$t('tip_order')
                    .split('|')
                    .join('</li><li>')}</li></ul>`,
                  classes: ['info'],
                  container: $refs.container,
                }"
              ></i>
              <i
                class="toggle-btn fa fa-user-o"
                :class="!avatar && 'deny'"
                @click="avatar = !avatar"
              ></i>
              <i class="toggle-btn divider" @click="divider += 1"
                ><divider
              /></i>
              <i
                class="toggle-btn robot"
                :class="{ disabled: sortBy_ === 'number' }"
                @click="sortBy_ !== 'number' && fillAI()"
                ><robot
              /></i>
              <i class="toggle-btn fa fa-random" @click="fillRandom"></i>
              <i class="toggle-btn fa fa-reply-all ltr" @click="fillAll"></i>
              <i class="toggle-btn fa fa-reply-all" @click="clearAll"></i>
              <i
                class="toggle-btn trash"
                :class="deleteMode && 'on'"
                @click="deleteMode = !deleteMode"
                ><trash
              /></i>
              <i
                class="toggle-btn trash-undo"
                @click="releaseHiddenPlayer()"
                :data-deletes="
                  (hiddenList || []).length === 0
                    ? undefined
                    : hiddenList.length
                "
                ><trash-undo
              /></i>
            </div>
            <div class="flex"></div>
          </div>
        </div>
        <div
          class="flex-container"
          :class="`layout-${divider % 4 === 1 ? -1 : divider % 2 ? 1 : 0}`"
          :key="sourceList.length"
        >
          <div
            class="flex"
            :style="{
              height:
                sourceList.length > 11
                  ? `${(dragBack ? sourceList.length + 1 : sourceList.length) *
                      45 +
                      77}px`
                  : 'auto',
            }"
          >
            <vue-draggable
              tag="fieldset"
              group="people"
              handle=".handle"
              dragClass="dragging"
              class="all-players players"
              :class="dragBack && 'drag'"
              :data-msg="$t('msg_move_back')"
              :list="sourceList"
              :move="move"
              @start="
                highlight = [];
                drag = true;
              "
              @end="dragEnd"
            >
              <div
                class="player"
                v-for="player in sourceList"
                :key="player.name"
              >
                <i
                  class="handle"
                  @touchstart="e => moveByDblclick(e, player)"
                  @click="e => moveByDblclick(e, player)"
                  ><drag-n-drop
                /></i>
                <span class="name">
                  <span v-if="avatar" class="avatar">
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
                  <span class="sortby"
                    >&nbsp;{{ formatValue(player[sortBy], sortBy) }}</span
                  >
                </span>
                <v-popover
                  v-if="(player.listByGame || []).length"
                  placement="bottom"
                  trigger="click"
                  popoverClass="info"
                  offset="14"
                  class="tip"
                  delay="300"
                  :autoHide="true"
                  :container="$refs.container"
                >
                  <!-- This will be the popover target (for the events and position) -->
                  <div class="tip-trigger"></div>

                  <!-- This will be the content of the popover -->
                  <template slot="popover">
                    <div class="chart">
                      <div class="chart-inner">
                        <div
                          class="bar"
                          v-for="(cube, cubeIndex) in player.listByGame"
                          :key="`bar_${encodeURI(player.name)}_${cubeIndex}`"
                        >
                          <template v-for="(cell, cellIndex) in cube">
                            <span
                              v-if="cellIndex === cube.length - 1"
                              class="game"
                              :key="`${cubeIndex}${cellIndex}`"
                              >{{ cell }}</span
                            >
                            <span
                              v-else
                              :class="
                                `item ${cell.color} ${
                                  cell.exclude ? 'exclude' : ''
                                }`
                              "
                              :key="`${cubeIndex}${cellIndex}`"
                              >{{ $t(cell.content) }}</span
                            >
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                </v-popover>
                <div v-if="deleteMode && player.number" class="delete">
                  <i
                    class="trash"
                    :style="
                      `
                        animation-delay: -${(
                          Math.random() * (0 - 1) +
                          1
                        ).toFixed(2)}s;
                        animation-duration: ${(
                          Math.random() * (0 - 1) +
                          1
                        ).toFixed(2)}s;
                      `
                    "
                    @click="addHiddenPlayer(player)"
                    ><trash
                  /></i>
                </div>
              </div>
              <div class="add-source">
                <input
                  type="text"
                  v-model="extra"
                  :placeholder="$t('pla_add_extra')"
                />
                <i class="fa fa-plus-circle" @click="addToSource"></i>
              </div>
              <legend>{{ $t('ttl_all_players') }}</legend>
            </vue-draggable>
          </div>
          <div class="separater"></div>
          <div class="flex">
            <vue-draggable
              tag="fieldset"
              group="people"
              handle=".handle"
              draggable=".player"
              class="starting-players players"
              :class="drag && 'drag'"
              @end="dragEnd"
            >
              <legend>{{ $t('ttl_starting_players') }}</legend>
              <template v-for="order in ORDER">
                <vue-draggable
                  group="people"
                  handle=".handle"
                  dragClass="dragging"
                  class="order"
                  :class="{ drag: drag, highlight: highlight.includes(order) }"
                  :data-order="order"
                  :list="order_(order)"
                  :key="`order_${order}`"
                  :move="move"
                  @start="
                    dragBack = true;
                    drag = true;
                    highlight = [];
                  "
                  @end="dragEnd"
                >
                  <div
                    class="player"
                    v-for="player in order_(order)"
                    :key="player.name"
                  >
                    <i
                      class="handle"
                      @touchstart="e => moveByDblclick(e, player, order)"
                      @click="e => moveByDblclick(e, player, order)"
                      ><drag-n-drop
                    /></i>
                    <span class="name">
                      <span v-if="avatar" class="avatar">
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
                  </div>
                </vue-draggable>
              </template>
            </vue-draggable>
          </div>
        </div>
      </div>
      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button class="btn" @click="edit">{{ $t('btn_start_game') }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.condition {
  margin-top: 15px;
  &__group {
    display: inline-block;
    margin-bottom: 5px;
    > div {
      display: inline-block;
      vertical-align: middle;
    }
  }
  label[for='unlimited_pa'] {
    cursor: pointer;
    margin-left: 5px;
  }
  &__label {
    display: inline-block;
    padding: 0 4px;
    text-align: left;
  }
}
.draggable-container {
  user-select: none;
}
.sticky {
  position: sticky;
  top: calc(50vh - (33px * 9 - 5px) / 2 - 35px);
  z-index: 1;
  .fake-flex {
    position: absolute;
    top: 35px;
    right: 0;
    left: 0;
    min-height: auto;
    height: 0;
  }
}
.toggle-btn {
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: inline-block;
  border: 2px solid $gray;
  text-align: center;
  border-radius: 50%;
  color: $gray;
  background-color: #fff;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 5px;
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &.fa-info-circle {
    font-size: 31px;
    position: relative;
    &:before {
      position: absolute;
      top: -3px;
      left: -1px;
    }
  }
  &.fa-user-o {
    font-size: 18px;
    font-weight: bold;
    line-height: 24px;
    &.deny {
      border-color: $error_color;
      position: relative;
      &:after {
        content: '';
        width: 2px;
        height: 27px;
        background-color: $error_color;
        display: inline-block;
        position: absolute;
        transform: rotate(-45deg);
        top: calc(-0.33 * 5.4px);
        left: calc(2.1 * 5.4px);
      }
    }
  }
  &.divider {
    line-height: 22px;
    svg {
      width: 20px;
      height: 20px;
      vertical-align: middle;
      fill: currentColor;
      overflow: hidden;
    }
  }
  &.trash,
  &.trash-undo,
  &.robot {
    line-height: 22px;
    svg {
      width: 18px;
      height: 18px;
      vertical-align: middle;
      fill: currentColor;
      overflow: hidden;
    }
    &.on {
      border-color: $active_bgcolor;
      color: $active_bgcolor;
    }
  }
  &.fa-random,
  &.fa-reply-all {
    font-size: 18px;
    line-height: 24px;
    &.ltr {
      transform: scaleX(-1) translateX(50%);
    }
  }
  &[data-deletes]:before {
    content: attr(data-deletes);
    position: absolute;
    right: -5px;
    bottom: -5px;
    height: 16px;
    width: 16px;
    line-height: 16px;
    font-size: 12px;
    background-color: #ff2200;
    border-radius: 50%;
    text-align: center;
    color: #fff;
    font-style: normal;
  }
}
.flex-container {
  display: flex;
  min-height: 590px;
  .flex {
    flex: 1;
    position: relative;
    transition: flex 0.5s;
  }
  .separater {
    width: 20px;
    position: relative;
  }
  &.layout--1 {
    .flex {
      &:first-child {
        flex: 2;
      }
      &:last-child {
        flex: 1;
      }
    }
  }
  &.layout-1 {
    .flex {
      &:first-child {
        flex: 1;
      }
      &:last-child {
        flex: 2;
      }
    }
  }
}
.players {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  border: 1px solid $input_border;
  border-radius: 4px;
  padding: 10px;
  margin: 0;
  min-width: auto;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  legend {
    color: $input_font;
    font-size: 12px;
  }
  &.all-players {
    &.drag {
      &:before {
        content: attr(data-msg);
        display: inline-block;
        border: 2px dotted $active_bgcolor;
        box-sizing: border-box;
        color: $active_bgcolor;
        border-radius: 5px;
        text-align: center;
        position: absolute;
        right: 10px;
        padding: 5px;
        height: calc(100% - 80px);
        width: calc(40% - 15px);
      }
      .player {
        width: 60%;
        margin-right: auto;
        border-style: dotted;
      }
    }
  }
  &.starting-players {
    .player {
      position: relative;
      z-index: 1;
      border-radius: 0 5px 5px 0;
      top: -2px;
      right: -2px;
    }
    .order {
      height: 36px;
      line-height: 36px;
      border: 2px solid $error_color;
      border-radius: 5px;
      margin: 0 0 5px 0;
      &:before {
        content: attr(data-order);
        display: block;
        width: 17px;
        margin-left: 3px;
        color: $error_color;
        text-align: center;
        float: left;
      }
      &.drag .player {
        border-style: dotted;
      }
    }
  }
  .player {
    position: relative;
    height: 40px;
    line-height: 34px;
    background-color: $row_odd_bgcolor;
    color: $row_color;
    border: 2px solid $row_color;
    box-sizing: border-box;
    border-radius: 5px;
    margin: 0 0 5px 0;
    padding: 0 10px 0 20px;
    white-space: nowrap;
    overflow: hidden;
    .name {
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
        }
      }
      .number {
        display: inline-block;
        width: 16px;
        text-align: center;
        flex: 0 0 16px;
      }
      .sortby {
        margin-left: auto;
      }
    }
    &.dragging {
      border-radius: 5px;
      width: 200px !important;
      border-style: solid !important;
    }
  }
  .add-source {
    height: 36px;
    line-height: 36px;
    border: 2px solid $active_bgcolor;
    border-radius: 5px;
    outline: none;
    text-align: left;
    color: $active_bgcolor;
    padding-left: 5px;
    > input[type='text'] {
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
    }
  }
}
.handle {
  position: absolute;
  left: 0;
  z-index: 1;
  cursor: move;
  vertical-align: top;
  width: 50%;
  height: 100%;
  display: inline-block;
  svg {
    width: 20px;
    height: 24px;
    vertical-align: middle;
    fill: currentColor;
    overflow: hidden;
  }
}
.tip {
  cursor: help;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  vertical-align: top;
  width: 50%;
  height: 100%;
  display: inline-block;
}
.tip-trigger {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
.chart {
  text-align: center;
  overflow-x: auto;
  overflow-y: hidden;
  direction: rtl;

  font-size: 12px;
  margin-bottom: 10px;
  padding-top: 5px;
  border-top: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 0 0 10px 10px;
  .chart-inner {
    display: flex;
    align-items: flex-end;
    width: 100%;
  }
  .bar {
    flex-grow: 1;
    min-width: 50px;
  }
  .item {
    display: block;
    height: 20px;
    line-height: 20px;
    width: 36px;
    margin: auto;
    color: #fff;
    margin-bottom: 1px;
    &.red {
      background-color: $hit;
    }
    &.yellow {
      background-color: $nonpa;
    }
    &.blue {
      background-color: $ng;
    }
    &.exclude {
      opacity: 0.5;
    }
  }
  .game {
    display: block;
    line-height: 20px;
    width: 36px;
    margin: auto;
  }
}
.delete {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 1;
  text-align: center;
  .trash {
    line-height: 28px;
    width: 28px;
    height: 28px;
    display: inline-block;
    cursor: pointer;
    svg {
      width: 28px;
      height: 28px;
      vertical-align: middle;
      fill: currentColor;
      overflow: hidden;
    }
  }
}
.player:nth-child(2n) .delete .trash {
  animation: shake1 infinite;
  transform-origin: 50% 10%;
}
.player:nth-child(2n-1) .delete .trash {
  animation: shake2 infinite alternate;
  transform-origin: 30% 5%;
}

i.fa {
  cursor: pointer;
  font-size: 28px;
  vertical-align: middle;
}
.drag {
  border-style: dotted !important;
}
.highlight {
  animation: shadow-pulse 0.8s 5;
}

@keyframes shadow-pulse {
  0% {
    box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.5);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
}
@keyframes shake1 {
  0% {
    transform: rotate(-1deg);
    animation-timing-function: ease-in;
  }
  50% {
    transform: rotate(1.5deg);
    animation-timing-function: ease-out;
  }
}
@keyframes shake2 {
  0% {
    transform: rotate(1deg);
    animation-timing-function: ease-in;
  }
  50% {
    transform: rotate(-1.5deg);
    animation-timing-function: ease-out;
  }
}

/* @media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) { */
@media only screen and (max-height: 414px) and (min-aspect-ratio: 13/9) {
  .sticky {
    top: calc(50vh - (33px * 5 - 5px) / 2 - 35px);
  }
  .flex-container {
    .separater {
      width: 71px;
    }
  }
  .toggle-btn {
    margin-left: 5px;
    transform: translateX(0);
    left: 0;
    vertical-align: top;
    &.fa-info-circle {
      display: block;
      margin: 0 auto 5px;
    }
    &.fa-reply-all.ltr {
      transform: scaleX(-1);
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import { scrollTo, getShuffledArr } from '../libs/utils';

export default {
  data() {
    const ORDER = Array(12)
      .fill(undefined)
      .map((undefined, i) => i + 1);
    const order_x = ORDER.reduce((acc, number) => {
      acc[`order_${number}`] = [];
      return acc;
    }, {});
    return {
      avatar: true,
      deleteMode: false,
      drag: false,
      dragBack: false,
      sourceList: [],
      ...order_x,
      ORDER,
      divider: 0,
      sortBy_: '',
      extra: '',
      extraList: [],
      hiddenList: [],
      delay: 250,
      clickCount: 0,
      clickTimer: null,
      highlight: [],
    };
  },
  created() {
    this.sortBy_ = this.sortBy;

    // until first batter play, order still can change
    const tempOrder = window.localStorage.getItem('temp_order');
    window.localStorage.removeItem('temp_order');
    if (tempOrder) {
      tempOrder.split(',').forEach((name, index, self) => {
        this[`order_${index + 1}`][0] = this.sourceList.find(
          player => player.name === name,
        );
        if (index === self.length - 1) {
          this.sourceList = this.sourceList.filter(
            player => !self.includes(player.name),
          );
        }
      });
    }
  },
  methods: {
    ...mapActions({
      setGame: 'setGame',
      setPeriod: 'setPeriod',
      setTop: 'setTop',
      setUnlimitedPA: 'setUnlimitedPA',
      setSortBy: 'setSortBy',
      editGameOrder: 'editGameOrder',
      alert: 'alert',
    }),
    back_() {
      this.$router.back();
    },
    edit() {
      const result = this.ORDER.map(
        i => this[`order_${i}`][0] && this[`order_${i}`][0].name,
      ).reduce((acc, item, i) => {
        if (item) {
          acc[i] = item;
        }
        return acc;
      }, []);
      const actualCount = result.filter(item => item).length;
      const maxCount = result.length;

      const errorStr = [
        {
          // should be continuously
          condition: actualCount < maxCount,
          err: this.$t('msg_sould_continuously'),
        },
        {
          // should more than 9 players
          condition: actualCount < 9,
          err: this.$t('msg_sould_more_than_9player'),
        },
      ]
        .reduce((acc, check) => {
          return check.condition ? acc.concat(check.err) : acc;
        }, [])
        .join('\n');

      if (errorStr) {
        this.alert(errorStr);
        return;
      }

      // call save action
      this.editGameOrder({
        teamCode: this.$route.params.team,
        gameId: this.$route.params.game,
        orders: result.map(name => ({ name })),
      });
    },
    order_(i) {
      return this[`order_${i}`];
    },
    setSortBy_(sortItem) {
      if (sortItem !== 'number') {
        this.setSortBy(sortItem);
      }
      this.sortBy_ = sortItem;
      this.doResetSource();
    },
    move(event) {
      const fromEle = event.from;
      const toEle = event.originalEvent.target;
      if (
        fromEle.className.indexOf('order') > -1 &&
        toEle.className.indexOf('starting-players') > -1
      ) {
        return false;
      }

      this.target_order = undefined;
      this.origin_order = undefined;
      this.origin = event.draggedContext.element;
      this.target = event.relatedContext.element;

      if (fromEle.className.indexOf('order') > -1) {
        this.origin_order = this.ORDER.find(order => {
          return this[`order_${order}`].find(item => {
            const obj = this.origin;
            return (
              (obj &&
                `${item.name}${item.number}` === `${obj.name}${obj.number}`) ||
              false
            );
          });
        });
      }

      if (toEle.className.indexOf('order') > -1) {
        this.target_order =
          this.ORDER.find(order => {
            return this[`order_${order}`].find(item => {
              const obj = this.target;
              return (
                (obj &&
                  `${item.name}${item.number}` ===
                    `${obj.name}${obj.number}`) ||
                false
              );
            });
          }) || parseInt(toEle.getAttribute('data-order'));
      }

      if (toEle.className.indexOf('starting-players') > -1) {
        this.target_order = this.ORDER.find(
          order => this[`order_${order}`].length === 0,
        );
      }

      return false;
    },
    moveByDblclick(e, currentTargetData, order) {
      e.preventDefault();

      this.clickCount++;

      if (this.clickCount === 1) {
        this.clickTimer = setTimeout(() => {
          this.clickCount = 0;
        }, this.delay);
      } else if (this.clickCount === 2) {
        clearTimeout(this.clickTimer);
        this.clickCount = 0;

        this.origin = currentTargetData;
        this.origin_order = order;
        this.target = undefined;
        this.target_order = undefined;
        this.highlight = [];
        if (!order) {
          this.origin_order = undefined;
          this.target_order = this.ORDER.find(
            order => this[`order_${order}`].length === 0,
          );
        }
        this.dragEnd();
      }
    },
    dragEnd() {
      // console.log('dragEnd', {
      //   origin: this.origin,
      //   origin_order: this.origin_order,
      //   target: this.target,
      //   target_order: this.target_order,
      // });
      if (this.origin_order && this.target_order) {
        // order swap
        this[`order_${this.target_order}`] = this.origin ? [this.origin] : [];
        this[`order_${this.origin_order}`] = this.target ? [this.target] : [];
      } else if (this.origin_order || this.target_order) {
        // two list swap
        if (this.origin_order) {
          this[`order_${this.origin_order}`] = this.target ? [this.target] : [];
        }
        if (this.target_order) {
          this[`order_${this.target_order}`] = this.origin ? [this.origin] : [];
        }

        const deduct = [
          ...this.sourceList.filter(item => {
            const obj = this.target_order ? this.origin : this.target;

            return obj
              ? `${item.name}${item.number}` !== `${obj.name}${obj.number}`
              : true;
          }),
        ];
        const add = [
          this.origin_order
            ? this.origin
            : (this.target_order && this.target) || {},
        ];
        const combine = deduct.concat(add).map(player => player.name);

        this.sourceList = this.resetSource().filter(player =>
          combine.includes(player.name),
        );
      }

      this.highlight = [
        this.target && this.origin_order,
        this.origin && this.target_order,
      ];
      this.$nextTick(() => {
        const element = document.querySelector(
          `[data-order="${this.target_order}"]`,
        );
        scrollTo(element);
      });

      // do nothing if swap in source list
      this.dragBack = false;
      this.drag = false;
    },
    resetSource() {
      // 成績排序 + 沒成績球員 - 請假球員 + 臨時傭兵
      const statistics =
        this.sortBy_ === 'number'
          ? this.teamInfo.players.map(player => ({
              name: player.name,
              number: player.number,
              photo: player.photo,
            }))
          : this.genStatistics.map(player => ({
              ...player,
              name: player.name,
              number: player.data.number,
              photo: player.data.photo,
            }));
      const statisticsExclude = statistics.map(
        player => `${player.name}${player.number}`,
      );
      const others = this.teamInfo.players.filter(
        player =>
          player.name &&
          !statisticsExclude.includes(`${player.name}${player.number}`),
      );
      const hiddenExclude = this.hiddenList.map(
        player => `${player.name}${player.number}`,
      );
      const combine = [...statistics, ...others].filter(
        player => !hiddenExclude.includes(`${player.name}${player.number}`),
      );
      const extras = this.extraList.map(name => ({ name }));
      return [...combine, ...extras];
    },
    doResetSource() {
      // 合理名單球員 - 先發球員
      const startList = this.ORDER.reduce((acc, order) => {
        const player = this[`order_${order}`][0];
        return player ? acc.concat(`${player.name}${player.number}`) : acc;
      }, []);
      this.sourceList = this.resetSource().filter(
        player => !startList.includes(`${player.name}${player.number}`),
      );
    },
    addToSource() {
      if (this.extra && !this.extraList.includes(this.extra)) {
        this.extraList = [...this.extraList, this.extra];
        this.extra = '';
        this.doResetSource();
      }
    },
    addHiddenPlayer(player) {
      this.hiddenList = [...this.hiddenList, player];
      window.localStorage.setItem(
        'hidden_list',
        JSON.stringify(
          this.hiddenList.map(({ name, number }) => ({ name, number })),
        ),
      );
      this.doResetSource();
    },
    releaseHiddenPlayer() {
      this.hiddenList = [];
      window.localStorage.setItem('hidden_list', JSON.stringify([]));
      this.doResetSource();
    },
    formatValue(value, col) {
      return value !== undefined &&
        ['AVG', 'OBP', 'SLG', 'OPS'].includes(col) &&
        value !== '-'
        ? value.toFixed(3)
        : value;
    },
    fillAI() {
      this.deleteMode = false;
      const rules = [
        { order: 3, rule: ['OPS'] },
        { order: 4, rule: ['SLG'] },
        { order: 5, rule: ['RBI', 'SLG'] },
        { order: 1, rule: ['OBP'] },
        { order: 2, rule: ['AVG'] },
        { order: 8, rule: ['OPS'] },
        { order: 7, rule: ['SLG'] },
        { order: 6, rule: ['RBI', 'SLG'] },
        { order: 10, rule: ['OBP'] },
        { order: 9, rule: ['AVG'] },
      ];
      const sort = (a, b, rule, i) => {
        const sortBy = rule[i] || 'number';
        if (a[sortBy] === b[sortBy]) {
          return sort(a, b, rule, i + 1);
        }
        return b[sortBy] - a[sortBy];
      };
      const alreadySetOrders = Array(10)
        .fill(undefined)
        .map((undefined, i) => i + 1)
        .filter(order => this[`order_${order}`].length === 1);
      this.sourceList = rules
        .filter(
          ({ order }) =>
            order <= this.sourceList.length + alreadySetOrders.length,
        )
        .reduce((acc, { order, rule }) => {
          if (this[`order_${order}`].length === 0) {
            const candidates = [...acc].sort((a, b) =>
              sort(a, b, [...rule, 'PA'], 0),
            );
            if (candidates[0]) {
              this[`order_${order}`][0] = candidates[0];
              return acc.filter(player => player.name !== candidates[0].name);
            }
          }
          return acc;
        }, this.sourceList);
    },
    fillRandom() {
      this.deleteMode = false;
      this.fill10(getShuffledArr(this.sourceList));
    },
    fillAll() {
      this.deleteMode = false;
      this.fill10(this.sourceList);
    },
    fill10(source) {
      this.sourceList = this.ORDER.filter(
        order =>
          this[`order_${order}`].length === 0 && ![11, 12].includes(order),
      ).reduce((acc, order, index) => {
        if (source[index]) {
          this[`order_${order}`][0] = source[index];
          return acc.filter(player => player.name !== source[index].name);
        }
        return acc;
      }, this.sourceList);
    },
    clearAll() {
      this.deleteMode = false;
      this.ORDER.forEach((order, index, self) => {
        this[`order_${order}`] = [];
        if (index === self.length - 1) {
          this.sourceList = this.resetSource();
        }
      });
      this.highlight = [];
    },
  },
  computed: {
    ...mapGetters({
      currentTeamIcon: 'currentTeamIcon',
      currentTeam: 'currentTeam',
      teamInfo: 'teamInfo',
      period: 'period',
      periodSelect: 'periodSelect',
      top: 'top',
      unlimitedPA: 'unlimitedPA',
      sortBy: 'sortBy',
      conditionCols: 'conditionCols',
      genStatistics: 'genStatistics',
    }),
  },
  watch: {
    genStatistics() {
      this.doResetSource();
    },
    teamInfo: {
      handler() {
        if (this.sourceList.length === 0) {
          // 請假球員清空
          // 先發球員清空
          // 成績排序 + 沒成績球員
          this.hiddenList =
            JSON.parse(window.localStorage.getItem('hidden_list')) || [];
          this.ORDER.forEach(order => {
            this[`order_${order}`] = [];
          });
          this.sourceList = this.resetSource();
        }
      },
      immediate: true,
    },
    sortBy() {
      this.sortBy_ = this.sortBy;
    },
  },
  components: {
    'drag-n-drop': {
      template: `<svg viewBox="0 0 1024 1024"><path d="M634.311111 0c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0zM372.622222 0C341.333333 0 312.888889 25.6 312.888889 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z"/></svg>`,
    },
    divider: {
      template: `<svg viewBox="0 0 365.368 365.368"><path d="M363.171,177.381L311.1,125.309c-1.406-1.407-3.314-2.197-5.303-2.197c-1.989,0-3.897,0.79-5.303,2.197l-14.143,14.143c-1.407,1.406-2.197,3.314-2.197,5.303c0,1.989,0.79,3.897,2.197,5.303l15.126,15.125h-52.543v-95.5c0-4.142-3.358-7.5-7.5-7.5h-20c-4.142,0-7.5,3.358-7.5,7.5v226c0,4.142,3.358,7.5,7.5,7.5h20c4.142,0,7.5-3.358,7.5-7.5v-95.5h52.543l-15.126,15.126c-1.407,1.406-2.197,3.314-2.197,5.303c0,1.989,0.79,3.897,2.197,5.303l14.143,14.143c1.406,1.407,3.314,2.197,5.303,2.197c1.989,0,3.897-0.79,5.303-2.197l52.071-52.071C366.1,185.058,366.1,180.309,363.171,177.381z"/><path d="M143.934,62.184h-20c-4.142,0-7.5,3.358-7.5,7.5v95.5H63.891l15.126-15.125c2.929-2.929,2.929-7.677,0-10.606l-14.142-14.143c-1.407-1.406-3.315-2.197-5.304-2.197c-1.989,0-3.897,0.79-5.303,2.197L2.197,177.381C0.79,178.787,0,180.695,0,182.684c0,1.989,0.79,3.897,2.197,5.303l52.072,52.071c1.407,1.407,3.314,2.197,5.303,2.197c1.989,0,3.897-0.79,5.304-2.197l14.142-14.143c2.929-2.929,2.928-7.678,0-10.606l-15.126-15.126h52.543v95.5c0,4.142,3.358,7.5,7.5,7.5h20c4.142,0,7.5-3.358,7.5-7.5v-226C151.434,65.542,148.076,62.184,143.934,62.184z"/></svg>`,
    },
    trash: {
      template: `<svg viewBox="0 0 448 512"><path fill="currentColor" d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"/></svg>`,
    },
    'trash-undo': {
      template: `<svg viewBox="0 0 448 512"><path fill="currentColor" d="M432 80h-82.41l-34-56.7C307.88 10.44 289.44 0 274.44 0H173.59c-15 0-33.43 10.44-41.15 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6.66 6.66 0 0 1 177 48h94a6.67 6.67 0 0 1 5.16 2.91L293.62 80H154.38zM368 464H80V128h288zM203.76 348.71A12 12 0 0 0 224 340v-35.16c48.68 5.1 65.21 26 48.45 84.78-2.15 7.53 6.15 13.37 12 8.72C303.11 383.45 320 355 320 326.19c0-62.88-39.64-82-96-86.17V204a12 12 0 0 0-20.24-8.73l-72 68a12 12 0 0 0 0 17.44z"/></svg>`,
    },
    robot: {
      template: `<svg viewBox="0 0 448 512"><path fill="currentColor" d="M17.99986,256H48V128H17.99986A17.9784,17.9784,0,0,0,0,146v92A17.97965,17.97965,0,0,0,17.99986,256Zm412-128H400V256h29.99985A17.97847,17.97847,0,0,0,448,238V146A17.97722,17.97722,0,0,0,429.99985,128ZM116,320H332a36.0356,36.0356,0,0,0,36-36V109a44.98411,44.98411,0,0,0-45-45H241.99985V18a18,18,0,1,0-36,0V64H125a44.98536,44.98536,0,0,0-45,45V284A36.03685,36.03685,0,0,0,116,320Zm188-48H272V240h32ZM288,128a32,32,0,1,1-32,32A31.99658,31.99658,0,0,1,288,128ZM208,240h32v32H208Zm-32,32H144V240h32ZM160,128a32,32,0,1,1-32,32A31.99658,31.99658,0,0,1,160,128ZM352,352H96A95.99975,95.99975,0,0,0,0,448v32a32.00033,32.00033,0,0,0,32,32h96V448a31.99908,31.99908,0,0,1,32-32H288a31.99908,31.99908,0,0,1,32,32v64h96a32.00033,32.00033,0,0,0,32-32V448A95.99975,95.99975,0,0,0,352,352ZM176,448a15.99954,15.99954,0,0,0-16,16v48h32V464A15.99954,15.99954,0,0,0,176,448Zm96,0a16,16,0,1,0,16,16A15.99954,15.99954,0,0,0,272,448Z"/></svg>`,
    },
  },
};
</script>
