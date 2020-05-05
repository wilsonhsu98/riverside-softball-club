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
    <div
      class="container"
      ref="container"
      :class="{ empty: role === 'manager' && gameList_.length === 0 }"
    >
      <template v-for="(item, i) in gameList_">
        <div
          :class="['row', { last: i === gameList_.length - 1 }]"
          :data-date="item.date"
          :key="`date_${item.date}`"
        >
          <template v-for="sub in item.games">
            <v-popover
              placement="bottom"
              trigger="click"
              offset="0"
              class="cell"
              :delay="{ show: 100, hide: 0 }"
              :popoverClass="
                `box-tip ${unlockGames.includes(sub.game) ? '' : sub.result}`
              "
              :open="sub.game === focus_game"
              :autoHide="true"
              :key="`game_${sub.game}`"
              :container="$refs.container"
              @show="setGame(sub.game)"
            >
              <div class="item">
                <div v-if="unlockGames.includes(sub.game)" class="result">
                  ?
                </div>
                <div v-else="" :class="`result ${sub.result} ${sub.group}`">
                  {{ (sub.result && sub.result.substr(0, 1)) || '?' }}
                </div>
                <div class="name">{{ sub.opponent || sub.game }}</div>
              </div>
              <template slot="popover">
                <template v-if="version !== 'import' && topBottom">
                  <div class="team-versus">
                    <div class="team-name">
                      <div class="name">
                        {{ topBottom === 'top' ? useTeam : opponent }}
                      </div>
                      <div class="score">
                        {{
                          topBottom === 'top'
                            ? sumByInn(scores, inn)
                            : sumByInn(opponentScores, inn)
                        }}
                      </div>
                    </div>
                    <div class="versus">:</div>
                    <div class="team-name">
                      <div class="score">
                        {{
                          topBottom === 'bot'
                            ? sumByInn(scores, inn)
                            : sumByInn(opponentScores, inn)
                        }}
                      </div>
                      <div class="name">
                        {{ topBottom === 'bot' ? useTeam : opponent }}
                      </div>
                    </div>
                  </div>
                  <div class="box">
                    <div class="team">
                      <div class="cell">&nbsp;</div>
                      <div class="cell">
                        {{ topBottom === 'top' ? useTeam : opponent }}
                      </div>
                      <div class="cell">
                        {{ topBottom === 'bot' ? useTeam : opponent }}
                      </div>
                    </div>
                    <div class="gap"></div>
                    <div
                      v-for="(undefined, index) in Array.apply(
                        null,
                        Array(inn),
                      )"
                      :key="index"
                      class="inn"
                    >
                      <div>{{ index + 1 }}</div>
                      <div class="cell" v-if="topBottom === 'top'">
                        {{
                          scores[index] !== undefined ? scores[index] : '&nbsp;'
                        }}
                      </div>
                      <div class="cell">
                        {{
                          opponentScores[index] !== undefined
                            ? opponentScores[index]
                            : '&nbsp;'
                        }}
                      </div>
                      <div class="cell" v-if="topBottom === 'bot'">
                        {{
                          scores[index] !== undefined ? scores[index] : '&nbsp;'
                        }}
                      </div>
                    </div>
                    <div class="inn" style="margin-left: auto;">
                      <div class="cell">R</div>
                      <div class="cell" v-if="topBottom === 'top'">
                        {{ score }}
                      </div>
                      <div class="cell">
                        {{ opponentScore }}
                      </div>
                      <div class="cell" v-if="topBottom === 'bot'">
                        {{ score }}
                      </div>
                    </div>
                    <div class="inn">
                      <div class="cell">H</div>
                      <div class="cell" v-if="topBottom === 'top'">
                        {{ hit }}
                      </div>
                      <div class="cell">?</div>
                      <div class="cell" v-if="topBottom === 'bot'">
                        {{ hit }}
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div v-if="sub.league && sub.group">
                    {{
                      `${sub.league} ${$t('box_group', {
                        g: sub.group.replace(/group|組/gi, ''),
                      })}`
                    }}
                    <template v-if="sub.period">
                      {{ `(${sub.period})` }}
                    </template>
                    <div>{{ sub.game }}</div>
                    <div>
                      {{
                        sub.opponent
                          ? $t('box_opponent', { opponent: sub.opponent })
                          : $t('box_forgot_opponent')
                      }}
                    </div>
                  </div>
                </template>
                <router-link
                  :to="{
                    name: 'game',
                    params: { team: $route.params.team, game: sub.game },
                  }"
                  tag="button"
                  class="link-btn"
                  >{{ $t('btn_view_box') }}
                </router-link>
              </template>
            </v-popover>
          </template>
        </div>
      </template>
      <div class="button-container" v-if="role === 'manager'">
        <router-link
          :to="{
            name: 'create_game_info',
            params: { team: $route.params.team },
          }"
          tag="span"
          >＋</router-link
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.link-btn {
  background-color: $active_bgcolor;
  padding: 10px 15px;
  width: 80%;
  margin: 10px 0 5px;
  outline: none;
  font-size: 14px;
}
.container {
  display: flex;
  flex-direction: column;
  .row {
    padding-bottom: 20px;
    display: flex;
    position: relative;
    &.last {
      margin-bottom: auto;
    }
    .cell {
      color: $row_color;
      text-align: center;
      flex: 1;
      font-size: 16px;
      .item {
        cursor: pointer;
        .name {
          line-height: 24px;
        }
      }
      .result {
        border-radius: 50%;
        display: inline-block;
        width: 60px;
        height: 60px;
        line-height: 50px;
        text-transform: uppercase;
        font-size: 40px;
        font-weight: bold;
        text-decoration: none;
        color: $gray;
        box-sizing: border-box;
        border: 5px solid;
        border-color: $row_odd_bgcolor;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
        background-color: #ccc;
        color: #fff;
        &.win {
          background-color: $hit;
        }
        &.tie {
          background-color: $nonpa;
        }
        &.lose {
          background-color: $ng;
        }
        // &.C { border-color: $header_bgcolor; }
        // &.G { border-color: $row_odd_bgcolor; }
        // &.no-order {
        //  opacity: .5;
        //  cursor: not-allowed;
        // }
      }
    }
    &:after {
      content: attr(data-date);
      display: inline-block;
      text-decoration: underline;
      color: $gray;
      position: absolute;
      left: 50%;
      bottom: 5px;
      transform: translateX(-50%);
    }
  }
  .button-container {
    margin-top: -50px;
    margin-left: auto;
    padding: 0;
    text-align: right;
    width: 60px;
    position: sticky;
    bottom: 20px;
    background: none;
    span {
      display: inline-block;
      width: 50px;
      height: 50px;
      line-height: 50px;
      color: #fff;
      border-radius: 50%;
      background-color: $current_user_bgcolor;
      margin: 0;
      font-size: 30px;
      font-weight: bold;
      outline: none;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    }
  }
  &.empty {
    padding-top: 70px;
    .button-container {
      margin-top: 0;
    }
  }
  .team-versus {
    margin: 3px 0 10px;
    display: flex;
    align-items: center;
    .team-name {
      flex: 1;
      display: flex;
      align-items: center;
      max-width: 50%;
      &:first-child {
        justify-content: flex-end;
        .name {
          text-align: right;
        }
      }
      &:last-child .name {
        text-align: left;
      }
      .name {
        word-break: break-all;
      }
      .score {
        margin: 0 10px;
      }
    }
  }
  .box {
    border-radius: 4px;
    border: 2px solid #fff;
    box-sizing: border-box;
    color: #fff;
    display: flex;
    text-align: center;
    padding: 4px 0 4px 4px;
    position: relative;
    .team {
      border: 2px solid transparent;
      text-align: left;
    }
    .inn {
      flex: 1 1 50px;
      max-width: 50px;
      border: 2px solid transparent;
    }
    .team,
    .inn {
      > div:first-child {
        line-height: 28px;
        color: #fff;
      }
    }
    .gap {
      flex: 0 1 10px;
      max-width: 10px;
    }
    .cell {
      line-height: 22px;
      white-space: nowrap;
    }
  }
}
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
  }
  label {
    cursor: pointer;
  }
  &__label {
    padding: 0 4px;
  }
}
i.fa {
  font-size: 28px;
  vertical-align: middle;
  cursor: pointer;
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
      padding: 3px;
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
  .container {
    padding: 10px 0 0;
    margin: 0;
    background-color: transparent;
    box-shadow: none;
    min-height: calc(100vh - 100px);
    min-height: calc(var(--vh, 1vh) * 100 - 100px);
    .row .cell .result,
    .row:after {
      color: #fff;
    }
    .button-container {
      margin-top: -15px;
      bottom: 50px;
      span {
        margin: 0 10px 10px 0;
      }
    }
    &.empty {
      height: calc(100vh - 100px);
      height: calc(var(--vh, 1vh) * 100 - 100px);
      margin: 0;
      padding: 0;
      position: relative;
      .button-container {
        position: absolute;
        bottom: 0;
        right: 0;
      }
    }
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .search-bar {
    .condition {
      &__label {
        width: 33vw;
      }
      &__element {
        &.date {
          &:before {
            content: attr(data-short);
          }
        }
      }
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  .search-bar {
    .condition {
      &__label {
        width: 20vw;
      }
      &__element {
        width: 30vw;
      }
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
    const focus_game = window.localStorage.getItem('focus_game');
    window.localStorage.removeItem('focus_game');
    return {
      gameList_: [],
      focus_game,
      version: '',
      inn: 0,
      scores: [],
      opponentScores: [],
      useTeam: '',
      opponent: '',
      topBottom: '',
      score: 0,
      opponentScore: 0,
      hit: 0,
      toggleSearch: false,
      defaultIcon,
      unlockGames: [],
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
    ...mapActions({
      setGame: 'setGame',
      setPeriod: 'setPeriod',
    }),
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
      this.setPeriod(period);
      this.toggleSearch = false;
    },
    sumByInn(scores, inn) {
      return scores.slice(0, inn).reduce((acc, v) => acc + (v || 0), 0);
    },
  },
  computed: {
    ...mapGetters({
      boxSummary: 'boxSummary',
      groupGames: 'groupGames',
      currentTeamIcon: 'currentTeamIcon',
      role: 'role',
      period: 'period',
      periodSelect: 'periodSelect',
      lastUpdate: 'lastUpdate',
      teamInfo: 'teamInfo',
    }),
  },
  watch: {
    groupGames: {
      handler() {
        this.$nextTick(() => {
          this.gameList_ = this.groupGames;
        });
      },
      immediate: true,
    },
    boxSummary: {
      handler() {
        if (this.boxSummary.game) {
          const {
            version,
            scores,
            opponentScores,
            useTeam,
            opponent,
            topBottom,
            r,
            h,
          } = this.boxSummary;
          this.version = version;
          this.inn = Math.max(scores.length, opponentScores.length);
          this.scores = scores;
          this.opponentScores = [...opponentScores];
          this.useTeam = useTeam;
          this.opponent = opponent;
          this.topBottom = topBottom;
          this.score = r;
          this.opponentScore = this.opponentScores.reduce(
            (acc, num) => (acc += num || 0),
            0,
          );
          this.hit = h;
        }
      },
      immediate: true,
    },
    teamInfo: {
      handler() {
        this.unlockGames = this.teamInfo.unlockGames;
      },
      immediate: true,
    },
  },
};
</script>
