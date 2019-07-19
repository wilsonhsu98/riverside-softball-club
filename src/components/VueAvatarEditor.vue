<template>
  <div>
    <vue-avatar
      :image="image"
      :width="width"
      :height="height"
      :rotation="rotation"
      :borderRadius="hasRadius ? borderRadius : 0"
      :border="border"
      :color="color"
      :scale="scale"
      :canMoveOutOfBound="canMoveOutOfBound"
      ref="vueavatar"
      @vue-avatar-editor:image-ready="onImageReady"
    >
    </vue-avatar>
    <div>
      <label>
        {{ zoomText }} : {{ scale }}x
        <br />
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.02"
          v-model.number="scale"
        />
        <!-- <input
          type="range"
          min=0
          max=360
          step=1
          v-model.number='rotation'
        /> -->
      </label>
      <label><i class="fa fa-undo" @click="rotate(-90)"/></label>
      <label><i class="fa fa-repeat" @click="rotate(90)"/></label>
      <button @click="finished">{{ finishText }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

input[type='range'] {
  height: 24px;
  -webkit-appearance: none;
  // margin: 10px 0;
  width: 100%;
}
input[type='range']:focus {
  outline: none;
}
input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: $row_color;
  border-radius: 1px;
  border: 0px solid #000000;
}
input[type='range']::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 0px solid #edf7f8;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: $current_user_bgcolor;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -6.5px;
}
input[type='range']:focus::-webkit-slider-runnable-track {
  background: $row_color;
}
input[type='range']::-moz-range-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: $row_color;
  border-radius: 1px;
  border: 0px solid #000000;
}
input[type='range']::-moz-range-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 0px solid #edf7f8;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: $current_user_bgcolor;
  cursor: pointer;
}
input[type='range']::-ms-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type='range']::-ms-fill-lower {
  background: $row_color;
  border: 0px solid #000000;
  border-radius: 2px;
  box-shadow: 0px 0px 0px #000000;
}
input[type='range']::-ms-fill-upper {
  background: $row_color;
  border: 0px solid #000000;
  border-radius: 2px;
  box-shadow: 0px 0px 0px #000000;
}
input[type='range']::-ms-thumb {
  margin-top: 1px;
  box-shadow: 0px 0px 0px #000000;
  border: 0px solid #edf7f8;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: $current_user_bgcolor;
  cursor: pointer;
}
input[type='range']:focus::-ms-fill-lower {
  background: $row_color;
}
input[type='range']:focus::-ms-fill-upper {
  background: $row_color;
}
</style>

<script>
// import VueAvatar from './VueAvatar.vue';

export default {
  props: {
    zoomText: {
      type: String,
      default: 'Zoom',
    },
    finishText: {
      type: String,
      default: 'Save',
    },
    hasRotation: {
      type: Boolean,
      default: true,
    },
    hasScale: {
      type: Boolean,
      default: true,
    },
    hasRadius: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
    border: {
      type: Number,
      default: 25,
    },
    borderRadius: {
      type: Number,
      default: 200,
    },
    width: {
      type: Number,
      default: 200,
    },
    height: {
      type: Number,
      default: 200,
    },
    color: {
      type: Array,
      default: () => [0, 0, 0, 0.5],
    },
    canMoveOutOfBound: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rotation: 0,
      scale: 1,
    };
  },
  methods: {
    onImageReady() {
      this.scale = 1;
      this.rotation = 0;
    },
    rotate(value) {
      this.rotation += value;
    },
    finished() {
      return this.$emit('finished', this.$refs.vueavatar.getImageScaled());
    },
  },
};
</script>
