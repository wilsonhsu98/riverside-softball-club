<template>
  <div>
    <mobile-header
      :icon="currentTeamIcon"
      :save_label="$t('btn_next')"
      @back="back_"
      @save="edit"
    />
    <div class="container" ref="container">
      <h1>{{ $t('fill_order') }}</h1>
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
                v-if="container"
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
                      onerror="this.style.display='none'"
                    />
                  </span>
                  <span class="number">{{ player.number || '?' }}</span>
                  <span>{{ player.name }}</span>
                  <span class="sortby"
                    >&nbsp;{{ formatValue(player[sortBy], sortBy) }}</span
                  >
                </span>
                <v-popover
                  v-if="(player.listByGame || []).length && container"
                  placement="bottom"
                  trigger="click"
                  popoverClass="info"
                  offset="14"
                  class="tip"
                  delay="300"
                  :autoHide="true"
                  :container="$refs.container"
                  @show="setSimplebar(`chart-inner_${player.name}`)"
                >
                  <!-- This will be the popover target (for the events and position) -->
                  <div class="tip-trigger"></div>

                  <!-- This will be the content of the popover -->
                  <template slot="popover">
                    <div class="chart">
                      <div
                        class="chart-inner"
                        :id="`chart-inner_${player.name}`"
                      >
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
                          onerror="this.style.display='none'"
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
        <button class="btn" @click="edit">{{ $t('btn_next') }}</button>
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
    transition: all 0.5s;
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
        height: calc(100% - 35px);
        width: calc(40% - 15px);
      }
      .player,
      .add-source {
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
      /* width: 200px !important; */
      border-style: solid !important;
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
    box-sizing: border-box;
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
  font-size: 12px;
  margin-bottom: 5px;
  padding-top: 5px;
  .chart-inner {
    white-space: nowrap;
    direction: rtl;
    ::-webkit-scrollbar {
      display: none;
    }
  }
  .bar {
    width: 50px;
    display: inline-block;
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
import SimpleBar from 'simplebar';
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
      container: null,
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
        if (!this.hiddenList.find(player => player.name === name)) {
          this[`order_${index + 1}`][0] = this.sourceList.find(
            player => player.name === name,
          ) || { name };
        }
        if (index === self.length - 1) {
          this.sourceList = this.sourceList.filter(
            player => !self.includes(player.name),
          );
        }
      });
    }
  },
  mounted() {
    this.container = this.$refs.container;
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
        redirect: () => {
          this.$router.push(
            `/main/games/${this.$route.params.team}/${this.$route.params.game}/position`,
          );
        },
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
      // console.log(toEle)
      if (typeof toEle.className === 'object') return false;
      if (
        !(
          toEle.className.includes('order') ||
          toEle.className.includes('starting-players') ||
          toEle.className.includes('all-players players') ||
          toEle.classList.contains('player')
        )
      )
        return false;
      if (
        fromEle.className.includes('order') &&
        toEle.className.includes('starting-players')
      ) {
        return false;
      }

      this.target_order = undefined;
      this.origin_order = undefined;
      this.origin = event.draggedContext.element;
      this.target = event.relatedContext.element;

      if (fromEle.className.includes('order')) {
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

      if (toEle.className.includes('order')) {
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
        this.target = this[`order_${this.target_order}`][0];
      }

      if (toEle.className.includes('starting-players')) {
        this.target_order = this.ORDER.find(
          order => this[`order_${order}`].length === 0,
        );
      }

      if (
        toEle.classList.contains('player') &&
        toEle.parentElement.getAttribute('data-order')
      ) {
        this.target_order = parseInt(
          toEle.parentElement.getAttribute('data-order'),
        );
        this.target = this[`order_${this.target_order}`][0];
      }
      // console.log('toele', toEle)
      // console.log('origin', this.origin, event.draggedContext)
      // console.log('target', this.target, event.relatedContext)
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
        ['AVG', 'OBP', 'SLG', 'OPS', 'AVG_NO', 'AVG_SP', 'AVG_FB'].includes(
          col,
        ) &&
        value !== '-'
        ? value.toFixed(3)
        : value;
    },
    fillAI() {
      this.deleteMode = false;
      const rules = [
        { order: 3, rule: ['OPS'] },
        { order: 4, rule: ['AVG_SP', 'SLG'] },
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
          if (a[sortBy] || b[sortBy]) {
            return sort(a, b, rule, i + 1);
          } else {
            return 0;
          }
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
    setSimplebar(id) {
      setTimeout(() => {
        new SimpleBar(document.querySelector(`#${id}`));
      }, 300);
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
};
</script>
