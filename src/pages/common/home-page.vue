<template>
  <main>
    <section id="container"></section>
    <button @click="start">start</button>
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
    start: ['banana', 'red-cherry', 'lemon', 'orange'],
    // delay: 0,
    // randomMaxSpeed: false,
    rollerType: 'image',
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
  setTimeout(() => {
    // game.stop([1, 2, 3, 4]);
    game.stop(['banana', 'red-cherry', 'lemon', 'orange']);
  }, 6000);
}
</script>
