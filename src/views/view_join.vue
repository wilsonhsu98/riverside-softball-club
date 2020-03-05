<template>
  <div>
    <mobile-header :back="back_" />
    <div class="container">
      <h1>{{ $t('join_team') }}</h1>

      <div
        class="request"
        :key="`request_${request.teamCode}`"
        v-for="request in requests"
      >
        <i class="fa fa-times" @click="deleteRequest_(request.id)"></i>
        <p>{{ $t('msg_request_join', { team: request.teamName }) }}</p>
        <p class="request-msg">{{ request.msg }}</p>
        <p>{{ new Date(request.timestamp).toLocaleString() }}</p>
        <p v-if="request.status === 'denied'" class="request-denied">
          {{ $t('msg_denied') }}
        </p>
      </div>

      <custom-input
        class="field-wrapper"
        :name="$t('ttl_search_team')"
        v-model="keyWord"
      >
        <i
          class="fa fa-search"
          @click="searchTeams({ keyword: keyWord, type: 'join' })"
        ></i>
      </custom-input>

      <div class="search-result">
        <div
          v-if="Array.isArray(teamList) && teamList.length"
          class="team-wrapper"
        >
          <span
            v-for="team in teamList"
            class="team"
            @click="searchTeam_(team.teamCode)"
            :key="`team_${team.teamCode}`"
          >
            <img :src="team.icon || defaultIcon" style="height: 50px;" />
            <p class="team__name">{{ team.name }}</p>
            <p
              class="team__name"
              v-for="(subName, i) in team.subNames.split(',')"
              :key="`${team.teamCode}_subname_${i}`"
            >
              {{ subName }}
            </p>
          </span>
        </div>
        <template v-if="teamCode">
          <div
            class="team-info"
            :style="{ backgroundImage: `url(${icon || defaultIcon})` }"
          >
            <label class="section-header">{{ $t('ttl_team_intro') }}</label>
            <p>{{ teamName }}</p>
            <p>{{ otherNames }}</p>
          </div>
          <p class="team-intro">{{ teamIntro }}</p>
          <div class="team-player" v-if="joined">
            <label class="section-header">{{ $t('ttl_player_list') }}</label>
            <div
              class="team-player-item"
              style="cursor: auto;"
              :class="{ current: player.uid === userId }"
              :key="`search_${i}`"
              v-for="(player, i) in players"
            >
              <span class="img" style="border-width: 1px">
                <i class="fa fa-user-o"></i>
              </span>
              <img
                v-if="player.photo"
                class="img"
                :src="$cacheImg(player.photo)"
              />
              <span v-if="player.number" class="team-player-item__number">{{
                player.number
              }}</span>
              <span v-if="player.name">{{ player.name }}</span>
            </div>
          </div>
          <div class="team-player" v-else>
            <label class="section-header">{{ $t('bind_self') }}</label>
            <div
              class="team-player-item"
              :class="{
                binded: !!player.uid,
                current: bindPlayer && bindPlayer.name === player.name,
              }"
              :key="`search_${i}`"
              @click="bindPlayer_(player)"
              v-for="(player, i) in players"
            >
              <span class="img" style="border-width: 1px">
                <i class="fa fa-user-o"></i>
              </span>
              <img
                v-if="player.photo"
                class="img"
                :src="$cacheImg(player.photo)"
              />
              <span v-if="player.number" class="team-player-item__number">{{
                player.number
              }}</span>
              <span>{{ player.name }}</span>
            </div>
            <div v-if="bindPlayer" style="margin-top: 5px;">
              <label>
                <input type="radio" v-model="choice" value="bind" />
                {{ $t('msg_join_bind', { name: bindPlayer.name }) }}
              </label>
            </div>
          </div>
          <div class="team-player" v-if="joined && benches.length">
            <label class="section-header">{{ $t('ttl_bench_list') }}</label>
            <div
              class="team-player-item"
              style="cursor: auto;"
              :class="{ current: player.uid === userId }"
              :key="`search_${i}`"
              v-for="(player, i) in benches"
            >
              <span class="img" style="border-width: 1px">
                <i class="fa fa-user-o"></i>
              </span>
              <img
                v-if="player.photo"
                class="img"
                :src="$cacheImg(player.photo)"
              />
              <span v-if="player.number" class="team-player-item__number">{{
                player.number
              }}</span>
              <span v-if="player.name">{{ player.name }}</span>
            </div>
          </div>
          <div class="team-other" v-if="!joined">
            <label class="section-header">{{ $t('ttl_or') }}</label>
            <div>
              <label>
                <input type="radio" v-model="choice" value="join" />
                {{ $t('msg_just_join') }}
                <input
                  type="text"
                  v-model="otherPlayer"
                  @focus="() => (this.choice = 'join')"
                />
              </label>
            </div>
          </div>
        </template>
      </div>

      <div class="btn-container">
        <button class="btn cancel" @click="back_">
          {{ $t('btn_cancel') }}
        </button>
        <button
          v-if="(choice === 'join' && otherPlayer) || choice === 'bind'"
          class="btn join"
          @click="joinTeam_"
        >
          {{ $t('btn_join') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  .request {
    background-color: $input_font;
    color: #fff;
    box-sizing: border-box;
    padding: 5px 8px;
    max-width: $max_width;
    width: 100%;
    margin: 15px auto;
    border-radius: 5px;
    position: relative;
    .fa-times {
      background-color: black;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 22px;
      position: absolute;
      right: -10px;
      top: -10px;
      font-size: 20px;
      cursor: pointer;
    }
    > p {
      margin: 0;
    }
    &-msg {
      position: relative;
      padding-left: 16px;
      &:before {
        content: '-';
        position: absolute;
        top: 2px;
        left: 3px;
      }
    }
    &-denied {
      color: $error_color;
    }
  }
  .field-wrapper {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    i.fa {
      font-size: 28px;
      vertical-align: middle;
      cursor: pointer;
      line-height: 36px;
      margin-right: 5px;
      color: $input_font;
    }
  }
  .search-result {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
  }
  .team {
    position: relative;
    cursor: pointer;
    display: inline-block;
    text-align: center;
    margin-right: 3px;
    vertical-align: top;
    &:last-child {
      margin-right: 0;
    }
    &__name {
      margin: 0;
      font-size: 12px;
      line-height: 14px;
    }
  }
  .team-wrapper {
    margin-top: 10px;
  }
  .section-header {
    position: absolute;
    background-color: #fff;
    color: $input_font;
    font-size: 12px;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 4px;
    line-height: 14px;
  }
  .team-info {
    margin-top: 20px;
    border-top: 1px solid $input_border;
    padding-left: 110px;
    padding-top: 5px;
    background: 5px 50% no-repeat;
    background-size: 90px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    > p {
      margin: 0 0 10px;
      word-break: keep-all;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .team-intro {
    margin: 0 0 10px 0;
  }
  .team-player,
  .team-other {
    border-top: 1px solid $input_border;
    position: relative;
    padding: 10px 0;
    display: flex;
    flex-wrap: wrap;
    input[type='text'] {
      display: inline-block;
      resize: none;
      outline: none;
      border: none;
      box-sizing: border-box;
      border-radius: 4px;
      width: 65px;
      border: 1px solid $input_border;
      font-size: 12px;
      line-height: 14px;
      height: 32px;
      padding: 0 10px;
      &:focus {
        border-color: #3b5998;
      }
    }
  }
  .team-player-item {
    display: inline-block;
    box-sizing: border-box;
    padding-left: 26px;
    margin: 0 auto 0 12px;
    min-width: 80px;
    line-height: 26px;
    height: 26px;
    text-align: left;
    font-size: 12px;
    color: $row_color;
    cursor: pointer;
    vertical-align: middle;
    position: relative;
    &__number {
      display: inline-block;
      width: 12px;
      text-align: right;
      margin: 0 3px;
    }
    &.binded {
      color: #c5c5c5;
      cursor: not-allowed;
      .img {
        border-color: #c5c5c5;
      }
    }
    .img {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 0 solid $row_color;
      box-sizing: border-box;
      border-radius: 50%;
      background: 50% 50% no-repeat;
      background-size: 24px auto;
      position: absolute;
      top: 1px;
      left: 0;
      text-align: center;
      line-height: 18px;
      .fa-user-o {
        font-size: 16px;
        vertical-align: middle;
      }
    }
  }
  .current {
    color: $active_bgcolor;
    .img {
      border-color: $active_bgcolor;
    }
  }
}

@media only screen and (max-width: 760px) {
  .btn-container {
    position: static;
    .join {
      display: inline-block;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import i18n from '../i18n';
import defaultIcon from '../images/icon.png';

export default {
  data() {
    return {
      keyWord: '',
      teamCode: '',
      teamName: '',
      teamIntro: '',
      otherNames: '',
      players: [],
      benches: [],
      icon: '',
      joined: false,

      bindPlayer: undefined,
      otherPlayer: '',
      choice: '',
      defaultIcon,
      selected: '',
    };
  },
  created() {
    this.fetchPersonalRequests(this.userId);
  },
  mounted() {},
  beforeDestroy() {
    if (this.currentTeam) {
      this.fetchTeamInfo(this.currentTeam);
    }
    this.searchTeams({ keyword: '', type: 'join' });
    this.disconnectPersonalRequests();
  },
  methods: {
    ...mapActions({
      fetchTeamInfo: 'fetchTeamInfo',
      searchTeams: 'searchTeams',
      requestJoin: 'requestJoin',
      disconnectPersonalRequests: 'disconnectPersonalRequests',
      fetchPersonalRequests: 'fetchPersonalRequests',
      handleRequest: 'handleRequest',
    }),
    back_() {
      this.$router.back();
    },
    joinTeam_() {
      const obj = {};
      if (this.choice === 'join') {
        obj.msg = `${i18n.t('msg_just_join')}${this.otherPlayer}`;
      } else {
        obj.name = this.bindPlayer.name;
        obj.msg = i18n.t('msg_join_bind', { name: this.bindPlayer.name });
      }
      this.requestJoin({
        ...obj,
        teamCode: this.teamCode,
        teamName: this.teamName,
        uid: this.userId,
        photo: this.accountInfo.photo,
      });
    },
    searchTeam_(teamCode) {
      this.selected = teamCode;
      this.fetchTeamInfo(teamCode);
      this.bindPlayer = undefined;
      this.choice = '';
    },
    bindPlayer_(player) {
      if (player.uid) return;
      if (JSON.stringify(this.bindPlayer) === JSON.stringify(player)) {
        this.bindPlayer = undefined;
        this.choice = '';
      } else {
        this.bindPlayer = player;
        this.choice = 'bind';
      }
    },
    deleteRequest_(requestId) {
      this.handleRequest({
        requestId,
        action: 'delete',
      });
    },
  },
  computed: {
    ...mapGetters({
      teamInfo: 'teamInfo',
      teamList: 'teamList',
      currentTeam: 'currentTeam',
      accountInfo: 'accountInfo',
      userId: 'userId',
      requests: 'requests',
    }),
  },
  watch: {
    teamInfo() {
      if (this.selected === this.teamInfo.teamCode) {
        this.teamCode = this.teamInfo.teamCode;
        this.teamName = this.teamInfo.teamName;
        this.teamIntro = this.teamInfo.teamIntro;
        this.otherNames = this.teamInfo.otherNames;
        this.icon = this.teamInfo.icon;
        this.players = Array.from(this.teamInfo.players);
        this.benches = Array.from(this.teamInfo.benches);

        this.joined =
          this.players.some(player => player.uid === this.userId) ||
          this.benches.some(player => player.uid === this.userId);
      }
    },
  },
};
</script>
