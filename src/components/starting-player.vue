<template>
  <div class="root-container">
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
@media only screen and (max-width: 760px) {
  .fa {
    visibility: hidden;
  }
}
</style>

<script>
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
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            this[item.var] = img;
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
          if (item.src) {
            img.src = this.$cacheImg(item.src);
          } else {
            resolve();
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
      const width = 108 + nameMaxWidth;
      const height = this.list.length * 45 - 3;
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');

      const orderWidth = 27 * scale;
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
        ctx.save();

        ctx.strokeStyle = orderBorderColor;
        ctx.lineWidth = 2 * scale;
        canvasRadius(
          2,
          2 + 45 * scale * index,
          orderWidth,
          40 * scale,
          5 * scale,
          0,
          0,
          5 * scale,
          '#fff',
        );

        ctx.strokeStyle = avatarBorderColor;
        ctx.lineWidth = 2 * scale;
        canvasRadius(
          2 + orderWidth,
          2 + 45 * scale * index,
          canvas.width - 4 - orderWidth,
          40 * scale,
          0,
          5 * scale,
          5 * scale,
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
          ctx.fillStyle = avatarBackgroundColor;
          ctx.textAlign = 'center';
          ctx.fill();
          ctx.font = `${avatarRadius * 1.4}px FontAwesome`;
          ctx.fillStyle = avatarBorderColor;
          ctx.shadowBlur = 0;
          ctx.fillText('\uF2C0', avatarRadius, avatarRadius * 1.4);
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
      downloadLink.download = `${this.fileNamePrefix}_starting_players.png`;
      downloadLink.href = this.imgSrc;
      downloadLink.click();
    },
  },
};
</script>
