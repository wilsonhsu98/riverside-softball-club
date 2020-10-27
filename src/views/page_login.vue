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
    <button class="signin-btn anonymous" @click="anonymousLogin">
      <i class="fa fa-user-secret"></i>
      {{ $t('login_anonymous_btn') }}
    </button>
    <a href="mailto:riversidesoftballclub.app@gmail.com">{{
      $t('system_mail')
    }}</a>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.login-container {
  text-align: center;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  /* height: -webkit-fill-available; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ccc;
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
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  position: relative;
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
    background-color: #00c300;
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
  &.anonymous {
    background-color: $header_bgcolor;
    &:before {
      content: none;
    }
    .fa {
      display: inline-block;
      position: absolute;
      left: 16px;
      width: 20px;
      height: 20px;
      text-align: center;
      font-size: 21px;
    }
  }
  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.3;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {};
  },
  created() {
    if (this.$route.params.custom) {
      this.lineLoginRedirect(this.$route.params.custom);
    }
  },
  methods: {
    ...mapActions({
      anonymousLogin: 'anonymousLogin',
      googleLogin: 'googleLogin',
      fbLogin: 'fbLogin',
      githubLogin: 'githubLogin',
      lineLogin: 'lineLogin',
      lineLoginRedirect: 'lineLoginRedirect',
    }),
  },
  computed: {
    ...mapGetters({
      loading: 'loading',
    }),
  },
};
</script>
