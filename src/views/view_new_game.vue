<template>
  <div>
    <mobile-header
      :back="$route.params.team ? back_ : undefined"
      :icon="$route.params.team ? currentTeamIcon : undefined"
      :save="edit"
    />
    <div class="container" ref="container">
      <h1>{{ $t('create_game') }}</h1>
      <div class="condition">
        <div class="condition__group">
          <div class="condition__label">{{ $t('col_period') }}</div>
          <div class="selectdiv" :class="sortBy_ === 'number' && 'disabled'">
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
                class="toggle-btn fa fa-user-o"
                :class="!avatar && 'deny'"
                @click="avatar = !avatar"
              ></i>
              <i class="toggle-btn divider" @click="divider += 1"
                ><divider
              /></i>
              <i
                class="toggle-btn fa fa-trash"
                :class="deleteMode && 'on'"
                @click="deleteMode = !deleteMode"
              ></i>
              <i
                class="toggle-btn fa fa-refresh"
                @click="releaseHiddenPlayer()"
              ></i>
            </div>
            <div class="flex"></div>
          </div>
        </div>
        <div
          class="flex-container"
          :class="`layout-${divider % 4 === 1 ? -1 : divider % 2 ? 1 : 0}`"
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
                <i class="handle" @click="e => moveByDblclick(e, player)"
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
                    <div v-if="(player.listByGame || []).length" class="chart">
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
                    class="fa fa-trash"
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
                  ></i>
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
  top: calc(50vh - 126px - 63.5px);
  z-index: 1;
  .fake-flex {
    position: absolute;
    top: 126px;
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
  border: 2px solid #a6a6a6;
  text-align: center;
  border-radius: 50%;
  color: #a6a6a6;
  background-color: #fff;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 5px;
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
        height: 28px;
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
    svg.icon-divider {
      width: 20px;
      height: 20px;
      vertical-align: middle;
      fill: currentColor;
      overflow: hidden;
    }
  }
  &.fa-trash,
  &.fa-refresh {
    font-size: 18px;
    line-height: 24px;
    &.on {
      border-color: $active_bgcolor;
      color: $active_bgcolor;
    }
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
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 10px;
  margin: 0;
  min-width: auto;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  legend {
    color: #b5b5b5;
    font-size: 12px;
  }
  &.all-players {
    &.drag:before {
      content: attr(data-msg);
      display: block;
      height: 36px;
      line-height: 36px;
      border: 2px dashed $active_bgcolor;
      color: $active_bgcolor;
      border-radius: 5px;
      margin-bottom: 5px;
      text-align: center;
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
    }
  }
  .player {
    position: relative;
    height: 36px;
    line-height: 36px;
    background-color: $row_odd_bgcolor;
    color: $row_color;
    border: 2px solid $row_color;
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
      width: 200px;
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
      color: #a6a6a6;
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
  svg.icon {
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
      background-color: #ef1010;
    }
    &.yellow {
      background-color: #efaf34;
    }
    &.blue {
      background-color: #4d9de5;
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
}
.player:nth-child(2n) .delete .fa-trash {
  animation: shake1 infinite;
  transform-origin: 50% 10%;
}
.player:nth-child(2n-1) .delete .fa-trash {
  animation: shake2 infinite alternate;
  transform-origin: 30% 5%;
}

i.fa {
  cursor: pointer;
  font-size: 28px;
  vertical-align: middle;
}
.drag {
  border-style: dashed !important;
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

@media only screen and (max-width: 760px) {
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import router from '../router';
import { scrollTo } from '../libs/utils';

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
    if (this.$route.params.team) {
      this.fetchTeamInfo(this.$route.params.team);
    }
    this.sortBy_ = this.sortBy;
  },
  methods: {
    ...mapActions({
      fetchTeamInfo: 'fetchTeamInfo',
      setPeriod: 'setPeriod',
      setTop: 'setTop',
      setUnlimitedPA: 'setUnlimitedPA',
      setSortBy: 'setSortBy',
    }),
    back_() {
      router.back();
    },
    edit() {},
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
      if (
        event.from.className.indexOf('order') > -1 &&
        event.to.className.indexOf('starting-players') > -1
      ) {
        return false;
      }

      this.target_order = undefined;
      this.origin_order = undefined;
      this.origin = event.draggedContext.element;
      this.target = event.relatedContext.element;

      if (event.from.className.indexOf('order') > -1) {
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

      if (event.to.className.indexOf('order') > -1) {
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
          }) || parseInt(event.to.getAttribute('data-order'));
      }

      if (event.to.className.indexOf('starting-players') > -1) {
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
      if (this.extra) {
        this.extraList = [...this.extraList, this.extra];
        this.extra = '';
        this.doResetSource();
      }
    },
    addHiddenPlayer(player) {
      this.hiddenList = [...this.hiddenList, player];
      this.doResetSource();
    },
    releaseHiddenPlayer() {
      this.hiddenList = [];
      this.doResetSource();
    },
    formatValue(value, col) {
      return value !== undefined &&
        ['AVG', 'OBP', 'SLG', 'OPS'].indexOf(col) > -1 &&
        value !== '-'
        ? value.toFixed(3)
        : value;
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
    $route() {
      if (this.$route.params.team) {
        this.fetchTeamInfo(this.$route.params.team);
      }
    },
    genStatistics() {
      this.doResetSource();
    },
    teamInfo() {
      // 請假球員清空
      // 先發球員清空
      // 成績排序 + 沒成績球員
      this.releaseHiddenPlayer();
      this.ORDER.forEach(order => {
        this[`order_${order}`] = [];
      });
      this.sourceList = this.resetSource();
    },
    sortBy() {
      this.sortBy_ = this.sortBy;
    },
  },
  components: {
    'drag-n-drop': {
      template: `
          <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M634.311111 0c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0zM372.622222 0C341.333333 0 312.888889 25.6 312.888889 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z"  /></svg>
          `,
    },
    divider: {
      template: `<svg class="icon-divider" version="1.1" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px" viewBox="0 0 365.368 365.368" style="enable-background:new 0 0 365.368 365.368;" xml:space="preserve"><path d="M363.171,177.381L311.1,125.309c-1.406-1.407-3.314-2.197-5.303-2.197c-1.989,0-3.897,0.79-5.303,2.197l-14.143,14.143c-1.407,1.406-2.197,3.314-2.197,5.303c0,1.989,0.79,3.897,2.197,5.303l15.126,15.125h-52.543v-95.5c0-4.142-3.358-7.5-7.5-7.5h-20c-4.142,0-7.5,3.358-7.5,7.5v226c0,4.142,3.358,7.5,7.5,7.5h20c4.142,0,7.5-3.358,7.5-7.5v-95.5h52.543l-15.126,15.126c-1.407,1.406-2.197,3.314-2.197,5.303c0,1.989,0.79,3.897,2.197,5.303l14.143,14.143c1.406,1.407,3.314,2.197,5.303,2.197c1.989,0,3.897-0.79,5.303-2.197l52.071-52.071C366.1,185.058,366.1,180.309,363.171,177.381z"/><path d="M143.934,62.184h-20c-4.142,0-7.5,3.358-7.5,7.5v95.5H63.891l15.126-15.125c2.929-2.929,2.929-7.677,0-10.606l-14.142-14.143c-1.407-1.406-3.315-2.197-5.304-2.197c-1.989,0-3.897,0.79-5.303,2.197L2.197,177.381C0.79,178.787,0,180.695,0,182.684c0,1.989,0.79,3.897,2.197,5.303l52.072,52.071c1.407,1.407,3.314,2.197,5.303,2.197c1.989,0,3.897-0.79,5.304-2.197l14.142-14.143c2.929-2.929,2.928-7.678,0-10.606l-15.126-15.126h52.543v95.5c0,4.142,3.358,7.5,7.5,7.5h20c4.142,0,7.5-3.358,7.5-7.5v-226C151.434,65.542,148.076,62.184,143.934,62.184z"/></svg>`,
    },
  },
};
</script>
