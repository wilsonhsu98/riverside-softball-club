<template>
  <div>
    <div class="search-bar" ref="searchBar">
      <div class="search-bar__container">
        <img class="icon" :src="currentTeamIcon || defaultIcon" />
        <i class="fa fa-search"></i>
      </div>
      <input
        type="checkbox"
        class="toggle-search non-input"
        v-model="toggleSearch"
      />
      <div class="condition__container">
        <div class="condition">
          <div class="condition__label">{{ $t('col_period') }}</div>
          <div class="condition__element">
            <div class="selectdiv">
              <select
                class="dropdown"
                :value="periodSelect"
                @change="setPeriod_($event.target.value)"
              >
                <option
                  v-for="item in period"
                  :value="item.period"
                  :key="`period_${item.period}`"
                  >{{
                    `${
                      item.period === 'period_all'
                        ? $t(item.period)
                        : item.period
                    }`
                  }}</option
                >
              </select>
            </div>
          </div>
          <div class="condition__label">{{ $t('col_sort') }}</div>
          <div class="condition__element">
            <div class="selectdiv">
              <select
                class="dropdown"
                :value="sortBy"
                @change="setSortBy_($event.target.value)"
              >
                <option
                  v-for="col in conditionCols"
                  :value="col.name"
                  :key="`col_${col.name}`"
                  >{{ $t(col.name) }}</option
                >
              </select>
            </div>
          </div>
          <div class="condition__label">{{ $t('col_latest') }}</div>
          <div class="condition__element pa">
            <minus-plus-number
              :value="top"
              :disabled="unlimitedPA"
              @change="setTop_"
            />
            <label for="unlimited_pa">
              <input
                id="unlimited_pa"
                type="checkbox"
                :checked="unlimitedPA"
                @change="setUnlimitedPA_($event.target.checked)"
              />{{ $t('col_unlimited') }}
            </label>
          </div>
          <br />
          <div class="condition__label col">{{ $t('col_display') }}</div>
          <div class="condition__element col">
            <label class="condition__col" for="check_all">
              <input
                id="check_all"
                type="checkbox"
                :checked="checkAll"
                @change="setCheckAll_($event.target.checked)"
              />{{ $t('All') }}
            </label>
            <label
              class="condition__col"
              :for="col.name"
              v-for="col in conditionCols"
              :key="`condition_${col.name}`"
            >
              <input
                :id="col.name"
                type="checkbox"
                :value="col.name"
                :checked="col.visible"
                :disabled="col.disabled"
                @change="toggleColumn_(col.name)"
              />{{ $t(col.name) }}
            </label>
          </div>
          <template v-if="lastUpdate">
            <div class="condition__label date">{{ $t('col_update') }}</div>
            <div
              class="condition__element date"
              :data-long="`${$t('col_update')} `"
              :data-short="`${$t('col_update_short')} `"
            >
              {{ new Date(lastUpdate).toLocaleString() }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <div id="table">
      <div class="header-row">
        <template v-for="col in displayedCols">
          <span
            v-if="col.name === 'Rank'"
            :key="`header_${col.name}`"
            class="cell Rank"
            :title="$t(col.name)"
            ><div>{{ $t(col.name) }}</div></span
          >
          <span
            v-else-if="col.name === 'name'"
            :key="`header_${col.name}`"
            class="cell name"
            :title="$t(col.name)"
            ><div>{{ $t(col.name) }}</div></span
          >
          <span
            v-else
            :key="`header_${col.name}`"
            :class="`cell ${col.name}${col.name === sortBy ? ' sort' : ''}`"
            :title="$t(col.name)"
            @click="setSortBy_(col.name)"
            ><div>{{ $t(col.name) }}</div></span
          >
        </template>
      </div>
      <template v-for="(item, itemIndex) in list">
        <input
          type="radio"
          name="expand"
          class="toggle-row non-input"
          :checked="toggleTarget === item.name"
          @click="e => toggleRadio(e, item.name)"
          :key="`chk_${encodeURI(item.name)}`"
        />
        <div
          :class="`row-grid${item.name === userName ? ' current' : ''}`"
          :key="`div_${encodeURI(item.name)}`"
        >
          <template v-for="(col, colIndex) in displayedCols">
            <span
              v-if="col.name === 'Rank'"
              class="cell Rank"
              data-label="Rank"
              :key="`row_${encodeURI(item.name)}_${colIndex}`"
              >{{ itemIndex + 1 }}</span
            >
            <span
              v-else-if="col.name === 'name'"
              class="cell name"
              data-label="name"
              :key="`row_${encodeURI(item.name)}_${colIndex}`"
            >
              <span>
                <span class="img" style="border-width: 1px">
                  <i class="fa fa-user-o"></i>
                </span>
                <img
                  v-if="item.data.photo"
                  class="img"
                  :src="$cacheImg(item.data.photo)"
                  onError="this.style.display='none'"
                />
                {{ item.name }}
              </span>
            </span>
            <span
              v-else
              :class="`cell${col.name === sortBy ? ' sort' : ''}`"
              :data-label="$t(col.name)"
              :key="`row_${encodeURI(item.name)}_${colIndex}`"
            >
              {{ formatValue(item[col.name], col.name) }}
            </span>
          </template>
          <div class="cell level">
            {{
              `${Math.floor((item.AVG * 1000) / 100)}/${Math.floor(
                (item.OBP * 1000) / 100,
              )}/${Math.floor((item.SLG * 1000) / 100)}`
            }}
          </div>
          <div
            v-if="item.listByGame.length"
            class="cell chart"
            :style="{ top: `${(itemIndex + 2) * 36}px` }"
            :id="`row_${item.name}`"
          >
            <div class="chart-wrapper">
              <coordination
                v-if="item.locations.length"
                :values="item.locations"
                :no_track="true"
                fixedSize="133"
                style="cursor: pointer; position: absolute; right: 0; bottom: 0;"
                @click.native="coordinates = item.locations"
              />
              <div
                class="chart-inner"
                :class="{ 'has-coordination': item.locations.length }"
              >
                <div
                  class="bar"
                  v-for="(cube, cubeIndex) in item.listByGame"
                  :key="`bar_${encodeURI(item.name)}_${cubeIndex}`"
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
                        `item ${cell.color} ${cell.exclude ? 'exclude' : ''}`
                      "
                      :key="`${cubeIndex}${cellIndex}`"
                      >{{ $t(cell.content) }}</span
                    >
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div
      v-if="coordinates.length > 0"
      class="location-modal"
      @click="closeLocation"
    >
      <coordination :values="coordinates" :no_track="true" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.condition {
  background-color: #fff;
  border-radius: 10px;
  margin: 20px 0;
  padding: 20px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  > div,
  label {
    display: inline-block;
    line-height: 30px;
    height: 30px;
    vertical-align: middle;
    &[for='unlimited_pa'] {
      margin-left: 5px;
    }
  }
  label {
    cursor: pointer;
  }
  &__label {
    padding: 0 4px;
    text-align: left;
    &.col {
      vertical-align: top;
    }
  }
  &__element {
    &.col {
      width: calc(100% - 90px);
      height: auto;
    }
  }
  &__col {
    margin-right: 10px;
    vertical-align: middle;
    text-align: left;
  }
}

i.fa {
  font-size: 28px;
  vertical-align: middle;
  cursor: pointer;
}

#table {
  display: table;
  width: 100%;
  // background: #FFF;
  margin: 0;
  box-sizing: border-box;
  color: $row_color;
  position: relative;
  z-index: 0;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  .header-row {
    display: table-row;
    color: $header_color;
    .cell {
      background: $header_bgcolor;
      &:first-of-type {
        border-top-left-radius: 10px;
      }
      &:last-of-type {
        border-top-right-radius: 10px;
      }
      &:not(.Rank):not(.name) {
        cursor: pointer;
      }
      > div {
        height: 36px;
        overflow: hidden;
      }
      &.Rank {
        width: 45px;
      }
      &.name {
        width: 100px;
        padding-left: 0;
        text-align: center;
      }
      &:nth-child(2n + 3):not(.sort) {
        opacity: 1;
        > div {
          opacity: 0.6;
        }
      }
    }
  }
  .toggle-row {
    display: block;
    position: absolute;
    left: 0;
    z-index: 1;
    height: 36px;
    width: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    &:checked {
      & + .row-grid span.cell:last-of-type {
        display: block;
        border-bottom-right-radius: 0;
      }
      & + .row-grid .cell.chart {
        display: block;
      }
    }
  }
  .row-grid {
    display: table-row;
    &:nth-child(4n + 3) {
      background-color: $row_even_bgcolor;
    }
    &:nth-child(4n + 1) {
      background-color: $row_odd_bgcolor;
    }
    &:last-child {
      span.cell {
        &:first-of-type {
          border-bottom-left-radius: 10px;
        }
        &:last-of-type {
          border-bottom-right-radius: 10px;
        }
      }
    }
    &.current {
      background-color: $current_user_bgcolor;
      color: $current_user_color;
      .cell .img {
        border-color: $current_user_color;
      }
      .cell.chart .game {
        color: $row_color;
      }
    }
  }
  .cell {
    display: table-cell;
    line-height: 36px;
    text-align: center;
    &span:nth-of-type(2n + 3) {
      opacity: 0.6;
    }
    &.chart {
      background-color: #fff;
      position: absolute;
      left: 145px;
      right: 0;
      z-index: 2;
      overflow: hidden;
      height: 133px;

      display: none;

      font-size: 12px;
      margin-bottom: 20px;
      border-top: 0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      border-radius: 0 0 10px 10px;
      .chart-wrapper {
        position: absolute;
        right: 0;
        left: 0;
        height: 133px;
        display: flex;
      }
      .chart-inner {
        display: flex;
        align-items: flex-end;
        direction: rtl;
        overflow-x: auto;
        width: 100%;
        &.has-coordination {
          width: calc(100% - 133px);
        }
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
    &.name {
      text-align: center;
      &:first-letter {
        text-transform: uppercase;
      }
      > span {
        position: relative;
        padding-left: 36px;
        text-align: left;
        line-height: 36px;
        display: inline-block;
        width: 100px;
        box-sizing: border-box;
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
      }
    }
    &.sort {
      opacity: 1;
      color: $error_color;
      > div {
        opacity: 1;
      }
    }
    &.level {
      display: none;
    }
  }
}
.search-bar__container,
.toggle-search {
  display: none;
}

.location-modal {
  position: fixed;
  z-index: 2;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  &::v-deep {
    .root-container {
      top: 50%;
      transform: translateY(-50%);
      text-align: center;
    }
    img {
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
@media only screen and (max-width: 760px) {
  .search-bar {
    background: $header_bgcolor center 2px no-repeat;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.13), 0 0 2px 0 rgba(0, 0, 0, 0.2);
    background-size: 55px auto;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    overflow: hidden;
    color: $header_color;
    text-align: center;
    &__container {
      display: block;
      height: 50px;
      line-height: 50px;
      text-align: right;
      padding-right: 14px;
      position: relative;
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
    .toggle-search {
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
      height: 50px;
      width: 50px;
      margin: 0;
      opacity: 0;
      cursor: pointer;
      &:checked {
        & ~ .condition__container {
          max-height: 200vh;
          transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
          transition-delay: 0s;
        }
      }
    }
    .condition__container {
      display: block;
      max-height: 0;
      transition: max-height 0.5s cubic-bezier(0, 1, 0, 1) -0.1s;
    }
    .condition {
      background-color: transparent;
      border-radius: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      padding: 3px;
      box-sizing: border-box;
      position: relative;
      > br {
        display: none;
      }
      &__col {
        margin: 0 8px 3px 0;
      }
      &__label {
        text-align: right;
        margin: 0 3px 6px 0;
        &.date {
          display: none;
        }
      }
      &__element {
        text-align: left;
        margin: 0 3px 6px 0;
        &.date {
          width: 100vw;
          text-align: right;
          padding: 0 10px 10px 0;
          margin: 0;
          &:before {
            content: attr(data-long);
          }
        }
      }
    }
  }
  #table {
    display: block;
    border: none;
    overflow: hidden;
    position: relative;
    z-index: 0;
    border-radius: 0;
    .row-grid {
      position: relative;
      display: flex;
      flex-wrap: wrap;

      z-index: 0;
      background-color: #fff;
      transition: max-height 0.8s cubic-bezier(0, 1, 0, 1) -0.1s;
      max-height: 36px;
      &:nth-child(4n + 1) {
        background-color: $row_odd_bgcolor;
      }
      &:nth-child(4n + 3) {
        background-color: $row_even_bgcolor;
      }
      &.current {
        .cell {
          color: $current_user_bgcolor;
          &.Rank,
          &.name,
          &.level,
          &.sort {
            background-color: $current_user_bgcolor;
            color: $current_user_color;
          }
          &.chart .game {
            color: $current_user_bgcolor;
          }
        }
      }
      .cell:nth-child(2n + 3) {
        opacity: 1;
      }
      &:last-child {
        span.cell {
          &:first-of-type {
            border-bottom-left-radius: 0;
          }
          &:last-of-type {
            border-bottom-right-radius: 0;
          }
        }
      }
    }
    .header-row {
      display: none;
    }
    .cell {
      order: 6;
      display: block;
      box-sizing: border-box;
      &:not(.sort):not(.Rank):not(.name):not(.chart):not(.level) {
        text-align: left;
      }
      &:not(.Rank):not(.name):not(.chart):not(.level) {
        &:before {
          content: attr(data-label) ':';
          display: inline-block;
          width: 58px;
          text-align: right;
          margin-right: -2px;
        }
      }
      &.Rank {
        order: 1;
      }
      &.name {
        order: 2;
      }
      &.level {
        order: 3;
        display: block;
      }
      &.sort {
        order: 4;
        color: inherit;
      }
      &.chart {
        order: 5;
        position: initial;
        margin: 0;
        border: none;
        box-shadow: none;
        background-color: transparent;
        display: flex;
        border-radius: 0;
      }
    }
    .toggle-row:checked + .row-grid {
      max-height: 200vh;
      transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
      transition-delay: 0s;
    }
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  #table {
    .row-grid {
      .cell {
        width: 33%;
        &.Rank {
          width: 10%;
        }
        &.name {
          width: 33%;
        }
        &.level {
          width: 70px;
        }
        &.sort {
          width: calc(57% - 70px);
        }
        &.chart {
          width: 100%;
        }
      }
    }
  }
  .search-bar {
    .condition {
      &__label {
        width: 31vw;
        &.date {
          display: none;
        }
      }
      &__element {
        width: 62vw;
        &.col {
          height: auto;
          width: 62vw;
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        &.date {
          &:before {
            content: attr(data-short);
          }
        }
      }
      &__col {
        width: 29%;
      }
    }
  }
  [lang='zh-TW'] {
    .search-bar .condition__element.col {
      font-size: 14px;
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  #table {
    .row-grid {
      .cell {
        width: 20%;
        &.Rank {
          width: 10%;
        }
        &.name {
          width: 20%;
        }
        &.level {
          width: 80px;
        }
        &.sort {
          width: calc(70% - 80px);
        }
        &.chart {
          width: 100%;
        }
      }
    }
  }
  .search-bar {
    .condition {
      &__label {
        width: 18vw;
        &.date {
          visibility: hidden;
        }
      }
      &__element {
        width: 29vw;
        &.pa {
          width: 78vw;
        }
        &.col {
          height: auto;
          width: 78vw;
          display: flex;
          flex-wrap: wrap;
          margin: 0 0 0 2px;
        }
      }
      &__col {
        width: 12%;
      }
    }
  }
  [lang='zh-TW'] {
    .search-bar .condition__element.col {
      font-size: 12px;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';
import { scrollTo } from '../libs/utils';
const clickEvent = (() => {
  if ('ontouchstart' in document.documentElement === true) return 'touchstart';
  else return 'click';
})();

export default {
  data() {
    return {
      toggleSearch: false,
      toggleTarget: null,
      defaultIcon,
      coordinates: [],
    };
  },
  created() {},
  mounted() {
    document.addEventListener(clickEvent, this.collapseSearch, true);
  },
  beforeDestroy() {
    document.removeEventListener(clickEvent, this.collapseSearch);
  },
  methods: {
    ...mapActions([
      'setPeriod',
      'setTop',
      'setUnlimitedPA',
      'setSortBy',
      'setCheckAll',
      'toggleColumn',
    ]),
    formatValue(value, col) {
      return ['AVG', 'OBP', 'SLG', 'OPS'].indexOf(col) > -1 && value !== '-'
        ? value.toFixed(3)
        : value;
    },
    toggleRadio(e, target) {
      if (this.toggleTarget === target) {
        this.toggleTarget = null;
      } else {
        this.toggleTarget = target;
        const scrollToHandler = function() {
          scrollTo(e.target.nextSibling);
          e.target.nextSibling.removeEventListener(
            'transitionend',
            scrollToHandler,
          );
        };
        e.target.nextSibling.addEventListener('transitionend', scrollToHandler);
      }
    },
    collapseSearch(event) {
      if (
        this.toggleSearch &&
        !this.$refs['searchBar'].contains(event.target)
      ) {
        this.toggleSearch = false;
        event.preventDefault();
      }
    },
    setPeriod_(period) {
      this.toggleTarget = null;
      this.setPeriod(period);
    },
    setTop_(top) {
      this.toggleTarget = null;
      this.setTop(top);
    },
    setUnlimitedPA_(isChecked) {
      this.toggleTarget = null;
      this.setUnlimitedPA(isChecked);
    },
    setSortBy_(sortItem) {
      this.toggleTarget = null;
      this.setSortBy(sortItem);
    },
    setCheckAll_(isCheckAll) {
      this.toggleTarget = null;
      this.setCheckAll(isCheckAll);
    },
    toggleColumn_(column) {
      this.toggleTarget = null;
      this.toggleColumn(column);
    },
    closeLocation(e) {
      if (!['CANVAS', 'IMG'].includes(e.target.tagName)) {
        this.coordinates = [];
      }
    },
  },
  computed: {
    ...mapGetters({
      period: 'period',
      periodSelect: 'periodSelect',
      top: 'top',
      unlimitedPA: 'unlimitedPA',
      sortBy: 'sortBy',
      checkAll: 'checkAll',
      conditionCols: 'conditionCols',
      list: 'genStatistics',
      displayedCols: 'displayedCols',
      lastUpdate: 'lastUpdate',
      userName: 'userName',
      currentTeamIcon: 'currentTeamIcon',
    }),
  },
};
</script>
