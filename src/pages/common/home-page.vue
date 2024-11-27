<template>
  <main>
    <section id="container"></section>
    <form action="">
      <button @click="start">start</button>
      <button @click="stop">stop</button>
    </form>
  </main>
</template>
<script setup>
import { onMounted } from 'vue';
import SlotMachineGame from 'dmc-slot-machine-game';
import 'dmc-slot-machine-game/css/index.css';
let game;
onMounted(() => {
  game = new SlotMachineGame({
    container: '#container',
    // start: ['banana', 'banana', 'banana', 'banana'],
    start: [0, 0, 0, 0],
    rollerNum: 4,
    stopMode: 'fast',
    // stopMode: 'slow',
    // delay: 0,
    // randomMaxSpeed: false,
    // rollerType: 'image',
    images: [
      {
        id: 'banana',
        width: '50%',
        url: 'https://hm-wx.oss-cn-hangzhou.aliyuncs.com/fruits/banana.png'
      },
      {
        id: 'red-cherry',
        width: '50%',
        url: 'https://hm-wx.oss-cn-hangzhou.aliyuncs.com/fruits/red-cherry.png'
      },
      {
        id: 'lemon',
        width: '50%',
        url: 'https://hm-wx.oss-cn-hangzhou.aliyuncs.com/fruits/lemon.png'
      },
      {
        id: 'orange',
        width: '50%',
        url: 'https://hm-wx.oss-cn-hangzhou.aliyuncs.com/fruits/orange.png'
      },
      {
        id: 'strawberry',
        width: '50%',
        url: 'https://hm-wx.oss-cn-hangzhou.aliyuncs.com/fruits/strawberry.png'
      },
      {
        id: 'watermelon',
        width: '50%',
        url: 'https://hm-wx.oss-cn-hangzhou.aliyuncs.com/fruits/watermelon.png'
      }
    ]
  });
});

function start() {
  game.start();
}
function stop() {
  game.stop([1, 2, 3, 4]);
  // game.stop(['banana', 'red-cherry', 'lemon', 'orange']);
}
</script>

<style>
/* @import '../../style/demo.css'; */
form {
  padding: 20px;
  gap: 10px;
  display: flex;
}
button {
  font-size: 20px;
}
#container {
  background-color: lavender;
  border: 18px solid salmon;
  padding: 10px;
  mask-border: url('https://developer.mozilla.org/zh-CN/docs/Web/CSS/mask-border/mask-border-diamonds.png')
    30 / 36px 18px round;
}
</style>
