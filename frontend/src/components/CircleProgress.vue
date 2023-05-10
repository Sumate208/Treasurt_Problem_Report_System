<template>
  <div>
      <VueCircleProgress class="progress-circle"
        v-for="(item, index) in circleProgressData"
        :key="index"
        :progress="item.progress"
        :size="item.size"
        line-cap="round"
        insert-mode="append"
        :thickness="item.thickness"
        :fill="item.fill"
      >
      <div class="progress-text-container">
        <div class="progress-text">
          <p>{{ item.text }}</p>
        </div>
      </div>
    </VueCircleProgress>
  </div>
</template>

<script>
import VueCircleProgress from 'vue2-circle-progress';

export default {
  components: {
    VueCircleProgress
  },
  data() {
    return {
      circleProgressData: [
        {
          progress: 30,
          size: 200,
          thickness: 15,
          fill: {
            gradient: ['#33A1FF'],
          },
          text: 'Progress 1'
        },
        {
          progress: 60,
          size: 200,
          thickness: 15,
          fill: {
            gradient: ['#333BFF'],
          },
          text: 'Progress 2'
        },
        {
          progress: 80,
          size: 200,
          thickness: 15,
          fill: {
            gradient: ['#9133FF'],
            
          },
          text: 'Progress 3'
        }
      ]
    }
  }
}
</script>
<style>
.progress-circle {
  margin-right: 200px;
  margin-top: 80px;
}
.progress-text-container {
  position: absolute;
  bottom: -50px;
}
</style>
