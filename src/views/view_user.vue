<template>
	<div class="profile-container">
		<mobile-header :icon="teamInfo.icon ? teamInfo.icon : '../images/icon.png'"/>
		<div>{{ accountInfo.name }}</div>
		<div>{{ accountInfo.email }}</div>
		<img class="avatar" :src="accountInfo.photo" width="100"></img>
		<router-link :to="{ path: 'create_team' }" tag="button">
			{{ $t('create_team') }}
		</router-link>
		<router-link :to="{ path: 'user/avatar' }" tag="button">
			{{ $t('edit_avatar') }}
		</router-link>
		<button class="logout-btn" @click="logout">
			{{ $t('logout_btn') }}
		</button>
		<!-- <coordination :values="dots"/> -->
	</div>
</template>

<style lang="scss" scoped>
	@import "../scss/variable";

	.profile-container {
		text-align: left;
		background-color: #fff;
		border-radius: 10px;
		margin: 20px auto;
		padding: 20px 20px 20px 140px;
		box-sizing: border-box;
		position: relative;
		min-height: 140px;
		box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
		.avatar {
			position: absolute;
			top: 20px;
			left: 20px;
			border-radius: 50%;
		}
	}

	button {
		background-color: $header_bgcolor;
		padding: 10px 15px;
	}
	.logout-btn {
		&:focus {
			outline: none;
		}
		&:disabled {
			opacity: .3;
		}
	}

	@media only screen and (max-width: 760px) {
		.profile-container {
			margin: 50px 0 0;
			background-color: #fff;
			border-radius: 0;
			box-shadow: none;
			min-height: calc(100vh - 100px);
			// padding: 10px 0 0;
		}
	}
</style>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { db, auth, provider } from "../firebase";

	export default {
		data() {
			return {
				// dots: [{x: 50, y: 50, color: 'blue'}, {x: 30, y: 30}]
			};
		},
		created() {
		},
		methods: {
			...mapActions({
				logout: 'logout',
			}),
		},
		computed: {
			...mapGetters({
				accountInfo: 'accountInfo',
				teamInfo: 'teamInfo',
			})
		}
	}
</script>