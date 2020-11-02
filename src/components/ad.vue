<template>
  <div v-if="show" ref="root" style="display: none;">
    <vpon
      v-if="mode === 'bottom_banner'"
      vpon_ad_format="320x50_mb"
      vpon_ad_adhesion="bottom"
      :vpon_ad_test="config[configMode].adTest"
      :vpon_ad_licensy_key="config[configMode].frequencyBannerKey"
      :debug="config[configMode].debug"
      :ad_request_callback="callbackMethod"
    >
    </vpon>
    <vpon
      v-if="mode === 'fullscreen'"
      vpon_ad_format="mi"
      :vpon_ad_test="config[configMode].adTest"
      :vpon_ad_licensy_key="config[configMode].gameFullscreenKey"
      :debug="config[configMode].debug"
      :ad_request_callback="callbackMethod"
    >
    </vpon>
    <div class="only-mobile">
      <vpon
        v-if="['games', 'game', 'stats_item', 'user'].includes(mode)"
        vpon_ad_format="320x50_mb"
        :vpon_ad_test="config[configMode].adTest"
        :vpon_ad_licensy_key="config[configMode].keys[mode]"
        :debug="config[configMode].debug"
        :ad_request_callback="callbackMethod"
      >
      </vpon>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@media only screen and (min-width: 761px) {
  .only-mobile {
    display: none;
  }
}
</style>

<script>
export default {
  props: ['mode'],
  data() {
    const testKey = {
      keys: {
        user: '8a80854b6a90b5bc016ad81ebabb6538',
        stats_item: '8a80854b6a90b5bc016ad81ebabb6538',
        games: '8a80854b6a90b5bc016ad81ebabb6538',
        game: '8a80854b6a90b5bc016ad81ebabb6538',
      },
      frequencyBannerKey: '8a80854b6a90b5bc016ad81ebabb6538',
      gameFullscreenKey: '8a80854b6a90b5bc016ad81f018e6539',
    };
    const prodKey = {
      keys: {
        user: '8a80854b757283cf0175832e7a115a9a',
        stats_item: '8a80854b757283cf0175832d9e455a99',
        games: '8a80854b757283cf0175832c30e55a98',
        game: '8a80854b757283cf0175832fe7685a9b',
      },
      frequencyBannerKey: '8a80854b757283cf017576f08a1c25a8',
      gameFullscreenKey: '8a80854b757283cf017576f2367725a9',
    };

    return {
      show: true,
      callbackMethod: `vponCallBackMethod${new Date().getTime()}`,
      configMode: 'test1', // test1, test2, production
      config: {
        test1: {
          adTest: 1,
          ...testKey,
          debug: true,
        },
        test2: {
          adTest: 0,
          ...testKey,
          debug: true,
        },
        production: {
          adTest: 0,
          ...prodKey,
          debug: false,
        },
      },
    };
  },
  mounted() {
    if (
      this.show &&
      [
        'bottom_banner',
        'fullscreen',
        'games',
        'game',
        'stats_item',
        'user',
      ].includes(this.mode)
    ) {
      console.log('~~~mounted', this.mode, this.callbackMethod)
      window[this.callbackMethod] = status => {
        if (status !== 0) {
          this.$refs.root.remove();
        } else {
          this.$refs.root.style.display = 'block';
        }
        // window[this.callbackMethod] = undefined;
      };
      console.log('~~~window.method', window[this.callbackMethod])
    }
  },
};
</script>
