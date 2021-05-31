<template>
  <div>
    <mobile-header @back="back_" />
    <div class="container">
      <h1>
        {{ $t('join_team') }}
        <div class="scanner" @click="showScanner"><scanner /></div>
      </h1>

      <template v-if="!redirectMode">
        <div
          class="request"
          :key="`request_${request.teamCode}`"
          v-for="request in requests"
        >
          <i class="fa fa-times" @click="deleteRequest_(request.id)"></i>
          <p>{{ $t('msg_request_join', { team: request.teamName }) }}</p>
          <p class="request-msg">{{ request.msg }}</p>
          <p>{{ new Date(request.timestamp).toLocaleString() }}</p>
          <p
            v-if="['denied', 'deleted'].includes(request.status) === 'denied'"
            class="request-denied"
          >
            {{ $t(`msg_${request.status}`) }}
          </p>
        </div>
        <custom-input
          class="field-wrapper"
          :name="$t('ttl_search_team')"
          v-model="keyWord"
          @enter="value => searchTeams({ keyword: value, type: 'join' })"
        >
          <i class="fa fa-search" @mousedown="searchTeams_"></i>
        </custom-input>
      </template>

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
            <div :data-score="team.score">
              <img :src="$cacheImg(team.icon) || $cacheImg(defaultIcon)" />
            </div>
            <p class="team__name">{{ team.name }}</p>
            <p
              class="team__name"
              v-for="(subName, i) in ellipsisTeams(team.subNames.split(','))"
              :key="`${team.teamCode}_subname_${i}`"
            >
              {{ subName }}
            </p>
          </span>
        </div>
        <template v-if="teamCode">
          <div
            class="team-info"
            :style="{
              backgroundImage: `url(${$cacheImg(icon) ||
                $cacheImg(defaultIcon)})`,
            }"
          >
            <div v-if="teamScore" class="score" @click="showScore">
              {{ `${$t('ttl_score')} ${teamScore}` }}
            </div>
            <label class="section-header" style="outline: none;">{{
              $t('ttl_team_intro')
            }}</label>
            <p>{{ teamName }}</p>
            <p>{{ otherNames }}</p>
          </div>
          <p class="team-intro" v-html="teamIntro.replace(/\n/g, '<br/>')" />
          <div class="team-player" v-if="joined">
            <label class="section-header" ref="label">{{
              $t('ttl_player_list')
            }}</label>
            <div
              class="team-player-item"
              style="cursor: auto;"
              :class="{ current: player.uid === userId }"
              :key="`search_${i}`"
              v-for="(player, i) in players"
            >
              <photo
                :photo="player.photo"
                :name="player.name"
                :number="player.number"
                size="small"
              />
              <span v-if="player.number" class="team-player-item__number">{{
                player.number
              }}</span>
              <span v-if="player.name">{{ player.name }}</span>
            </div>
            <div class="team-player-item"></div>
            <div class="team-player-item"></div>
            <div class="team-player-item"></div>
          </div>
          <div class="team-player" v-else>
            <label class="section-header" ref="label">{{
              $t('bind_self')
            }}</label>
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
              <photo
                :photo="player.photo"
                :name="player.name"
                :number="player.number"
                size="small"
              />
              <span v-if="player.number" class="team-player-item__number">{{
                player.number
              }}</span>
              <span>{{ player.name }}</span>
            </div>
            <div class="team-player-item"></div>
            <div class="team-player-item"></div>
            <div class="team-player-item"></div>
            <div v-if="bindPlayer" style="margin-top: 5px; width: 100%;">
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
              <photo
                :photo="player.photo"
                :name="player.name"
                :number="player.number"
                size="small"
              />
              <span v-if="player.number" class="team-player-item__number">{{
                player.number
              }}</span>
              <span v-if="player.name">{{ player.name }}</span>
            </div>
            <div class="team-player-item"></div>
            <div class="team-player-item"></div>
            <div class="team-player-item"></div>
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
          v-if="(choice === 'join' && otherPlayer.trim()) || choice === 'bind'"
          class="btn join"
          @click="joinTeam_"
        >
          {{ $t('btn_join') }}
        </button>
      </div>
    </div>
    <team-score-modal
      :title="$t('ttl_score_team', { team: teamName })"
      :teamScore="teamScore"
      :teamScoreKVP="teamScoreKVP"
    />
    <div class="modal" v-if="isShowScanner" @click="closeScanner">
      <div class="cam">
        <qrcode-stream @decode="onDecode"></qrcode-stream>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  h1 {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    position: relative;
    .scanner {
      position: absolute;
      z-index: 1;
      right: 0;
      top: 1px;
      width: 22px;
      height: 22px;
      cursor: pointer;
    }
  }
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
      margin-right: auto;
    }
    &__name {
      margin: 0;
      font-size: 12px;
      line-height: 14px;
    }
    div[data-score] {
      display: inline-block;
      position: relative;
      &:after {
        content: attr(data-score);
        position: absolute;
        z-index: 1;
        left: -3px;
        top: -3px;
        height: 18px;
        padding: 0 3px;
        min-width: 18px;
        line-height: 18px;
        font-size: 12px;
        background-color: $dark_gray;
        border-radius: 9px;
        box-sizing: border-box;
        text-align: center;
        color: #fff;
        opacity: 0.8;
      }
    }
    img {
      height: 50px;
      width: 50px;
    }
  }
  .team-wrapper {
    margin-top: 10px;
    margin-right: -3px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .section-header {
    position: absolute;
    background-color: var(--card-bg);
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
      &:last-child {
        margin-bottom: 0;
      }
    }
    .score {
      position: absolute;
      z-index: 1;
      right: 0;
      top: 10px;
      height: 18px;
      padding: 0 8px;
      min-width: 18px;
      line-height: 18px;
      font-size: 12px;
      background-color: $dark_gray;
      border-radius: 9px;
      box-sizing: border-box;
      text-align: center;
      color: #fff;
      opacity: 0.8;
      cursor: pointer;
    }
  }
  .team-intro {
    margin: 0 0 10px 0;
    overflow: hidden;
    word-break: break-word;
  }
  .team-player,
  .team-other {
    border-top: 1px solid $input_border;
    position: relative;
    padding: 10px 0;
    display: flex;
    flex-wrap: wrap;
    input[type='text'] {
      background-color: var(--card-bg);
      color: var(--input-color);
      display: inline-block;
      resize: none;
      outline: none;
      border: none;
      box-sizing: border-box;
      border-radius: 4px;
      width: 65px;
      border: 2px solid $input_border;
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
    &:empty {
      height: 0;
    }
    &__number {
      display: inline-block;
      width: 12px;
      text-align: right;
      margin: 0 3px;
    }
    &.binded {
      color: #c5c5c5;
      cursor: not-allowed;
      &::v-deep .img {
        border-color: #c5c5c5;
      }
    }
  }
  .current {
    color: $active_bgcolor;
    &::v-deep .img {
      border-color: $active_bgcolor;
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
  > .cam {
    width: 300px;
    height: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }
}

@media only screen and (max-width: 760px) {
  .container {
    .btn-container {
      position: static;
      .join {
        display: inline-block;
      }
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';
import { scrollTo } from '../libs/utils';

export default {
  data() {
    return {
      keyWord: '',
      teamCode: '',
      teamName: '',
      teamIntro: '',
      otherNames: '',
      teamScore: undefined,
      teamScoreKVP: {},
      players: [],
      benches: [],
      icon: '',
      joined: false,

      bindPlayer: undefined,
      otherPlayer: '',
      choice: '',
      defaultIcon,
      selected: '',
      redirectMode: !!this.$route.query.teamCode,
      isShowScanner: false,
    };
  },
  created() {
    if (this.redirectMode) {
      this.searchTeam_(this.$route.query.teamCode);
    } else {
      this.fetchPersonalRequests(this.userId);
    }
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
    ...mapActions([
      'fetchTeamInfo',
      'searchTeams',
      'requestJoin',
      'disconnectPersonalRequests',
      'fetchPersonalRequests',
      'handleRequest',
      'alert',
    ]),
    back_() {
      if (this.redirectMode) {
        this.$router.push('/main/user');
      } else {
        this.$router.back();
      }
    },
    joinTeam_() {
      const obj = {};
      if (this.choice === 'join') {
        obj.msg = `${this.$t('msg_just_join')}${this.otherPlayer}`;
      } else {
        obj.name = this.bindPlayer.name;
        obj.msg = this.$t('msg_join_bind', { name: this.bindPlayer.name });
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
    searchTeams_(e) {
      e.stopPropagation();
      this.searchTeams({ keyword: this.keyWord, type: 'join' });
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
    showScore() {
      this.$modal.show('score');
    },
    showScanner() {
      this.isShowScanner = true;
    },
    closeScanner(e) {
      if (e.currentTarget === e.target) {
        this.isShowScanner = false;
      }
    },
    onDecode(result) {
      if (result) {
        if (result.match(/main\/join_team\?teamCode=/)) {
          const teamCode = result.replace(
            /.*main\/join_team\?teamCode=(.*)/,
            '$1',
          );
          if (teamCode !== this.$route.query.teamCode) {
            this.$router.replace(`/main/join_team?teamCode=${teamCode}`);
          }
          this.isShowScanner = false;
        } else {
          this.alert(this.$t('msg_not_valid_invited_url'));
        }
      }
    },
    ellipsisTeams(teams) {
      const subTeams = teams.filter(team => team);
      if (subTeams.length > 2) {
        const find =
          subTeams.find(t => t.includes(this.keyWord)) || subTeams[0];
        return [find, this.$t('msg_team_ellipsis', { n: subTeams.length - 1 })];
      } else {
        return subTeams;
      }
    },
  },
  computed: {
    ...mapGetters([
      'teamInfo',
      'teamList',
      'currentTeam',
      'accountInfo',
      'userId',
      'requests',
    ]),
  },
  watch: {
    $route(to) {
      if (to.query.teamCode) {
        this.redirectMode = true;
        this.searchTeam_(to.query.teamCode);
      }
    },
    teamInfo() {
      if (this.selected === this.teamInfo.teamCode) {
        this.teamCode = this.teamInfo.teamCode;
        this.teamName = this.teamInfo.teamName;
        this.teamIntro = this.teamInfo.teamIntro;
        this.otherNames = this.teamInfo.otherNames;
        this.teamScore = this.teamInfo.score;
        this.teamScoreKVP = this.teamInfo.scoreKVP;
        this.icon = this.teamInfo.icon;
        this.players = [...this.teamInfo.players];
        this.benches = [...this.teamInfo.benches];

        this.joined =
          this.players.some(player => player.uid === this.userId) ||
          this.benches.some(player => player.uid === this.userId);

        this.$nextTick(() => {
          scrollTo(this.$refs.label);
        });
      }
    },
  },
};
</script>
