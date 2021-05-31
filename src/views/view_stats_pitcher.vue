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
          <div class="condition__element" :data-col="$t('col_period')">
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
          <div class="condition__element" :data-col="$t('col_sort')">
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
          <br />
          <div class="condition__label">{{ $t('col_game_type') }}</div>
          <div class="condition__element" :data-col="$t('col_game_type')">
            <label
              class="condition__col"
              v-for="gameType in ['regular', 'playoff', 'cup', 'fun']"
              :key="`gameType_${gameType}`"
            >
              <input
                type="checkbox"
                :checked="gameTypes.includes(gameType)"
                :value="gameType"
                @change="setGameTypes_(gameType)"
              />
              <span>{{ $t(`ttl_${gameType}`) }}</span>
            </label>
          </div>
          <br />
          <div class="condition__label col">{{ $t('col_display') }}</div>
          <div class="condition__element col" :data-col="$t('col_display')">
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
    <div ref="sticky-table-wrapper">
      <simplebar
        class="sticky-table-wrapper"
        :style="{ maxHeight: `${tableHeight}px` }"
      >
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
                :title="
                  ['SO', 'R'].includes(col.name)
                    ? $t(`${col.name}_P`)
                    : $t(col.name)
                "
                @click="setSortBy_(col.name)"
              >
                <div>
                  <template v-if="['SO', 'R'].includes(col.name)">
                    {{ $t(`${col.name}_P`) }}
                  </template>
                  <template
                    v-else-if="
                      ['K7', 'BB7', 'H7'].includes(col.name) &&
                        teamInfo.pitcherInn === 9
                    "
                  >
                    {{ $t(`${col.name}_9`) }}
                  </template>
                  <template v-else>
                    {{ $t(col.name) }}
                  </template>
                </div>
              </div>
            </template>
          </div>
          <div class="sum-row" v-if="sum.G > 0">
            <template v-for="(col, colIndex) in displayedCols">
              <div
                v-if="col.name === 'Rank'"
                :key="`header_${col.name}`"
                class="cell rank"
              ></div>
              <div
                v-else-if="col.name === 'name'"
                :key="`header_${col.name}`"
                class="cell name"
                style="text-align: left;"
              >
                {{ $t('SUM') }}
              </div>
              <!-- <div
                v-else-if="['ERA', 'WHIP'].includes(col.name)"
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_sum_${colIndex}`"
              >
                {{ formatValue(sum[col.name], 3) }}
              </div> -->
              <div
                v-else-if="['S%', 'PIP', 'K7', 'BB7', 'H7'].includes(col.name)"
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_sum_${colIndex}`"
              >
                <div class="align-right _30">
                  {{ formatValue(sum[col.name], 1) }}
                </div>
              </div>
              <div
                v-else-if="
                  ['GS', 'IP', 'H', 'R', 'NP', 'BB', 'SO'].includes(col.name)
                "
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_sum_${colIndex}`"
              >
                <div class="align-right">
                  {{ sum.OUT === 0 ? '-' : sum[col.name] }}
                </div>
              </div>
              <div
                v-else
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_sum_${colIndex}`"
              >
                <div class="align-right">{{ sum[col.name] }}</div>
              </div>
            </template>
          </div>
          <template v-for="(item, itemIndex) in list">
            <div
              class="normal-row"
              :class="{ current: item.data.uid === userId }"
              :key="`div_${item.name}`"
            >
              <template v-for="(col, colIndex) in displayedCols">
                <div
                  v-if="col.name === 'Rank'"
                  :key="`row_${item.name}_${colIndex}`"
                  class="cell rank"
                >
                  <div class="align-right">{{ itemIndex + 1 }}</div>
                </div>
                <div
                  v-else-if="col.name === 'name'"
                  :key="`row_${item.name}_${colIndex}`"
                  class="cell name"
                >
                  <div class="player">
                    <photo
                      :photo="item.data.photo"
                      :name="item.name"
                      :number="item.data.number"
                    />
                    {{ item.name }}
                  </div>
                </div>
                <div
                  v-else-if="
                    ['S%', 'PIP', 'K7', 'BB7', 'H7'].includes(col.name)
                  "
                  class="cell"
                  :class="{ sort: col.name === sortBy }"
                  :data-label="$t(col.name)"
                  :key="`row_${item.name}_${colIndex}`"
                >
                  <div class="align-right _30">
                    {{ formatValue(item[col.name], 1) }}
                  </div>
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
      </simplebar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.condition {
  background-color: var(--card-bg);
  border-radius: 10px;
  margin: 20px 0;
  padding: 20px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  > div,
  label {
    display: inline-block;
    line-height: 30px;
    vertical-align: top;
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
      width: calc(100% - 80px);
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
  ::-webkit-scrollbar {
    display: none;
  }
}
.sticky-table {
  display: table;
  min-width: 100%;
  margin: 0;
  box-sizing: border-box;
  color: var(--table-row-color);
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
        width: 110px;
        /* min-width: 110px; */
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
  .sum-row {
    display: table-row;
    color: $header_color;
    .cell {
      background: $header_bgcolor_noalpha;
      position: sticky;
      top: 36px;
      z-index: 4;
      text-align: center;
      vertical-align: top;
      &:not(.rank):not(.name) {
        cursor: initial;
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
        min-width: 110px;
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
  .normal-row {
    display: table-row;
    &:nth-child(2n + 1) .cell {
      background-color: var(--table-row-even);
    }
    &:nth-child(2n + 2) .cell {
      background-color: var(--table-row-odd);
    }
    &.current {
      color: $current_user_color;
      .cell {
        &:not(.chart) {
          background-color: $current_user_bgcolor;
        }
        &::v-deep .img {
          border-color: $current_user_color;
        }
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
    }
    &.name {
      position: sticky !important;
      left: 42px !important;
      z-index: 2;
      /* box-shadow: 5px 0 5px -5px #333; */
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
      }
      &:after {
        content: '';
        position: absolute;
        right: -5px;
        display: inline-block;
        width: 5px;
        height: 100%;
        background: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.12),
          rgba(0, 0, 0, 0)
        );
      }
    }
    &.sort {
      color: $error_color;
    }
    .align-right {
      margin: auto;
      padding-right: 5px;
      /* width: 30px; */
      text-align: right;
      direction: rtl;
      &._30 {
        padding-right: initial;
        width: 30px;
      }
    }
  }
}

.search-bar__container,
.toggle-search {
  display: none;
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
      padding: 3px 10px;
      box-sizing: border-box;
      position: relative;
      > br {
        display: none;
      }
      &__col {
        margin: 0 8px 3px 0;
      }
      &__label {
        display: none;
      }
      &__element {
        width: auto;
        text-align: left;
        line-height: normal;
        margin: 0 15px 10px 0;
        height: 30px;
        white-space: nowrap;
        &.col {
          height: auto;
          white-space: initial;
          margin: 0 0 10px 0;
          label {
            min-width: 57px;
          }
        }
        &:before {
          content: attr(data-col);
          display: inline-block;
          vertical-align: top;
          margin-right: 3px;
          line-height: 30px;
        }
        &.date {
          width: 100vw;
          text-align: right;
          padding: 0 10px 10px 0;
          margin: 0;
          line-height: 30px;
          &:before {
            content: attr(data-long);
          }
        }
      }
    }
  }
  .sticky-table-wrapper {
    height: calc(100vh - 100px) !important;
    height: calc(var(--vh, 1vh) * 100 - 100px) !important;
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .search-bar {
    .condition {
      &__element {
        &:before {
          width: 72px;
          text-align: right;
        }
        &.date {
          &:before {
            content: attr(data-short);
          }
        }
      }
    }
  }
  [lang='zh-TW'] {
    .search-bar .condition__element label {
      font-size: 14px;
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  [lang='zh-TW'] {
    .search-bar .condition__element label {
      font-size: 12px;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';
import { accCalc } from '../libs/utils';
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
      tableHeight: 0,
      sum: {},
    };
  },
  created() {},
  mounted() {
    document.addEventListener(clickEvent, this.collapseSearch, true);
    window.addEventListener('resize', this.requestAnimationFrame);
    this.detectHeight();
  },
  beforeDestroy() {
    document.removeEventListener(clickEvent, this.collapseSearch);
    window.removeEventListener('resize', this.requestAnimationFrame);
  },
  methods: {
    ...mapActions(['setPeriod', 'setGameTypes']),
    ...mapActions({
      setSortBy: 'setPitcherSortBy',
      setCheckAll: 'setPitcherCheckAll',
      toggleColumn: 'togglePitcherColumn',
    }),
    formatValue(value, decimal = 3) {
      return value !== '-' ? parseFloat(value).toFixed(decimal) : value;
    },
    collapseSearch(event) {
      if (
        this.toggleSearch &&
        this.$refs &&
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
    setGameTypes_(gameType) {
      this.toggleTarget = null;
      this.setGameTypes(gameType);
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
    detectHeight() {
      const { top } = this.$refs[
        'sticky-table-wrapper'
      ].getBoundingClientRect();
      this.tableHeight = window.innerHeight - top - 20;
    },
    requestAnimationFrame() {
      window.requestAnimationFrame(this.detectHeight);
    },
  },
  computed: {
    ...mapGetters([
      'period',
      'periodSelect',
      'gameTypes',
      'lastUpdate',
      'userId',
      'currentTeamIcon',
      'teamInfo',
    ]),
    ...mapGetters({
      list: 'genPitcherStatistics',
      sortBy: 'pitcherSortBy',
      checkAll: 'pitcherCheckAll',
      conditionCols: 'pitcherConditionCols',
      displayedCols: 'pitcherDisplayedCols',
    }),
  },
  watch: {
    list: {
      handler() {
        this.sum = this.list.reduce(
          (acc, record, index, self) => {
            const sum = Object.keys(acc).reduce(
              (accObj, k) => ({
                ...accObj,
                [k]: acc[k] + (Number.isInteger(record[k]) ? record[k] : 0),
              }),
              {},
            );
            if (index === self.length - 1) {
              const { ERA, WHIP, K7, BB7, H7, PIP } = accCalc(
                [],
                [
                  {
                    OUT: [sum.OUT],
                    R: [sum.R],
                    H: [sum.H],
                    SO: [sum.SO],
                    BB: [sum.BB],
                    S: [sum.S],
                    B: [sum.B],
                  },
                ],
                0,
                this.teamInfo.pitcherInn,
              );
              return {
                ...sum,
                ERA,
                WHIP,
                K7,
                BB7,
                H7,
                PIP,
                'S%':
                  sum.B === 0 ? '-' : Math.round((sum.S / sum.B) * 100) / 100,
                IP: `${Math.floor(sum.OUT / 3)}.${sum.OUT % 3}`,
              };
            }
            return sum;
          },
          {
            OUT: 0,
            W: 0,
            L: 0,
            G: 0,
            GS: 0,
            H: 0,
            R: 0,
            NP: 0,
            BB: 0,
            SO: 0,
            S: 0,
            B: 0,
          },
        );
      },
      immediate: true,
    },
  },
};
</script>
