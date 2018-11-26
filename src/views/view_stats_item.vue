<template>
	<div>
		<div class="search-bar" ref="searchBar">
			<div class="search-bar__container">
				<img class="icon" :src="currentTeamIcon || defaultIcon"/>
				<i class="fa fa-search"></i>
			</div>
			<input type="checkbox" class="toggle-search non-input" v-model="toggleSearch"/>
			<div class="condition__container">
				<div class="condition">
					<div class="condition__label">{{ $t('col_period') }}</div>
					<div class="condition__element">
						<div class="selectdiv">
							<select class="dropdown" :value="periodSelect" @change="setPeriod_($event.target.value)">
								<option v-for="(item, i) in period" :value="item.period" :key="`period_${i}`">{{ `${item.period === 'period_all' ? $t(item.period) : item.period}` }}</option>
							</select>
						</div>
					</div>
					<template v-if="lastUpdate">
						<br>
						<div class="condition__label date">{{ $t('col_update') }}</div>
						<div class="condition__element date" :data-long="`${$t('col_update')} `" :data-short="`${$t('col_update_short')} `">{{ new Date(lastUpdate).toLocaleString() }}</div>
					</template>
				</div>
			</div>
		</div>
		<div class="item-container">
			<div class="item-container__table" v-for="key in ['AVG', 'H', 'HR', 'RBI']" :key="`block_${key}`">
				<div class="header"><span @click="goStats(key)">{{ $t(key) }}</span></div>
				<template v-for="(item, index) in itemStats[key].slice(0, 5)">
					<div v-if="index === 0" class="row" :key="`row_${index}`">
						<span class="rank">{{ index + 1 }}</span>
						<img v-if="item.data.photo" class="img" :src="item.data.photo" onLoad="this.className='img'" onError="this.className='img-hidden'"/>
						<span v-else class="img-hidden"></span>
						<span class="name">{{ item.name }}</span>
						<span class="dummy"></span>
						<span class="value">{{ item[key] }}</span>
					</div>
					<div v-else class="row" :key="`row_${index}`">
						<span class="rank">{{ index + 1 }}</span>
						<span class="name">{{ item.name }}</span>
						<span class="value">{{ item[key] }}</span>
					</div>
				</template>
				<div class="note">{{ $t(`${key}_note`, { g: periodGames.length,pa: parseInt(periodGames.length * 1.6, 10) }) }}</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../scss/variable";

.condition {
  background-color: #fff;
  border-radius: 10px;
  margin: 20px 0;
  padding: 20px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  > div,
  label {
    display: inline-block;
    line-height: 30px;
    height: 30px;
    vertical-align: middle;
  }
  label {
    cursor: pointer;
  }
  &__label {
    padding: 0 4px;
  }
}

.dropdown {
  height: 30px;
  width: 110px;
  border: 2px solid rgb(166, 166, 166);
  background-color: rgb(248, 248, 248);
  border-radius: 5px;
  vertical-align: top;
}
i.fa {
  font-size: 28px;
  vertical-align: middle;
  cursor: pointer;
}
.search-bar__container,
.toggle-search {
  display: none;
}

.item-container {
  display: flex;
  margin: 0 -10px;
  .item-container__table {
    flex: 1;
    margin: 0 10px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    .header {
      background: $header_bgcolor;
      color: $header_color;
      line-height: 36px;
      text-align: right;
      padding-right: 10px;
      span {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .row {
      color: $row_color;
      line-height: 36px;
      height: 36px;
      display: flex;
      &:nth-child(even) {
        background-color: $row_even_bgcolor;
      }
      &:nth-child(odd) {
        background-color: $row_odd_bgcolor;
      }
      .rank {
        width: 20px;
        text-align: left;
        padding-left: 10px;
      }
      .name,
      .dummy {
        flex: 1;
      }
      .value {
        width: 50px;
        text-align: right;
        padding-right: 10px;
      }
    }
    .img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      position: relative;
      top: -30px;
      left: -7px;
      ~ .name {
        display: none;
      }
    }
    .img-hidden {
      display: none;
      ~ .dummy {
        display: none;
      }
    }
    .note {
      border-top: 2px dotted $row_color;
      padding: 10px;
      background-color: $row_even_bgcolor;
      margin-top: auto;
      font-size: 10px;
    }
  }
}
@media only screen and (max-width: 760px) {
  .search-bar {
    background: $header_bgcolor center 2px no-repeat;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.13), 0 0 2px 0 rgba(0, 0, 0, 0.2);
    background-size: 55px auto;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    overflow: hidden;
    color: $header_color;
    text-align: center;
    &__container {
      display: block;
      height: 50px;
      line-height: 50px;
      text-align: right;
      padding-right: 14px;
      position: relative;
      .icon {
        max-height: 45px;
        position: absolute;
        top: 50%;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        transform: translateY(-50%);
      }
    }
    .toggle-search {
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
      height: 50px;
      width: 50px;
      margin: 0;
      opacity: 0;
      &:checked {
        & ~ .condition__container {
          max-height: 200vh;
          transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
          transition-delay: 0s;
          .fa {
            opacity: 1;
            transition-delay: 0.4s;
          }
        }
      }
    }
    .condition__container {
      display: block;
      max-height: 0;
      transition: max-height 0.5s cubic-bezier(0, 1, 0, 1) -0.1s;
    }
    .condition {
      background-color: transparent;
      border-radius: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      padding: 3px;
      box-sizing: border-box;
      position: relative;
      > br {
        display: none;
      }
      .fa {
        opacity: 0;
        transition: opacity 0.1s 0s;
        display: inline-block;
        color: $header_color;
      }
      &__label {
        text-align: right;
        margin: 0 3px 6px 0;
        &.date {
          display: none;
        }
      }
      &__element {
        text-align: left;
        margin: 0 3px 6px 0;
        &.date {
          width: 100vw;
          text-align: right;
          padding: 0 10px 10px 0;
          margin: 0;
          &:before {
            content: attr(data-long);
          }
        }
      }
    }
  }
  .item-container {
    margin: 10px 0;
    flex-wrap: wrap;
    justify-content: space-between;
    .item-container__table {
      margin: 10px 0;
      flex: 0 1 48%;
      flex: 0 1 calc(50vw - 10px);
      border-radius: 0;
    }
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .search-bar {
    .condition {
      &__label {
        width: 33vw;
      }
      &__element {
        &.date {
          &:before {
            content: attr(data-short);
          }
        }
      }
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  .search-bar {
    .condition {
      &__label {
        width: 20vw;
      }
      &__element {
        width: 30vw;
      }
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from "vuex";
import router from "../router";
import defaultIcon from "../images/icon.png";
const clickEvent = (() => {
  if ("ontouchstart" in document.documentElement === true) return "touchstart";
  else return "click";
})();

export default {
  data() {
    return {
      toggleSearch: false,
      defaultIcon
    };
  },
  created() {},
  mounted() {
    document.addEventListener(clickEvent, this.collapseSearch, true);
  },
  beforeDestroy() {
    document.removeEventListener(clickEvent, this.collapseSearch);
  },
  methods: {
    ...mapActions(["setPeriod", "setSortBy", "setUnlimitedPA"]),
    collapseSearch(event) {
      if (
        this.toggleSearch &&
        !this.$refs["searchBar"].contains(event.target)
      ) {
        this.toggleSearch = false;
        event.preventDefault();
      }
    },
    setPeriod_(period) {
      this.setPeriod(period);
      this.toggleSearch = false;
    },
    goStats(key) {
      this.setSortBy(key);
      this.setUnlimitedPA(true);
      router.push(`/main/stats_pa/${this.$route.params.team}`);
    }
  },
  computed: {
    ...mapGetters({
      period: "period",
      periodSelect: "periodSelect",
      periodGames: "periodGames",
      lastUpdate: "lastUpdate",
      itemStats: "itemStats",
      currentTeamIcon: "currentTeamIcon"
    })
  }
};
</script>
