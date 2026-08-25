<template>
  <div class="career-stats">
    <mobile-header v-on="headerListeners" />
    <div v-if="careerLoading" class="loading">讀取中...</div>
    <template v-else>
      <div class="player-card">
        <div class="photo-wrap">
          <photo
            :name="careerPlayerName"
            :photo="careerPhoto"
            :icon-fallback="true"
          />
        </div>
        <div class="info">
          <div class="name">{{ careerPlayerName || '球員生涯統計' }}</div>
          <div class="summary">
            生涯跨隊統計 · 共 {{ teamCount }} 支球隊 · {{ totalGames }} 場比賽
          </div>
        </div>
      </div>

      <div v-if="!careerSections.length" class="empty">查無比賽紀錄</div>
      <div v-else ref="tableWrapper">
        <simplebar
          class="sticky-table-wrapper"
          :style="{ maxHeight: `${tableHeight}px` }"
        >
          <table class="sticky-table">
            <thead>
              <tr>
                <th
                  v-for="col in cols"
                  :key="`header_${col.key}`"
                  class="cell"
                  :class="{
                    sort: col.key === selectedCol,
                    hover: col.key === hoveredCol && col.key !== selectedCol,
                    year: col.key === 'year',
                  }"
                  @click="selectCol_(col.key)"
                  @mouseenter="hoverCol_(col.key)"
                  @mouseleave="hoverCol_(null)"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="section in careerSections">
                <tr
                  v-if="!section.hideHeader"
                  :key="`${section.key}-header`"
                  class="section-row"
                  :class="[
                    section.teamType,
                    { aggregate: section.isAggregate },
                  ]"
                >
                  <td
                    v-for="(col, colIndex) in cols"
                    :key="`${section.key}-header-${col.key}`"
                    class="cell"
                  >
                    <template v-if="colIndex === 0">
                      <span v-if="section.isAggregate" class="sum-mark">Σ</span>
                      {{ section.title }}
                    </template>
                  </td>
                </tr>
                <tr
                  v-for="(row, index) in section.rows"
                  :key="`${section.key}-${row.year}`"
                  class="normal-row"
                  :class="{
                    odd: index % 2 === 1,
                    clickable: row.locations.length,
                  }"
                  @click="openLocation_(row, row.year)"
                >
                  <td
                    v-for="col in cols"
                    :key="`${section.key}-${row.year}-${col.key}`"
                    class="cell"
                    :class="{
                      sort: col.key === selectedCol,
                      hover: col.key === hoveredCol && col.key !== selectedCol,
                      advance: advanceCols.includes(col.key),
                      center: centerCols.includes(col.key),
                    }"
                  >
                    <template v-if="col.key === 'year'">
                      {{ row.year }}
                      <span
                        v-if="row.unlocked"
                        class="unlocked-dot"
                        title="含未鎖定比賽,為即時計算"
                      />
                    </template>
                    <template v-else-if="advanceCols.includes(col.key)">
                      <div>{{ formatCol(row, col.key) }}</div>
                      <div>({{ formatDesc(row, col.key) }})</div>
                    </template>
                    <template v-else>{{ formatCol(row, col.key) }}</template>
                  </td>
                </tr>
                <tr
                  :key="`${section.key}-total`"
                  class="normal-row total-row"
                  :class="[
                    section.teamType,
                    {
                      aggregate: section.isAggregate,
                      clickable: section.total.locations.length,
                    },
                  ]"
                  @click="openLocation_(section.total, '總計')"
                >
                  <td
                    v-for="col in cols"
                    :key="`${section.key}-total-${col.key}`"
                    class="cell"
                    :class="{
                      sort: col.key === selectedCol,
                      hover: col.key === hoveredCol && col.key !== selectedCol,
                      advance: advanceCols.includes(col.key),
                      center: centerCols.includes(col.key),
                    }"
                  >
                    <template v-if="col.key === 'year'">
                      總計
                      <span
                        v-if="section.total.unlocked"
                        class="unlocked-dot"
                        title="含未鎖定比賽,為即時計算"
                      />
                    </template>
                    <template v-else-if="advanceCols.includes(col.key)">
                      <div>{{ formatCol(section.total, col.key) }}</div>
                      <div>({{ formatDesc(section.total, col.key) }})</div>
                    </template>
                    <template v-else>{{
                      formatCol(section.total, col.key)
                    }}</template>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </simplebar>
      </div>
    </template>
    <div
      v-if="coordinates.values.length"
      class="location-modal"
      @click="closeLocation_"
    >
      <div class="location-content">
        <coordination
          :no_track="true"
          :values="coordinates.values"
          :displayMode="locationDisplayMode"
          :avatar="careerPhoto"
          :player="careerPlayerName"
          :corner-label="cornerLabel"
          @click.native.stop
        />
        <i
          class="fa mode-toggle"
          :class="{
            'fa-map-marker': ['dot', 'heatmap'].includes(locationDisplayMode),
            'fa-percent': locationDisplayMode === 'percentage',
            heatmap: locationDisplayMode === 'heatmap',
          }"
          @click.stop="locationDisplayCount += 1"
        ></i>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

const COLS = [
  { key: 'year', label: '年度' },
  { key: 'G', label: '場次' },
  { key: 'PA', label: '打席' },
  { key: 'AB', label: '打數' },
  { key: 'H', label: '安打' },
  { key: '2H', label: '二安' },
  { key: '3H', label: '三安' },
  { key: 'HR', label: '全壘打' },
  { key: 'R', label: '得分' },
  { key: 'RBI', label: '打點' },
  { key: 'K', label: '三振' },
  { key: 'DP', label: '雙殺' },
  { key: 'BB', label: '四壞' },
  { key: 'SF', label: '犧飛' },
  { key: 'AVG', label: '打擊率' },
  { key: 'OBP', label: '上壘率' },
  { key: 'SLG', label: '長打率' },
  { key: 'OPS', label: 'OPS' },
  { key: 'LEVEL', label: '三圍' },
  { key: 'AVG_NO', label: '壘上無人' },
  { key: 'AVG_SP', label: '得點圈' },
  { key: 'AVG_FB', label: '滿壘' },
];
const RATE_COLS = ['AVG', 'OBP', 'SLG', 'OPS'];
const ADVANCE_COLS = ['AVG_NO', 'AVG_SP', 'AVG_FB'];
const CENTER_COLS = ['AVG', 'OBP', 'SLG', 'OPS', 'LEVEL'];

export default {
  data() {
    return {
      cols: COLS,
      advanceCols: ADVANCE_COLS,
      centerCols: CENTER_COLS,
      tableHeight: 0,
      selectedCol: null,
      hoveredCol: null,
      coordinates: { values: [], year: '' },
      locationDisplayMode: 'dot', // [dot, heatmap, percentage]
      locationDisplayCount: 0,
    };
  },
  watch: {
    locationDisplayCount(count) {
      this.locationDisplayMode = ['dot', 'heatmap', 'percentage'][count % 3];
    },
  },
  computed: {
    ...mapGetters([
      'careerLoading',
      'careerPlayerName',
      'careerPhoto',
      'careerSections',
    ]),
    headerListeners() {
      return this.$router.hasHistory ? { back: this.back_ } : {};
    },
    teamCount() {
      return this.careerSections.filter(section => !section.isAggregate).length;
    },
    totalGames() {
      return this.careerSections
        .filter(section => !section.isAggregate)
        .reduce((acc, section) => acc + section.total.G, 0);
    },
    cornerLabel() {
      if (!this.coordinates.year) return '';
      const modeWord = {
        dot: '落點',
        heatmap: '熱點',
        percentage: '落點機率',
      }[this.locationDisplayMode];
      return `${this.coordinates.year}${modeWord}`;
    },
  },
  // `career_stats` and `career_stats_team` are different route records that
  // both render this component, so vue-router treats switching between them
  // as leave+enter rather than update — even though Vue's patching reuses
  // the same instance instead of remounting it. beforeRouteEnter covers
  // that case (and the first-ever load, replacing a created() hook that
  // would otherwise only run once); beforeRouteUpdate covers staying on the
  // same route record with different params (e.g. one uid link to another).
  beforeRouteEnter(to, from, next) {
    next(vm => vm.loadCareer(to));
  },
  beforeRouteUpdate(to, from, next) {
    this.loadCareer(to);
    next();
  },
  mounted() {
    window.addEventListener('resize', this.detectRect);
    this.detectRect();
  },
  beforeDestroy() {
    this.clearCareer();
    window.removeEventListener('resize', this.detectRect);
  },
  updated() {
    this.detectRect();
  },
  methods: {
    ...mapActions(['fetchCareerStats', 'fetchTeamCareerStats', 'clearCareer']),
    loadCareer(route) {
      this.coordinates = { values: [], year: '' };
      this.locationDisplayCount = 0;
      this.locationDisplayMode = 'dot';
      if (route.name === 'career_stats_team') {
        this.fetchTeamCareerStats({
          teamCode: route.params.teamCode,
          playerName: route.params.playerName,
        });
      } else {
        this.fetchCareerStats(route.params.uid);
      }
    },
    openLocation_(row, year) {
      if (!row.locations.length) return;
      this.coordinates = { values: row.locations, year };
    },
    closeLocation_() {
      this.coordinates = { values: [], year: '' };
    },
    back_() {
      this.$router.back();
    },
    selectCol_(key) {
      if (key === 'year') return;
      this.selectedCol = key;
    },
    hoverCol_(key) {
      this.hoveredCol = key === 'year' ? null : key;
    },
    formatCol(row, key) {
      const value = row[key];
      if (!RATE_COLS.includes(key) && !ADVANCE_COLS.includes(key)) {
        return value;
      }
      if (typeof value !== 'number') return '-';
      return value.toFixed(3);
    },
    formatDesc(row, key) {
      return row[key.replace('_', '_DESC_')] || '0-0';
    },
    detectRect() {
      if (!this.$refs.tableWrapper) return;
      const { top } = this.$refs.tableWrapper.getBoundingClientRect();
      // A top-fixed header (desktop) is already excluded from `top` via the
      // page's own padding-top, so only compensate for a fixed bar that
      // sits at the bottom of the viewport (mobile) and eats into space
      // below — there can be more than one <header> on the page (this
      // view's own mobile-header plus the app's bottom tab bar), so check
      // all of them rather than assuming the first match is the right one.
      const bottomBarHeight = Array.from(document.querySelectorAll('header'))
        .filter(header => getComputedStyle(header).position === 'fixed')
        .map(header => header.getBoundingClientRect())
        .filter(rect => rect.bottom >= window.innerHeight - 1)
        .reduce((max, rect) => Math.max(max, rect.height), 0);
      this.tableHeight =
        window.innerHeight -
        top -
        bottomBarHeight -
        (bottomBarHeight ? 10 : 20);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../scss/variable';

.career-stats {
  overflow-x: hidden;
  box-sizing: border-box;
}

.loading,
.empty {
  padding: 40px 0;
  text-align: center;
  color: #888;
}

.player-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: var(--card-bg);
  border-radius: 10px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  padding: 16px 18px;
  margin: 20px 0;

  .photo-wrap {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    ::v-deep .img {
      width: 100px;
      height: 100px;
      line-height: 100px;
      &.img-photo {
        text-indent: -100px;
        &:after {
          line-height: 100px;
          font-size: 67px;
        }
      }
    }
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .summary {
    margin-top: 2px;
  }
}

.sticky-table-wrapper {
  width: 100%;
  box-sizing: border-box;
  ::-webkit-scrollbar {
    display: none;
  }
}

@media only screen and (max-width: 760px), (max-height: 480px) {
  .career-stats {
    padding: 60px 10px 0;
  }
  .player-card {
    margin: 0 0 10px 0;
  }
}

.sticky-table {
  border-collapse: collapse;
  min-width: 100%;
  color: var(--table-row-color);
  white-space: nowrap;

  thead th.cell {
    background: $header_bgcolor_noalpha;
    color: $header_color;
    position: sticky;
    top: 0;
    z-index: 4;
    font-weight: normal;
    text-align: center;
    cursor: pointer;
    &.year {
      cursor: initial;
    }
    &:nth-child(2n + 3):not(.sort):not(.hover) {
      color: rgba($header_color, 0.6);
    }
  }

  .cell {
    line-height: 36px;
    text-align: right;
    padding: 0 10px;
    box-sizing: border-box;
    &.sort {
      color: $error_color;
    }
    &.hover {
      color: rgba($error_color, 0.7);
    }
    &.center {
      text-align: center;
    }
    &.advance > div {
      display: inline-block;
      vertical-align: top;
      &:first-child {
        width: 55px;
        text-align: right;
      }
      &:last-child {
        margin-left: 5px;
        width: 75px;
        text-align: left;
      }
    }
  }

  .cell:first-child {
    position: sticky !important;
    left: 0 !important;
    z-index: 2;
    text-align: left;
  }
  thead .cell:first-child {
    z-index: 5;
  }

  .normal-row {
    &.odd .cell {
      background-color: var(--table-row-odd);
    }
    &:not(.odd):not(.total-row) .cell {
      background-color: var(--table-row-even);
    }
    &.clickable {
      cursor: pointer;
    }
  }

  .section-row .cell {
    color: #fff;
    font-weight: 500;
    text-align: left;
  }
  .section-row .cell:first-child {
    top: 0 !important;
    z-index: 6;
  }
  .section-row.softball .cell {
    background: $header_bgcolor;
  }
  .section-row.baseball .cell {
    background: rgba(70, 90, 140, 0.9);
  }
  .section-row.aggregate.softball .cell {
    background: #085041;
  }
  .section-row.aggregate.baseball .cell {
    background: #2c3a66;
  }

  .total-row .cell {
    font-weight: 500;
  }
  .total-row.softball .cell {
    background: #e1f5ee;
    color: #085041;
  }
  .total-row.baseball .cell {
    background: #e6ecfb;
    color: #3d4f8c;
  }
  .total-row.aggregate.softball .cell {
    background: #085041;
    color: #fff;
  }
  .total-row.aggregate.baseball .cell {
    background: #2c3a66;
    color: #fff;
  }
  .total-row .cell.sort {
    color: $error_color !important;
  }
  .total-row .cell.hover {
    color: rgba($error_color, 0.7) !important;
  }
}

.sum-mark {
  display: inline-block;
  margin-right: 4px;
}

.unlocked-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e0994a;
  margin-left: 4px;
}

.location-modal {
  position: fixed;
  z-index: 10;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-content {
  display: inline-block;
  text-align: right;
}

.mode-toggle {
  display: inline-block;
  margin-top: 5px;
  width: 26px;
  height: 26px;
  line-height: 26px;
  font-size: 18px;
  text-align: center;
  color: #fff;
  background-color: $active_bgcolor;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
  &.heatmap {
    background-color: $error_color;
  }
}
</style>
