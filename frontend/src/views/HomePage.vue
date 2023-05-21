<template>
  <div class="container is-widescreen">
    <section class="hero">
      <div class="hero-body">
        <CircleProgress 
          :percent="percent" 
          :viewport="true" 
          :show-percent="true" 
          />
      </div>
    </section>
  </div>
</template>
<script>
import CircleProgress from "vue3-circle-progress";
import "vue3-circle-progress/dist/circle-progress.css";

export default {
  name: 'HomePage',
  components: {
    CircleProgress: CircleProgress,
  }
}
</script>
