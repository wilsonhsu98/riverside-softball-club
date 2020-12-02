<template>
  <modal
    name="video"
    :adaptive="true"
    @opened="opened"
    @closed="closed"
    class="modal-wrapper"
  >
    <div v-if="videos.length > 1" class="selectdiv">
      <select class="dropdown" v-model="video_">
        <option v-for="(v, i) in videos" :value="v" :key="v">{{
          $t('opt_video', { n: i + 1 })
        }}</option>
      </select>
    </div>
    <div
      id="player"
      :style="{
        height: videos.length > 1 ? 'calc(100% - 180px)' : 'calc(100% - 130px)',
      }"
    ></div>
    <vue-range-slider
      ref="slider"
      class="slider"
      v-model="value"
      :max="max"
      :tooltip-merge="tooltipMerge"
      :enable-cross="enableCross"
      :formatter="formatter"
      :process-style="{ backgroundColor: '#00b5a3' }"
      :tooltip-style="{ backgroundColor: '#00b5a3', borderColor: '#00b5a3' }"
      @slide-end="slideEnd"
    ></vue-range-slider>
    <div class="control-container">
      <div>
        {{ $t('ttl_start') }}
        <input
          type="number"
          pattern="\d*"
          min="0"
          :max="end_ - 1"
          class="txt-number"
          @input="checkNumber"
          @change="seekTo('start')"
          v-model.number.lazy="start_"
        />
        <div class="format-time">
          <span>{{ formatter(start_) }}</span>
        </div>
      </div>
      <div>
        {{ $t('ttl_range') }}
        <input
          type="number"
          pattern="\d*"
          :min="1"
          :max="max - start_"
          class="txt-number"
          @input="checkNumber"
          @change="seekTo('end')"
          v-model.number.lazy="range"
        />
        <div class="format-time">
          <span>{{ formatter(range) }}</span>
        </div>
      </div>
      <div>
        {{ $t('ttl_end') }}
        <input
          type="number"
          pattern="\d*"
          :min="start_ + 1"
          :max="max"
          class="txt-number"
          @input="checkNumber"
          @change="seekTo('end')"
          v-model.number.lazy="end_"
        />
        <div class="format-time">
          <span>{{ formatter(end_) }}</span>
        </div>
      </div>
    </div>
    <div class="control-container">
      <button class="btn" @click="clear">{{ $t('btn_clear_save') }}</button>
      <button class="btn" @click="save">{{ $t('btn_update') }}</button>
    </div>
  </modal>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.modal-wrapper {
  background-color: rgba(0, 0, 0, 0.5);
  ::v-deep .v--modal-box {
    border-radius: 10px;
    position: fixed;
    top: 20px !important;
    bottom: 20px !important;
    height: auto !important;
    left: 20px !important;
    right: 20px !important;
    width: auto !important;
  }
  .slider {
    margin: 0 20px;
  }
  .selectdiv {
    margin: 10px;
    height: 30px;
    display: block;
    .dropdown {
      max-width: initial;
      width: 100%;
    }
  }
  .control-container {
    text-align: center;
    margin-bottom: 8px;
    font-size: 12px;
    display: flex;
    justify-content: center;
    .format-time {
      text-align: right;
      > span {
        display: inline-block;
        width: 48px;
        text-align: center;
        margin-top: 3px;
        margin-right: 4px;
      }
    }
  }
  .btn {
    background-color: $header_bgcolor;
    padding: 10px 15px;
    width: 100px;
    outline: none;
  }
  .txt-number {
    border: 2px solid $input_border;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: $input_font_size - 4;
    line-height: 14px;
    height: 32px;
    display: inline-block;
    margin: 0;
    padding: 0 8px;
    margin-right: 4px;
    outline: none;
    width: 48px;
  }
}

@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 80px !important;
    bottom: 80px !important;
    height: auto !important;
    left: 20px !important;
    right: 20px !important;
    width: auto !important;
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 20px !important;
    bottom: 20px !important;
    height: auto !important;
    left: 60px !important;
    right: 60px !important;
    width: auto !important;
  }
}
</style>

<script>
export default {
  props: ['videos', 'video', 'start', 'end', 'order'],
  emits: ['close', 'clear', 'save'],
  data() {
    return {
      player: undefined,
      max: 100,
      value: [0, 100],
      tooltipMerge: true,
      enableCross: false,

      video_: this.video || this.videos[0],
      start_: 0,
      end_: 100,
      range: 100,
      isOpen: false,
    };
  },
  mounted() {
    window.addEventListener('resize', this.requestAnimationFrame);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.requestAnimationFrame);
  },
  methods: {
    opened() {
      this.isOpen = true;
      this.video_ = this.video || this.videos[0];
      if (
        !isNaN(parseInt(this.start)) &&
        !isNaN(parseInt(this.end)) &&
        this.end > 0
      ) {
        this.start_ = this.start;
        this.end_ = this.end;
      }
      if (window.YT) {
        this.initPlayer();
      } else {
        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.src = `https://www.youtube.com/iframe_api`;
        head.appendChild(script);

        window.onYouTubeIframeAPIReady = () => {
          this.initPlayer();
          window.onYouTubeIframeAPIReady = undefined;
        };
      }
    },
    initPlayer() {
      this.player = new window.YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: this.video_,
        playerVars: {
          rel: 0,
          autoplay: 1, // 自動播放影片
          controls: 0, // 顯示播放器
          showinfo: 0, // 隱藏影片標題
          modestbranding: 0, // 隱藏YouTube Logo
          fs: 0, // 隱藏全螢幕按鈕
          cc_load_policty: 0, // 隱藏字幕
          iv_load_policy: 3, // 隱藏影片註解
          autohide: 0, // 影片播放時，隱藏影片控制列
          playsinline: 1, // 在iOS的播放器中全屏播放，0:全屏(默認)，1:內嵌
        },
        events: {
          onReady: this.onPlayerReady,
        },
      });
    },
    onPlayerReady() {
      this.max = parseInt(this.player.getDuration());
      this.seekTo('start');
    },
    slideEnd() {
      const [start, end] = this.value;
      if (this.start_ !== start) {
        this.seekTo('start');
      }
      if (this.end_ !== end) {
        this.seekTo('end');
      }
      this.start_ = start;
      this.end_ = end;
    },
    seekTo(mode) {
      this.$nextTick(() => {
        this.player &&
          this.player.seekTo &&
          this.player.seekTo(mode === 'start' ? this.start_ : this.end_);
        // this.player && this.player.pauseVideo && this.player.pauseVideo();
      });
    },
    checkNumber(e) {
      if (e.target.value !== '' && !e.target.validity.valid) {
        e.target.value = '';
      }
    },
    formatter(value) {
      const m = parseInt(value / 60);
      const s = parseInt(value % 60);
      if (m === 0) {
        return `${s}s`;
      } else {
        return `${m}m${s}s`;
      }
    },
    closed() {
      this.video_ = this.video || this.videos[0];
      this.max = 100;
      this.value = [0, 100];
      this.start_ = 0;
      this.end_ = 100;
      this.range = 0;
      this.$emit('close');
      // this.player && this.player.destroy && this.player.destroy();
    },
    clear() {
      this.$emit('clear', {
        order: this.order,
      });
    },
    save() {
      this.$emit('save', {
        order: this.order,
        videoID: this.video_,
        start: this.start_,
        end: this.end_,
      });
    },
    refreshSlider() {
      setTimeout(() => {
        this.$refs.slider && this.$refs.slider.refresh();
      }, 100);
    },
    requestAnimationFrame() {
      window.requestAnimationFrame(this.refreshSlider);
    },
  },
  watch: {
    max() {
      // console.log('max');
      if (this.start_ === 0 && this.end_ === 100) {
        this.value = [0, this.max];
        this.end_ = this.max;
      }
      if (this.start_ !== 0 || this.end_ !== 100) {
        this.value = [this.start_, this.end_];
      }
    },
    start_() {
      // console.log('start_');
      this.value = [this.start_, this.end_];
      this.range = this.end_ - this.start_;
    },
    end_() {
      // console.log('end_');
      this.value = [this.start_, this.end_];
      this.range = this.end_ - this.start_;
    },
    range() {
      // console.log('range_');
      this.end_ = this.start_ + this.range;
      this.value = [this.start_, this.end_];
    },
    video_() {
      if (this.isOpen) {
        this.isOpen = false;
      } else {
        // console.log('video_')
        this.start_ = 0;
        this.end_ = 100;
        this.player.destroy();
        this.initPlayer();
      }
    },
  },
};
</script>
