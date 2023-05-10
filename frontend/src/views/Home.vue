<template>
  <div class="container is-widescreen">
    <section class="hero">
      <div class="hero-body">
        <PieChart />
      </div>
    </section>
  </div>
</template>
<script>
import PieChart from '../components/CircleProgress.vue'

export default {
  name: 'HomePage',
  components: {
    PieChart
  }
}
</script>
