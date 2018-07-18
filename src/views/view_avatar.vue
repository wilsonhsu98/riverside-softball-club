<template>
	<div class="profile-container">
		<mobile-header
			:back="back_"
			:icon="teamInfo.icon ? teamInfo.icon : '/assets/images/icon.png'"
			:save="edit_"
		/>
		<h1>{{ $t('edit_avatar') }}</h1>
		<div class="avatar-container">
			<template v-for="provider in ['google', 'facebook', 'line', 'github', 'custom']">
				<span
					v-if="provider !== 'custom' && accountInfo[`${provider}_photo`]"
					:class="provider"
					@click="setCurrent(provider)"
				>
					<template v-if="current">
						<i v-if="provider === current" class="fa fa-check"/>
					</template>
					<template v-else>
						<i v-if="accountInfo[`${provider}_photo`] === accountInfo.photo" class="fa fa-check"/>
					</template>
					<img :src="accountInfo[`${provider}_photo`]"/>
				</span>
				<span
					v-if="provider === 'custom' && (img || accountInfo[`${provider}_photo`])"
					:class="provider"
					@click="setCurrent(provider)"
				>
					<template v-if="current">
						<i v-if="provider === current" class="fa fa-check"/>
					</template>
					<template v-else>
						<i v-if="accountInfo[`${provider}_photo`] === accountInfo.photo" class="fa fa-check"/>
					</template>
					<img :src="img || accountInfo.custom_photo"/>
				</span>
			</template>
		</div>
		<vue-avatar-editor
			class="avatar-editor"
			@finished="genImage"
			:hasRadius="true"
			:hasRotation="false"
			:width="400"
			:height="400"
			:zoomText="$t('zoom')"
			:finishText="$t('gen_img')"
		/>
		<button class="save-btn" @click="edit_">{{ $t('btn_update') }}</button>
	</div>
</template>

<style lang="scss" scoped>
	@import "../scss/variable";
	$max-width: 400px;

	.profile-container {
		text-align: left;
		background-color: #fff;
		border-radius: 10px;
		margin: 20px auto;
		padding: 20px;
		box-sizing: border-box;
		position: relative;
		min-height: 140px;
		box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
		h1 {
			font-size: 18px;
			font-weight: normal;
			margin: 0;
			text-align: center;
			text-decoration: underline;
		}
		.save-btn {
			background-color: $header_bgcolor;
			padding: 10px 15px;
			width: 100px;
			margin: 10px auto;
			display: block;
		}
	}
	.avatar-container {
		max-width: $max-width;
		width: 100%;
		margin: 15px auto;
		text-align: center;
		span {
			display: inline-block;
			position: relative;
			cursor: pointer;
			&:not(.custom):before {
				content: '';
				display: inline-block;
				width: 20px;
				height: 20px;
				background: transparent center center no-repeat;
				background-size: 70%;
				border-radius: 4px;
				position: absolute;
				top: 0;
				left: 0;
				box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
			}
			&.google {
				&:before {
					background-color: #fff;
					background-image: url(../images/google.svg);
				}
			}
			&.facebook {
				&:before {
					background-color: #3b5998;
					background-image: url(../images/facebook_blue.svg);
				}
			}
			&.line {
				&:before {
					background-color: #00C300;
					background-image: url(../images/line.png);
					background-size: 100%;
				}
			}
			&.github {
				&:before {
					background-color: #333;
					background-image: url(../images/github.svg);
				}
			}
			i.fa {
				position: absolute;
				right: 0;
				bottom: 0;
				color: white;
				background-color: $current_user_bgcolor;
				border-radius: 4px;
				padding: 2px;
			}
		}
		img {
			width: 80px;
			border-radius: 50%;
			vertical-align: top;
		}
	}
	.avatar-editor {
		max-width: 300px;
		width: 100%;
		text-align: center;
		margin: 0 auto;
		> :last-child { // buttons area
			display: flex;
			justify-content: space-between;
			align-items: center;
			> :first-child { // progress
				width: 200px;
				margin-right: 10px;
			}
			> :last-child { // button
				flex: 1;
				background-color: $header_bgcolor;
				padding: 10px 15px;
			}
		}
	}

	@media only screen and (max-width: 760px) {
		.profile-container {
			margin: 50px 0 0;
			background-color: #fff;
			border-radius: 0;
			box-shadow: none;
			min-height: calc(100vh - 100px);
			padding: 10px;
			.save-btn {
				display: none;
			}
		}
		.avatar-container {
			img {
				width: 64px;
			}
		}
	}
</style>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import router from '../router';

	export default {
		data() {
			return {
				img: undefined,
				current: undefined,
			};
		},
		created() {
		},
		methods: {
			...mapActions({
				editAvatar: 'editAvatar',
			}),
			setCurrent(provider) {
				this.current = provider;
			},
			genImage(img) {
				this.img = img.toDataURL();
			},
			back_() {
				router.back();
			},
			edit_() {
				this.editAvatar({
					userId: this.userId,
					current: this.current,
					custom: this.img || this.accountInfo.custom_photo || '',
					accountInfo: this.accountInfo,
				});
			},
		},
		computed: {
			...mapGetters({
				accountInfo: 'accountInfo',
				teamInfo: 'teamInfo',
				userId: 'userId',
			})
		}
	}
</script>