<template>
	<div class="main-container">
		<header>
			<div class="header-container">
				<img class="icon" :src="currentTeamIcon || defaultIcon"/>
				<ul class="tab">
					<li v-if="currentTeam">
						<router-link :to="{ name: 'games', params: { team: currentTeam } }" active-class="active" :data-label="$t('menu_games')">
							<i class="fa fa-table"></i>
						</router-link>
					</li>
					<li v-if="currentTeam">
						<router-link :to="{ name: 'stats_pa', params: { team: currentTeam } }" active-class="active" :data-label="$t('menu_stats')">
							<i class="fa fa-list-ol"></i>
						</router-link>
					</li>
					<li v-if="currentTeam">
						<router-link :to="{ name: 'stats_item', params: { team: currentTeam } }" active-class="active" :data-label="$t('menu_stats_item')">
							<i class="fa fa-th-large"></i>
						</router-link>
					</li>
					<li v-if="currentTeam && role === 'manager'">
						<router-link :to="{ name: 'edit_team', params: { team: currentTeam } }" active-class="active" :data-label="$t('menu_manage')">
							<i class="fa fa-cog"></i>
						</router-link>
					</li>
					<li>
						<router-link :to="{ name: 'user' }" active-class="active" :data-label="$t('menu_profile')">
							<i class="fa fa-user"></i>
						</router-link>
					</li>
				</ul>
			</div>
		</header>
		<router-view class="content"></router-view>
		<loading v-if="loading" :text="loading.text"></loading>
	</div>
</template>

<style lang="scss" scoped>
@import "../scss/variable";

$header_menu_height: 70px;
$footer_menu_height: 50px;

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
    width: 980px;
    margin: 0 auto;
  }
  .icon {
    max-height: 60px;
    vertical-align: middle;
  }
  .tab {
    display: inline-block;
    box-sizing: border-box;
    list-style-type: none;
    padding: 0;
    margin: 0 0 0 5px;
    background-size: contain;
    height: 100%;
    line-height: 70px;
    > li {
      display: inline-block;
    }
  }
  a {
    color: $header_color;
    text-decoration: none;
    padding: 8px 15px;
    margin: 0 2px;
    border-radius: 98px;
    &.active {
      background-color: $menu_active;
      color: $row_color;
    }
    &:after {
      content: attr(data-label);
    }
    &:hover:not(.active) {
      background-color: $menu_hover;
    }
    .fa {
      display: none;
    }
  }
}
.content {
  width: 980px;
  margin: 0 auto;
  position: relative;
  z-index: 0;
}
@media only screen and (max-width: 990px) {
  header .header-container,
  .content {
    width: calc(100% - 40px);
    margin-left: 20px;
    margin-right: 20px;
  }
}
@media only screen and (max-width: 760px) {
  .main-container {
    padding-top: 0;
    padding-bottom: $footer_menu_height;
  }
  header {
    height: $footer_menu_height;
    line-height: $footer_menu_height;
    bottom: 0;
    top: initial;
    .icon {
      display: none;
    }
    .tab {
      display: flex;
      justify-content: space-around;
      align-items: start;
      font-size: 25px;
      padding: 0;
      background: none;
      margin: 0;
      width: 100%;
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
          -moz-transition: background-color 0.5s;
          -webkit-transition: background-color 0.5s;
          transition: background-color 0.5s;
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
          line-height: 44px;
          margin-bottom: 3px;
          color: $current_user_color;
          opacity: 0.9;
        }
      }
    }
    a:hover:not(.active) {
      background: none;
    }
  }
  .content {
    width: 100%;
    margin: 0;
    padding-top: 50px;
  }
}
</style>

<script>
import { mapGetters, mapActions } from "vuex";
import defaultIcon from "../images/icon.png";

export default {
  data() {
    return {
      isFetchGame: false,
      defaultIcon
    };
  },
  created() {
    this.initFromLS();
    this.fetchGame();
    this.fetchUser();
    this.fetchTeamIcon(this.currentTeam);
  },
  methods: {
    ...mapActions({
      initFromLS: "initFromLS",
      fetchTable: "fetchTable",
      fetchUser: "fetchUser",
      fetchTeamIcon: "fetchTeamIcon"
    }),
    fetchGame() {
      if (!this.isFetchGame && this.$route.params.team) {
        this.fetchTable(this.$route.params.team);
        this.isFetchGame = true;
      }
    }
  },
  computed: {
    ...mapGetters({
      loading: "loading",
      currentTeam: "currentTeam",
      role: "role",
      currentTeamIcon: "currentTeamIcon"
    })
  },
  watch: {
    $route() {
      this.fetchGame();
      window.scrollTo(0, 0);
    }
  }
};
</script>
