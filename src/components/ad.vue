<template>
  <div v-if="show">
    <vpon
      v-if="mode === 'banner'"
      vpon_ad_test="0"
      :vpon_ad_licensy_key="bannerKey"
      vpon_ad_format="320x50_mb"
      vpon_ad_adhesion="bottom"
      debug="true"
    >
    </vpon>
    <vpon
      v-if="mode === 'fullscreen'"
      vpon_ad_test="0"
      :vpon_ad_licensy_key="fullscreenKey"
      vpon_ad_format="mi"
      debug="true"
    >
    </vpon>
  </div>
</template>

<style lang="scss" scoped></style>

<script>
export default {
  props: ['mode'],
  data() {
    return {
      show: true,

      /* test */
      // bannerKey: '8a80854b6a90b5bc016ad81ebabb6538',
      // fullscreenKey: '8a80854b6a90b5bc016ad81f018e6539',

      /* my */
      bannerKey: '8a80854b757283cf017576f08a1c25a8',
      fullscreenKey: '8a80854b757283cf017576f2367725a9',
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
