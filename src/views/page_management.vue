<template>
  <div class="manage-container">
    <button @click="deleteAnonymousUsers()">
      Delete Anonymous Users
    </button>
    <hr />
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
    <button @click="migrate" disabled>
      Migrate
    </button>
    <loading v-if="loading"></loading>
    <div class="modal" v-if="alertMsg">
      <div class="dialog">
        <p class="msg" v-html="alertMsg"></p>
        <button @click="alert('')">{{ $t('btn_noticed') }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.manage-container {
  /* height: 0; */
  padding: 10px;
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
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    text-align: center;
    background-color: #fff;
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

export default {
  data() {
    return {
      checkedTeams: [],
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
};
</script>
