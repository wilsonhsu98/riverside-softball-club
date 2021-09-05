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
                  v-for="(item, i) in period"
                  :value="item.period"
                  :key="`period_${i}`"
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
          <template v-if="lastUpdate">
            <br />
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
    <div class="web">
      <div class="item-container">
        <board
          v-for="key in pitcherGameCount
            ? ['AVG', 'H', 'HR', 'RBI', 'GWRBI']
            : ['AVG', 'H', 'HR', 'RBI', 'W']"
          :key="`block_${key}`"
          :cat="key"
          :itemStats="itemStats"
          :periodGames="periodGames"
          :goStats="goStats"
          :pitcherGameCount="pitcherGameCount"
        />
      </div>
      <div class="item-container" v-if="pitcherGameCount">
        <board
          v-for="key in ['W', 'SO', 'ERA', 'WHIP', 'MVP']"
          :key="`block_${key}`"
          :cat="key"
          :itemStats="itemStats"
          :periodGames="periodGames"
          :goStats="goStats"
          :pitcherGameCount="pitcherGameCount"
        />
      </div>
    </div>
    <div class="mobile">
      <ad :mode="'stats_item'" />
      <carousel-3d
        class="item-container"
        border="0"
        :width="200"
        :height="326"
        :count="pitcherGameCount ? col_v2.length : col_v1.length"
      >
        <slide
          v-for="(key, index) in pitcherGameCount ? col_v2 : col_v1"
          :index="index"
          :key="`carousel_${key}`"
        >
          <board
            :cat="key"
            :itemStats="itemStats"
            :periodGames="periodGames"
            :goStats="goStats"
            :pitcherGameCount="pitcherGameCount"
          />
        </slide>
      </carousel-3d>
      <ad :mode="'stats_item300x250'" />
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
    height: 30px;
    vertical-align: top;
  }
  label {
    cursor: pointer;
  }
  &__label {
    padding: 0 4px;
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

.search-bar__container,
.search-icon,
.toggle-search {
  display: none;
}

.item-container {
  display: flex;
  margin: 0 -10px;
  &:last-child {
    margin-top: 20px;
  }
  .item-container__table {
    flex: 1;
    min-height: 200px;
    margin: 0 10px;
    background-color: var(--card-bg);
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    &::v-deep {
      .header {
        background: $header_bgcolor;
        color: $header_color;
        line-height: 36px;
        text-align: right;
        padding-right: 10px;
        span.clickable {
          cursor: pointer;
          text-decoration: underline;
        }
      }
      .row {
        color: var(--stats-item-row-color);
        line-height: 36px;
        height: 36px;
        display: flex;
        &:nth-child(even) {
          background-color: var(--stats-item-row-even);
        }
        &:nth-child(odd) {
          background-color: var(--stats-item-row-odd);
        }
        .rank {
          width: 20px;
          text-align: left;
          padding-left: 10px;
        }
        .name,
        .dummy {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .value {
          max-width: 50px;
          text-align: right;
          padding-right: 10px;
        }
      }
      .img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        position: relative;
        top: -30px;
        left: -7px;
        ~ .name {
          display: none;
        }
      }
      .img-hidden {
        display: none;
        ~ .dummy {
          display: none;
        }
      }
      .note {
        border-top: 2px dotted $row_color;
        padding: 10px;
        background-color: var(--card-bg);
        margin-top: auto;
        font-size: 12px;
      }
    }
  }
}
.mobile {
  display: none;
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
          max-height: 200vh;
          transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
          transition-delay: 0s;
          .fa {
            opacity: 1;
            transition-delay: 0.4s;
          }
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
      .fa {
        opacity: 0;
        transition: opacity 0.1s 0s;
        display: inline-block;
        color: $header_color;
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
  /* .item-container {
    margin: 10px 0;
    flex-wrap: wrap;
    justify-content: space-between;
    .item-container__table {
      margin: 10px 0;
      flex: 0 1 48%;
      flex: 0 1 calc(50vw - 10px);
      min-height: calc(var(--vh, 1vh) * 50 - 80px);
      border-radius: 0;
    }
  } */
  .mobile {
    display: block;
    .carousel-3d-slide {
      background-color: transparent;
    }
    .item-container {
      margin: 10px auto;
    }
    .item-container__table {
      margin: 10px;
      height: calc(100% - 20px);
    }
  }
  .web {
    display: none;
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
      defaultIcon,
      col_v1: this.getRandomStartArr(['AVG', 'H', 'HR', 'RBI', 'W']),
      col_v2: this.getRandomStartArr([
        'AVG',
        'H',
        'HR',
        'RBI',
        'GWRBI',
        'W',
        'SO',
        'ERA',
        'WHIP',
        'MVP',
      ]),
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
      'setGameTypes',
      'setSortBy',
      'setUnlimitedPA',
      'setPitcherSortBy',
    ]),
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
      this.setPeriod(period);
      this.toggleSearch = false;
    },
    setGameTypes_(gameType) {
      this.toggleTarget = null;
      this.setGameTypes(gameType);
    },
    goStats(key) {
      if (['AVG', 'H', 'HR', 'RBI'].includes(key)) {
        this.setSortBy(key);
        this.setUnlimitedPA(true);
        this.$router.push(
          `/${this.isViewMode ? 'view' : 'main'}/stats_pa/${
            this.$route.params.team
          }`,
        );
      }
      if (['W', 'SO', 'ERA', 'WHIP'].includes(key)) {
        this.setPitcherSortBy(key);
        this.$router.push(
          `/${this.isViewMode ? 'view' : 'main'}/stats_pitcher/${
            this.$route.params.team
          }`,
        );
      }
    },
    getRandomStartArr(arr = []) {
      return arr
        .slice(Math.floor(Math.random() * arr.length))
        .concat(arr)
        .slice(0, arr.length);
    },
  },
  computed: {
    ...mapGetters([
      'period',
      'periodSelect',
      'periodGames',
      'gameTypes',
      'lastUpdate',
      'itemStats',
      'currentTeamIcon',
      'pitcherGameCount',
      'isViewMode',
    ]),
  },
  components: {
    board: {
      props: ['cat', 'itemStats', 'periodGames', 'goStats', 'pitcherGameCount'],
      template: `
        <div class="item-container__table">
          <div class="header">
            <span
              :class="{ clickable: [
                'AVG',
                'H',
                'HR',
                'RBI',
                'W',
                'SO',
                'ERA',
                'WHIP',
              ].includes(cat)}"
              @click="goStats(cat)"
            >{{ $t(cat === 'SO' ? 'SO_P': cat) }}</span>
          </div>
          <template v-for="(item, index) in (itemStats[cat] || []).slice(0, 5)">
            <div v-if="index === 0" class="row" :key="index">
              <span class="rank">{{ index + 1 }}</span>
              <img
                v-if="item.data.photo"
                class="img"
                :src="$cacheImg(item.data.photo)"
                onLoad="this.className='img'"
                onError="this.className='img-hidden'"
              />
              <span v-else class="img-hidden"></span>
              <span class="name">{{ item.name }}</span>
              <span class="dummy"></span>
              <span class="value">{{ item[cat] }}</span>
            </div>
            <div v-else class="row" :key="index">
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ item.name }}</span>
              <span class="value">{{ item[cat] }}</span>
            </div>
          </template>
          <div class="note">
            {{
              $t((cat === 'W' && pitcherGameCount) ? 'W__note' : cat + '_note', {
                g: periodGames.length,
                pa: parseInt(periodGames.length * 1.6, 10),
                p: parseInt(pitcherGameCount * 1, 10),
                out: parseInt(pitcherGameCount * 3, 10),
              })
            }}
          </div>
        </div>
      `,
    },
  },
};
</script>
