<template>
  <div>
    <div class="search-bar" ref="searchBar">
      <div class="search-bar__container">
        <clock-or-icon
          :icon="$cacheImg(currentTeamIcon) || $cacheImg(defaultIcon)"
        />
      </div>
      <label class="search-icon" for="toggle-search">
        <i class="fa fa-search"></i>
      </label>
      <input
        id="toggle-search"
        type="checkbox"
        class="toggle-search non-input"
        v-model="toggleSearch"
      />
      <div
        class="condition__container"
        ref="conditionContainer"
        :style="{ '--height': `${conditionContainerHeight}px` }"
      >
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
          <div class="condition__label">{{ $t('col_latest') }}</div>
          <div class="condition__element pa" :data-col="$t('col_latest')">
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
                :title="$t(col.name)"
                @click="setSortBy_(col.name)"
              >
                <div>{{ $t(col.name) }}</div>
              </div>
            </template>
          </div>
          <div class="sum-row" v-if="sum.PA > 0">
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
              >
                {{ $t('SUM') }}
              </div>
              <div
                v-else-if="['AVG_NO', 'AVG_SP', 'AVG_FB'].includes(col.name)"
                class="cell advance"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_sum_${colIndex}`"
              >
                <div>
                  {{ formatValue(sum[col.name]) }}
                </div>
                <div>{{ `(${sum[col.name.replace('_', '_DESC_')]})` }}</div>
              </div>
              <div
                v-else-if="['AVG', 'OBP', 'SLG', 'OPS'].includes(col.name)"
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_sum_${colIndex}`"
              >
                {{ formatValue(sum[col.name]) }}
              </div>
              <div
                v-else-if="col.name === 'LEVEL'"
                class="cell"
                :class="{ sort: col.name === sortBy }"
                :data-label="$t(col.name)"
                :key="`row_sum_${colIndex}`"
              >
                {{ sum[col.name] }}
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
              :class="{ current: item.data.uid === userId }"
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
                    <photo
                      :photo="item.data.photo"
                      :name="item.name"
                      :number="item.data.number"
                    />
                    <span class="number">{{ item.data.number }}</span>
                    <span>{{ item.name }}</span>
                  </div>
                  <div
                    v-if="item.listByGame.length && lazy"
                    class="chart"
                    tabIndex="-1"
                    :id="`chart_${item.name}`"
                    :style="{
                      width: `${chartWidth}px`,
                      '--height': `${chartHeight[item.name]}px`,
                    }"
                    @click="e => e.preventDefault()"
                  >
                    <div class="chart-wrapper">
                      <simplebar
                        class="chart-inner"
                        :style="{
                          height: item.locations.length ? '144px' : 'auto',
                          width: `${
                            item.locations.length
                              ? chartWidth - 144
                              : chartWidth
                          }px`,
                        }"
                      >
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
                      </simplebar>
                      <coordination
                        v-if="item.locations.length"
                        :no_track="true"
                        :values="item.locations"
                        :displayMode="locationDisplayMode"
                        fixedSize="144"
                        style="cursor: pointer;"
                        @click.native="
                          coordinates = {
                            values: item.locations,
                            avatar: item.data.photo,
                            player: item.name,
                          }
                        "
                      />
                      <i
                        v-if="item.locations.length"
                        class="fa"
                        :class="{
                          'fa-map-marker': ['dot', 'heatmap'].includes(
                            locationDisplayMode,
                          ),
                          'fa-percent': locationDisplayMode === 'percentage',
                          heatmap: locationDisplayMode === 'heatmap',
                        }"
                        @click="locationDisplayCount += 1"
                      ></i>
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
      </simplebar>
    </div>
    <div
      v-if="coordinates.values.length > 0"
      class="location-modal"
      @click="closeLocation"
    >
      <coordination
        :no_track="true"
        :values="coordinates.values"
        :displayMode="locationDisplayMode"
        :avatar="coordinates.avatar"
        :player="coordinates.player"
      />
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
    display: table-header-group;
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
    display: table-header-group;
    color: $header_color;
    .cell {
      background: $header_bgcolor_noalpha;
      position: sticky;
      top: 36px;
      z-index: 4;
      text-align: center;
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
        padding-left: 10px;
        text-align: left;
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
        height: var(--height);
      }
    }
  }
  .normal-row {
    display: table-row;
    &:nth-child(4n + 4) .cell {
      background-color: var(--table-row-even);
    }
    &:nth-child(4n + 2) .cell {
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
      .chart .game {
        color: var(--table-row-color);
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
        width: 115px;
        box-sizing: border-box;
        text-overflow: ellipsis;
        overflow: hidden;
        vertical-align: middle;
        .number {
          display: inline-block;
          text-align: center;
          width: 20px;
          margin-right: 3px;
        }
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
    &.level {
      display: none;
    }
    &.advance > div {
      display: inline-block;
      vertical-align: top;
      &:first-child {
        width: 50px;
        text-align: right;
      }
      &:last-child {
        margin-left: 5px;
        width: 75px;
        text-align: left;
      }
    }
    .align-right {
      margin: auto;
      width: 30px;
      text-align: right;
      direction: rtl;
    }
  }
  .chart {
    background-color: var(--chart-bg);
    position: absolute;
    left: 125px;
    z-index: 2;
    overflow: hidden;
    outline: none;

    height: 0;
    transition: height 0.2s ease-in-out;

    font-size: 12px;
    padding: 0;
    border-top: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    .chart-wrapper {
      display: flex;
      width: 100%;
      align-items: flex-end;
    }
    .chart-inner {
      flex-grow: 1;
      direction: rtl;
      padding-top: 5px;
      box-sizing: border-box;
      cursor: initial;
      ::-webkit-scrollbar {
        display: none;
      }
      &::v-deep {
        .simplebar-content {
          display: flex;
          align-items: flex-end;
          height: 100%;
          box-sizing: border-box;
        }
        .simplebar-track {
          top: 0;
        }
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
      text-align: center;
      &.red {
        background-color: var(--hit);
      }
      &.yellow {
        background-color: var(--nonpa);
      }
      &.blue {
        background-color: var(--ng);
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
    i.fa {
      color: white;
      background-color: $active_bgcolor;
      border-radius: 4px;
      width: 26px;
      height: 26px;
      line-height: 26px;
      font-size: 18px;
      box-sizing: border-box;
      position: absolute;
      right: 10px;
      bottom: 10px;
      transform: translateZ(0);
      &.heatmap {
        background-color: $error_color;
      }
    }
  }
}

.search-bar__container,
.search-icon,
.toggle-search {
  display: none;
}

.location-modal {
  position: fixed;
  z-index: 3;
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
@media only screen and (max-width: 760px), (max-height: 480px) {
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
      position: relative;
    }
    .search-icon {
      display: block;
      position: absolute;
      top: 0;

      right: 0;
      right: calc(constant(safe-area-inset-right));
      /* iOS 11.0 */
      right: calc(env(safe-area-inset-right));
      /* iOS 11.2 */

      z-index: 1;
      height: 50px;
      line-height: 50px;
      width: 50px;
      margin: 0;
      /* opacity: 0; */
      cursor: pointer;
    }
    .toggle-search {
      &:checked {
        & ~ .condition__container {
          height: var(--height);
        }
      }
    }
    .condition__container {
      height: 0;
      transition: height 0.2s ease-in-out;
    }
    .condition {
      background-color: transparent;
      border-radius: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;

      padding: 3px 10px;
      padding-right: calc(10px + constant(safe-area-inset-right));
      padding-left: calc(10px + constant(safe-area-inset-left));
      /* iOS 11.0 */
      padding-right: calc(10px + env(safe-area-inset-right));
      padding-left: calc(10px + env(safe-area-inset-left));
      /* iOS 11.2 */

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
    height: calc(
      100vh - 100px - constant(safe-area-inset-top) -
        constant(safe-area-inset-bottom)
    ) !important;
    height: calc(
      var(--vh, 1vh) * 100 - 100px - constant(safe-area-inset-top) -
        constant(safe-area-inset-bottom)
    ) !important;
    /* iOS 11.0 */
    height: calc(
      100vh - 100px - env(safe-area-inset-top) - env(safe-area-inset-bottom)
    ) !important;
    height: calc(
      var(--vh, 1vh) * 100 - 100px - env(safe-area-inset-top) -
        env(safe-area-inset-bottom)
    ) !important;
    /* iOS 11.2 */
  }
  .sticky-table {
    .toggle-row:checked + .normal-row .chart {
      left: -42px;

      width: 100vw !important;
      width: calc(
        100vw - constant(safe-area-inset-left) - constant(safe-area-inset-right)
      ) !important;
      /* iOS 11.0 */
      width: calc(
        100vw - env(safe-area-inset-left) - env(safe-area-inset-right)
      ) !important;
      /* iOS 11.2 */
    }
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
      coordinates: {
        values: [],
        avatar: '',
        player: '',
      },
      lazy: false,
      chartWidth: 0,
      tableHeight: 0,
      locationDisplayMode: 'dot', // [dot, heatmap, percentage]
      locationDisplayCount: 0,
      sum: {},
      conditionContainerHeight: 0,
      chartHeight: {},
    };
  },
  created() {},
  mounted() {
    setTimeout(() => {
      this.lazy = true;
    }, 500);
    document.addEventListener(clickEvent, this.collapseSearch, true);
    window.addEventListener('resize', this.requestAnimationFrame);
    this.detectRect();
  },
  beforeDestroy() {
    document.removeEventListener(clickEvent, this.collapseSearch);
    window.removeEventListener('resize', this.requestAnimationFrame);
  },
  methods: {
    ...mapActions([
      'setPeriod',
      'setGameTypes',
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
        setTimeout(() => {
          document
            .querySelector(`#${e.target.id.replace('chk_', 'chart_')}`)
            .focus();
        }, 100);
      }
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
        this.coordinates = {
          values: [],
          avatar: '',
          player: '',
        };
      }
    },
    detectRect() {
      const { width, top } = this.$refs[
        'sticky-table-wrapper'
      ].getBoundingClientRect();
      this.chartWidth = width - 167;
      this.tableHeight = window.innerHeight - top - 20;

      this.$refs.conditionContainer.style.height = 'auto';
      const { height } = this.$refs.conditionContainer.getBoundingClientRect();
      this.conditionContainerHeight = height;
      this.$refs.conditionContainer.style.height = '';

      setTimeout(() => {
        const chartHeight = {};
        Array.from(document.querySelectorAll('.chart')).forEach(ele => {
          ele.style.height = 'auto';
          const { height } = ele.getBoundingClientRect();
          chartHeight[ele.id.replace('chart_', '')] = height;
          ele.style.height = '';
        });
        this.chartHeight = chartHeight;
      }, 500);
    },
    requestAnimationFrame() {
      window.requestAnimationFrame(this.detectRect);
    },
  },
  computed: {
    ...mapGetters([
      'period',
      'periodSelect',
      'gameTypes',
      'top',
      'unlimitedPA',
      'sortBy',
      'checkAll',
      'conditionCols',
      'displayedCols',
      'lastUpdate',
      'userId',
      'currentTeamIcon',
    ]),
    ...mapGetters({
      list: 'genStatistics',
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
              return {
                ...sum,
                AVG: Math.round((sum.H / sum.AB) * 1000) / 1000,
                AVG_NO: sum.abNo
                  ? Math.round((sum.hNo / sum.abNo) * 1000) / 1000
                  : '-',
                AVG_DESC_NO: `${sum.abNo}-${sum.hNo}`,
                AVG_SP: sum.abSP
                  ? Math.round((sum.hSP / sum.abSP) * 1000) / 1000
                  : '-',
                AVG_DESC_SP: `${sum.abSP}-${sum.hSP}`,
                AVG_FB: sum.abFB
                  ? Math.round((sum.hFB / sum.abFB) * 1000) / 1000
                  : '-',
                AVG_DESC_FB: `${sum.abFB}-${sum.hFB}`,
                OBP: Math.round((sum.TOB / sum.PA) * 1000) / 1000,
                SLG: Math.round((sum.TB / sum.AB) * 1000) / 1000,
                OPS:
                  Math.round((sum.TOB / sum.PA + sum.TB / sum.AB) * 1000) /
                  1000,
                LEVEL: `${Math.floor(
                  Math.round((sum.H / sum.AB) * 1000) / 100,
                )}/${Math.floor(
                  Math.round((sum.TOB / sum.PA) * 1000) / 100,
                )}/${Math.floor(Math.round((sum.TB / sum.AB) * 1000) / 100)}`,
              };
            }
            return sum;
          },
          {
            PA: 0,
            AB: 0,
            H: 0,
            TB: 0,
            TOB: 0,
            R: 0,
            RBI: 0,
            '1H': 0,
            '2H': 0,
            '3H': 0,
            HR: 0,
            K: 0,
            BB: 0,
            SF: 0,
            DP: 0,
            hNo: 0,
            abNo: 0,
            hSP: 0,
            abSP: 0,
            hFB: 0,
            abFB: 0,
          },
        );

        this.lazy = false;
        setTimeout(() => {
          this.lazy = true;
          this.detectRect();
        }, 500);
      },
      immediate: true,
    },
    locationDisplayCount() {
      this.locationDisplayMode = ['dot', 'heatmap', 'percentage'][
        this.locationDisplayCount % 3
      ];
    },
  },
};
</script>
