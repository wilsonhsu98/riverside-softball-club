<template>
  <div class="root-container">
    <canvas ref="canvas" @mousedown="trackXY" :disabled="disabled"></canvas>
    <img v-if="isImage" :src="imgSrc" />
  </div>
</template>

<style lang="scss" scoped>
.root-container {
  position: relative;
}
canvas {
  width: 400px;
  height: 400px;
  &[disabled] {
    cursor: not-allowed;
  }
}
img {
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 400px;
}
@media only screen and (max-width: 760px) {
  canvas,
  img {
    width: 300px;
    height: 300px;
  }
}
</style>

<script>
import ballIcon from '../images/icon_100.png';
export default {
  props: ['values', 'disabled', 'no_track', 'fixedSize'],
  data() {
    return {
      xy: this.values || [],
      isImage: Array.isArray(this.values) && this.values.length > 1,
      imgSrc: '',
      ballImage: '',
    };
  },
  mounted() {
    const img = new Image();
    img.onload = () => {
      this.ballImage = img;
      this.draw();
    };
    img.src = ballIcon;

    if (!this.fixedSize) {
      window.addEventListener('resize', this.draw);
    }
  },
  beforeDestroy() {
    if (!this.fixedSize) {
      window.removeEventListener('resize', this.draw);
    }
  },
  methods: {
    draw() {
      const canvas = this.$refs.canvas;
      const { width } = canvas.getBoundingClientRect();

      if (this.fixedSize) {
        canvas.style.width = `${this.fixedSize}px`;
        canvas.style.height = `${this.fixedSize}px`;
        canvas.width = this.fixedSize;
        canvas.height = this.fixedSize;
      } else {
        canvas.width = width;
        canvas.height = width;
      }

      const { width: base } = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');

      const green = '#6aa253';
      const orange = '#e3ab78';
      const white = '#fff';
      const grassWidth = base * 0.051;
      const outfieldRadius = (base * 0.45) / 2;
      const clip = outfieldRadius * 0.8;
      const p = {
        x: base * 0.5,
        y: base * 0.67,
        width: base * 0.036,
        height: base * 0.01,
      };
      const c = {
        x: base * 0.5,
        y: base * 0.67 + ((base * 0.45) / 2) * 0.8,
      };
      const baseCircle = base * 0.044;
      const battingRectTranslate = base * 0.051 * 0.5;
      const orangeBaseLineWidth = base * 0.04;
      const whiteBaseLineWidth = orangeBaseLineWidth * 0.22;
      const batterBox = {
        width: base * 0.048,
        height: base * 0.08,
      };
      const aBase = base * 0.02;
      const rotateBase = base * 0.034;

      // background
      ctx.beginPath();
      ctx.fillStyle = green;
      ctx.fillRect(0, 0, base, base);

      // grass
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((-135 * Math.PI) / 180);
      ctx.fillStyle = 'rgba(255, 255, 255, .1)';
      Array.apply(null, Array(7)).forEach((undefined, i) => {
        ctx.fillRect(0, grassWidth + grassWidth * i * 2, base, grassWidth);
        ctx.fillRect(grassWidth + grassWidth * i * 2, 0, grassWidth, base);
      });
      ctx.restore();

      // infield
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - outfieldRadius);
      ctx.arcTo(
        p.x + outfieldRadius,
        p.y - outfieldRadius,
        p.x + outfieldRadius,
        p.y,
        outfieldRadius,
      );
      ctx.arcTo(
        p.x + outfieldRadius,
        p.y + outfieldRadius,
        p.x,
        p.y + outfieldRadius,
        outfieldRadius,
      );
      ctx.arcTo(
        p.x - outfieldRadius,
        p.y + outfieldRadius,
        p.x - outfieldRadius,
        p.y,
        outfieldRadius,
      );
      ctx.arcTo(
        p.x - outfieldRadius,
        p.y - outfieldRadius,
        p.x,
        p.y - outfieldRadius,
        outfieldRadius,
      );
      ctx.moveTo(p.x, p.y - clip);
      ctx.lineTo(p.x + clip, p.y);
      ctx.lineTo(p.x, p.y + clip);
      ctx.lineTo(p.x - clip, p.y);
      ctx.lineTo(p.x, p.y - clip);
      ctx.fillStyle = orange;
      ctx.fill('evenodd');

      // warning track
      ctx.beginPath();
      ctx.arc(p.x, p.y, base * 0.563, 0, 2 * Math.PI);
      ctx.lineWidth = base * 0.058;
      ctx.strokeStyle = orange;
      ctx.stroke();

      // p - orange background
      ctx.beginPath();
      ctx.arc(p.x, p.y, baseCircle, 0, 2 * Math.PI);
      ctx.fillStyle = orange;
      ctx.fill();

      // 1B - orange background
      ctx.beginPath();
      ctx.arc(p.x + clip, p.y, baseCircle, 0, 2 * Math.PI);
      ctx.fillStyle = orange;
      ctx.fill();

      // 2B - orange background
      ctx.beginPath();
      ctx.arc(p.x, p.y - clip, baseCircle, 0, 2 * Math.PI);
      ctx.fillStyle = orange;
      ctx.fill();

      // 3B - orange background
      ctx.beginPath();
      ctx.arc(p.x - clip, p.y, baseCircle, 0, 2 * Math.PI);
      ctx.fillStyle = orange;
      ctx.fill();

      // yard
      ctx.beginPath();
      ctx.arc(p.x, p.y, base, 0, 2 * Math.PI);
      ctx.lineWidth = base * 0.817;
      ctx.strokeStyle = green;
      ctx.stroke();

      // right green triangle
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((-45 * Math.PI) / 180);
      ctx.fillStyle = green;
      ctx.fillRect(0, orangeBaseLineWidth, base, base);
      ctx.restore();

      // left green triangle
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = green;
      ctx.fillRect(0, orangeBaseLineWidth, -base, base);
      ctx.restore();

      // batting cirle - orange background
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y + clip * 1.1,
        baseCircle * 2.5,
        -0.25 * Math.PI,
        1.25 * Math.PI,
      );
      ctx.fillStyle = orange;
      ctx.fill();

      // batting circle - white border
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y + clip * 1.1,
        baseCircle * 2.5,
        -0.2 * Math.PI,
        1.2 * Math.PI,
      );
      ctx.lineWidth = whiteBaseLineWidth;
      ctx.strokeStyle = white;
      ctx.stroke();

      // right base line - orange track & white line
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((-45 * Math.PI) / 180);
      ctx.fillStyle = orange;
      ctx.fillRect(0, 0, base, orangeBaseLineWidth);
      ctx.fillStyle = white;
      ctx.fillRect(
        orangeBaseLineWidth * 1.4,
        orangeBaseLineWidth * 0.38,
        base,
        orangeBaseLineWidth * 0.24,
      );
      ctx.restore();

      // left base line - orange track & white line
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = orange;
      ctx.fillRect(0, 0, -base, orangeBaseLineWidth);
      ctx.fillStyle = white;
      ctx.fillRect(
        -orangeBaseLineWidth * 1.4,
        orangeBaseLineWidth * 0.38,
        -base,
        orangeBaseLineWidth * 0.24,
      );
      ctx.restore();

      // right batter box
      ctx.beginPath();
      ctx.rect(
        c.x + battingRectTranslate,
        c.y - battingRectTranslate,
        batterBox.width,
        batterBox.height,
      );
      ctx.lineWidth = whiteBaseLineWidth;
      ctx.strokeStyle = white;
      ctx.stroke();

      // left batter box
      ctx.beginPath();
      ctx.rect(
        c.x - battingRectTranslate,
        c.y - battingRectTranslate,
        -batterBox.width,
        batterBox.height,
      );
      ctx.lineWidth = whiteBaseLineWidth;
      ctx.strokeStyle = white;
      ctx.stroke();

      // home base
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + aBase);
      ctx.lineTo(c.x - base * 0.015, c.y + aBase * 0.5);
      ctx.lineTo(c.x - base * 0.015, c.y - aBase * 0.5);
      ctx.lineTo(c.x + base * 0.015, c.y - aBase * 0.5);
      ctx.lineTo(c.x + base * 0.015, c.y + aBase * 0.5);
      ctx.lineTo(c.x, c.y + aBase);
      ctx.fillStyle = white;
      ctx.fill();

      // p
      ctx.beginPath();
      ctx.fillStyle = white;
      ctx.fillRect(
        p.x - p.width * 0.5,
        p.y - p.height * 0.5,
        p.width,
        p.height,
      );

      // 1B
      ctx.save();
      ctx.translate(p.x + clip, p.y - aBase);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = white;
      ctx.fillRect(0, 0, rotateBase, rotateBase);
      ctx.restore();

      // 2B
      ctx.save();
      ctx.translate(p.x, p.y - clip - aBase);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = white;
      ctx.fillRect(0, 0, rotateBase, rotateBase);
      ctx.restore();

      // 3B
      ctx.save();
      ctx.translate(p.x - clip, p.y - aBase);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = white;
      ctx.fillRect(0, 0, rotateBase, rotateBase);
      ctx.restore();

      if (this.xy.length === 1 && this.xy[0].click) {
        const drawingDot = this.xy[0];

        // draw direction line
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo((drawingDot.x / 100) * base, (drawingDot.y / 100) * base);
        ctx.lineWidth = base * 0.002;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // draw clicking ball
        ctx.beginPath();
        const ballWidth = base * 0.1;
        ctx.drawImage(
          this.ballImage,
          (drawingDot.x / 100) * base - ballWidth * 0.5,
          (drawingDot.y / 100) * base - ballWidth * 0.5,
          ballWidth,
          ballWidth,
        );
      } else {
        this.xy.forEach(item => {
          ctx.beginPath();
          ctx.arc(
            (item.x / 100) * base,
            (item.y / 100) * base,
            base * 0.02,
            0,
            2 * Math.PI,
          );
          ctx.fillStyle = item.color || 'yellow';
          ctx.fill();
          ctx.arc(
            (item.x / 100) * base,
            (item.y / 100) * base,
            base * 0.02,
            0,
            2 * Math.PI,
          );
          ctx.lineWidth = base * 0.001;
          ctx.strokeStyle = 'black';
          ctx.stroke();
        });
      }

      if (this.disabled) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, .3)';
        ctx.fillRect(0, 0, base, base);
      }
      this.imgSrc = canvas.toDataURL('image/png');
    },
    trackXY(event) {
      if (this.disabled || this.no_track) return;
      if (Array.isArray(this.values) && this.values.length > 1) return;
      const {
        left,
        top,
        width,
        height,
      } = this.$refs.canvas.getBoundingClientRect();
      const x = parseInt(
        ((event.pageX - left - window.scrollX) / width) * 100,
        10,
      );
      const y = parseInt(
        ((event.pageY - top - window.scrollY) / height) * 100,
        10,
      );
      const location = ((x, y) => {
        // console.log(`(${x}, ${y})`);
        if (y - x <= 38 && y + x <= 138) {
          if (Math.pow(x - 50, 2) + Math.pow(y - 66, 2) <= Math.pow(21, 2)) {
            if (
              y - (x * 4) / 7 >= 56 - (32 * 4) / 7 &&
              y + (x * 7) / 3 <= 64 + (46 * 7) / 3
            ) {
              return '3B';
            } else if (
              y + (x * 4) / 7 >= 56 + (68 * 4) / 7 &&
              y - (x * 7) / 3 <= 64 - (54 * 7) / 3
            ) {
              return '1B';
            } else if (x <= 50 && y <= 64) {
              return 'ss';
            } else if (x > 50 && y <= 64) {
              return '2B';
            } else {
              return 'P';
            }
          } else if (
            Math.pow(x - 50, 2) + Math.pow(y - 66, 2) <
            Math.pow(58.5, 2)
          ) {
            if (y - (x * 7) / 2 >= -87) {
              return 'lf';
            } else if (y + (x * 7) / 2 >= 263) {
              return 'rf';
            } else {
              return 'cf';
            }
          } else {
            if (y - (x * 7) / 2 >= -87) {
              return 'l_hr';
            } else if (y + (x * 7) / 2 >= 263) {
              return 'r_hr';
            } else {
              return 'c_hr';
            }
          }
        } else {
          return 'foul';
        }
      })(x, y);
      this.xy = [
        {
          x,
          y,
          location,
          click: true,
        },
      ];
      this.draw();
    },
  },
  watch: {
    values() {
      if (this.no_track) {
        this.xy = this.values;
        this.draw();
      }
    },
    xy() {
      const { x, y, location } = this.xy[0];
      this.$emit('change', { x, y, location });
    },
    disabled() {
      if (this.disabled) {
        this.xy = [];
      }
      this.draw();
    },
  },
};
</script>
