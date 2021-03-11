<template>
  <div
    v-if="show"
    ref="root"
    class="root"
    style="display: none;"
    :style="{ height: height ? `${height}px` : '' }"
  >
    <div
      :style="{
        transform: scale ? `scale(${scale})` : '',
        transformOrigin: scale ? 'top center' : '',
      }"
    >
      <template v-if="local">
        <div
          v-if="mode === 'bottom_banner'"
          class="only-mobile fake-iframe"
          vpon_ad_format="320x50_mb"
          vpon_ad_adhesion="bottom"
          style="position: fixed; right: 0; bottom: 0; left: 0; height: 50px; z-index: 9999;"
          @click="show = false"
        ></div>
        <div
          v-if="
            ['game_f', 'stats_pa_f', 'stats_pitcher_f', 'edit_team_f'].includes(
              mode,
            )
          "
          class="only-mobile fake-iframe"
          vpon_ad_format="mi"
          style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9999;"
          @click="show = false"
        ></div>
        <div class="only-mobile">
          <div
            v-if="['games', 'game', 'stats_item', 'user'].includes(mode)"
            class="fake-iframe"
            vpon_ad_format="320x50_mb"
            style="width: 320px; height: 50px;"
          ></div>
          <div
            v-if="['stats_item300x250', 'user300x250'].includes(mode)"
            class="fake-iframe"
            vpon_ad_format="300x250_mb"
            style="width: 300px; height: 250px;"
          ></div>
        </div>
      </template>
      <template v-else>
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
          v-if="
            ['game_f', 'stats_pa_f', 'stats_pitcher_f', 'edit_team_f'].includes(
              mode,
            )
          "
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
            is_rotate="false"
            :vpon_ad_test="config[configMode].adTest"
            :vpon_ad_licensy_key="config[configMode].keys[mode]"
            :debug="config[configMode].debug"
            :ad_request_callback="callbackMethod"
          >
          </vpon>
          <vpon
            v-if="['stats_item300x250', 'user300x250'].includes(mode)"
            vpon_ad_format="300x250_mb"
            is_rotate="false"
            :vpon_ad_test="config[configMode].adTest"
            :vpon_ad_licensy_key="config[configMode].keys[mode]"
            :debug="config[configMode].debug"
            :ad_request_callback="callbackMethod"
          >
          </vpon>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.root {
  overflow: hidden;
}
.fake-iframe {
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 0.5);
  position: relative;
  &:before {
    content: attr(vpon_ad_format) '' attr(vpon_ad_adhesion);
    color: #fff;
    font-size: 20px;
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
[vpon_ad_format='mi']::v-deep > div {
  z-index: 2;
}
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
        stats_pitcher_f: '8a80854b6a90b5bc016ad81f018e6539',
        edit_team_f: '8a80854b6a90b5bc016ad81f018e6539',
        user: '8a80854b6a90b5bc016ad81ebabb6538',
        user300x250: '8a80854b6a90b5bc016ad81ebabb6538',
        stats_item: '8a80854b6a90b5bc016ad81ebabb6538',
        stats_item300x250: '8a80854b6a90b5bc016ad81ebabb6538',
        games: '8a80854b6a90b5bc016ad81ebabb6538',
        game: '8a80854b6a90b5bc016ad81ebabb6538',
      },
      frequencyBannerKey: '8a80854b6a90b5bc016ad81ebabb6538',
      debug: true,
    };
    const prodKey = {
      keys: {
        game_f: '8a80854b77f116cb01781c63487622db',
        stats_pa_f: '8a80854b77f116cb01781c639ce622dc',
        stats_pitcher_f: '8a80854b77f116cb01781c64c68e22de',
        edit_team_f: '8a80854b77f116cb01781c651d1c22df',
        user: '8a80854b77f116cb01781c4e8b8a22d2',
        user300x250: '8a80854b77f116cb01781c4f942a22d3',
        stats_item: '8a80854b77f116cb01781c5cd82022d7',
        stats_item300x250: '8a80854b77f116cb01781c60c31c22d8',
        games: '8a80854b77f116cb01781c61dc7222d9',
        game: '8a80854b77f116cb01781c624ed122da',
      },
      frequencyBannerKey: '8a80854b77f116cb0178201b14cc2642',
      debug: true,
    };

    return {
      local: false,
      show: true,
      callbackMethod: `vponCallBackMethod${new Date().getTime()}`,
      configMode: 'production', // test1, test2, production
      config: {
        test1: {
          adTest: 1,
          ...testKey,
        },
        test2: {
          adTest: 0,
          ...testKey,
        },
        production: {
          adTest: 0,
          ...prodKey,
        },
      },
      scale: undefined,
      height: undefined,
    };
  },
  mounted() {
    if (
      this.show &&
      [
        'bottom_banner',
        'game_f',
        'stats_pa_f',
        'stats_pitcher_f',
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
      };
      if (this.local) {
        this.$refs.root.style.display = 'block';
      }

      // if (document.body.clientWidth <= 414) {
      //   if (['games', 'game', 'stats_item', 'user'].includes(this.mode)) {
      //     this.scale = document.body.clientWidth / 320;
      //     this.height = 50 * this.scale;
      //   }
      //   if (['stats_item300x250', 'user300x250'].includes(this.mode)) {
      //     this.scale = document.body.clientWidth / 300;
      //     this.height = 250 * this.scale;
      //   }
      // }
    }
  },
  beforeDestroy() {
    window[this.callbackMethod] = undefined;
  },
};
</script>
