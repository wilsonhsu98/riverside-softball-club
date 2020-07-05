<template>
  <div>
    <div class="search-bar" ref="searchBar">
      <div class="search-bar__container">
        <img
          class="icon"
          :src="$cacheImg(currentTeamIcon) || $cacheImg(defaultIcon)"
        />
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
                        ? $t('period_all')
                        : item.period === ''
                        ? $t('period_empty')
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
            <label class="unlimited_pa">
              <input
                type="checkbox"
                :checked="unlimitedPA"
                @change="setUnlimitedPA_($event.target.checked)"
              />{{ $t('col_unlimited') }}
            </label>
          </div>
          <br />
          <div class="condition__label col">{{ $t('col_display') }}</div>
          <div class="condition__element col">
            <label class="condition__col">
              <input
                type="checkbox"
                :checked="checkAll"
                @change="setCheckAll_($event.target.checked)"
              />{{ $t('All') }}
            </label>
            <label
              class="condition__col"
              v-for="col in conditionCols"
              :key="`condition_${col.name}`"
            >
              <input
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
    <div class="sticky-table-wrapper" ref="sticky-table-wrapper">
      <div class="sticky-table">
        <div class="header-row">
          <template v-for="col in displayedCols">
            <div
              v-if="col.name === 'Rank'"
              :key="`header_${col.name}`"
              class="cell rank"
              :title="$t(col.name)"
            >
              {{ $t(col.name) }}
            </div>
            <div
              v-else-if="col.name === 'name'"
              :key="`header_${col.name}`"
              class="cell name"
              :title="$t(col.name)"
            >
              {{ $t(col.name) }}
            </div>
            <div
              v-else
              :key="`header_${col.name}`"
              class="cell"
              :class="{
                sort: col.name === sortBy,
                [col.name]: true,
              }"
              :title="$t(col.name)"
              @click="setSortBy_(col.name)"
            >
              <div>{{ $t(col.name) }}</div>
            </div>
          </template>
        </div>
        <template v-for="(item, itemIndex) in list">
          <input
            :key="`chk_${item.name}`"
            :id="`chk_${item.name}`"
            type="radio"
            name="expand"
            class="toggle-row non-input"
            :checked="toggleTarget === item.name"
            @click="e => toggleRadio(e, item.name)"
          />
          <div
            class="normal-row"
            :class="{ current: item.name === userName }"
            :key="`div_${item.name}`"
          >
            <template v-for="(col, colIndex) in displayedCols">
              <label
                v-if="col.name === 'Rank'"
                :key="`row_${item.name}_${colIndex}`"
                :for="`chk_${item.name}`"
                class="cell rank"
                ><div class="align-right">{{ itemIndex + 1 }}</div></label
              >
              <label
                v-else-if="col.name === 'name'"
                :key="`row_${item.name}_${colIndex}`"
                :for="`chk_${item.name}`"
                class="cell name"
              >
                <div class="player">
                  <div class="img" style="border-width: 1px">
                    <i class="fa fa-user-o"></i>
                  </div>
                  <img
                    v-if="item.data.photo"
                    class="img"
                    :src="$cacheImg(item.data.photo)"
                    onError="this.style.display='none'"
                  />
                  {{ item.name }}
                </div>
                <div
                  v-if="item.listByGame.length && lazy"
                  class="chart"
                  tabIndex="-1"
                  :id="`chart_${item.name}`"
                  :style="{ width: `${chartWidth}px` }"
                  @click="e => e.preventDefault()"
                >
                  <div class="chart-wrapper">
                    <div class="chart-inner">
                      <div
                        class="bar"
                        v-for="(cube, cubeIndex) in item.listByGame"
                        :key="`bar_${item.name}_${cubeIndex}`"
                      >
                        <template v-for="(cell, cellIndex) in cube">
                          <div
                            v-if="cellIndex === cube.length - 1"
                            class="game"
                            :key="`${cubeIndex}${cellIndex}`"
                          >
                            {{ cell }}
                          </div>
                          <div
                            v-else
                            class="item"
                            :class="{
                              [cell.color]: true,
                              exclude: cell.exclude,
                            }"
                            :key="`${cubeIndex}${cellIndex}`"
                          >
                            {{ $t(cell.content) }}
                          </div>
                        </template>
                      </div>
                    </div>
                    <coordination
                      v-if="item.locations.length"
                      :values="item.locations"
                      :no_track="true"
                      fixedSize="144"
                      style="cursor: pointer;"
                      @click.native="coordinates = item.locations"
                    />
                  </div>
                </div>
              </label>
              <div
                v-else-if="['AVG_NO', 'AVG_SP', 'AVG_FB'].includes(col.name)"
                class="cell advance"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_${item.name}_${colIndex}`"
              >
                <div>{{ formatValue(item[col.name]) }}</div>
                <div>{{ `(${item[col.name.replace('_', '_DESC_')]})` }}</div>
              </div>
              <div
                v-else-if="['AVG', 'OBP', 'SLG', 'OPS'].includes(col.name)"
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_${item.name}_${colIndex}`"
              >
                {{ formatValue(item[col.name]) }}
              </div>
              <div
                v-else-if="col.name === 'LEVEL'"
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_${item.name}_${colIndex}`"
              >
                {{ item[col.name] }}
              </div>
              <div
                v-else
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_${item.name}_${colIndex}`"
              >
                <div class="align-right">{{ item[col.name] }}</div>
              </div>
            </template>
          </div>
        </template>
      </div>
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
    &.unlimited_pa {
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
    overflow: hidden;
  }
}

i.fa {
  font-size: 28px;
  vertical-align: middle;
  cursor: pointer;
}

.sticky-table-wrapper {
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  max-height: calc(100vh - 70px - 20px);
  max-height: calc(var(--vh, 1vh) * 100 - 70px - 20px);
  &::-webkit-scrollbar {
    display: none;
  }
}
.sticky-table {
  display: table;
  min-width: 100%;
  margin: 0;
  box-sizing: border-box;
  color: $row_color;
  position: relative;
  z-index: 0;
  .header-row {
    display: table-row;
    color: $header_color;
    .cell {
      background: $header_bgcolor_noalpha;
      position: sticky;
      top: 0;
      z-index: 4;
      text-align: center;
      &:not(.rank):not(.name) {
        cursor: pointer;
      }
      > div {
        height: 36px;
        white-space: nowrap;
      }
      &.rank {
        width: 1px;
        z-index: 5;
        cursor: initial;
      }
      &.name {
        width: 1px;
        padding-left: 0;
        text-align: center;
        z-index: 5;
        cursor: initial;
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
    width: 100%;
    height: 36px;
    z-index: 1;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    &:checked + .normal-row {
      .cell.name {
        z-index: 3;
      }
      .chart {
        display: block;
      }
    }
  }
  .normal-row {
    display: table-row;
    &:nth-child(4n + 3) .cell {
      background-color: $row_even_bgcolor;
    }
    &:nth-child(4n + 1) .cell {
      background-color: $row_odd_bgcolor;
    }
    &.current {
      color: $current_user_color;
      .cell {
        &:not(.chart) {
          background-color: $current_user_bgcolor;
        }
        .img {
          border-color: $current_user_color;
        }
      }
      .chart .game {
        color: $row_color;
      }
    }
  }
  .cell {
    display: table-cell;
    line-height: 36px;
    text-align: center;
    padding: 0 5px;
    box-sizing: border-box;
    white-space: nowrap;
    &.rank {
      position: sticky !important;
      left: 0 !important;
      z-index: 2;
      cursor: pointer;
    }
    &.name {
      position: sticky !important;
      left: 42px !important;
      z-index: 2;
      /* box-shadow: 5px 0 5px -5px #333; */
      cursor: pointer;
      text-align: center;
      &:first-letter {
        text-transform: uppercase;
      }
      .player {
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
      color: $error_color;
    }
    &.level {
      display: none;
    }
    &.advance > div {
      display: inline-block;
      &:first-child {
        width: 50px;
        text-align: right;
      }
      &:last-child {
        margin-left: 5px;
        width: 58px;
        text-align: left;
      }
    }
    .align-right {
      margin: auto;
      width: 20px;
      text-align: right;
      direction: rtl;
    }
  }
  .chart {
    background-color: #fff;
    position: absolute;
    left: 110px;
    z-index: 2;
    overflow: hidden;
    outline: none;

    display: none;

    font-size: 12px;
    padding: 0;
    border-top: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    .chart-wrapper {
      display: flex;
      width: 100%;
    }
    .chart-inner {
      display: flex;
      align-items: flex-end;
      direction: rtl;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      width: 100%;
      padding-top: 5px;
      cursor: initial;
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
      text-align: center;
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
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      display: inline-block;
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
  .sticky-table-wrapper {
    max-height: calc(100vh - 100px);
    max-height: calc(var(--vh, 1vh) * 100 - 100px);
  }
  .sticky-table {
    .toggle-row:checked + .normal-row .chart {
      left: -42px;
      width: 100vw !important;
    }
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
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
      lazy: false,
      chartWidth: 0,
    };
  },
  created() {},
  mounted() {
    setTimeout(() => {
      this.lazy = true;
    }, 500);
    document.addEventListener(clickEvent, this.collapseSearch, true);
    window.addEventListener('resize', this.requestAnimationFrame);
    this.detectChartWidth();
  },
  beforeDestroy() {
    document.removeEventListener(clickEvent, this.collapseSearch);
    window.removeEventListener('resize', this.requestAnimationFrame);
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
    formatValue(value) {
      return value !== '-' ? value.toFixed(3) : value;
    },
    toggleRadio(e, target) {
      if (this.toggleTarget === target) {
        this.toggleTarget = null;
      } else {
        this.toggleTarget = target;
        document
          .querySelector(`#${e.target.id.replace('chk_', 'chart_')}`)
          .focus();
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
      if (sortItem !== this.sortBy) {
        this.toggleTarget = null;
        this.setSortBy(sortItem);
      }
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
      if (e.currentTarget === e.target) {
        this.coordinates = [];
      }
    },
    detectChartWidth() {
      const { width } = this.$refs[
        'sticky-table-wrapper'
      ].getBoundingClientRect();
      this.chartWidth = width - 152;
    },
    requestAnimationFrame() {
      window.requestAnimationFrame(this.detectChartWidth);
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
