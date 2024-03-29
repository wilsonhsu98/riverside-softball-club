<template>
  <div class="main-container">
    <router-view class="content"></router-view>
    <header>
      <div class="header-container">
        <clock-or-icon
          :icon="$cacheImg(currentTeamIcon) || $cacheImg(defaultIcon)"
        />
        <ul class="tab">
          <li>
            <router-link
              :to="{ name: 'v_games', params: { team: currentTeam } }"
              exact
              active-class="active"
              :data-label="$t('menu_games')"
            >
              <i class="fa box"><box /></i>
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ name: 'v_stats_pa', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats')"
            >
              <i class="fa fa-list-ol"></i>
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ name: 'v_stats_pitcher', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats_pitcher')"
            >
              <i class="fa fa-list-ol"></i>
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ name: 'v_stats_item', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats_item')"
            >
              <i class="fa carousel"><carousel /></i>
            </router-link>
          </li>
          <li class="logout_link">
            <a @click="close" :data-label="$t('close_tab_btn')">
              <i class="fa fa-window-close-o"></i>
            </a>
          </li>
        </ul>
      </div>
    </header>
    <loading v-if="loading" :text="loading.text"></loading>
    <div class="preload" />
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
    flex: 1;
    vertical-align: middle;
    > li {
      display: inline-block;
      &.home {
        order: -1;
      }
    }
    .logout_link {
      margin-left: auto;
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
.preload {
  font-family: icomoon;
  height: 0;
  visibility: hidden;
  &:before {
    content: '\e901';
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
      .logout_link {
        margin-left: inherit;
      }
    }
    a {
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
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';

export default {
  data() {
    return {
      defaultIcon,
      currentTeam: this.$route.params.team,
    };
  },
  mounted() {
    this.listenTeamChange(this.currentTeam);
  },
  methods: {
    ...mapActions(['listenTeamChange']),
    close() {
      window.close();
    },
  },
  computed: {
    ...mapGetters(['loading', 'currentTeamIcon']),
  },
};
</script>
