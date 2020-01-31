<template>
  <div>
    <mobile-header :icon="currentTeamIcon" />
    <div
      class="container"
      ref="container"
      :class="{ empty: role === 'manager' && gameList_.length === 0 }"
    >
      <template v-for="item in gameList_">
        <div class="row" :data-date="item.date" :key="`date_${item.date}`">
          <template v-for="sub in item.games">
            <v-popover
              placement="bottom"
              trigger="click"
              offset="0"
              class="cell"
              :delay="{ show: 100, hide: 0 }"
              :popoverClass="`box-tip ${sub.result}`"
              :open="sub.game === focus_game"
              :autoHide="true"
              :key="`game_${sub.game}`"
              :container="$refs.container"
              @show="setGame(sub.game)"
            >
              <div class="item">
                <div :class="`result ${sub.result} ${sub.group}`">
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
                    {{ `${sub.league} ${$t('box_group', { g: sub.group })}` }}
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
  .row {
    padding-bottom: 20px;
    display: flex;
    position: relative;
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
@media only screen and (max-width: 760px) {
  .container {
    padding: 10px 0 0;
    background-color: transparent;
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
</style>

<script>
import { mapGetters, mapActions } from 'vuex';

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
    };
  },
  created() {},
  mounted() {},
  methods: {
    ...mapActions({
      setGame: 'setGame',
    }),
    sumByInn(scores, inn) {
      return scores.slice(0, inn).reduce((acc, v) => acc + (v || 0), 0);
    },
  },
  computed: {
    ...mapGetters({
      boxSummary: 'boxSummary',
      gameList: 'gameList',
      currentTeamIcon: 'currentTeamIcon',
      role: 'role',
    }),
  },
  watch: {
    gameList: {
      handler() {
        this.$nextTick(() => {
          this.gameList_ = this.gameList;
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
  },
};
</script>
