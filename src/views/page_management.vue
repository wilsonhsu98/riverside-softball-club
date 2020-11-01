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
        {{ team.name }}
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
  },
  computed: {
    ...mapGetters({
      loading: 'loading',
      alertMsg: 'alertMsg',
      teamList: 'teamList',
    }),
  },
};
</script>
