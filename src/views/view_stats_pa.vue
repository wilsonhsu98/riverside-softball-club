<template>
	<div>
		<div class="search-bar" ref="searchBar">
			<div class="search-bar__container">
				<img class="icon" :src="teamInfo.icon || defaultIcon"/>
				<i class="fa fa-search"></i>
			</div>
			<input type="checkbox" class="toggle-search non-input" v-model="toggleSearch"/>
			<div class="condition__container">
				<div class="condition">
					<div class="condition__label">{{ $t('col_period') }}</div>
					<div class="condition__element">
						<div class="selectdiv">
							<select class="dropdown" :value="periodSelect" @change="setPeriod_($event.target.value)">
								<option v-for="item in period" :value="item.period">{{ `${item.period === 'period_all' ? $t(item.period) : item.period}` }}</option>
							</select>
						</div>
					</div>
					<div class="condition__label">{{ $t('col_sort') }}</div>
					<div class="condition__element">
						<div class="selectdiv">
							<select class="dropdown" :value="sortBy" @change="setSortBy_($event.target.value)">
								<option v-for="col in conditionCols" :value="col.name">{{ $t(col.name) }}</option>
							</select>
						</div>
					</div>
					<div class="condition__label">{{ $t('col_latest') }}</div>
					<div class="condition__element pa">
						<minus-plus-number :value="top" :disabled="unlimitedPA" @change="setTop_"/>
						<label for="unlimited_pa"><!--
							 --><input id="unlimited_pa" type="checkbox" :checked="unlimitedPA" @change="setUnlimitedPA_($event.target.checked)"/><!--
							  -->{{ $t('col_unlimited') }}<!--
						 --></label>
					</div>
					<br>
					<div class="condition__label col">{{ $t('col_display') }}</div>
					<div class="condition__element col">
						<label class="condition__col" for="check_all"><!--
							 --><input id="check_all" type="checkbox" :checked="checkAll" @change="setCheckAll_($event.target.checked)"/><!--
							 -->{{ $t('All') }}<!--
						 --></label><!--
						 --><label class="condition__col" :for="col.name" v-for="col in conditionCols"><!--
							 --><input :id="col.name" type="checkbox" :value="col.name" :checked="col.visible" :disabled="col.disabled" @change="toggleColumn_(col.name)"/><!--
							 -->{{ $t(col.name) }}<!--
						 --></label>
					</div>
					<template v-if="lastUpdate">
						<div class="condition__label date">{{ $t('col_update') }}</div>
						<div class="condition__element date" :data-long="`${$t('col_update')} `" :data-short="`${$t('col_update_short')} `">{{ new Date(lastUpdate).toLocaleString() }}</div>
					</template>
					<i class="fa fa-refresh" @click="refreshPlayer_"></i>
				</div>
			</div>
		</div>
		<div id="table">
			<div class="header-row">
				<span class="cell delete"><i class="fa fa-refresh" @click="refreshPlayer_"></i></span>
				<template v-for="col in displayedCols">
					<span v-if="col.name === 'Rank'" class="cell Rank" :title="$t(col.name)"><div>{{ $t(col.name) }}</div></span>
					<span v-else-if="col.name === 'name'" class="cell name" :title="$t(col.name)"><div>{{ $t(col.name) }}</div></span>
					<span v-else :class="`cell ${col.name}${col.name === sortBy ? ' sort' : ''}`" :title="$t(col.name)" @click="setSortBy_(col.name)"><div>{{ $t(col.name) }}</div></span>
				</template>
			</div>
			<template v-for="(item, index) in list">
				<input type="radio" name="expand" class="toggle-row non-input" :checked="toggleTarget ===  item.name" @click="toggleRadio(item.name)"/>
				<div :class="`row-grid${item.name === userName ? ' current' : ''}`">
					<span class="cell delete"><i class="fa fa-trash" @click="deletePlayer_(item.name)"></i></span>
					<template v-for="col in displayedCols">
						<span v-if="col.name === 'Rank'" class="cell Rank" data-label="Rank">{{ index + 1 }}</span>
						<span v-else-if="col.name === 'name'" class="cell name" data-label="name">
							<span>
								<span class="img" style="border-width: 1px">
									<i class="fa fa-user-o"></i>
								</span>
								<span v-if="item.data.photo" class="img" :style="`background-image: url(${item.data.photo})`">
								</span>
								{{ item.name }}
							</span>
						</span>
						<span v-else :class="`cell${col.name === sortBy ? ' sort' : ''}`" :data-label="$t(col.name)">
							{{ formatValue(item[col.name], col.name) }}
						</span>
					</template>
					<div v-if="item.listByGame.length" class="cell chart" :style="{ top: `${(index + 2) * 36}px` }" :id="`row_${item.name}`">
						<div class="chart-inner">
							<div class="bar" v-for="cube in item.listByGame">
								<template v-for="(cell, i) in cube">
									<span v-if="i === cube.length - 1" class="game">{{ cell }}</span>
									<span v-else :class="`item ${cell.color} ${cell.exclude ? 'exclude' : ''}`">{{ $t(cell.content) }}</span>
								</template>
							</div>
						</div>
					</div>
				</div>
			</template>
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
		> div, label {
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
			text-align: left;
			&.col {
				vertical-align: top;
			}
		}
		&__element {
			&.col {
				width: calc(100% - 90px);
				height: auto;
			}
		}
		&__col {
			margin-right: 10px;
			vertical-align: middle;
			text-align: left;
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
	#table {
		display: table;
		width: 100%;
		background: #FFF;
		margin: 0;
		box-sizing: border-box;
		color: $row_color;
		position: relative;
		z-index: 0;
		.header-row {
			display: table-row;
			background: $header_bgcolor;
			color: $header_color;
			.cell {
				&:not(.Rank):not(.name) {
					cursor: pointer;
				}
				> div {
					height: 36px;
					overflow : hidden;
				}
				&.Rank, &.delete { width: 45px; }
				&.name {
					width: 100px;
					padding-left: 0;
					text-align: center;
				}
			}
		}
		.toggle-row {
			display: block;
			position: absolute;
			left: 50px;
			z-index: 1;
			height: 36px;
			width: calc(100% - 50px);
			margin: 0;
			opacity: 0;
			cursor: pointer;
			&:checked {
				&+.row-grid .cell.chart {
					display: flex;
				}
			}
		}
		.row-grid {
			display: table-row;
			&:nth-child(4n+3) { background-color: $row_even_bgcolor; }
			&:nth-child(4n+1) { background-color: $row_odd_bgcolor; }
			&.current {
				background-color: $current_user_bgcolor;
				color: $current_user_color;
				.cell .img {
					border-color: $current_user_color;
				}
				.cell.chart .game {
					color: $row_color;
				}
			}
		}
		.cell {
			display: table-cell;
			line-height: 36px;
			text-align: center;
			&:nth-child(2n+4) {
				opacity: 0.6;
			}
			&.chart {
				background-color: #fff;
				position: absolute;
				left: 190px;
				right: 0;
				z-index: 2;
				overflow-x: auto;
				overflow-y: hidden;
				direction: rtl;

				display: none;

				font-size: 12px;
				margin-bottom: 20px;
				padding-top: 5px;
				border-top: 0;
				box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
				.chart-inner {
					display: flex;
					align-items: flex-end;
					width: 100%;
				}
				.bar {
					flex-grow: 1;
					min-width: 50px
				}
				.item {
					display: block;
					height: 20px;
					line-height: 20px;
					width: 36px;
					margin: auto;
					color: #fff;
					margin-bottom: 1px;
					&.red { background-color: #ef1010; }
					&.yellow { background-color: #efaf34; }
					&.blue { background-color: #4d9de5; }
					&.exclude { opacity: 0.5; }
				}
				.game {
					display: block;
					line-height: 20px;
					width: 36px;
					margin: auto;
				}
			}
			&.name {
				text-align: center;
				&:first-letter { text-transform:uppercase; }
				> span {
					position: relative;
					padding-left: 36px;
					text-align: left;
					line-height: 36px;
					display: inline-block;
					width: 100px;
					box-sizing: border-box;
					.img {
						display: inline-block;
						width: 32px;
						height: 32px;
						border: 0 solid $row_color;
						box-sizing: border-box;
						border-radius: 50%;
						background: 50% 50% no-repeat;
						background-size: 32px auto;
						position: absolute;
						top: 2px;
						left: 0;
						text-align: center;
						line-height: 26px;
						.fa-user-o {
							font-size: 20px;
						}
					}
				}
			}
			&.sort {
				opacity: 1;
				color: $active_bgcolor;
			}
		}
	}
	.search-bar__container,
	.condition .fa-refresh,
	.toggle-search {
		display: none;
	}
	@media only screen and (max-width: 760px) {
		.search-bar {
			background: $header_bgcolor center 2px no-repeat;
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
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					margin: auto;
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
					&~.condition__container {
						max-height: 200vh;
						transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
						transition-delay: 0s;
						.fa {
							opacity: 1;
							transition-delay: .4s;
						}
					}
				}
			}
			.condition__container {
				display: block;
				max-height: 0;
				transition: max-height .5s cubic-bezier(0, 1, 0, 1) -.1s;
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
				&__col {
					margin: 0 8px 3px 0;
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
				.fa {
					opacity: 0;
					transition: opacity .1s 0s;
					display: inline-block;
					color: $header_color;
				}
				.fa-refresh {
					position: absolute;
					bottom: 10px;
					left: 12px;
				}
			}
		}
		#table {
			display: block;
			border: none;
			overflow: hidden;
			position: relative;
			z-index: 0;

			.row-grid {
				position: relative;
				display: flex;
				flex-wrap: wrap;

				z-index: 0;
				background-color: #FFF;
				transition: max-height 1s cubic-bezier(0, 1, 0, 1) -.1s;
				max-height: 36px;
				&:nth-child(4n+1) { background-color: $row_odd_bgcolor; }
				&:nth-child(4n+3) { background-color: $row_even_bgcolor; }
				&.current {
					background-color: $current_user_bgcolor;
					color: $current_user_color;
					.cell .img {
						border-color: $current_user_color;
					}
					.cell.chart .game {
						color: $current_user_color;
					}
				}
				.cell:nth-child(2n+4) {
					opacity: 1;
				}
			}
			.header-row {
				display: none;
			}
			.cell {
				order: 6;
				display: block;
				box-sizing: border-box;
				&:not(.sort):not(.Rank):not(.name):not(.delete):not(.chart) {
					text-align: left;
				}
				&:not(.Rank):not(.name):not(.delete):not(.chart) {
					&:before {
						content: attr(data-label) ":";
						display: inline-block;
						width: 58px;
						text-align: right;
						margin-right: -2px;
					}
				}
				&.Rank { order: 1; }
				&.name { order: 2; }
				&.sort {
					order: 3;
					text-align: center;
					color: inherit;
				}
				&.delete { order: 4; }
				&.chart {
					order: 5;
					position: initial;
					margin: 0;
					border: none;
					box-shadow: none;
					background-color: transparent;
					display: flex;
				}
			}
			.toggle-row {
				left: 0;
				cursor: initial;
				&:checked {
					&+.row-grid {
						max-height: 10000px;
						transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
						transition-delay: 0s;
					}
				}
			}
		}
	}
	@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
		#table {
			.row-grid {
				.cell {
					width: 33%;
					&.Rank   { width: 17%; }
					&.name   { width: 33%; }
					&.sort   { width: 33%; }
					&.delete { width: 17%; }
					&.chart  { width: 100%; }
				}
			}
			.toggle-row {
				width: calc(100% / 6 * 5);
			}
		}
		.search-bar {
			.condition {
				&__label {
					width: 31vw;
					&.date {
						display: none;
					}
				}
				&__element {
					width: 62vw;
					&.col {
						height: auto;
						width: 62vw;
						display: flex;
						flex-wrap: wrap;
						margin-bottom: 4px;
					}
					&.date {
						&:before {
							content: attr(data-short);
						}
					}
				}
				&__col {
					width: 29%;
				}
			}
		}
		[lang=zh-TW] {
			.search-bar .condition__element.col {
				font-size: 14px;
			}
		}
	}
	@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
		#table {
			.row-grid {
				.cell {
					width: 20%;
					&.Rank   { width: 10%; }
					&.name   { width: 20%; }
					&.sort   { width: 60%; }
					&.delete { width: 10%; }
					&.chart  { width: 100%; }
				}
			}
			.toggle-row {
				width: calc(100% / 10 * 9);
			}
		}
		.search-bar {
			.condition {
				&__label {
					width: 18vw;
					&.date {
						visibility: hidden;
					}
				}
				&__element {
					width: 29vw;
					&.pa {
						width: 78vw;
					}
					&.col {
						height: auto;
						width: 78vw;
						display: flex;
						flex-wrap: wrap;
						margin: 0 0 0 2px;
					}
				}
				&__col {
					width: 12%;
				}
			}
		}
		[lang=zh-TW] {
			.search-bar .condition__element.col {
				font-size: 12px;
			}
		}
	}
</style>

<script>
	import Vue from 'vue';
	import { mapGetters, mapActions } from 'vuex';
	import defaultIcon from '../images/icon.png';
	const clickEvent = (() => {
		if ('ontouchstart' in document.documentElement === true)
			return 'touchstart';
		else
			return 'click';
	})();

	export default {
		data() {
			return {
				toggleSearch: false,
				toggleTarget: null,
				defaultIcon,
			};
		},
		created () {
		},
		mounted() {
			document.addEventListener(clickEvent, this.collapseSearch, true);
		},
		beforeDestroy() {
			document.removeEventListener(clickEvent, this.collapseSearch);
		},
		methods: {
			...mapActions([
				'setPeriod',
				'setTop',
				'setUnlimitedPA',
				'setSortBy',
				'setCheckAll',
				'toggleColumn',
				'deletePlayer',
				'refreshPlayer',
			]),
			formatValue(value, col) {
				return ['AVG', 'OBP', 'SLG', 'OPS'].indexOf(col) > -1 && value !== '-' ? value.toFixed(3) : value;
			},
			toggleRadio(target) {
				if (this.toggleTarget === target) {
					this.toggleTarget = null;
				} else {
					this.toggleTarget = target;
				}
			},
			collapseSearch(event) {
				if (this.toggleSearch && !this.$refs["searchBar"].contains(event.target)) {
					this.toggleSearch = false;
					event.preventDefault();
					if (event.target.classList.contains('fa-trash')) {
						event.stopPropagation();
					}
				}
			},
			setPeriod_(period) {
				this.toggleTarget = null;
				this.setPeriod(period);
			},
			setTop_(top) {
				this.toggleTarget = null;
				this.setTop(top);
			},
			setUnlimitedPA_(isChecked) {
				this.toggleTarget = null;
				this.setUnlimitedPA(isChecked);
			},
			setSortBy_(sortItem) {
				this.toggleTarget = null;
				this.setSortBy(sortItem);
			},
			setCheckAll_(isCheckAll) {
				this.toggleTarget = null;
				this.setCheckAll(isCheckAll);
			},
			toggleColumn_(column) {
				this.toggleTarget = null;
				this.toggleColumn(column);
			},
			deletePlayer_(player) {
				this.toggleTarget = null;
				this.deletePlayer(player);
			},
			refreshPlayer_() {
				this.toggleTarget = null;
				this.refreshPlayer();
			},
		},
		computed: {
			...mapGetters({
				period: 'period',
				periodSelect: 'periodSelect',
				top: 'top',
				unlimitedPA: 'unlimitedPA',
				sortBy: 'sortBy',
				checkAll: 'checkAll',
				conditionCols: 'conditionCols',
				list: 'genStatistics',
				displayedCols: 'displayedCols',
				lastUpdate: 'lastUpdate',
				userName: 'userName',
				teamInfo: 'teamInfo',
			}),
		}
	}
</script>