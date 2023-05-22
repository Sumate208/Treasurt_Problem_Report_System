<template>
  <div class="container is-widescreen">
    <section class="hero">
        <div  style="font-size: 40px;"> รายการเเจ้งปัญหาทั้งหมด ({{this.lengthproblem }}) รายการ 
    <select v-model="timeday"> 
      <option disabled value="">เลือกช่วงเวลา</option>
      <option value="todayValue">วันนี้</option>
      <option value="weekValue">สัปดาห์นี้</option>
      <option value="monthValue">เดือนนี้</option>
    </select>
    <div class="sleep">
      <div class="colum">
        <CircleProgress
          :percent="this.x" 
          :viewport="true" 
          :show-percent="true"
          :fill-color = "'#5feb'"
        
          />
          <span style="font-size: 25px;">กำลังดำเนินการ {{this.lengthproblem }} รายการ</span>
        </div>
        <div class="colum">
        <CircleProgress
          :percent="this.y" 
          :viewport="true" 
          :show-percent="true"
          :fill-color = "'#5feb'"
        
          />
          <span style="font-size: 25px;">ระหว่างดำเนินการ {{this.lengthproblem }} รายการ</span>
        </div>
        <div class="colum">
        <CircleProgress
          :percent="this.z" 
          :viewport="true" 
          :show-percent="true"
          :fill-color = "'#5feb'"
        
          />
          <span style="font-size: 25px;">ดำเนินการสำเร็จ {{this.lengthproblem }} รายการ</span>
        </div>
          
        </div>
      </div>
    </section>
    <div style="font-size: 24px;">
    <div  class="table-container"> <!-- เพิ่มคลาส text-center เพื่อจัดให้ตารางอยู่ตรงกลาง -->
      <table class="table is-fullwidth " >
        <thead  >
          <tr >
            <th>ลำดับ</th>
            <th>ชื่อระบบ</th>
            <th>หน่วยงาน</th>
            <th>วันที่ส่งคำร้อง</th>
            <th>สถานะ</th>
          </tr>
          
        </thead>
        <tbody>
          <tr v-for="(value, index) in tomonth.slice(0, 10)" :key="index">
            <td>{{ value.id }}</td>
            <td>{{ value.NameSystem }}</td>
            <td>{{ value.agency }}</td>
            <td>{{ value.date }}</td>
            <td>{{ value.status }}</td>
          </tr>
        </tbody>

      </table>
    </div>
    </div>
  </div>
</template>
<script>
import CircleProgress from "vue3-circle-progress";
import "vue3-circle-progress/dist/circle-progress.css";
import axios from '@/plugins/axios';

export default {
  name: 'HomePage',
  components: {
    CircleProgress: CircleProgress,
  },
  data() {
    return {

      problems: [
        { id: 1, NameSystem: 'เว็บไซต์ของสำนักงานธนารักษ์พื้นที่มุกดาหาร', agency: 'สำนักงานธนารักษ์พื้นที่มุกดาหาร', date: '1/12/2565', status: 'กำลังดำเนินการ' },
        { id: 2, NameSystem: 'เว็บไซต์ของสำนักงานธนารักษ์พื้นที่เลย', agency: 'สำนักงานธนารักษ์พื้นที่เลย', date: '2/02/2565', status: 'ระหว่างดำเนินการ' },
        { id: 3, NameSystem: 'เว็บไซต์ของสำนักงานธนารักษ์พื้นที่เพชรบูรณ์', agency: 'สำนักงานธนารักษ์พื้นที่เพชรบูรณ์', date: '3/03/2565', status: 'ดำเนินการสำเร็จ' },
      ],
      todayproblem : [],
      toweekproblem : [],
      tomonth : [],
      timeday:"todayValue",
      lengthproblem:0
    };
  },
  mounted() {
    this.getproblems();
  },
  methods: {
    getproblems() {
      axios
      .get("/dashboard/problem")
      .then((res) => {
        console.log(res)
          this.todayproblem = res.data.arrDay;
          this.toweekproblem = res.data.arrWeek;
          this.tomonth = res.data.arrMonth;
          console.log(res.data)
      })
      .catch((e) => console.log(e.response.data));
    },
    Todayproblem() {

      console.log(1)
      this.lengthproblem = this.todayproblem.length
      var cancleProblem = this.todayproblem.filter((problem) =>{
        return problem.state = 0
      });
      this.x = (cancleProblem.length/this.todayproblem)*100
      console.log(1)
      var finishProblem = this.todayproblem.filter((problem) =>{
        return problem.state = 7
      });
      this.y = (finishProblem.length/this.todayproblem)*100

      var editProblem = this.todayproblem.filter((problem) =>{
        return problem.state <= 6 && problem.state >= 1
      });
      this.z = (editProblem.length/this.todayproblem)*100
    },
    Toweekproblem() {

      this.lengthproblem = this.toweekproblem.length
      console.log(2)
      var cancleProblem = this.toweekproblem.filter((problem) =>{
        return problem.state = 0

      });
      this.x = (cancleProblem.length/this.toweekproblem)*100

      var finishProblem = this.toweekproblem.filter((problem) =>{
        return problem.state = 7
      });
      this.y = (finishProblem.length/this.toweekproblem)*100

      var editProblem = this.toweekproblem.filter((problem) =>{
        return problem.state <= 6 && problem.state >= 1
      });
      this.z = (editProblem.length/this.toweekproblem)*100
    },
    Tomonthproblem() {

      this.lengthproblem = this.tomonth.length
      var cancleProblem = this.tomonthproblem.filter((problem) =>{
        return problem.state = 0
      });
      this.x = (cancleProblem.length/this.tomonthproblem)*100

      var finishProblem = this.tomonthproblem.filter((problem) =>{
        return problem.state = 7
      });
      this.y = (finishProblem.length/this.tomonthproblem)*100

      var editProblem = this.tomonthproblem.filter((problem) =>{
        return problem.state <= 6 && problem.state >= 1
      });
      this.z = (editProblem.length/this.tomonthproblem)*100
    }
  },
  computed:{
    check(){
      console.log(this.timeday)
    if(this.timeday == "todayValue"){
    return  this.Todayproblem();
    }
    else if(this.timeday == "weekValue"){
      return  this.Toweekproblem();
    }
    else {
      return  this.Tomonthproblem();
    }
  }

}
};
</script>
<style>
.sleep{
  display: flex;
  justify-content: space-evenly;
  padding: auto;
  margin-top: 30px;

}
.progress-circle {
  margin-right: 200px;
  margin-top: 80px;
  font-size: 30px;
}
.progress-text-container {
  position: absolute;
  bottom: -50px;
  font-size: 20px;
}
.table-container {
  display: flex;
  justify-content: flex-start;;
  align-items: center;
  min-height: 800px; /* ปรับความสูงตามความเหมาะสม */
}

.table-bordered {
  border-collapse: collapse;
  font-size: 20px;
}

.table-bordered th,
.table-bordered td {
  border: 2px solid #ddd;
  padding: 8px;
  width: 500px;
  height: 100px;
  font-size: 20px;
}
.container is-widescreen{
  font-size: 50px;
}
select {
    font-size: 30px;
  }

</style>