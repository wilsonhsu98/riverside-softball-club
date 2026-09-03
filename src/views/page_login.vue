<template>
  <loading v-if="loading" />
  <div v-else class="login-container">
    <div class="brand">
      <div class="brand-glow"></div>
      <img class="brand-logo" src="../images/icon_100.png" alt="" />
      <div class="brand-text">
        <div class="brand-name">河岸壘球俱樂部</div>
        <div class="brand-subtitle">Riverside Softball Club</div>
      </div>
    </div>
    <div class="login-card">
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
      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-label">或</span>
        <span class="divider-line"></span>
      </div>
      <button class="signin-btn anonymous" @click="anonymousLogin">
        <i class="fa fa-user-secret"></i>
        {{ $t('login_anonymous_btn') }}
      </button>
    </div>
    <div class="footer-links">
      <div>
        <a
          class="link"
          href="https://drive.google.com/file/d/1fDA9vLOH772eTkzBO5aFfTuSJgh1zuo7/view?usp=sharing"
          target="_blank"
          >{{ $t('system_manual') }}</a
        >
        <span class="dot">·</span>
        <a class="link" href="mailto:riversidesoftballclub.app@gmail.com">{{
          $t('system_mail')
        }}</a>
        <span class="dot">·</span>
        <a
          class="link"
          href="https://docs.google.com/forms/d/e/1FAIpQLSf82txQ_Cqc9GheIU6EPCj3f3xtMc5qI6PF8OB-x6XzuvngFA/viewform"
          target="_blank"
          >{{ $t('system_feedback') }}</a
        >
      </div>
      <div>
        <a
          class="link"
          href="https://riversidesoftballclub.netlify.app/privacy_policy.html"
          target="_blank"
          >{{ $t('system_privacy_policy') }}</a
        >
        <span class="dot">·</span>
        <a
          class="link"
          href="https://riversidesoftballclub.netlify.app/terms_and_conditions.html"
          target="_blank"
          >{{ $t('system_term_of_use') }}</a
        >
      </div>
    </div>
    <theme-switcher class="theme-toggle" />
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
  background-color: var(--site-bg);
  background-image: radial-gradient(
    120% 55% at 50% 0%,
    rgba(64, 130, 136, 0.15),
    transparent 62%
  );
  padding: 24px;
  box-sizing: border-box;
}

.brand {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;

  &-glow {
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    width: 128px;
    height: 128px;
    border-radius: 50%;
    background: rgba(64, 130, 136, 0.24);
    filter: blur(3px);
  }
  &-logo {
    position: relative;
    width: 60px;
    height: 60px;
    display: block;
  }
  &-text {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  &-name {
    font-size: 21px;
    font-weight: 700;
    color: var(--basic-font-color);
  }
  &-subtitle {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--accent-teal);
    text-transform: uppercase;
  }
}

.login-card {
  width: 268px;
  max-width: 100%;
  box-sizing: border-box;
  background-color: var(--card-bg);
  border-radius: 10px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 220px;

  &-line {
    flex: 1;
    height: 1px;
    background-color: rgba(128, 128, 128, 0.35);
  }
  &-label {
    font-size: 11px;
    color: var(--basic-font-color);
    opacity: 0.55;
  }
}

.footer-links {
  margin-top: 24px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .dot {
    margin: 0 5px;
    opacity: 0.5;
  }
}

.login-container .theme-toggle {
  position: fixed;
  top: auto;
  left: auto;
  right: 15px;
  bottom: 15px;
  transform: scale(0.6);
  transform-origin: right bottom;
  &::v-deep {
    label[for^='theme_dark'],
    [type='radio']:checked[value='dark'] ~ .dot {
      background-color: #3a3b3d;
    }
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
      // 'fbLogin',
      'githubLogin',
      'lineLogin',
      'lineLoginRedirect',
      'alert',
    ]),
    fbLogin() {
      this.alert(this.$t('msg_fb_disallow'));
    },
  },
  computed: {
    ...mapGetters(['loading', 'alertMsg']),
  },
};
</script>
