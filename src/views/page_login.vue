<template>
  <loading v-if="loading" :img="loading.img"></loading>
  <div v-else class="login-container">
    <div></div>
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
    <div>
      <a
        class="link"
        href="https://drive.google.com/file/d/1fDA9vLOH772eTkzBO5aFfTuSJgh1zuo7/view?usp=sharing"
        target="_blank"
        >{{ $t('system_manual') }}</a
      >
      <a
        class="link"
        href="mailto:riversidesoftballclub.app@gmail.com"
        style="margin-left: 5px;"
        >{{ $t('system_mail') }}</a
      >
      <a
        class="link"
        style="margin-left: 5px;"
        href="https://docs.google.com/forms/d/e/1FAIpQLSf82txQ_Cqc9GheIU6EPCj3f3xtMc5qI6PF8OB-x6XzuvngFA/viewform"
        target="_blank"
        >{{ $t('system_feedback') }}</a
      >
      <div style="margin-top: 5px;">
        <a
          class="link"
          href="https://www.privacypolicies.com/live/a6db80b5-4d56-4e7e-946a-505db52f9dcd"
          target="_blank"
          >{{ $t('system_privacy_policy') }}</a
        >
        <a
          class="link"
          style="margin-left: 5px;"
          href="https://www.privacypolicies.com/live/f438ae5b-73b5-4b83-b7c0-0d004c7453a2"
          target="_blank"
          >{{ $t('system_term_of_use') }}</a
        >
      </div>
    </div>
    <div class="modal" v-if="alertMsg">
      <div class="dialog">
        <p class="msg" v-html="alertMsg"></p>
        <button @click="alert('')">{{ $t('btn_noticed') }}</button>
      </div>
    </div>
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
  > div {
    flex: 1;
  }
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
.modal {
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  .dialog {
    background-color: var(--card-bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    text-align: center;
    border-radius: 10px;
    box-shadow: 0 20px 60px -2px rgba(27, 33, 58, 0.4);
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
  }
  .msg {
    margin: 0 0 15px;
    text-align: left;
    width: 100%;
    &::v-deep {
      ul {
        margin: 0;
        padding-inline-start: 25px;
      }
    }
  }
  button {
    background-color: $header_bgcolor;
    padding: 10px;
    margin: 0;
    outline: none;
    flex: 1;
    &:nth-of-type(2) {
      margin-left: 10px;
    }
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
    ...mapActions([
      'anonymousLogin',
      'googleLogin',
      'fbLogin',
      'githubLogin',
      'lineLogin',
      'lineLoginRedirect',
      'alert',
    ]),
  },
  computed: {
    ...mapGetters(['loading', 'alertMsg']),
  },
};
</script>
