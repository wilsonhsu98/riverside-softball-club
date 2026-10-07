<template>
  <div>
    <mobile-header @back="back_" />
    <div class="container">
      <h1>{{ $t('install_guide_title') }}</h1>
      <ol>
        <li v-for="(step, i) in guide.steps" :key="i">
          <p class="step-title">
            {{ $t(step[0]) }}
            <span
              v-if="step[2]"
              class="step-icon"
              v-html="ICONS[step[2]]"
            ></span>
          </p>
          <p v-if="step[1]" class="step-note">{{ $t(step[1]) }}</p>
        </li>
      </ol>
      <p v-if="guide.footnote" class="footnote">{{ $t(guide.footnote) }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

ol {
  margin: 10px 0 0;
  padding-left: 22px;
  li {
    margin-bottom: 18px;
    &::marker {
      font-weight: 500;
      color: var(--accent-teal);
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
.step-title {
  margin: 0;
  font-weight: 500;
  color: var(--basic-font-color);
}
.step-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 4px;
  border: 1px solid currentColor;
  border-radius: 4px;
  vertical-align: middle;
  opacity: 0.85;
  ::v-deep svg {
    width: 16px;
    height: 16px;
  }
}
.step-note {
  margin: 4px 0 0;
  color: var(--basic-font-color);
  opacity: 0.65;
  font-size: 13px;
  line-height: 1.5;
}
.footnote {
  margin: 20px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgba(128, 128, 128, 0.25);
  color: var(--basic-font-color);
  opacity: 0.65;
  font-size: 13px;
  line-height: 1.5;
}
</style>

<script>
const ICONS = {
  share:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11 V20 H19 V11"/><path d="M12 2 V14"/><path d="M8 6 L12 2 L16 6"/></svg>',
  plus:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4 V20"/><path d="M4 12 H20"/></svg>',
  menu:
    '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 V20 H20 V16"/><path d="M12 2 V14"/><path d="M8 10 L12 14 L16 10"/></svg>',
};

const GUIDES = {
  ios: {
    steps: [
      ['install_guide_ios_s1_title', 'install_guide_ios_s1_note'],
      ['install_guide_ios_s2_title', 'install_guide_ios_s2_note', 'share'],
      ['install_guide_ios_s3_title', 'install_guide_ios_s3_note', 'plus'],
      ['install_guide_ios_s4_title', null],
      ['install_guide_ios_s5_title', null],
    ],
    footnote: 'install_guide_ios_footnote',
  },
  android: {
    steps: [
      ['install_guide_android_s1_title', 'install_guide_android_s1_note'],
      ['install_guide_android_s2_title', null, 'menu'],
      [
        'install_guide_android_s3_title',
        'install_guide_android_s3_note',
        'download',
      ],
      ['install_guide_android_s4_title', 'install_guide_android_s4_note'],
      ['install_guide_android_s5_title', null],
    ],
    footnote: null,
  },
  mac: {
    steps: [
      ['install_guide_mac_s1_title', 'install_guide_mac_s1_note'],
      ['install_guide_mac_s2_title', 'install_guide_mac_s2_note', 'plus'],
      ['install_guide_mac_s3_title', null],
      ['install_guide_mac_s4_title', null],
    ],
    footnote: 'install_guide_mac_footnote',
  },
};

export default {
  data() {
    return {
      ICONS,
    };
  },
  computed: {
    platform() {
      return GUIDES[this.$route.query.platform]
        ? this.$route.query.platform
        : 'android';
    },
    guide() {
      return GUIDES[this.platform];
    },
  },
  methods: {
    back_() {
      this.$router.back();
    },
  },
};
</script>
