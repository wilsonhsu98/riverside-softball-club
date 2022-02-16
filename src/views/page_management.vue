<template>
  <div class="manage-container">
    <simplebar class="sticky-table-wrapper">
      <div class="sticky-table">
        <div class="header-row">
          <template v-for="col in displayedCols">
            <div
              v-if="col === 'Rank'"
              :key="`header_${col}`"
              class="cell rank"
              :title="$t(col)"
            >
              {{ $t(col) }}
            </div>
            <div
              v-else-if="col === 'name'"
              :key="`header_${col}`"
              class="cell name"
              :title="$t(col)"
            >
              {{ $t(col) }}
            </div>
            <div
              v-else
              :key="`header_${col}`"
              class="cell"
              :class="{
                sort: col === sortBy,
                [col]: true,
              }"
              :title="columnSet[col]"
              @click="setSortBy_(col)"
            >
              {{ columnSet[col] }}
            </div>
          </template>
        </div>
        <template v-for="(item, itemIndex) in allTeams_">
          <div
            class="normal-row"
            :key="`div_${item.teamCode}`"
            :class="{ current: item.teamCode === hightlight }"
            @click="setHighlight(item.teamCode)"
          >
            <template v-for="(col, colIndex) in displayedCols">
              <div
                v-if="col === 'Rank'"
                :key="`row_${item.teamCode}_${colIndex}`"
                class="cell rank"
              >
                <div class="align-right">{{ itemIndex + 1 }}</div>
              </div>
              <div
                v-else-if="col === 'name'"
                :key="`row_${item.teamCode}_${colIndex}`"
                class="cell name"
              >
                <div class="player">
                  <photo :photo="item.icon" :name="item.name" />
                  <a
                    class="link"
                    :href="
                      `javascript:window.open('#/session/${item.teamCode}')`
                    "
                    >{{ item.name }}</a
                  >
                </div>
              </div>
              <div
                v-else-if="['createTime', 'lastUpdate'].includes(col)"
                class="cell"
                :class="{ sort: col === sortBy }"
                :key="`row_${item.teamCode}_${colIndex}`"
              >
                <div class="align-right">
                  {{
                    new Date(item[col]).toString() === 'Invalid Date'
                      ? ''
                      : new Date(item[col]).toLocaleDateString()
                  }}
                </div>
              </div>
              <div
                v-else-if="['teamType'].includes(col)"
                class="cell"
                :class="{ sort: col === sortBy }"
                :key="`row_${item.teamCode}_${colIndex}`"
              >
                <div class="align-right">
                  {{ columnSet[item[col]] }}
                </div>
              </div>
              <div
                v-else
                class="cell"
                :class="{ sort: col === sortBy }"
                :key="`row_${item.teamCode}_${colIndex}`"
              >
                <div class="align-right">
                  {{
                    typeof item[col] === 'boolean'
                      ? item[col]
                        ? '●'
                        : ''
                      : item[col]
                  }}
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </simplebar>
    <!-- <button @click="deleteAnonymousUsers()">
      Delete Anonymous Users
    </button>
    <hr /> -->
    <div v-for="team in teamList" :key="team.teamCode">
      <label :for="`chk${team.teamCode}`">
        <input
          type="checkbox"
          :id="`chk${team.teamCode}`"
          :value="team.teamCode"
          v-model="checkedTeams"
        />
        {{ `${team.name}(${team.score})` }}
      </label>
    </div>
    <button
      v-if="teamList.length"
      :disabled="checkedTeams.length === 0"
      @click="deleteUnuseTeams"
    >
      Delete Unuse Teams
    </button>
    <div v-else>There is no team can be deleted</div>
    <template v-if="recentGames.length">
      <hr />
      <table>
        <thead>
          <tr
            :key="row.name"
            v-for="row in recentGames.filter(
              r => r.name === 'HEADER_SUM_TOTAL',
            )"
          >
            <th></th>
            <th>今天{{ row.col[0] }}</th>
            <th>明天{{ row.col[1] }}</th>
            <th>後天{{ row.col[2] }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :key="row.name"
            v-for="row in recentGames.filter(
              r => r.name === 'HEADER_SUM_TOTAL',
            )"
          >
            <td>總計</td>
            <td>{{ row.today }}</td>
            <td>{{ row.nextDay }}</td>
            <td>{{ row.next2Days }}</td>
          </tr>
          <tr
            :key="row.name"
            v-for="row in recentGames.filter(
              r => r.name !== 'HEADER_SUM_TOTAL',
            )"
          >
            <td>{{ row.name }}</td>
            <td>{{ row.today }}</td>
            <td>{{ row.nextDay }}</td>
            <td>{{ row.next2Days }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <hr />
    <button @click="batchEvaluateTeamScore">
      Batch Evaluate Team Score
    </button>
    <hr />
    <button @click="migrate">
      Migrate
    </button>
    <hr />
    <input type="file" accept="application/JSON" @change="handleRollbackFile" />
    <div>
      <code>{{ parsingResult }}</code>
    </div>
    <button @click="handleRollback" :disabled="rollbackJSON === null">
      Rollback
    </button>
    <loading v-if="loading"></loading>
    <div class="modal" v-if="alertMsg">
      <div class="dialog">
        <p class="msg" v-html="alertMsg"></p>
        <button @click="alert('')">{{ $t('btn_noticed') }}</button>
      </div>
    </div>
    <button style="position: fixed; right: 10px; bottom: 10px;" @click="close">
      {{ $t('close_tab_btn') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.sticky-table-wrapper {
  margin: -10px -10px 10px;
  max-height: 50vh;
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
        background-color: $current_user_bgcolor;
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
        width: 120px;
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
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
.manage-container {
  /* height: 0; */
  padding: 10px;
  padding-right: calc(10px + constant(safe-area-inset-right));
  padding-left: calc(10px + constant(safe-area-inset-left));
  /* iOS 11.0 */
  padding-right: calc(10px + env(safe-area-inset-right));
  padding-left: calc(10px + env(safe-area-inset-left));
  /* iOS 11.2 */

  text-align: center;
  button {
    background-color: $header_bgcolor;
    padding: 10px 15px;
    outline: none;
  }
  label {
    line-height: 30px;
  }
  table {
    margin: 0 auto;
    th,
    td {
      padding: 0 5px;
    }
  }
  .link {
    color: $error_color;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.modal {
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  .dialog {
    background-color: var(--card-bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    text-align: center;
    border-radius: 10px;
    box-shadow: 0 20px 60px -2px rgba(27, 33, 58, 0.4);
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
  }
  .msg {
    margin: 0 0 15px;
    text-align: left;
    width: 100%;
    &::v-deep {
      ul {
        margin: 0;
        padding-inline-start: 25px;
      }
    }
  }
  button {
    background-color: $header_bgcolor;
    padding: 10px;
    margin: 0;
    outline: none;
    flex: 1;
    &:nth-of-type(2) {
      margin-left: 10px;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import { f_timestamp } from '../firebase';

export default {
  data() {
    return {
      checkedTeams: [],
      parsingResult: '',
      rollbackJSON: null,
      displayedCols: [
        'Rank',
        'name',
        'score',
        'games',
        'players',
        'managers',
        'benches',
        'teamType',
        'pitcherInn',
        'teamIcon',
        '10Players',
        '10BindingPlayers',
        '10CompletedGames',
        'teamIntro',
        'teamOtherNames',
        'gamePeriod',
        'gameLeague',
        'gameGroup',
        'gameType',
        'gamePlace',
        'gameTopBottom',
        'gameCoach',
        'gameRecorder',
        'gameTags',
        'gamePitcher',
        'gamePitchers',
        'gameErrors',
        'gameResult',
        'gameOpponentScores',
        'gameMvp',
        'gameNote',
        'gamePositions',
        'gameVideo',
        'gamePersonalVideo',
        'createTime',
        'lastUpdate',
      ],
      columnSet: {
        score: '分數',
        games: '場數',
        players: '球員',
        managers: '管理',
        benches: '板凳',
        teamType: '棒壘',
        pitcherInn: '局',
        teamIcon: 'LOGO',
        '10Players': '10球員',
        '10BindingPlayers': '10綁定',
        '10CompletedGames': '10比賽',
        teamIntro: '簡介',
        teamOtherNames: '別名',
        gamePeriod: '區間',
        gameLeague: '聯盟',
        gameGroup: '組別',
        gameType: '比賽性質',
        gamePlace: '休息區',
        gameTopBottom: '攻守',
        gameCoach: '教練',
        gameRecorder: '記錄',
        gameTags: '標籤',
        gamePitcher: '投手',
        gamePitchers: '投手記錄',
        gameErrors: '守備失誤',
        gameResult: '勝敗',
        gameOpponentScores: '對手分數',
        gameMvp: 'MVP',
        gameNote: '賽後',
        gamePositions: '守位',
        gameVideo: '影片',
        gamePersonalVideo: '個人影片',
        createTime: '加入時間',
        lastUpdate: '最後更新',
        softball: '壘',
        baseball: '棒',
      },
      allTeams_: JSON.parse(window.localStorage.getItem('allTeams')) || [],
      sortBy: window.localStorage.getItem('pref_m_team_sortby') || 'score',
      hightlight: '',
    };
  },
  created() {
    this.fetchDummyTeams();
  },
  methods: {
    ...mapActions([
      'alert',
      'deleteAnonymousUsers',
      'fetchDummyTeams',
      'deleteTeam',
      'editTeamScore',
      'migrate',
      'rollback',
    ]),
    deleteUnuseTeams() {
      this.checkedTeams
        .reduce((acc, teamCode) => {
          return acc.then(() => {
            return new Promise(resolve => {
              this.deleteTeam({
                teamCode: teamCode,
                nextAction: () => {
                  resolve();
                },
              });
            });
          });
        }, Promise.resolve())
        .then(() => {
          this.fetchDummyTeams();
        });
    },
    batchEvaluateTeamScore() {
      this.allTeams
        .map(t => t.teamCode)
        .reduce((acc, teamCode) => {
          return acc.then(() => {
            return new Promise(resolve => {
              this.editTeamScore({
                teamCode: teamCode,
                nextAction: () => {
                  resolve();
                },
              });
            });
          });
        }, Promise.resolve())
        .then(() => {
          this.alert('完成');
        });
    },
    handleRollbackFile(event) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          this.rollbackJSON = JSON.parse(e.target.result);
          this.parsingResult = JSON.stringify(
            this.rollbackJSON.map(({ team, games }) => ({
              team,
              games: games.map(g => g.id),
            })),
          );
        } catch (ex) {
          this.rollbackJSON = null;
          this.parsingResult = ex;
        }
      };
      reader.readAsText(event.target.files[0]);
    },
    handleRollback() {
      if (
        Array.isArray(this.rollbackJSON) &&
        this.rollbackJSON.length > 0 &&
        this.rollbackJSON.every(
          row =>
            typeof row === 'object' &&
            row.team &&
            Array.isArray(row.games) &&
            row.games.length,
        )
      ) {
        this.rollback(this.rollbackJSON);
      } else {
        this.alert('格式不符');
      }
    },
    setSortBy_(sortItem) {
      if (sortItem !== this.sortBy) {
        this.sortBy = sortItem;
        window.localStorage.setItem('pref_m_team_sortby', sortItem);
        if (['createTime', 'lastUpdate'].includes(sortItem)) {
          this.allTeams_ = this.allTeams_.sort((a, b) => {
            if (
              new Date(a[sortItem]).toString() === 'Invalid Date' &&
              new Date(b[sortItem]).toString() !== 'Invalid Date'
            )
              return 1;
            if (
              new Date(a[sortItem]).toString() !== 'Invalid Date' &&
              new Date(b[sortItem]).toString() === 'Invalid Date'
            )
              return -1;
            return new Date(b[sortItem]) - new Date(a[sortItem]);
          });
        } else if (['teamType', 'pitcherInn'].includes(sortItem)) {
          this.allTeams_ = this.allTeams_.sort((a, b) => {
            if (a[sortItem] === undefined && b[sortItem] !== undefined)
              return 1;
            if (a[sortItem] !== undefined && b[sortItem] === undefined)
              return -1;
            if (
              typeof b[sortItem] === 'string' &&
              typeof a[sortItem] === 'string'
            ) {
              return a[sortItem].localeCompare(b[sortItem]);
            } else if (
              typeof b[sortItem] === 'number' &&
              typeof a[sortItem] === 'number'
            ) {
              return b[sortItem] - a[sortItem];
            } else {
              return b[sortItem] - a[sortItem];
            }
          });
        } else {
          this.allTeams_ = this.allTeams_.sort((a, b) => {
            if (a[sortItem] === undefined && b[sortItem] !== undefined)
              return 1;
            if (a[sortItem] !== undefined && b[sortItem] === undefined)
              return -1;
            return b[sortItem] - a[sortItem];
          });
        }
      }
    },
    setHighlight(team) {
      this.hightlight = team;
    },
    close() {
      window.close();
    },
  },
  computed: {
    ...mapGetters([
      'loading',
      'alertMsg',
      'teamList',
      'recentGames',
      'allTeams',
    ]),
  },
  watch: {
    allTeams: {
      handler() {
        const allTeams_ = this.allTeams
          .map(team => ({
            ...team,
            games: Object.keys(team.games || {}).length,
            players: Object.keys(team.players || {}).length,
            benches: Object.keys(team.benches || {}).length,
            managers: Object.keys(team.players || {}).filter(
              name => team.players[name].manager,
            ).length,
            ...team.scoreKVP,
            createTime: team.createTime
              ? new f_timestamp(
                  team.createTime.seconds,
                  team.createTime.nanoseconds,
                ).toDate()
              : '',
            lastUpdate: new Date(team.timestamp),
          }))
          .sort((a, b) => b[this.sortBy] - a[this.sortBy]);
        window.localStorage.setItem('allTeams', JSON.stringify(allTeams_));
        this.allTeams_ = allTeams_;
      },
    },
  },
};
</script>
