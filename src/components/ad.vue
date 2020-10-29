<template>
  <div>
    <vpon
      vpon_ad_test="0"
      vpon_ad_licensy_key="8a80854b6a90b5bc016ad81f018e6539"
      vpon_ad_format="mi"
      debug="true"
    >
    </vpon>
  </div>
</template>

<style lang="scss" scoped></style>

<script>
export default {
  props: ['back', 'icon', 'save', 'save_label', 'disabled', 'focus'],
  data() {
    return {};
  },
  mounted() {
    const vpon = document.getElementById('vpon-script');
    if (vpon) vpon.remove();
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.id = 'vpon-script';
    script.src = `//m.vpon.com/sdk/vpadn-sdk.js?time=${new Date().getTime()}`;
    head.appendChild(script);
  },
};
</script>
