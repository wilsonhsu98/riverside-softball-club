<template>
  <div>
    <mobile-header />
    <ad :mode="'user'" />
    <div class="container">
      <template v-if="isAnonymous === false">
        <theme-switcher class="theme" />
        <div class="avatar">
          <img :src="$cacheImg(accountInfo.photo)" />
          <router-link
            :to="{ path: 'user_avatar' }"
            tag="i"
            class="fa fa-camera"
          />
        </div>
        <div class="info-wrapper">
          <div class="info">{{ accountInfo.name }}</div>
          <div class="info" v-if="accountInfo.email">
            {{ accountInfo.email }}
          </div>
          <div
            class="btn-container"
            v-if="
              (teams === null || (Array.isArray(teams) && teams.length)) &&
                collapse
            "
          >
            <button @click="collapse = false">{{ $t('btn_seldom') }}</button>
          </div>
          <div class="btn-container" v-else>
            <router-link :to="{ path: 'join_team' }" tag="button">
              {{ $t('join_team') }}
            </router-link>
            <router-link :to="{ path: 'create_team' }" tag="button">
              {{ $t('create_team') }}
            </router-link>
            <router-link
              v-if="teams.length > 0"
              :to="{ path: 'leave_team' }"
              tag="button"
            >
              {{ $t('leave_team') }}
            </router-link>
            <button class="logout-btn" @click="logout">
              {{ $t('logout_btn') }}
            </button>
          </div>
          <div class="links">
            <a
              class="link"
              href="https://www.privacypolicies.com/live/a6db80b5-4d56-4e7e-946a-505db52f9dcd"
              target="_blank"
              >{{ $t('system_privacy_policy') }}</a
            >
            <a
              class="link"
              href="https://drive.google.com/file/d/1fDA9vLOH772eTkzBO5aFfTuSJgh1zuo7/view?usp=sharing"
              target="_blank"
              >{{ $t('system_manual') }}</a
            >
            <a
              class="link"
              href="mailto:riversidesoftballclub.app@gmail.com"
              >{{ $t('system_mail') }}</a
            >
            <a
              class="link"
              href="https://docs.google.com/forms/d/e/1FAIpQLSf82txQ_Cqc9GheIU6EPCj3f3xtMc5qI6PF8OB-x6XzuvngFA/viewform"
              target="_blank"
              >{{ $t('system_feedback') }}</a
            >
            <a
              v-if="
                [
                  'Ac1JwgNSkdctBkdoiOC0Fgn3mqE2',
                  '6CMMLMg6adPL3CyUWkWbPzIAYN62',
                ].includes(userId)
              "
              class="link"
              href="#/management"
              target="_blank"
              >後台</a
            >
          </div>
        </div>
      </template>
      <template v-if="isAnonymous === true">
        <button class="logout-btn" @click="logout_">
          {{ $t('logout_btn') }}
        </button>
        <div class="search-wrapper">
          <h1>{{ $t('anonymous_join') }}</h1>
          <custom-input
            class="field-wrapper"
            :name="$t('ttl_search_team')"
            v-model="keyWord"
            @enter="value => searchTeams({ keyword: value, type: 'anonymous' })"
          >
            <i class="fa fa-search" @mousedown="searchTeams_"></i>
          </custom-input>
        </div>
      </template>
      <div v-if="Array.isArray(teams) && teams.length" class="team-wrapper">
        <label v-if="isAnonymous === true">{{
          $t('ttl_anonymous_search')
        }}</label>
        <template v-else>
          <label v-if="teams.length === 1">{{ $t('ttl_current_team') }}</label>
          <label v-else>{{ $t('ttl_switch_team') }}</label>
        </template>
        <span
          v-for="team in teams"
          class="team"
          @click="switchTeam_(team.teamCode)"
          :data-requests="
            (team.requests || []).length === 0 || team.teamCode === currentTeam
              ? undefined
              : team.requests.length
          "
          :key="`team_${team.teamCode}`"
        >
          <div
            :data-score="
              team.teamCode === 'DEMO' || isAnonymous !== true
                ? undefined
                : team.score
            "
          >
            <img :src="$cacheImg(team.icon) || $cacheImg(defaultIcon)" />
            <i v-if="team.teamCode === currentTeam" class="fa fa-check" />
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
      <!-- <coordination :values="dots"/> -->
    </div>
    <ad :mode="'user300x250'" />
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
    margin: 0 auto;
    position: relative;
    > img {
      border-radius: 50%;
      width: 100px;
      height: 100px;
    }
    i.fa {
      position: absolute;
      right: 0;
      bottom: 0;
      color: white;
      background-color: $current_user_bgcolor;
      border-radius: 4px;
      font-size: 14px;
      width: 26px;
      height: 26px;
      text-align: center;
      line-height: 26px;
      cursor: pointer;
    }
  }
  .info-wrapper {
    flex: 1 0 280px;
    padding: 0 10px;
    .info {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
  .links {
    margin: 0 0 0 -5px;
    .link {
      display: inline-block;
      margin: 0 5px;
    }
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
    .fa-check {
      position: absolute;
      right: 0;
      top: 33px;
      color: white;
      background-color: #00b5a3;
      border-radius: 4px;
      padding: 2px;
    }
    &[data-requests]:before {
      content: attr(data-requests);
      position: absolute;
      z-index: 1;
      right: -3px;
      top: -3px;
      height: 18px;
      width: 18px;
      line-height: 18px;
      font-size: 12px;
      background-color: #ff2200;
      border-radius: 50%;
      text-align: center;
      color: #fff;
    }
    &__name {
      margin: 0;
      font-size: 12px;
      line-height: 14px;
    }
  }
  .team-wrapper {
    flex: 1 0 268px;
    height: 100%;
    border: 2px solid $input_border;
    border-radius: 4px;
    margin-top: 12px;
    padding: 10px 2px 5px 5px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    label {
      background-color: var(--card-bg);
      color: $input_font;
      font-size: $input_font_size - 2;
      line-height: $input_font_size;
      max-width: 90%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding: 0 4px;
      position: absolute;
      top: -$input_font_size/2;
      right: auto;
      left: 8px;
      z-index: 1;
    }
  }
  .btn-container {
    margin: 0 -5px;
    display: flex;
    button {
      flex: 0;
      padding: 0 10px;
      word-break: keep-all;
    }
  }
  button {
    background-color: $header_bgcolor;
    padding: 10px 15px;
    vertical-align: middle;
    height: 36px;
    outline: none;
  }
  .logout-btn {
    display: none;
    &:focus {
      outline: none;
    }
    &:disabled {
      opacity: 0.3;
    }
  }
  .search-wrapper {
    margin-top: 10px;
    width: 100%;
    h1 {
      font-size: 18px;
      font-weight: normal;
      margin: 0;
      text-align: center;
      text-decoration: underline;
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
    & + .team-wrapper {
      max-width: $max_width;
      margin: 12px auto 0;
    }
  }
  .theme {
    display: none;
  }
}

@media only screen and (max-width: 760px), (max-height: 480px) {
  .container {
    .info-wrapper {
      flex: none;
      width: 100%;
      text-align: center;
      .btn-container {
        justify-content: center;
        margin: 8px 0;
        > button {
          margin: 0 3px;
        }
      }
    }
    .logout-btn {
      display: inline-block;
    }
    .theme {
      display: inline-block;
      position: absolute;
      top: 20px;
      right: 10px;
      transform-origin: right center;
      transform: scale(0.7);
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';

export default {
  data() {
    return {
      collapse: true,
      dots: undefined,
      keyWord: '',
      defaultIcon,
      // dots: [{x: 50, y: 50, color: 'blue'}, {x: 30, y: 30}]
    };
  },
  created() {},
  beforeDestroy() {
    if (!this.isAnonymous && !this.userId) {
      this.searchTeams({ keyword: '', type: 'anonymous' });
    }
  },
  methods: {
    ...mapActions(['logout', 'switchTeam', 'searchTeams', 'searchDemo']),
    logout_() {
      this.logout();
    },
    switchTeam_(teamCode) {
      if (this.currentTeam !== teamCode) {
        this.switchTeam(teamCode);
        if (this.isAnonymous) {
          this.$router.push(`/main/games/${teamCode}`);
        }
      }
    },
    searchTeams_(e) {
      e.stopPropagation();
      this.searchTeams({ keyword: this.keyWord, type: 'anonymous' });
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
      'userId',
      'accountInfo',
      'currentTeamIcon',
      'currentTeam',
      'teams',
      'isAnonymous',
      'keyword',
    ]),
  },
  watch: {
    keyword: {
      handler() {
        this.keyWord = this.keyword;
      },
      immediate: true,
    },
    isAnonymous: {
      handler() {
        if (this.isAnonymous) {
          this.searchDemo();
        }
      },
      immediate: true,
    },
  },
};
</script>
