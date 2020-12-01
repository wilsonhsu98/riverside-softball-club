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
      v-if="['game_f', 'stats_pa_f', 'edit_team_f'].includes(mode)"
      vpon_ad_format="mi"
      :vpon_ad_test="config[configMode].adTest"
      :vpon_ad_licensy_key="config[configMode].keys[mode]"
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
      <vpon
        v-if="['stats_item300x250', 'user300x250'].includes(mode)"
        vpon_ad_format="300x250_mb"
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
        game_f: '8a80854b6a90b5bc016ad81f018e6539',
        stats_pa_f: '8a80854b6a90b5bc016ad81f018e6539',
        edit_team_f: '8a80854b6a90b5bc016ad81f018e6539',
        user: '8a80854b6a90b5bc016ad81ebabb6538',
        user300x250: '8a80854b6a90b5bc016ad81ebabb6538',
        stats_item: '8a80854b6a90b5bc016ad81ebabb6538',
        stats_item300x250: '8a80854b6a90b5bc016ad81ebabb6538',
        games: '8a80854b6a90b5bc016ad81ebabb6538',
        game: '8a80854b6a90b5bc016ad81ebabb6538',
      },
      frequencyBannerKey: '8a80854b6a90b5bc016ad81ebabb6538',
    };
    const prodKey = {
      keys: {
        game_f: '8a80854b757283cf017576f2367725a9',
        stats_pa_f: '8a80854b75ab2b0101761888e3a66334',
        edit_team_f: '8a80854b75ab2b0101761bd9d81f6ad1',
        user: '8a80854b757283cf0175832e7a115a9a',
        user300x250: '8a80854b75ab2b010176188a368b6337',
        stats_item: '8a80854b757283cf0175832d9e455a99',
        stats_item300x250: '8a80854b75ab2b0101761d9fe0087c12',
        games: '8a80854b757283cf0175832c30e55a98',
        game: '8a80854b757283cf0175832fe7685a9b',
      },
      frequencyBannerKey: '8a80854b757283cf017576f08a1c25a8',
    };

    return {
      show: true,
      callbackMethod: `vponCallBackMethod${new Date().getTime()}`,
      configMode: 'production', // test1, test2, production
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
          debug: true,
        },
      },
    };
  },
  mounted() {
    if (
      this.show &&
      [
        'bottom_banner',
        'game_f',
        'stats_pa_f',
        'edit_team_f',
        'games',
        'game',
        'stats_item',
        'stats_item300x250',
        'user',
        'user300x250',
      ].includes(this.mode)
    ) {
      const callbackMethod = this.callbackMethod;
      window[callbackMethod] = status => {
        if (status !== 0) {
          this.$refs.root.remove();
        } else {
          this.$refs.root.style.display = 'block';
        }
        window[callbackMethod] = undefined;
      };
    }
  },
};
</script>
