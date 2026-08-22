<template>
  <div class="career-stats">
    <mobile-header @back="back_" />
    <div v-if="careerLoading" class="loading">讀取中...</div>
    <template v-else>
      <div class="player-card">
        <div class="photo-wrap">
          <photo :name="careerPlayerName" :photo="careerPhoto" />
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
                <th v-for="col in cols" :key="`header_${col.key}`" class="cell">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="section in careerSections">
                <tr
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
                  :class="{ odd: index % 2 === 1 }"
                >
                  <td
                    v-for="col in cols"
                    :key="`${section.key}-${row.year}-${col.key}`"
                    class="cell"
                  >
                    <template v-if="col.key === 'year'">
                      {{ row.year }}
                      <span
                        v-if="row.unlocked"
                        class="unlocked-dot"
                        title="含未鎖定比賽,為即時計算"
                      />
                    </template>
                    <template v-else>{{ formatCol(row, col.key) }}</template>
                  </td>
                </tr>
                <tr
                  :key="`${section.key}-total`"
                  class="normal-row total-row"
                  :class="[
                    section.teamType,
                    { aggregate: section.isAggregate },
                  ]"
                >
                  <td
                    v-for="col in cols"
                    :key="`${section.key}-total-${col.key}`"
                    class="cell"
                  >
                    <template v-if="col.key === 'year'">
                      總計
                      <span
                        v-if="section.total.unlocked"
                        class="unlocked-dot"
                        title="含未鎖定比賽,為即時計算"
                      />
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
];
const RATE_COLS = ['AVG', 'OBP', 'SLG', 'OPS'];

export default {
  data() {
    return {
      cols: COLS,
      tableHeight: 0,
    };
  },
  computed: {
    ...mapGetters([
      'careerLoading',
      'careerPlayerName',
      'careerPhoto',
      'careerSections',
    ]),
    uid() {
      return this.$route.params.uid;
    },
    teamCount() {
      return this.careerSections.filter(section => !section.isAggregate).length;
    },
    totalGames() {
      return this.careerSections
        .filter(section => !section.isAggregate)
        .reduce((acc, section) => acc + section.total.G, 0);
    },
  },
  created() {
    this.fetchCareerStats(this.uid);
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
    ...mapActions(['fetchCareerStats', 'clearCareer']),
    back_() {
      this.$router.back();
    },
    formatCol(row, key) {
      const value = row[key];
      if (!RATE_COLS.includes(key)) return value;
      if (typeof value !== 'number') return '-';
      return value.toFixed(3).replace(/^(-?)0\./, '$1.');
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
      this.tableHeight = window.innerHeight - top - bottomBarHeight - 20;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../scss/variable';

.career-stats {
  padding: 16px 16px 0;
  font-family: 'Inconsolata', '微軟正黑體', sans-serif;
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
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  padding: 16px 18px;
  margin-bottom: 16px;

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
          font-size: 36px;
        }
      }
    }
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 18px;
    font-weight: 500;
  }
  .summary {
    font-size: 13px;
    color: #888;
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
    padding: 66px 16px 0;
  }
}

.sticky-table {
  border-collapse: collapse;
  min-width: 100%;
  color: var(--table-row-color);
  font-size: 13px;
  white-space: nowrap;

  thead th.cell {
    background: $header_bgcolor_noalpha;
    color: $header_color;
    position: sticky;
    top: 0;
    z-index: 4;
    font-weight: 500;
  }

  .cell {
    line-height: 36px;
    text-align: right;
    padding: 0 10px;
    box-sizing: border-box;
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
</style>
