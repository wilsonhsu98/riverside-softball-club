<template>
  <div class="main-container">
    <router-view class="content"></router-view>
    <header>
      <div class="header-container">
        <clock-or-icon
          :icon="$cacheImg(currentTeamIcon) || $cacheImg(defaultIcon)"
        />
        <ul class="tab">
          <li v-if="currentTeam">
            <router-link
              :to="{ name: 'games', params: { team: currentTeam } }"
              exact
              active-class="active"
              :data-label="$t('menu_games')"
            >
              <i class="fa box"><box /></i>
            </router-link>
          </li>
          <li v-if="currentTeam">
            <router-link
              :to="{ name: 'stats_pa', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats')"
            >
              <i class="fa fa-list-ol"></i>
            </router-link>
          </li>
          <li v-if="currentTeam">
            <router-link
              :to="{ name: 'stats_pitcher', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats_pitcher')"
            >
              <i class="fa fa-list-ol"></i>
            </router-link>
          </li>
          <li v-if="currentTeam">
            <router-link
              :to="{ name: 'stats_item', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats_item')"
            >
              <i class="fa carousel"><carousel /></i>
            </router-link>
          </li>
          <li v-if="currentTeam && role === 'manager'">
            <router-link
              :to="{ name: 'edit_team', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_manage')"
              :data-requests="
                teamRequests.length === 0 ? undefined : teamRequests.length
              "
            >
              <i class="fa fa-cog"></i>
            </router-link>
          </li>
          <li :class="{ home: isAnonymous }">
            <router-link
              :to="{ name: 'user' }"
              active-class="active"
              :data-label="isAnonymous ? $t('menu_home') : $t('menu_profile')"
              :data-requests="totalRequest || undefined"
            >
              <i
                class="fa"
                :class="{
                  'fa-home': isAnonymous,
                  'fa-user': !isAnonymous,
                }"
              ></i>
            </router-link>
          </li>
          <li class="theme">
            <theme-switcher />
          </li>
          <li class="logout_link">
            <a @click="logout">{{ $t('logout_btn') }}</a>
          </li>
        </ul>
      </div>
    </header>
    <loading v-if="loading" :text="loading.text"></loading>
    <div class="modal" v-if="alertMsg">
      <div class="dialog">
        <p class="msg" v-html="alertMsg.replace('\n', '<br>')"></p>
        <button @click="alertYes">{{ $t('btn_noticed') }}</button>
      </div>
    </div>
    <div class="modal" v-if="confirmMsg">
      <div class="dialog">
        <p class="msg" v-html="confirmMsg.replace('\n', '<br>')"></p>
        <button @click="confirmYes">{{ confirmMsgY || $t('btn_yes') }}</button>
        <button @click="confirmNo">{{ confirmMsgN || $t('btn_no') }}</button>
      </div>
    </div>
    <ad v-if="showAd" :key="showAd" :mode="adMode" />
    <div class="preload" />
    <div v-if="showUpdateAvailable" class="update">
      <span>{{ $t('system_new_version') }}</span>
      <a class="link" @click="hardReload">{{
        $t('system_new_version_reload')
      }}</a>
      <i class="fa fa-times" @click="showUpdateAvailable = false"></i>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

$header_menu_height: 70px;
$footer_menu_height: 50px;
$main_width: 980px;

.main-container {
  padding-top: $header_menu_height;
  padding-bottom: 20px;
}
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background-color: $header_bgcolor;
  height: $header_menu_height;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.13), 0 0 2px 0 rgba(0, 0, 0, 0.2);
  .header-container {
    width: $main_width;
    margin: 0 auto;
    display: flex;
    align-items: center;
  }
  &::v-deep {
    .icon {
      max-height: 60px;
    }
    .icon,
    .clock {
      position: unset;
      top: unset;
      left: unset;
      transform: unset;
    }
  }
  .tab {
    display: inline-flex;
    box-sizing: border-box;
    list-style-type: none;
    padding: 0;
    margin: 0 0 0 5px;
    background-size: contain;
    height: 100%;
    line-height: 70px;
    vertical-align: middle;
    flex: 1;
    > li {
      display: inline-block;
      &.home {
        order: -1;
      }
    }
    .theme {
      margin: 0 5px 0 auto;
    }
    .logout_link {
      cursor: pointer;
    }
  }
  a {
    color: $header_color;
    text-decoration: none;
    padding: 8px 15px;
    margin: 0 2px;
    border-radius: 98px;
    position: relative;
    &.active {
      background-color: $menu_active;
      color: $row_color;
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
      background-color: $request_bgcolor;
      border-radius: 50%;
      text-align: center;
      color: #fff;
    }
    &:after {
      content: attr(data-label);
    }
    @media (hover: hover) and (pointer: fine) {
      &:hover:not(.active) {
        background-color: $menu_hover;
      }
    }
    &:active:not(.active) {
      background-color: $menu_hover;
    }
    .fa {
      display: none;
    }
  }
}
.content {
  width: $main_width;
  margin: 0 auto;
  position: relative;
  /* z-index: 0; */
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
.preload {
  font-family: icomoon;
  height: 0;
  visibility: hidden;
  &:before {
    content: '\e901';
  }
}
.update {
  position: fixed;
  left: 20px;
  bottom: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;

  padding: 20px;
  padding-left: calc(20px + constant(safe-area-inset-left));
  padding-right: calc(20px + constant(safe-area-inset-right));
  /* iOS 11.0 */
  padding-left: calc(20px + env(safe-area-inset-left));
  padding-right: calc(20px + env(safe-area-inset-right));
  /* iOS 11.2 */

  border-radius: 4px;
  display: flex;
  align-items: center;
  a {
    cursor: pointer;
    margin: 0 20px;
  }
  i.fa {
    font-size: 30px;
    height: 16px;
    margin-top: -16px;
    cursor: pointer;
  }
}
@media only screen and (max-width: 990px) {
  header .header-container,
  .content {
    width: calc(100% - #{$stage_gap * 2});
    width: calc(
      100% - constant(safe-area-inset-left) - constant(safe-area-inset-right) -
        #{$stage_gap * 2}
    );
    /* iOS 11.0 */
    width: calc(
      100% - env(safe-area-inset-left) - env(safe-area-inset-right) - #{$stage_gap *
        2}
    );
    /* iOS 11.2 */

    margin-left: $stage_gap;
    margin-left: calc(#{$stage_gap} + constant(safe-area-inset-left));
    /* iOS 11.0 */
    margin-left: calc(#{$stage_gap} + env(safe-area-inset-left));
    /* iOS 11.2 */

    margin-right: $stage_gap;
    margin-right: calc(#{$stage_gap} + constant(safe-area-inset-right));
    /* iOS 11.0 */
    margin-right: calc(#{$stage_gap} + env(safe-area-inset-right));
    /* iOS 11.2 */
  }
}
@media only screen and (max-width: 760px), (max-height: 480px) {
  .main-container {
    padding-top: 0;
    padding-bottom: $footer_menu_height;
    padding-bottom: calc(
      #{$footer_menu_height} + constant(safe-area-inset-bottom)
    ); /* iOS 11.0 */
    padding-bottom: calc(
      #{$footer_menu_height} + env(safe-area-inset-bottom)
    ); /* iOS 11.2 */
  }
  header {
    height: $footer_menu_height;
    line-height: $footer_menu_height;
    bottom: 0;
    top: initial;
    padding-bottom: constant(safe-area-inset-bottom); /* iOS 11.0 */
    padding-bottom: env(safe-area-inset-bottom); /* iOS 11.2 */
    &::v-deep {
      .icon,
      .clock {
        display: none;
      }
    }
    .tab {
      display: flex;
      justify-content: space-around;
      align-items: flex-start;
      font-size: 25px;
      padding: 0;
      background: none;
      margin: 0;
      width: 100%;
      > li.home {
        order: 1;
      }
      .theme,
      .logout_link {
        display: none;
      }
      a {
        display: inline-block;
        text-align: center;
        padding: 0;
        color: $header_color;
        .fa {
          display: block;
          width: 40px;
          height: 30px;
          line-height: 30px;
          margin: 0 auto;
          transition: background-color 0.5s;
          &.carousel > svg {
            margin-top: -2px;
            width: 34px;
          }
          &.box > svg {
            width: 26px;
          }
        }
        &:after {
          content: attr(data-label);
          display: block;
          line-height: 15px;
          font-size: 15px;
        }
      }
      .active {
        background: none;
        margin-top: -15px;
        .fa {
          background-color: $active_bgcolor;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          line-height: 42px;
          margin-bottom: 3px;
          color: $current_user_color;
          opacity: 0.9;
          &.carousel > svg {
            margin-top: 0;
            height: 40px;
          }
          &.box > svg {
            margin-top: 5px;
          }
        }
      }
    }
    a {
      &[data-requests]:before {
        right: -8px;
        top: initial;
        bottom: 16px;
        background-color: $request_bgcolor;
      }
      @media (hover: hover) and (pointer: fine) {
        &:hover:not(.active) {
          background: none;
        }
      }
      &:active:not(.active) {
        background: none;
      }
    }
  }
  .content {
    margin: auto;

    width: 100%;
    width: calc(
      100% - constant(safe-area-inset-left) - constant(safe-area-inset-right)
    );
    /* iOS 11.0 */
    width: calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right));
    /* iOS 11.2 */

    padding-top: 50px;
  }
  .update {
    right: 0;

    bottom: 50px;
    bottom: calc(50px + constant(safe-area-inset-bottom));
    /* iOS 11.0 */
    bottom: calc(50px + env(safe-area-inset-bottom));
    /* iOS 11.2 */

    left: 0;
    border-radius: 0;
    i.fa {
      margin-left: auto;
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
      defaultIcon,
      totalRequest: 0,
      showAd: '',
      adMode: '',
      showUpdateAvailable: false,
    };
  },
  created() {
    this.initFromLS();
  },
  mounted() {
    // this.shouldShowAd(this.$route);
  },
  methods: {
    ...mapActions([
      'initFromLS',
      'listenTeamChange',
      'logout',
      'alert',
      'confirm',
      'checkUpdateAvailable',
    ]),
    alertYes() {
      this.alertPromiseResolve();
      this.alert('');
    },
    confirmYes() {
      this.confirmPromiseResolve();
      this.confirm(undefined);
    },
    confirmNo() {
      this.confirmPromiseReject();
      this.confirm(undefined);
    },
    shouldShowAd(currentRoute) {
      if (
        ['stats_pa', 'stats_pitcher', 'edit_team'].includes(currentRoute.name)
      ) {
        this.showAd = new Date().getTime();
        this.adMode = `${currentRoute.name}_f`;
      } else if (
        currentRoute.name === 'game' &&
        !this.teamInfo.unlockGames.includes(this.$route.params.game)
      ) {
        this.showAd = new Date().getTime();
        this.adMode = 'game_f';
      } else if (
        [
          'create_game_info',
          'edit_game_info',
          'edit_defense_info',
          'game_order',
          'game_position',
          'edit_game_position',
          'pa',
        ].includes(currentRoute.name)
      ) {
        this.showAd = '';
        this.adMode = '';
      } else {
        window.adCount = (window.adCount || 0) + 1;
        if (window.adCount % 3 === 0) {
          // console.log('adCount:', window.adCount);
          this.showAd = new Date().getTime();
          this.adMode = 'bottom_banner';
        } else {
          this.showAd = '';
          this.adMode = '';
        }
      }

      this.$nextTick(() => {
        if (document.querySelectorAll('vpon').length) {
          const vpon = document.getElementById('vpon-script');
          if (vpon) vpon.remove();
          const head = document.getElementsByTagName('head')[0];
          const script = document.createElement('script');
          script.id = 'vpon-script';
          script.src = `//m.vpon.com/sdk/vpadn-sdk.js?time=${new Date().getTime()}`;
          head.appendChild(script);
        }
      });
    },
    shouldShowUpdateAvailable() {
      if (this.updateAvailable && !this.showUpdateAvailable) {
        window.updateAvailable = (window.updateAvailable || 0) + 1;
        if (window.updateAvailable % 5 === 0) {
          this.showUpdateAvailable = true;
        }
      }
      if (!this.updateAvailable) {
        window.checkUpdateAvailable = (window.checkUpdateAvailable || 0) + 1;
        if (window.checkUpdateAvailable % 5 === 0) {
          this.checkUpdateAvailable();
        }
      }
    },
    hardReload(e) {
      window.location.reload();
      e.preventDefault();
    },
  },
  computed: {
    ...mapGetters([
      'loading',
      'currentTeam',
      'role',
      'teamInfo',
      'currentTeamIcon',
      'teamRequests',
      'teams',
      'alertMsg',
      'alertPromiseResolve',
      'confirmMsg',
      'confirmMsgY',
      'confirmMsgN',
      'confirmPromiseResolve',
      'confirmPromiseReject',
      'isAnonymous',
      'updateAvailable',
      'clock',
    ]),
  },
  watch: {
    $route(to, from) {
      if (to.params.team && to.params.team !== this.currentTeam) {
        console.log('route1');
        this.listenTeamChange(to.params.team);
      }
      if (from.params.team && from.params.team !== this.currentTeam) {
        console.log('route2');
        this.listenTeamChange(this.currentTeam);
      }
      // this.shouldShowAd(to);
      this.shouldShowUpdateAvailable();
    },
    currentTeam: {
      handler() {
        if (this.currentTeam) {
          this.listenTeamChange(this.currentTeam);
          this.totalRequest = (this.teams || [])
            .filter(team => team.teamCode !== this.currentTeam)
            .reduce((acc, team) => {
              return acc + ((team.requests || []).length || 0);
            }, 0);
        }
      },
      immediate: true,
    },
    teams: {
      handler() {
        this.totalRequest = (this.teams || [])
          .filter(team => team.teamCode !== this.currentTeam)
          .reduce((acc, team) => {
            return acc + ((team.requests || []).length || 0);
          }, 0);
      },
      immediate: true,
    },
    updateAvailable: {
      handler() {
        if (this.updateAvailable) {
          this.showUpdateAvailable = true;
        }
      },
      immediate: true,
    },
  },
};
</script>
