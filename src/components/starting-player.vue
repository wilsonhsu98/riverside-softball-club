<template>
  <div class="root-container">
    <div class="mobile-download">{{ $t('msg_mobile_download') }}</div>
    <img :src="imgSrc" />
    <i v-if="fileNamePrefix" class="fa fa-download" @click="download"></i>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.root-container {
  position: relative;
  line-height: 0;
}
img {
  height: 440px;
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
  right: -30px;
  bottom: 5px;
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

export default {
  props: ['players', 'fileNamePrefix'],
  data() {
    return {
      list: this.players || [],
      imgSrc: '',
    };
  },
  mounted() {
    Promise.all(
      [
        ...(Array.isArray(this.list) && this.list.length
          ? this.list.map(({ name, photo }) => {
              return {
                var: name,
                src: photo,
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
      const nameWidths = this.list.map(({ name }) => {
        const span = document.createElement('span');
        span.innerText = name;
        document.body.appendChild(span);
        const { width } = span.getBoundingClientRect();
        document.body.removeChild(span);
        return width;
      });
      const max = Math.max(...nameWidths);
      this.draw(max);
    });
  },
  methods: {
    draw(nameMaxWidth) {
      const scale = 2;
      const lineWidth = 2 * scale;
      const orderWidth = 27 * scale;
      const orderHeight = 40 * scale;
      const nameWidth = (81 + nameMaxWidth) * scale;
      const positionWidth = 40 * scale;
      const borderRadius = 5 * scale;
      const canvasWidth = orderWidth + nameWidth + positionWidth;
      const canvasHeight = (this.list.length * 45 - 3) * scale;
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      const avatarRadius = 16 * scale;
      const diameter = avatarRadius * 2;
      const avatarBackgroundColor = 'rgba(237, 247, 248, 1)'; // $row_odd_bgcolor
      const avatarBorderColor = 'rgba(50, 122, 129, 1)'; // $row_color
      const orderBorderColor = '#ff695e'; // $error_color
      const canvasRadius = (x, y, w, h, tl, tr, br, bl, fillStyle) => {
        const r = x + w;
        const b = y + h;

        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(r - tr, y);
        ctx.quadraticCurveTo(r, y, r, y + tr);
        ctx.lineTo(r, b - br);
        ctx.quadraticCurveTo(r, b, r - br, b);
        ctx.lineTo(x + bl, b);
        ctx.quadraticCurveTo(x, b, x, b - bl);
        ctx.lineTo(x, y + tl);
        ctx.quadraticCurveTo(x, y, x + tl, y);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.stroke();
      };

      // ctx.beginPath();
      // ctx.fillStyle = 'rgba(0,0,0,0.5)';
      // ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.list.forEach((player, index) => {
        const yAxis = 2 + 45 * scale * index;
        ctx.save();

        ctx.strokeStyle = orderBorderColor;
        ctx.lineWidth = lineWidth;
        canvasRadius(
          2,
          yAxis,
          orderWidth,
          orderHeight,
          borderRadius,
          0,
          0,
          borderRadius,
          '#fff',
        );

        ctx.strokeStyle = orderBorderColor;
        ctx.lineWidth = lineWidth;
        canvasRadius(
          orderWidth + nameWidth - 2,
          yAxis,
          positionWidth,
          orderHeight,
          0,
          borderRadius,
          borderRadius,
          0,
          '#fff',
        );

        ctx.strokeStyle = avatarBorderColor;
        ctx.lineWidth = lineWidth;
        canvasRadius(
          2 + orderWidth,
          yAxis,
          nameWidth - 4,
          orderHeight,
          0,
          0,
          0,
          0,
          avatarBackgroundColor,
        );

        ctx.beginPath();
        ctx.fillStyle = orderBorderColor;
        ctx.font = `${16 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(
          index + 1,
          14.5 * scale,
          (diameter + 13 * scale) * index + 27 * scale,
        );

        ctx.beginPath();
        ctx.fillStyle = orderBorderColor;
        ctx.font = `${16 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(
          this.$t(player.position),
          orderWidth + nameWidth + 18.5 * scale,
          (diameter + 13 * scale) * index + 27 * scale,
        );

        ctx.beginPath();
        ctx.fillStyle = avatarBorderColor;
        ctx.font = `${16 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(
          player.number || '?',
          orderWidth + 26 * scale + diameter,
          (diameter + 13 * scale) * index + 27 * scale,
        );

        ctx.beginPath();
        ctx.fillStyle = avatarBorderColor;
        ctx.font = `${16 * scale}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(
          player.name,
          orderWidth + 36 * scale + diameter,
          (diameter + 13 * scale) * index + 27 * scale,
        );

        ctx.beginPath();
        ctx.translate(
          orderWidth + 12 * scale,
          (diameter + 13 * scale) * index + 5 * scale,
        );
        ctx.arc(avatarRadius, avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        if (this[player.name]) {
          ctx.clip();
          ctx.drawImage(this[player.name], 0, 0, diameter, diameter);
        } else {
          // ctx.fillStyle = avatarBackgroundColor;
          // ctx.textAlign = 'center';
          // ctx.fill();
          // ctx.font = `${avatarRadius * 1.4}px FontAwesome`;
          // ctx.fillStyle = avatarBorderColor;
          // ctx.shadowBlur = 0;
          // ctx.fillText('\uF2C0', avatarRadius, avatarRadius * 1.4);
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
            getNameNumber({ name: player.name, number: player.number }),
            avatarRadius,
            avatarRadius * 1.3,
          );
          ctx.lineWidth = avatarRadius * 0.1;
          ctx.strokeStyle = avatarBorderColor;
          ctx.stroke();
        }

        ctx.restore();
      });

      this.imgSrc = canvas.toDataURL('image/png');
    },
    download() {
      const downloadLink = document.createElement('a');
      downloadLink.download = `${this.fileNamePrefix}_lineup.png`;
      downloadLink.href = this.imgSrc;
      downloadLink.click();
    },
  },
};
</script>
