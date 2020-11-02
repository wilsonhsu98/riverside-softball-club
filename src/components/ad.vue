<template>
  <div v-if="show">
    <vpon
      v-if="mode === 'bottom_banner'"
      vpon_ad_test="0"
      :vpon_ad_licensy_key="frequencyBannerKey"
      vpon_ad_format="320x50_mb"
      vpon_ad_adhesion="bottom"
      debug="true"
    >
    </vpon>
    <div class="only-mobile">
      <vpon
        v-if="['games', 'game', 'stats_item', 'user'].includes(mode)"
        vpon_ad_test="0"
        :vpon_ad_licensy_key="keys[mode]"
        vpon_ad_format="320x50_mb"
        debug="true"
      >
      </vpon>
    </div>
    <vpon
      v-if="mode === 'fullscreen'"
      vpon_ad_test="0"
      :vpon_ad_licensy_key="gameFullscreenKey"
      vpon_ad_format="mi"
      debug="true"
    >
    </vpon>
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
    return {
      show: true,

      /* test */
      keys: {
        user: '8a80854b6a90b5bc016ad81ebabb6538',
        stats_item: '8a80854b6a90b5bc016ad81ebabb6538',
        games: '8a80854b6a90b5bc016ad81ebabb6538',
        game: '8a80854b6a90b5bc016ad81ebabb6538',
      },
      frequencyBannerKey: '8a80854b6a90b5bc016ad81ebabb6538',
      gameFullscreenKey: '8a80854b6a90b5bc016ad81f018e6539',

      /* my */
      // keys: {
      //   user: '8a80854b757283cf0175832e7a115a9a',
      //   stats_item: '8a80854b757283cf0175832d9e455a99',
      //   games: '8a80854b757283cf0175832c30e55a98',
      //   game: '8a80854b757283cf0175832fe7685a9b',
      // },
      // frequencyBannerKey: '8a80854b757283cf017576f08a1c25a8',
      // gameFullscreenKey: '8a80854b757283cf017576f2367725a9',
    };
  },
  mounted() {
    if (this.show) {
      const vpon = document.getElementById('vpon-script');
      if (vpon) vpon.remove();
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.id = 'vpon-script';
      script.src = `//m.vpon.com/sdk/vpadn-sdk.js?time=${new Date().getTime()}`;
      head.appendChild(script);
    }
  },
};
</script>
