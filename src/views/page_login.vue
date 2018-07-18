<template>
	<loading v-if="loading" :img="loading.img"></loading>
	<div v-else class="login-container">
		<button class="signin-btn google" @click="googleLogin">
			{{ $t('login_google_btn') }}
		</button>
		<button class="signin-btn fb" @click="fbLogin">
			{{ $t('login_fb_btn') }}
		</button>
		<button class="signin-btn line" @click="lineLogin">
			{{ $t('login_line_btn') }}
		</button>
		<button class="signin-btn github" @click="githubLogin">
			{{ $t('login_github_btn') }}
		</button>
	</div>
</template>

<style lang="scss" scoped>
	@import "../scss/variable";

	.login-container {
		text-align: center;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #CCC;
	}
	.signin-btn {
		direction: ltr;
		font-weight: 500;
		height: auto;
		line-height: normal;
		max-width: 220px;
		min-height: 40px;
		padding: 8px 16px 8px 50px;
		text-align: left;
		width: 100%;
		display: inline-block;
		font-family: Roboto,Helvetica,Arial,sans-serif;
		font-size: 14px;
		position: relative;
		cursor: pointer;
		margin-bottom: 15px;
		&:before {
			content: '';
			display: inline-block;
			width: 20px;
			height: 20px;
			background: transparent center center no-repeat;
			background-size: contain;
			vertical-align: middle;
			margin-right: 14px;
			position: absolute;
			top: 50%;
			left: 16px;
			transform: translateY(-50%);
		}
		&.google {
			background-color: #fff;
			color: #757575;
			&:before {
				background-image: url(../images/google.svg);
			}
		}
		&.fb {
			background-color: #3b5998;
			&:before {
				background-image: url(../images/facebook.svg);
			}
		}
		&.line {
			background-color: #00C300;
			&:before {
				background-image: url(../images/line.png);
				background-size: 28px;
			}
		}
		&.github {
			background-color: #333;
			&:before {
				background-image: url(../images/github.svg);
			}
		}
		&:focus {
			outline: none;
		}
		&:disabled {
			opacity: .3;
		}
		&:last-child {
			margin-bottom: 0;
		}
	}
</style>

<script>
	import { mapGetters, mapActions } from 'vuex';

	export default {
		created() {
			if (this.$route.params.custom) {
				this.lineLoginRedirect(this.$route.params.custom);
			} else {
				this.chkLoginStatus();
			}
		},
		methods: {
			...mapActions({
				googleLogin: 'googleLogin',
				fbLogin: 'fbLogin',
				githubLogin: 'githubLogin',
				lineLogin: 'lineLogin',
				lineLoginRedirect: 'lineLoginRedirect',
				chkLoginStatus: 'chkLoginStatus',
			})
		},
		computed: {
			...mapGetters({
				loading: 'loading'
			})
		}
	}
</script>