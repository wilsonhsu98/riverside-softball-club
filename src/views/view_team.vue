<template>
	<div>
		<mobile-header
			:back="back_"
			:icon="teamInfo.icon"
			:save="editTeam_"
		/>
		<div class="container">
			<h1>{{ $route.params.team ? $t('manage_team') : $t('create_team') }}</h1>

			<custom-input
				class="field-wrapper"
				limit="en-only"
				:name="$t('ttl_team_code')"
				:placeholder="$t('pla_en_only')"
				:error="teamCode_err"
				:disabled="$route.params.team ? true : false"
				v-model="teamCode"
			/>

			<custom-input
				class="field-wrapper"
				:name="$t('ttl_team_name')"
				:error="teamName_err"
				v-model="teamName"
			/>

			<custom-input
				class="field-wrapper"
				type="splitting-wording"
				:name="$t('ttl_other_names')"
				:placeholder="$t('pla_split_names')"
				v-model="otherNames"
			/>

			<custom-input
				class="field-wrapper"
				type="textarea"
				rows="3"
				:name="$t('ttl_team_intro')"
				v-model="teamIntro"
			/>

			<h2 class="player-header">{{ $t('ttl_player') }}<i class="fa fa-plus-circle" @click="players = [].concat({}, players)"></i></h2>
			<div class="player" v-for="(player, i) in players">

				<!-- a little bit different between insert / edit mode -->
				<template v-if="$route.params.team">
					<input
						type="text"
						class="txt-player"
						:placeholder="$t('name')"
						v-model="player.name"
					/>
					<input
						type="number"
						min="0"
						oninput="validity.valid||(value='');"
						class="txt-number"
						:placeholder="$t('number')"
						v-model.number="player.number"
					/>
					<label v-if="player && player.uid" :for="`chk${i}`">
						<input
							type="checkbox"
							:id="`chk${i}`"
							:disabled="atLeastOneManager(player.manager)"
							v-model="player.manager"
							@change="releaseSelfManager($event, player)"
						/>
						{{ $t('manager') }}
					</label>
					<img v-if="player && player.uid && player.photo" :src="player.photo" class="binded"/>
					<span v-if="player && player.uid">{{ $t('binded') }}</span>
					<i v-if="player.uid !== userId" class="fa fa-minus-circle" @click="players.splice(i, 1)"></i>
				</template>

				<!-- insert mode -->
				<template v-else>
					<input
						type="text"
						class="txt-player"
						:placeholder="$t('name')"
						v-model="player.name"
					/>
					<input
						type="number"
						min="0"
						oninput="validity.valid||(value='');"
						class="txt-number"
						:placeholder="$t('number')"
						v-model.number="player.number"
					/>
					<label :for="`rdo${i}`">
						<input
							type="radio"
							name="self"
							:id="`rdo${i}`"
							:checked="player.self"
							@change="rdoBindSelf(i)"
						/>
						{{ $t('bind_self') }}
					</label>
					<i class="fa fa-minus-circle" @click="players.splice(i, 1)"></i>
				</template>

			</div>

			<div v-if="players_err" class="error">{{ players_err }}</div>

			<button class="save-btn" @click="editTeam_">{{ $route.params.team ? $t('btn_update') : $t('btn_insert') }}</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	@import "../scss/variable";
	$max-width: 400px;

	.container {
		background-color: #fff;
		border-radius: 10px;
		margin: 20px 0;
		padding: 20px;
		box-sizing: border-box;
		position: relative;
		box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
		h1 {
			font-size: 18px;
			font-weight: normal;
			margin: 0;
			text-align: center;
			text-decoration: underline;
		}
		h2 {
			max-width: $max-width;
			width: 100%;
			margin: 0 auto;
			padding: 15px 0 2px 10px;
			font-size: 12px;
			font-weight: normal;
			text-align: left;
			color: #b5b5b5;
			box-sizing: border-box;
			&.player-header {
				position: relative;
				.fa { bottom: 0; }
			}
		}
		.field-wrapper {
			max-width: $max-width;
			width: 100%;
			margin: 0 auto;
		}
		.fa-minus-circle, .fa-plus-circle {
			position: absolute;
			right: 5px;
			font-size: 28px;
			cursor: pointer;
		}
		.binded {
			width: 28px;
			height: 28px;
			vertical-align: middle;
			margin: 0 3px 0 15px;
			border-radius: 50%;
		}
		.player {
			max-width: $max-width;
			width: 100%;
			margin: 0 auto 5px;
			position: relative;
			display: flex;
			align-items: center;
			.txt-player, .txt-number {
				border: 1px solid #ced4da;
				border-radius: 4px;
				box-sizing: border-box;
				font-size: 12px;
				line-height: 32px;
				display: inline-block;
				margin: 0;
				padding: 0 8px;
				margin-right: 4px;
				outline: none;
				&:focus, &:hover {
					border-color: #3b5998;
				}
			}
			.txt-player { width: 55px; }
			.txt-number { width: 48px; }
			label, span { font-size: 12px; }
		}
		.error {
			max-width: $max-width;
			width: 100%;
			margin: 0 auto;
			padding: 0 10px;
			font-size: 12px;
			box-sizing: border-box;
			color: $active_bgcolor;
		}
		.save-btn {
			background-color: $header_bgcolor;
			padding: 10px 15px;
			width: 100px;
			margin: 10px auto;
			display: block;
		}
	}

	@media only screen and (max-width: 760px) {
		.container {
			margin: 0;
			background-color: #fff;
			border-radius: 0;
			box-shadow: none;
			min-height: calc(100vh - 100px);
			.save-btn {
				display: none;
			}
		}
	}
</style>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { auth } from "../firebase";
	import router from '../router';

	export default {
		data() {
			return {
				teamCode: '',
				teamCode_err: '',
				teamName: '',
				teamName_err: '',
				teamIntro: '',
				otherNames: '',
				players: [{}],
				players_err: '',
			};
		},
		created() {
			if (this.$route.params.team) {
				this.fetchTeamInfo(this.$route.params.team);
			}
		},
		mounted() {
		},
		beforeDestroy() {
		},
		methods: {
			...mapActions({
				editTeam: 'editTeam',
				fetchTeamInfo: 'fetchTeamInfo',
			}),
			chkTeamCode() {
				if (/[\W]/g.test(this.teamCode)) {
					this.teamCode = this.teamCode.replace(/[\W]/g, '');
				}
			},
			validate() {
				let returnVal = true;

				this.players = this.players.map(item => {
					return {
						name: item.name || '',
						number: item.number,
						manager: item.manager || false,
						self: item.self || false,
						uid: item.uid || '',
						photo: item.photo || '',
					}
				}).filter((v, i, self) => {
					return self.map(item => item.name.trim()).indexOf(v.name.trim()) === i && v.name.trim() !== '';
				});

				this.teamCode_err = '';
				if (!this.teamCode) {
					this.teamCode_err = this.$t('required');
					returnVal = false;
				}

				this.teamName_err = '';
				if (!this.teamName) {
					this.teamName_err = this.$t('required');
					returnVal = false;
				}

				this.players_err = '';
				if (this.players.length === 0) {
					this.players = [{}];
					this.players_err = this.$t('msg_atleastone');
					returnVal = false;
				} else if (!this.players.find(item => item.self) && !this.$route.params.team) {
					this.players_err = this.$t('msg_bind_self');
					returnVal = false;
				} else if (!this.players.find(item => item.manager) && this.$route.params.team) {
					this.players_err = this.$t('msg_atleastone_manager');
					returnVal = false;
				}

				return returnVal;
			},
			back_() {
				router.back();
			},
			editTeam_() {
				if (this.validate()) {
					this.editTeam({
						code: this.teamCode,
						name: this.teamName,
						subNames: this.otherNames,
						intro: this.teamIntro,
						players: this.players,
						isNew: !this.$route.params.team,
					});
				}
			},
			rdoBindSelf(index) {
				this.players.forEach(item => {
					item.manager = false;
					item.self = false;
				});
				this.players[index].manager = true;
				this.players[index].self = true;

				this.players = [].concat(this.players);
			},
			atLeastOneManager(checked) {
				return checked && this.players.filter(item => item.manager).length === 1;
			},
			releaseSelfManager($event, player) {
				if ($event.target.checked === false && player.uid === this.userId) {
					alert(this.$t('msg_self_release'));
				}
			},
		},
		computed: {
			...mapGetters({
				userId: 'userId',
				teamInfo: 'teamInfo',
			}),
		},
		watch: {
			$route() {
				if (this.$route.params.team) {
					this.teamCode_err = '';
					this.teamName_err = '';
					this.players_err = '';
					this.fetchTeamInfo(this.$route.params.team);
				}
			},
			teamInfo() {
				this.teamCode = this.teamInfo.teamCode;
				this.teamName = this.teamInfo.teamName;
				this.teamIntro = this.teamInfo.teamIntro;
				this.otherNames = this.teamInfo.otherNames;
				this.players = JSON.parse(JSON.stringify(this.teamInfo.players));
				const find = this.players.find(player => player.uid === this.userId)
				if (find) {
					find.self = true;
				}
			}
		}
	}
</script>