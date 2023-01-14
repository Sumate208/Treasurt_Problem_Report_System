<template>
  <div class="container pt-4 px-6 pb-6">
    <h1
      class="is-size-3-tablet"
      :class="{ 'has-text-white': this.$parent.$data.darkMode }"
    >
      การแจ้งขอแก้ไขข้อมูลทั้งหมด({{ reports.length }})รายการ
    </h1>

    <!-- Filter -->
    <div class="field has-addons">
      <div class="control full-width">
        <input
          class="input"
          type="text"
          v-model="search"
          placeholder="ค้นหาด้วย ชื่อผู้แจ้ง หรือ ชื่อระบบ"
        />
      </div>
      <div class="control">
        <a
          class="button is-info ml-0 mr-0"
          @click="activeFilter = !activeFilter"
        >
          <font-awesome-icon icon="fa-solid fa-filter" />
        </a>
      </div>
      <div class="control">
        <a class="button is-link ml-0 mr-0" @click="filterReport()"> Search </a>
      </div>
    </div>

    <!-- filter -->
    <div v-show="activeFilter" class="r-filter mb-3 full-width box">
      <!-- หน่วยงาน -->
      <div class="columns">
        <div class="column field line-justify-evenly">
          <label class="radio"
            ><input
              type="radio"
              v-model="agencyType"
              value="สกก"
              name="type"
            />สำนัก/กอง/กลุ่ม</label
          >
          <label class="radio"
            ><input
              type="radio"
              v-model="agencyType"
              value="ธพ"
              name="type"
            />สนง.ธนารักษ์พื้นที่</label
          >
        </div>
        <div class="column">
          <v-select
            class="agencyDropdown"
            v-if="agencyType == 'สกก'"
            placeholder="สังกัดหน่วยงาน(พิมพ์ค้นหาได้)"
            v-model="agency"
            :options="allAgency.skk"
            label="title"
          >
          </v-select>
          <v-select
            class="agencyDropdown"
            v-if="agencyType == 'ธพ'"
            placeholder="สังกัดหน่วยงาน(พิมพ์ค้นหาได้)"
            v-model="agency"
            :options="allAgency.tnp"
            label="title"
          >
          </v-select>
        </div>
      </div>

      <!-- วันที่ -->
      <div class="columns is-tablet">
        <!-- วันเริ่ม -->
        <div class="column">
          <div class="field">
            <div class="control">
              <DatePicker
                class="full-width"
                v-model="startDate"
                :placeholder="'วันเริ่มค้นหา'"
                :lang="'th'"
                :position="'bottom'"
              />
            </div>
          </div>
        </div>
        <span id="dat">-</span>
        <!-- วันสิ้นสุด -->
        <div class="column">
          <div class="field">
            <div class="control">
              <DatePicker
                class="full-width"
                v-model="endDate"
                :placeholder="'วันสิ้นสุดค้นหา'"
                :lang="'th'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- สถานะของ report -->
      <div class="columns is-tablet">
        <div class="column">
          <div class="field">
            <div class="columns is-tablet statusFilter">
              <div
                v-if="
                  this.$parent.$data.user &&
                  !(
                    this.$parent.$data.user.USER_TYPE == 'member' &&
                    this.$parent.$data.user.ROLE == 'พนง.'
                  )
                "
                class="column is-tablet"
              >
                <label class="checkbox">
                  <input type="checkbox" id="a" v-model="status.a" />
                  ต้องดำเนินการ({{ todoReport.length }})
                </label>
              </div>
              <div class="column is-tablet">
                <label class="checkbox">
                  <input type="checkbox" id="s" v-model="status.s" />
                  ดำเนินการสำเร็จ({{ reportCount.s }})
                </label>
              </div>
              <div class="column is-tablet">
                <label class="checkbox">
                  <input type="checkbox" id="w" v-model="status.w" />
                  กำลังดำเนินการ({{ reportCount.w }})
                </label>
              </div>
              <div class="column is-tablet">
                <label class="checkbox">
                  <input type="checkbox" id="c" v-model="status.c" />
                  ไม่ผ่านการอนุมัติ({{ reportCount.c }})
                </label>
              </div>
              <div class="column is-tablet">
                <button class="button is-info" @click="clearFilter()">
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show Report -->
    <section class="full-width shadow">
      <div class="container">
        <div class="b-table has-pagination">
          <div class="table-wrapper has-mobile-cards">
            <table
              class="table is-fullwidth is-striped is-hoverable is-fullwidth"
            >
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อระบบ</th>
                  <th>หน่วยงาน</th>
                  <th>
                    ผู้แจ้ง
                    <a v-if="!nameUp"
                      ><font-awesome-icon
                        icon="fa-solid fa-arrow-down-a-z"
                        @click="sortByName()"
                    /></a>
                    <a v-if="nameUp"
                      ><font-awesome-icon
                        icon="fa-solid fa-arrow-up-z-a"
                        @click="sortByName()"
                    /></a>
                  </th>
                  <th>
                    วันที่แจ้ง
                    <a v-if="!dateUp"
                      ><font-awesome-icon
                        icon="fa-solid fa-arrow-down-1-9"
                        @click="sortByDate()"
                    /></a>
                    <a v-if="dateUp"
                      ><font-awesome-icon
                        icon="fa-solid fa-arrow-up-9-1"
                        @click="sortByDate()"
                    /></a>
                  </th>
                  <th>สถานะ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(report, index) in displayReports.slice(
                    pageNow * 10 - 10,
                    pageNow * 10
                  )"
                  :key="index"
                >
                  <td class="has-text-centered">
                    {{ (pageNow - 1) * 10 + (index + 1) }}
                  </td>
                  <td data-label="ชื่อระบบ">{{ report.SYSTEM_NAME }}</td>
                  <td data-label="หน่วยงาน">{{ report.AGENCY }}</td>
                  <td data-label="ผู้แจ้ง">
                    {{ report.FIRST_NAME + " " + report.LAST_NAME }}
                  </td>
                  <td data-label="วันที่แจ้ง">
                    <small class="has-text-grey is-abbr-like">{{
                      report.WRITE_DATE
                    }}</small>
                  </td>
                  <td data-label="สถานะ" class="is-progress-cell">
                    <div class="status-box">
                      <p>{{ report.STATUS }}</p>
                      <progress
                        max="7"
                        class="progress is-small"
                        :class="progressColor(report.STATE)"
                        :value="report.STATE"
                      ></progress>
                    </div>
                  </td>
                  <td class="is-actions-cell">
                    <button
                      class="button is-small is-primary"
                      type="button"
                      @click="$router.push(`/report/${report.REPORT_ID}`)"
                    >
                      <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="notification">
            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  <div class="buttons has-addons">
                    <button
                      v-for="page in arrTablePage"
                      :key="page"
                      type="button"
                      class="button"
                      :class="{ 'is-active': page == pageNow }"
                      @click="pageNow = page"
                    >
                      {{ page }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <small>Page {{ pageNow }} of {{ arrTablePage.length }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import myJson2 from "@/data/agency2.json";
// import dummy from "@/data/DummyReports.json";

export default {
  name: "ReportView",
  data() {
    return {
      search: "",
      reports: [], // array of report
      todoReport: [], 
      displayReports: [],
      allAgency: myJson2, // json ข้อมูลหน่วยงาน

      // filter
      activeFilter: true,
      agencyType: "สกก",
      agency: null,
      status: {
        a: false,
        s: false,
        w: false,
        c: false,
      },
      startDate: null,
      endDate: null,
      arrTablePage: [],
      pageNow: 1,
      // sort
      nameUp: false,
      dateUp: false,
    };
  },
  mounted() {
    this.isLogin();
  },
  methods: {
    // เช็คว่าล็อกอินหรือยัง
    isLogin() {
      const token = localStorage.getItem("ts-token");
      if (!token) {
        this.$router.push({ path: "/signin" });
      } else {
        this.$parent.$data.isLoading = true;
        this.getReport();
        this.getTodoReport();
        this.$parent.$data.isLoading = false;
      }
    },
    // request หา report ทั้งหมด ไป server (ไฟล์ server/routes/report.js) ที่ get("/report")
    getReport() {
      axios
        .get("/report")
        .then((res) => {
          this.reports = res.data;
          this.displayReports = res.data;
          this.tablePage();
          this.sortByDate();
        })
        .catch((e) => {
          console.log(e.response.data);
        });
    },
    // request หา report ที่ user ต้องดำเนินการ ไป server (ไฟล์ server/routes/report.js) ที่ get("/todo-report")
    getTodoReport() {
      this.$parent.$data.isLoading = true;
      axios
        .get("/todo-report")
        .then((res) => {
          this.todoReport = res.data;
        })
        .catch((e) => {
          console.log(e.response.data);
        });
    },
    // เปลี่ยนสี progress bar
    progressColor(state) {
      if (state == 0) {
        return "is-danger";
      } else if (state == 7) {
        return "is-success";
      } else {
        return "is-warning";
      }
    },
    clearFilter() {
      this.search = "";
      this.agency = null;
      this.startDate = "";
      this.endDate = "";
      this.status = {
        a: false,
        s: false,
        w: false,
        c: false,
      };
    },
    convertDate(date) {
      let result, arrStr, month;
      arrStr = date.toString().split(" ", 4);
      if (arrStr[1] == "Jan") {
        month = "01";
      } else if (arrStr[1] == "Feb") {
        month = "02";
      } else if (arrStr[1] == "Mar") {
        month = "03";
      } else if (arrStr[1] == "Apr") {
        month = "04";
      } else if (arrStr[1] == "May") {
        month = "05";
      } else if (arrStr[1] == "Jun") {
        month = "06";
      } else if (arrStr[1] == "Jul") {
        month = "07";
      } else if (arrStr[1] == "Aug") {
        month = "08";
      } else if (arrStr[1] == "Sep") {
        month = "09";
      } else if (arrStr[1] == "Oct") {
        month = "10";
      } else if (arrStr[1] == "Nov") {
        month = "11";
      } else if (arrStr[1] == "Dec") {
        month = "12";
      } else {
        arrStr[1] = "00";
      }
      result = arrStr[3] + "/" + month + "/" + arrStr[2];
      return result;
    },
    filterReport() {
      this.$parent.$data.isLoading = true;
      var list = this.reports;
      if (this.status.a) {
        list = this.todoReport;
      }
      if (this.status.s || this.status.w || this.status.c) {
        list = list.filter((report) => {
          if (this.status.s && report.STATE == 7) {
            return true;
          } else if (this.status.w && report.STATE > 0 && report.STATE < 7) {
            return true;
          } else if (this.status.c && report.STATE == 0) {
            return true;
          } else {
            return false;
          }
        });
      }
      // Search
      if (this.search != "") {
        list = list.filter((report) => {
          return (
            report.FIRST_NAME.search(this.search) != -1 ||
            report.SYSTEM_NAME.search(this.search) != -1
          );
        });
      }

      // Agency
      if (this.agency != null) {
        list = list.filter((report) => {
          console.log(this.agency.title == report.AGENCY);
          return this.agency.title == report.AGENCY;
        });
      }

      // Start Date
      if (this.startDate != "" && this.startDate != null) {
        const start = this.convertDate(this.startDate);
        list = list.filter((report) => {
          let date =
            report.WRITE_DATE.slice(6, 10) +
            "/" +
            report.WRITE_DATE.slice(3, 5) +
            "/" +
            report.WRITE_DATE.slice(0, 2);
          return date >= start;
        });
      }

      // // End Date
      if (this.endDate != "" && this.endDate != null) {
        const end = this.convertDate(this.endDate);
        list = list.filter((report) => {
          let date =
            report.WRITE_DATE.slice(6, 10) +
            "/" +
            report.WRITE_DATE.slice(3, 5) +
            "/" +
            report.WRITE_DATE.slice(0, 2);
          return date <= end;
        });
      }

      // Status

      this.displayReports = list;

      this.tablePage();
    },
    // แบ่งหน้าแสดง Report ทีละ10
    tablePage() {
      this.arrTablePage = [];
      this.pageNow = 1;
      var maxPage = Math.ceil(this.displayReports.length / 10);
      this.arrTablePage.push(1);
      for (let i = 2; i < maxPage + 1; i++) {
        this.arrTablePage.push(i);
      }
      this.$parent.$data.isLoading = false;
    },
    sortByName() {
      this.displayReports.sort((a, b) => {
        let aName = a.FIRST_NAME + " " + a.LAST_NAME,
          bName = b.FIRST_NAME + " " + b.LAST_NAME;
        if (this.nameUp) {
          if (aName > bName) {
            return 1;
          }
          if (aName < bName) {
            return -1;
          }
        } else if (!this.nameUp) {
          if (aName > bName) {
            return -1;
          }
          if (aName < bName) {
            return 1;
          }
        }
        return 0;
      });
      this.nameUp = !this.nameUp;
    },
    sortByDate() {
      this.displayReports.sort((a, b) => {
        let aDate =
            a.WRITE_DATE.slice(6, 10) +
            "/" +
            a.WRITE_DATE.slice(3, 5) +
            "/" +
            a.WRITE_DATE.slice(0, 2) +
            a.WRITE_DATE.slice(10),
          bDate =
            b.WRITE_DATE.slice(6, 10) +
            "/" +
            b.WRITE_DATE.slice(3, 5) +
            "/" +
            b.WRITE_DATE.slice(0, 2) +
            b.WRITE_DATE.slice(10);
        if (this.dateUp) {
          if (aDate > bDate) {
            return 1;
          }
          if (aDate < bDate) {
            return -1;
          }
        } else if (!this.dateUp) {
          if (aDate > bDate) {
            return -1;
          }
          if (aDate < bDate) {
            return 1;
          }
        }
        return 0;
      });
      this.dateUp = !this.dateUp;
    },
  },
  computed: {
    reportCount() {
      let s = 0,
        w = 0,
        c = 0;
      this.reports.forEach((report) => {
        if (report.STATE == 7) {
          s++;
        } else if (report.STATE == 0) {
          c++;
        } else {
          w++;
        }
      });
      return { s: s, w: w, c: c };
    },
  },
};
</script>

<style>
@import "@/css/bulma-responsive-tables.css";
@import "vue-select/dist/vue-select.css";
/* Modul Style */
.v-calendar {
  width: 100%;
}
.v-calendar .content {
  top: 46px;
}
.v-calendar .input-field input {
  text-align: center;
  width: 100%;
}
.v-calendar .calendar .days .day .number {
  margin-right: 0;
  border-radius: 0;
}
.v-calendar .calendar .days .day {
  margin-right: 0px;
}
.vs--searchable .vs__dropdown-toggle {
  height: 45px;
}
/* ----------- */
.full-width {
  width: 100%;
}
.shadow {
  -webkit-box-shadow: 0px 0px 5px 0px #c7c7c7;
  box-shadow: 0px 0px 5px 0px #c7c7c7;
}
#dat {
  align-self: center;
  font-size: 30px;
}

.report-card:hover {
  cursor: pointer;
}
.table_warp {
  overflow-x: auto;
}
span.icon:hover {
  cursor: pointer;
}
/* filter style */
.statusFilter .column {
  text-align: center;
}

@media screen and (max-width: 768px) {
  tbody tr td .status-box {
    width: 80%;
  }
  #dat {
    display: none;
  }
}
</style>
