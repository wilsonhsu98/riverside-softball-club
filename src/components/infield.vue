<template>
  <div class="outer-container">
    <div class="canvas">
      <div class="in-field">
        <div class="warning-track">
          <div class="out-field">
            <div class="out-field-gress r-270">
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
            </div>
            <div class="out-field-gress r-180">
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
              <div class="gress-mask"></div>
            </div>
          </div>
        </div>
        <div class="in-field-track"></div>
        <div class="in-field-gress">
          <div class="first-base base"></div>
          <div class="second-base base"></div>
          <div class="third-base base"></div>
          <div class="pitcher base"></div>

          <div class="gress r-270">
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
          </div>
          <div class="gress r-180">
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
            <div class="gress-mask"></div>
          </div>
        </div>
      </div>
      <div class="cover cover-left">
        <div class="cover-ground"></div>
      </div>
      <div class="cover cover-right">
        <div class="cover-ground"></div>
      </div>
      <div class="home">
        <div class="home-batting-left home-batting"></div>
        <div class="home-base"></div>
        <div class="home-batting-right home-batting"></div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
$green: #6aa253;
$orange: #e3ab78;
.outer-container {
  width: 300px;
  height: 180px;
  position: relative;
  overflow: hidden;
  display: inline-block;
}
.canvas {
  display: inline-block;
  width: 300px;
  height: 300px;
  background-color: $green;
  overflow: hidden;
  position: absolute;
  top: -118px;
  left: 0;
  .in-field {
    display: inline-block;
    width: 25%;
    height: 25%;
    top: 60%;
    left: 50%;
    transform: rotate(-45deg);
    transform-origin: 0% 100%;
    position: absolute;
    .warning-track {
      display: inline-block;
      width: 475%;
      height: 475%;
      border-radius: 50%;
      background-color: $orange;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .out-field {
        display: inline-block;
        width: 90%;
        height: 90%;
        background-color: $green;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        overflow: hidden;
        text-align: right;
        .out-field-gress {
          display: inline-block;
          width: 62%;
          height: 62%;
          transform-origin: 50% 50%;
          position: absolute;
          right: 0;
          &.r-180 {
            transform: rotate(180deg);
          }
          &.r-270 {
            transform: rotate(270deg);
          }
        }
      }
    }
    .in-field-track {
      display: inline-block;
      width: 180%;
      height: 180%;
      border-radius: 50%;
      background-color: $orange;
      top: 50%;
      left: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
    }
    .in-field-gress {
      display: inline-block;
      width: 100%;
      height: 100%;
      background-color: $green;
      top: 49%;
      left: 49%;
      position: absolute;
      transform: translate(-49%, -49%);

      .base {
        display: inline-block;
        width: 35%;
        height: 35%;
        background-color: $orange;
        border-radius: 50%;
        position: absolute;
        z-index: 1;
        &:before {
          content: '';
          display: inline-block;
          width: 40%;
          height: 40%;
          background-color: white;
          top: 50%;
          left: 50%;
          position: absolute;
          transform: translate(-50%, -50%);
        }
      }
      .first-base {
        right: -17%;
        bottom: -17%;
      }
      .second-base {
        top: -17%;
        right: -17%;
      }
      .third-base {
        top: -17%;
        left: -17%;
      }
      .pitcher {
        top: 50%;
        left: 50%;
        transform: rotate(-45deg) translate(-50%, -50%);
        transform-origin: 0 0;
        &:before {
          width: 10%;
        }
      }
      .gress {
        display: inline-block;
        width: 100%;
        height: 100%;
        transform-origin: 50% 50%;
        position: absolute;
        right: 0;
        overflow: hidden;
        &.r-180 {
          transform: rotate(180deg);
        }
        &.r-270 {
          transform: rotate(270deg);
        }
      }
    }
  }
  .cover {
    width: 50%;
    height: 87.2%;
    display: inline-block;
    position: absolute;
    &-left {
      transform: rotate(-45deg);
      transform-origin: 100% 100%;
      left: 0;
      &:before {
        right: 0;
      }
      &:after {
        left: 0;
      }
      .cover-ground {
        right: -3%;
      }
    }
    &-right {
      transform: rotate(45deg);
      transform-origin: 0% 100%;
      right: 0;
      &:before {
        left: 0;
      }
      &:after {
        right: 0;
      }
      .cover-ground {
        left: -3%;
      }
    }
    &:before {
      content: '';
      display: inline-block;
      width: 2%;
      height: 100%;
      background-color: #fafbf5;
      position: absolute;
      z-index: 1;
    }
    &:after {
      content: '';
      display: inline-block;
      width: 95%;
      height: 100%;
      background-color: $green;
      position: absolute;
      top: 0;
    }
    &-ground {
      display: inline-block;
      width: 8%;
      height: 67%;
      background-color: $orange;
      position: absolute;
    }
  }
  .home {
    display: inline-block;
    width: 12%;
    height: 12%;
    background-color: $orange;
    position: absolute;
    left: 50%;
    bottom: 8%;
    transform: translateX(-50%);
    .home-base {
      display: inline-block;
      width: 25%;
      height: 25%;
      position: absolute;
      top: 21%;
      left: 50%;
      transform: translateX(-50%);
      &:before {
        content: '';
        display: inline-block;
        width: 100%;
        height: 70%;
        background-color: #fafbf5;
        position: absolute;
        top: 30%;
        left: 0;
      }
      &:after {
        content: '';
        display: inline-block;
        width: 70%;
        height: 70%;
        background-color: #fafbf5;
        transform: rotate(45deg);
        transform-origin: 0 100%;
        position: absolute;
        top: 29%;
        left: 0;
      }
    }
    .home-batting {
      display: inline-block;
      width: 31%;
      height: 68%;
      background-color: #fafbf5;
      position: absolute;
      top: 12%;
      &:before {
        content: '';
        display: inline-block;
        width: 78%;
        height: 77%;
        position: absolute;
        top: 13%;
        background-color: $orange;
      }
      &-left {
        left: 0;
        &:before {
          left: 0;
        }
      }
      &-right {
        right: 0;
        &:before {
          right: 0;
        }
      }
    }
  }
  .gress-mask {
    height: 20px;
    opacity: 0.1;
    background-color: white;
    margin: 20px 0;
  }
}
@media only screen and (max-width: 760px) {
  // .canvas {
  // 	width: calc(100vw - 20px);
  // 	height: calc(100vw - 20px);
  // 	.gress-mask {
  // 		height: 20px;
  // 		opacity: .1;
  // 		background-color: white;
  // 		margin: 20px 0;
  // 	}
  // }
}
</style>

<script></script>
