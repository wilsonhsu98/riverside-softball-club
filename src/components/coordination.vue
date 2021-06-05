<template>
  <div class="root-container">
    <div v-if="no_track" class="mobile-download">
      {{ $t('msg_mobile_download') }}
    </div>
    <img ref="img" :src="imgSrc" @mousedown="trackXY" :disabled="disabled" />
    <slot></slot>
    <i v-if="fileNamePrefix" class="fa fa-download" @click="download"></i>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.root-container {
  position: relative;
  line-height: 0;
}
.fa {
  width: 26px;
  height: 26px;
  line-height: 26px;
  font-size: 18px;
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
  margin-left: 5px;
  color: white;
  background-color: $current_user_bgcolor;
  border-radius: 4px;
  position: absolute;
  right: 5px;
  bottom: 5px;
}
img {
  width: 400px;
  height: 400px;
  &[disabled] {
    cursor: not-allowed;
  }
}
.mobile-download {
  display: none;
  color: #fff;
  white-space: nowrap;
  line-height: 20px;
  margin-top: -20px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
@media only screen and (max-width: 760px), (max-height: 480px) {
  img {
    width: 300px;
    height: 300px;
  }
  .fa {
    visibility: hidden;
  }
  .mobile-download {
    display: block;
  }
}
</style>

<script>
import { getNameNumber } from '../libs/utils';
import ballIcon from '../images/icon_100.png';
const colorMappging = {
  red: '#ef1010',
  blue: '#4d9de5',
  yellow: '#efaf34',
};

export default {
  props: [
    'values',
    'disabled',
    'no_track',
    'fixedSize',
    'showPercentage',
    'avatar',
    'player',
    'positions',
    'fileNamePrefix',
  ],
  emits: ['change'],
  data() {
    return {
      xy: this.values || [],
      imgSrc: '',
      ballImage: '',
      homeImage: '',
      firstImage: '',
      secondImage: '',
      thirdImage: '',
      avatarImage: '',
      positions_: this.positions || {},
    };
  },
  mounted() {
    Promise.all(
      [
        { var: 'ballImage', src: ballIcon },
        ...(this.avatar ? [{ var: 'avatarImage', src: this.avatar }] : []),
        ...(typeof this.xy[0] === 'object' && this.xy[0].onbase
          ? [
              {
                var: 'homeImage',
                src: this.xy[0].onbase[0].photo,
              },
              {
                var: 'firstImage',
                src: this.xy[0].onbase[1].photo,
              },
              {
                var: 'secondImage',
                src: this.xy[0].onbase[2].photo,
              },
              {
                var: 'thirdImage',
                src: this.xy[0].onbase[3].photo,
              },
            ]
          : []),
        ...(typeof this.positions === 'object' &&
        Object.keys(this.positions).length
          ? Object.keys(this.positions).map(position => {
              return {
                var: position,
                src: this.positions[position].photo,
              };
            })
          : []),
      ].map(item => {
        return new Promise(resolve => {
          const img = new Image();
          const timer = setTimeout(() => {
            resolve();
          }, 500);
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            this[item.var] = img;
            resolve();
            clearTimeout(timer);
          };
          img.onerror = () => {
            resolve();
            clearTimeout(timer);
          };
          if (item.src) {
            img.src = this.$cacheImg(item.src);
          } else {
            resolve();
            clearTimeout(timer);
          }
        });
      }),
    ).then(() => {
      this.draw();
    });

    if (!this.fixedSize) {
      window.addEventListener('resize', this.requestAnimationFrame);
    }
  },
  beforeDestroy() {
    if (!this.fixedSize) {
      window.removeEventListener('resize', this.requestAnimationFrame);
    }
  },
  methods: {
    draw() {
      const img = this.$refs.img;
      if (!img) return;
      const { width } = img.getBoundingClientRect();

      if (this.fixedSize) {
        img.style.width = `${this.fixedSize}px`;
        img.style.height = `${this.fixedSize}px`;
      }

      const { width: temp } = img.getBoundingClientRect();
      const scale = 2;
      const base = (this.fixedSize ? this.fixedSize : temp || width) * scale;
      const canvas = document.createElement('canvas');
      canvas.width = base;
      canvas.height = base;
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
      const avatarRadius = base * 0.07;
      // const avatarBackgroundColor = 'rgba(237, 247, 248, 1)'; // $row_odd_bgcolor
      const avatarBorderColor = 'rgba(50, 122, 129, 1)'; // $row_color

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

      if (
        typeof this.xy[0] === 'object' &&
        this.xy[0].onbase &&
        this.xy[0].onbase[0].name
      ) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(c.x - avatarRadius, c.y + aBase - avatarRadius);
        ctx.arc(avatarRadius, avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        if (this.homeImage) {
          ctx.clip();
          ctx.drawImage(
            this.homeImage,
            0,
            0,
            avatarRadius * 2,
            avatarRadius * 2,
          );
        } else {
          // ctx.fillStyle = avatarBackgroundColor;
          // ctx.fill();
          // ctx.font = `${avatarRadius * 1.2}px FontAwesome`;
          // ctx.fillStyle = avatarBorderColor;
          // ctx.fillText('\uF2C0', avatarRadius * 0.5, avatarRadius * 1.4);
          // ctx.lineWidth = avatarRadius * 0.1;
          // ctx.strokeStyle = avatarBorderColor;
          // ctx.stroke();
          ctx.fillStyle = avatarBorderColor;
          ctx.textAlign = 'center';
          ctx.fill();
          ctx.font = `${16 * scale}px Arial`;
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 0;
          ctx.fillText(
            getNameNumber({
              name: this.xy[0].onbase[0].name,
              number: this.xy[0].onbase[0].number,
            }),
            avatarRadius * 1,
            avatarRadius * 1.25,
          );
          ctx.lineWidth = avatarRadius * 0.1;
          ctx.strokeStyle = avatarBorderColor;
          ctx.stroke();
        }
        ctx.restore();
      }

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

      if (
        typeof this.xy[0] === 'object' &&
        this.xy[0].onbase &&
        this.xy[0].onbase[1].name
      ) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(p.x + clip - avatarRadius, p.y - aBase - avatarRadius);
        ctx.arc(avatarRadius, avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        if (this.firstImage) {
          ctx.clip();
          ctx.drawImage(
            this.firstImage,
            0,
            0,
            avatarRadius * 2,
            avatarRadius * 2,
          );
        } else {
          // ctx.fillStyle = avatarBackgroundColor;
          // ctx.fill();
          // ctx.font = `${avatarRadius * 1.2}px FontAwesome`;
          // ctx.fillStyle = avatarBorderColor;
          // ctx.fillText('\uF2C0', avatarRadius * 0.5, avatarRadius * 1.4);
          // ctx.lineWidth = avatarRadius * 0.1;
          // ctx.strokeStyle = avatarBorderColor;
          // ctx.stroke();
          ctx.fillStyle = avatarBorderColor;
          ctx.textAlign = 'center';
          ctx.fill();
          ctx.font = `${16 * scale}px Arial`;
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 0;
          ctx.fillText(
            getNameNumber({
              name: this.xy[0].onbase[1].name,
              number: this.xy[0].onbase[1].number,
            }),
            avatarRadius * 1,
            avatarRadius * 1.25,
          );
          ctx.lineWidth = avatarRadius * 0.1;
          ctx.strokeStyle = avatarBorderColor;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2B
      ctx.save();
      ctx.translate(p.x, p.y - clip - aBase);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = white;
      ctx.fillRect(0, 0, rotateBase, rotateBase);
      ctx.restore();

      if (
        typeof this.xy[0] === 'object' &&
        this.xy[0].onbase &&
        this.xy[0].onbase[2].name
      ) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(p.x - avatarRadius, p.y - clip - aBase - avatarRadius);
        ctx.arc(avatarRadius, avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        if (this.secondImage) {
          ctx.clip();
          ctx.drawImage(
            this.secondImage,
            0,
            0,
            avatarRadius * 2,
            avatarRadius * 2,
          );
        } else {
          // ctx.fillStyle = avatarBackgroundColor;
          // ctx.fill();
          // ctx.font = `${avatarRadius * 1.2}px FontAwesome`;
          // ctx.fillStyle = avatarBorderColor;
          // ctx.fillText('\uF2C0', avatarRadius * 0.5, avatarRadius * 1.4);
          // ctx.lineWidth = avatarRadius * 0.1;
          // ctx.strokeStyle = avatarBorderColor;
          // ctx.stroke();
          ctx.fillStyle = avatarBorderColor;
          ctx.textAlign = 'center';
          ctx.fill();
          ctx.font = `${16 * scale}px Arial`;
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 0;
          ctx.fillText(
            getNameNumber({
              name: this.xy[0].onbase[2].name,
              number: this.xy[0].onbase[2].number,
            }),
            avatarRadius * 1,
            avatarRadius * 1.25,
          );
          ctx.lineWidth = avatarRadius * 0.1;
          ctx.strokeStyle = avatarBorderColor;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3B
      ctx.save();
      ctx.translate(p.x - clip, p.y - aBase);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = white;
      ctx.fillRect(0, 0, rotateBase, rotateBase);
      ctx.restore();

      if (
        typeof this.xy[0] === 'object' &&
        this.xy[0].onbase &&
        this.xy[0].onbase[3].name
      ) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(p.x - clip - avatarRadius, p.y - aBase - avatarRadius);
        ctx.arc(avatarRadius, avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        if (this.thirdImage) {
          ctx.clip();
          ctx.drawImage(
            this.thirdImage,
            0,
            0,
            avatarRadius * 2,
            avatarRadius * 2,
          );
        } else {
          // ctx.fillStyle = avatarBackgroundColor;
          // ctx.fill();
          // ctx.font = `${avatarRadius * 1.2}px FontAwesome`;
          // ctx.fillStyle = avatarBorderColor;
          // ctx.fillText('\uF2C0', avatarRadius * 0.5, avatarRadius * 1.4);
          // ctx.lineWidth = avatarRadius * 0.1;
          // ctx.strokeStyle = avatarBorderColor;
          // ctx.stroke();
          ctx.fillStyle = avatarBorderColor;
          ctx.textAlign = 'center';
          ctx.fill();
          ctx.font = `${16 * scale}px Arial`;
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 0;
          ctx.fillText(
            getNameNumber({
              name: this.xy[0].onbase[3].name,
              number: this.xy[0].onbase[3].number,
            }),
            avatarRadius * 1,
            avatarRadius * 1.25,
          );
          ctx.lineWidth = avatarRadius * 0.1;
          ctx.strokeStyle = avatarBorderColor;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (this.xy.length === 1 && this.xy[0].click) {
        const drawingDot = this.xy[0];

        // draw direction line
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo((drawingDot.x / 100) * base, (drawingDot.y / 100) * base);
        ctx.lineWidth = base * 0.002;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // console.log(drawingDot.x, drawingDot.y);

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
        if (this.showPercentage) {
          const percentage = this.xy.reduce((acc, item, i, self) => {
            const p = {
              ...acc,
              [item.location]: (acc[item.location] || 0) + 1,
            };
            if (i === self.length - 1) {
              const values = Object.keys(p).map(key => p[key]);
              const max = Math.max(...values);
              const maxCount = values.filter(
                value => value === Math.max(...values),
              ).length;
              return Object.keys(p).reduce(
                (subAcc, key) => ({
                  ...subAcc,
                  [key]: `${Math.round((p[key] / self.length) * 100)}%`,
                  ...(maxCount === 1 && p[key] === max
                    ? { max: key }
                    : undefined),
                }),
                {},
              );
            } else {
              return p;
            }
          }, {});
          ctx.lineWidth = base * 0.008;
          ctx.strokeStyle = 'yellow';
          // 界外線
          ctx.beginPath();
          ctx.moveTo((50 / 100) * base, (87.7 / 100) * base);
          ctx.lineTo((0 / 100) * base, (38 / 100) * base);
          ctx.moveTo((50 / 100) * base, (87.7 / 100) * base);
          ctx.lineTo((138 / 100) * base, (0 / 100) * base);
          ctx.stroke();
          // 內野弧線
          // Math.pow(x - 50, 2) + Math.pow(y - 66, 2) <= Math.pow(21, 2)
          ctx.beginPath();
          for (let x = 0; x < 100; x += 1) {
            const y = -Math.sqrt(Math.pow(21, 2) - Math.pow(x - 50, 2)) + 66;
            ctx.lineTo((x / 100) * base, (y / 100) * base);
          }
          ctx.stroke();

          ctx.beginPath();
          // 三壘
          ctx.moveTo((31.8 / 100) * base, (56 / 100) * base);
          ctx.lineTo((46 / 100) * base, (64 / 100) * base);
          ctx.lineTo((40.2 / 100) * base, (77.3 / 100) * base);
          // 一壘
          ctx.moveTo((68.2 / 100) * base, (56 / 100) * base);
          ctx.lineTo((54 / 100) * base, (64 / 100) * base);
          ctx.lineTo((59.8 / 100) * base, (77.3 / 100) * base);
          // 中線
          ctx.moveTo((50 / 100) * base, (64 / 100) * base);
          ctx.lineTo((50 / 100) * base, (45 / 100) * base);
          // 投手線
          ctx.moveTo((46 / 100) * base, (64 / 100) * base);
          ctx.lineTo((54 / 100) * base, (64 / 100) * base);
          ctx.stroke();
          // 外野弧線
          // Math.pow(x - 50, 2) + Math.pow(y - 66, 2) < Math.pow(58.5, 2)
          ctx.beginPath();
          for (let x = -1; x <= 101; x += 1) {
            const y = -Math.sqrt(Math.pow(58.5, 2) - Math.pow(x - 50, 2)) + 66;
            ctx.lineTo((x / 100) * base, (y / 100) * base);
          }
          ctx.stroke();
          // 左中線 中右線
          ctx.beginPath();
          ctx.moveTo((38.5 / 100) * base, (48.5 / 100) * base);
          ctx.lineTo((28 / 100) * base, (11.5 / 100) * base);
          ctx.moveTo((61.5 / 100) * base, (48.5 / 100) * base);
          ctx.lineTo((72 / 100) * base, (11.5 / 100) * base);
          ctx.stroke();

          ctx.font = `${avatarRadius * 0.8}px Arial`;
          ctx.shadowColor = 'black';
          ctx.shadowBlur = (1 / 100) * base;
          const textLocation = {
            cf: { x: 50, y: 30 },
            rf: { x: 79, y: 40 },
            lf: { x: 21, y: 40 },
            ss: { x: 42, y: 57 },
            '2B': { x: 58, y: 57 },
            '3B': { x: 38, y: 68 },
            '1B': { x: 62, y: 68 },
            P: { x: 50, y: 75 },
            foul: { x: 6, y: 80 },
          };
          Object.keys(percentage)
            .filter(key => key !== 'max')
            .forEach(key => {
              if (key === 'foul') {
                ctx.fillStyle = 'yellow';
                ctx.textAlign = 'left';
                ctx.fillText(
                  `Foul: ${percentage.foul}`,
                  (textLocation.foul.x / 100) * base,
                  (textLocation.foul.y / 100) * base,
                );
              } else {
                if (key === percentage.max) {
                  ctx.fillStyle = 'red';
                } else {
                  ctx.fillStyle = 'yellow';
                }
                ctx.textAlign = 'center';
                ctx.fillText(
                  percentage[key],
                  (textLocation[key].x / 100) * base,
                  (textLocation[key].y / 100) * base,
                );
              }
            });
        } else {
          this.xy.forEach(item => {
            ctx.beginPath();
            ctx.shadowColor = 'black';
            ctx.shadowBlur = (1 / 100) * base;
            ctx.arc(
              (item.x / 100) * base,
              (item.y / 100) * base,
              base * 0.02,
              0,
              2 * Math.PI,
            );
            ctx.fillStyle = colorMappging[item.color] || item.color || 'yellow';
            ctx.fill();
            ctx.arc(
              (item.x / 100) * base,
              (item.y / 100) * base,
              base * 0.02,
              0,
              2 * Math.PI,
            );
            ctx.lineWidth =
              item.borderColor === 'white' ? base * 0.005 : base * 0.001;
            ctx.strokeStyle = item.borderColor || 'black';
            ctx.stroke();
          });
        }
        if (Object.keys(this.positions_).length > 0) {
          ctx.font = `${avatarRadius * 0.6}px Arial`;
          ctx.shadowColor = '#000';
          ctx.shadowBlur = (1 / 100) * base;
          const textLocation = {
            CF: { x: 50, y: 27 },
            FREE: { x: 50, y: 45 },
            RF: { x: 79, y: 40 },
            LF: { x: 21, y: 40 },
            SS: { x: 33, y: 57 },
            '2B': { x: 67, y: 57 },
            '3B': { x: 25, y: 76.5 },
            '1B': { x: 75, y: 76.5 },
            P: { x: 50, y: 76.5 },
            C: { x: 50, y: 95 },
            DH: { x: 85, y: 95 },
          };
          Object.keys(this.positions_).forEach(key => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(
              `${this.positions_[key].number} ${this.positions_[key].name}`,
              (textLocation[key].x / 100) * base,
              (textLocation[key].y / 100) * base,
            );

            ctx.save();
            ctx.beginPath();
            ctx.translate(
              (textLocation[key].x / 100) * base - avatarRadius * 0.8,
              (textLocation[key].y / 100) * base - avatarRadius * 2.3,
            );
            ctx.arc(
              avatarRadius * 0.8,
              avatarRadius * 0.8,
              avatarRadius * 0.8,
              0,
              Math.PI * 2,
              true,
            );
            if (this[key]) {
              ctx.clip();
              ctx.drawImage(
                this[key],
                0,
                0,
                avatarRadius * 1.6,
                avatarRadius * 1.6,
              );
            } else {
              // ctx.fillStyle = avatarBackgroundColor;
              // ctx.textAlign = 'center';
              // ctx.fill();
              // ctx.font = `${avatarRadius}px FontAwesome`;
              // ctx.fillStyle = avatarBorderColor;
              // ctx.shadowBlur = 0;
              // ctx.fillText('\uF2C0', avatarRadius * 0.8, avatarRadius * 1.1);
              // ctx.lineWidth = avatarRadius * 0.1;
              // ctx.strokeStyle = avatarBorderColor;
              // ctx.stroke();
              ctx.fillStyle = avatarBorderColor;
              ctx.textAlign = 'center';
              ctx.fill();
              ctx.font = `${14 * scale}px Arial`;
              ctx.fillStyle = '#fff';
              ctx.shadowBlur = 0;
              ctx.fillText(
                getNameNumber({
                  name: this.positions_[key].name,
                  number: this.positions_[key].number,
                }),
                avatarRadius * 0.8,
                avatarRadius * 1,
              );
              ctx.lineWidth = avatarRadius * 0.1;
              ctx.strokeStyle = avatarBorderColor;
              ctx.stroke();
            }
            ctx.restore();
          });
        }
        // 個人頭貼
        if (this.avatarImage) {
          ctx.save();
          ctx.beginPath();
          ctx.translate(
            base - avatarRadius * 2 - (5 / 100) * base,
            base - avatarRadius * 2 - (5 / 100) * base,
          );
          ctx.arc(
            avatarRadius,
            avatarRadius,
            avatarRadius,
            0,
            Math.PI * 2,
            true,
          );
          ctx.clip();
          ctx.drawImage(
            this.avatarImage,
            0,
            0,
            avatarRadius * 2,
            avatarRadius * 2,
          );
          ctx.restore();
        } else {
          if (this.player) {
            ctx.font = `${avatarRadius * 1.2}px Arial`;
            ctx.shadowColor = 'white';
            ctx.shadowBlur = (1 / 100) * base;
            ctx.fillStyle = avatarBorderColor;
            ctx.textAlign = 'right';
            ctx.fillText(
              this.player,
              base - (5 / 100) * base,
              base - (6 / 100) * base,
            );
          }
        }
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
      } = this.$refs.img.getBoundingClientRect();
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
    requestAnimationFrame() {
      window.requestAnimationFrame(this.draw);
    },
    download() {
      const downloadLink = document.createElement('a');
      downloadLink.download = `${this.fileNamePrefix}_positions.png`;
      downloadLink.href = this.imgSrc;
      downloadLink.click();
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
      if (this.xy.length) {
        const { x, y, location } = this.xy[0];
        this.$emit('change', { x, y, location });
      }
    },
    disabled() {
      if (this.disabled) {
        this.xy = [];
      }
      this.draw();
    },
    showPercentage() {
      this.draw();
    },
  },
};
</script>
