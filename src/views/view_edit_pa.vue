<template>
	<div class="gamelist-container">
		<mobile-header
			:back="back_"
			:icon="currentTeamIcon"
			:save="edit_"
		/>
		<!-- {{ pa }}
		<div>{{ pa.name }}</div>
		<div>{{ pa.inn }}</div>
		<div>{{ pa.content }}</div> -->
		<div class="left">
			<div class="desc">
				<div><minus-plus-number :value="inn"/> {{ $t('desc_inn') }}</div>
				<div>{{ $t('desc_order', { n: order }) }}</div>
				<div>{{ $t('desc_out', { n: 3 }) }}</div>
				<div>{{ $t('desc_batting', { n: order % box[box.length - 1].order || box[box.length - 1].order }) }}</div>
			</div>
			<infield class="infield">
				<div class="player-container">
					<div :class="`on-base-player ${b}`" v-for="b in ['first', 'second', 'third', 'home']">
						<span
							:class="`run${base[b].run ? ' select' : ''}${base[b].disabled ? ' disabled' : ''}`"
							@click="base[b].disabled || toggle(`base.${b}.run`)"
						>
							{{ $t('R') }}
						</span>
						<span
							class="name"
						>
							{{ base[b].name }}
						</span>
						<span
							:class="`out${base[b].out ? ' select' : ''}${base[b].disabled ? ' disabled' : ''}`"
							@click="base[b].disabled || toggle(`base.${b}.out`)"
						>
							{{ $t('Out') }}
						</span>
					</div>
				</div>
			</infield>
			<div class="content">
				<div>
					<span
						v-for="item in ['1H', '2H', '3H', 'HR']"
						:class="`red${content === item ? ' select' : ''}`"
						@click="toggle('content', item)"
					>
						{{ $t(item) }}
					</span>
					<span
						:class="`rbi${rbi.value === 1 ? ' select' : ''}${rbi.one.disabled ? ' disabled' : ''}`"
						@click="rbi.one.disabled || toggle('rbi.value', 1)"
					>
						{{ $t('RBI_count', { rbi: 1 }) }}
					</span>
				</div>
				<div>
					<span
						v-for="item in ['K', 'FO', 'GO', 'E']"
						:class="`blue${content === item ? ' select' : ''}`"
						@click="toggle('content', item)"
					>
						{{ $t(item) }}
					</span>
					<span
						:class="`rbi${rbi.value === 2 ? ' select' : ''}${rbi.two.disabled ? ' disabled' : ''}`"
						@click="rbi.two.disabled || toggle('rbi.value', 2)"
					>
						{{ $t('RBI_count', { rbi: 2 }) }}
					</span>
				</div>
				<div>
					<span
						v-for="item in ['FC', 'DP', 'TP']"
						:class="`blue${content === item ? ' select' : ''}`"
						@click="toggle('content', item)"
					>
						{{ $t(item) }}
					</span>
					<span></span>
					<span
						:class="`rbi${rbi.value === 3 ? ' select' : ''}${rbi.three.disabled ? ' disabled' : ''}`"
						@click="rbi.three.disabled || toggle('rbi.value', 3)"
					>
						{{ $t('RBI_count', { rbi: 3 }) }}
					</span>
				</div>
				<div>
					<span
						v-for="item in ['BB', 'SF']"
						:class="`yellow${content === item ? ' select' : ''}`"
						@click="toggle('content', item)"
					>
						{{ $t(item) }}
					</span>
					<span></span><span></span>
					<span
						:class="`rbi${rbi.value === 4 ? ' select' : ''}${rbi.four.disabled ? ' disabled' : ''}`"
						@click="rbi.four.disabled || toggle('rbi.value', 4)"
					>
						{{ $t('RBI_count', { rbi: 4 }) }}
					</span>
				</div>
			</div>
		</div>
		<div class="right">
			<div class="coordination">
				<coordination :values="location" :disabled="['BB', 'K'].includes(content)"/>
			</div>
		</div>
		<div class="button-container">
			<button class="save-btn" @click="back_">{{ $t('btn_cancel') }}</button>
			<button class="save-btn" @click="edit_">{{ $t('btn_update') }}</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	@import "../scss/variable";

	.gamelist-container {
		background-color: #fff;
		border-radius: 10px;
		margin: 20px auto;
		padding: 20px;
		box-sizing: border-box;
		box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
		text-align: center;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		.desc {
			width: 300px;
			text-align: left;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;
			> div {
				display: inline-block;
				line-height: 30px;
				height: 30px;
				vertical-align: middle;
				&:nth-child(odd) {
					text-align: right;
					width: 130px;
				}
				&:nth-child(even) {
					width: 120px;
				}
			}
		}
		.infield {
			vertical-align: middle;
			display: block;
			margin-bottom: 20px;
			.player-container {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				.on-base-player {
					position: absolute;
					display: flex;
					width: 142px;
					justify-content: center;
					> span {
						text-align: center;
						white-space: nowrap;
						overflow: hidden;
						line-height: 28px;
						height: 34px;
						border: 3px solid transparent;
						box-sizing: border-box;
						cursor: pointer;
						&.run {
							width: 41px;
							color: #3f00ff;
							border-color: #3f00ff;
							border-right: 0;
							border-radius: 5px 0 0 5px;
							background-color: rgba(248,248,248,.5);
						}
						&.name {
							width: 60px;
							color: #777;
							border-color: #777;
							background-color: rgba(248,248,248,.5);
						}
						&.out {
							width: 41px;
							color: #ff5722;
							border-color: #ff5722;
							border-left: 0;
							border-radius: 0 5px 5px 0;
							background-color: rgba(248,248,248,.5);
						}
						&.select {
							color: #fff;
							&.run {
								background-color: #3f00ff;
							}
							&.name {
								// background-color: #3f00ff;
							}
							&.out {
								background-color: #ff5722;
							}
						}
						&.disabled {
							opacity: 0.2;
							cursor: not-allowed;
						}
					}
					&.first {
						top: 68px;
						right: 5px;
					}
					&.second {
						top: 14px;
						left: 50%;
						transform: translateX(-50%);
					}
					&.third {
						top: 68px;
						left: 5px;
					}
					&.home {
						bottom: 22px;
						left: 50%;
						transform: translateX(-50%);
					}
				}
			}
		}
		.content {
			margin: 20px 0;
			display: block;
			vertical-align: middle;
			width: 300px;
			div {
				display: flex;
				justify-content: center;
				margin-bottom: 3px;
			}
			span {
				// color: #fff;
				text-align: center;
				white-space: nowrap;
				overflow: hidden;
				line-height: 28px;
				width: 60px;
				border: 3px solid transparent;
				border-radius: 5px;
				box-sizing: border-box;
				cursor: pointer;
				&:not(:first-child) {
					margin-left: 3px;
				}
				&.red {
					color: #ef1010;
					border: 3px solid #ef1010;
					&.select {
						color: #fff;
						background-color: #ef1010;
					}
				}
				&.yellow {
					color: #efaf34;
					border: 3px solid #efaf34;
					&.select {
						color: #fff;
						background-color: #efaf34;
					}
				}
				&.blue {
					color: #4d9de5;
					border: 3px solid #4d9de5;
					&.select {
						color: #fff;
						background-color: #4d9de5;
					}
				}
				&.rbi {
					color: $row_color;
					border: 3px solid $row_color;
					&.select {
						color: #fff;
						background-color: $row_color;
					}
				}
				&.disabled {
					opacity: 0.2;
					cursor: not-allowed;
				}
			}
		}
		.coordination {
			margin: 0;
			text-align: center;
		}
		.button-container {
			padding: 10px 0;
			text-align: center;
			width: 100%;
			position: sticky;
			bottom: 0;
			background-color: rgba(255,255,255,0.8);
		}
		.save-btn {
			background-color: $header_bgcolor;
			padding: 10px 15px;
			width: 100px;
		}
	}
	.left {
		margin-right: 20px;
	}
	@media only screen and (max-width: 760px) {
		.gamelist-container {
			border-radius: 0;
			margin: 50px 0 0;
			padding: 10px 0;
			background-color: transparent;
			box-shadow: none;
			.content {
				span {
					font-size: 10px;
				}
			}
			.infield {
				.player-container {
					.on-base-player {
						> span {
							font-size: 10px;
						}
					}
				}
			}
			.button-container {
				display: none;
			}
		}
		.left {
			margin-right: 0;
		}
	}
</style>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import router from '../router';

	export default {
		data() {
			return {
				inn: '',
				order: '',
				base: {
					home: {
						name: '',
						run: false,
						out: false,
						disabled: true,
					},
					first: {
						name: '',
						run: false,
						out: false,
						disabled: true,
					},
					second: {
						name: '',
						run: false,
						out: false,
						disabled: true,
					},
					third: {
						name: '',
						run: false,
						out: false,
						disabled: true,
					},
				},
				content: '',
				rbi: {
					value: '',
					one: { disabled: true },
					two: { disabled: true },
					three: { disabled: true },
					four: { disabled: true },
				},
				location: [],
			};
		},
		created() {
			this.setGame(this.$route.params.game);
			this.setOrder(this.$route.params.order);
			this.setPa();
		},
		methods: {
			...mapActions({
				setGame: 'setGame',
				setOrder: 'setOrder',
			}),
			toggle(path, value) {
				const setPath = (path, value) => path
								.split('.')
								.reduce((o,p) => o[p] = path.split('.').pop() === p ? value : o[p] || {}, this);
				const tempValue = path
								.split('.')
								.reduce((o, p) => o ? o[p] : defaultValue, this);

				if (typeof tempValue === 'boolean') {
					setPath(path, !tempValue);
				} else {
					if (tempValue === value) {
						setPath(path, '');
					} else {
						setPath(path, value);
					}
				}
			},
			back_() {
				// router.back();
				router.push(`/main/games/${this.$route.params.team}/${this.$route.params.game}`);
			},
			edit_() {
				// this.editAvatar({
				// 	userId: this.userId,
				// 	current: this.current,
				// 	custom: this.img || this.accountInfo.custom_photo || '',
				// 	accountInfo: this.accountInfo,
				// });
			},
			setPa() {
				if (this.pa) {
					this.inn = this.pa.inn || 1;
					this.order = this.pa.order;
					this.base.home.name = this.pa.name;
					this.content = this.pa.content === 'new' ? '' : this.pa.content;
					this.rbi.value = this.pa.rbi;
					if (typeof this.pa.location === 'object') this.location = [].concat(this.pa.location);
				} else {
					const last = this.boxSummary.contents[this.boxSummary.contents.length - 1];
					const estimate = this.boxSummary.contents[this.boxSummary.contents.length - this.box.filter(item => item.altOrder === undefined).length];
					this.inn = last.inn || 1;
					if (last.order) {
						this.order = last.order + 1;
					} else if (parseInt(this.$route.params.order) !== NaN) {
						this.order = this.$route.params.order
					} else {
						this.order = this.boxSummary.contents.length + 1;
					}
					if (estimate.name) {
						this.base.home.name = estimate.name;
					}
				}
			}
		},
		watch: {
			$route() {
				this.setGame(this.$route.params.game);
				this.setOrder(this.$route.params.order);
				this.setPa();
			},
			box() {
				this.setPa();
			},
			content() {
				if (this.content) {
					this.base.home.disabled = false;
					this.base.first.disabled = false;
					this.base.second.disabled = false;
					this.base.third.disabled = false;
				} else {
					this.base.home.disabled = true;
					this.base.first.disabled = true;
					this.base.second.disabled = true;
					this.base.third.disabled = true;
				}
			},
		},
		computed: {
			...mapGetters({
				box: 'box',
				boxSummary: 'boxSummary',
				currentTeamIcon: 'currentTeamIcon',
				pa: 'pa',
			})
		}
	}
</script>