<template>
  <div class="count" ref="countRef">
    <div class="view1">
      <div class="title">统计分析</div>
      <div class="card" v-loading="echartsLoading">
        <div class="card_title">总卫生情况</div>
        <div class="wrapper">
          <div
            class="echart echart1"
            style="width: 100px; height: 100px"
            ref="echart1"
          ></div>
        </div>
      </div>
    </div>
    <div class="view2">
      <div class="row1">
        <div class="col1">
          <div class="card">
            <div class="card_title">
              班级卫生情况为优占总次数的比率
              <span
                class="tips"
                style="font-weight: 200; color: gray; margin-left: 0px"
                >(仅显示前五)</span
              >
            </div>

            <div class="wrapper">
              <div
                class="echart echart2"
                style="width: 100px; height: 100px"
                ref="echart2"
              ></div>
            </div>
          </div>
        </div>
        <div class="col2">
          <div class="card">
            <div class="card_title">总体优良差卫生情况占比</div>
            <div class="wrapper">
              <div
                class="echart echart3"
                style="width: 100px; height: 100px"
                ref="echart4"
              ></div>
            </div>
          </div>
        </div>
        <div class="col3">
          <div class="card">
            <div class="card_title">
              班级卫生情况为差占总次数的比率
              <span
                class="tips"
                style="font-weight: 200; color: gray; margin-left: 0px"
                >(仅显示前五)</span
              >
            </div>
            <div class="wrapper">
              <div
                class="echart echart4"
                style="width: 100px; height: 100px"
                ref="echart3"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="row2">
        <div class="card">
          <div class="card_title">负责人考勤情况</div>
          <div class="wrapper">
            <div
              class="echart echart5"
              style="width: 100px; height: 100px"
              ref="echart5"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as echarts from "echarts";
export default {
  data() {
    return {
      echartsLoading: true,
      // 向下滑或向上滑的次数（下滑正数、上滑负数）
      wheelTimes: 0,
    };
  },
  async created() {
    // 初始化信息
    // await this.init();
  },
  async mounted() {
    // 初始化信息
    await this.init();
    // 初始化echarts
    this.initEcharts();
    // 鼠标滚动事件
    document.onmousewheel =  (e)=> {
      // 向上滑时
      if (e.wheelDelta > 0) {
        this.wheelTimes > 0 ? (this.wheelTimes = -1) : this.wheelTimes--;
      }
      // 向下滑时
      else {
        this.wheelTimes < 0 ? (this.wheelTimes = 1) : this.wheelTimes++;
      }
      
      // 当下滑或次数到三次时，页面滚动
      if (this.wheelTimes >= 3) {
        this.$refs.countRef.style.top = "-100%"
      }
      if (this.wheelTimes <= -3) {
        this.$refs.countRef.style.top = "0%"

      }
    };
  },
  destroyed() {
    window.onresize;
  },
  methods: {
    // 初始化信息
    async init() {
      // 获取统计信息
      await axios({
        method: "get",
        url: "/api/count",
        headers: {
          Authorization: window.sessionStorage.getItem("token"),
        },
      }).then((res) => {
        console.log("res", res);
        if (res.data.code == 200) {
          this.echartsLoading = false;

          this.allClassStatus = res.data.data.allClassStatus;
          this.principalStatus = res.data.data.principalStatus;
          this.statusByGoodRate = res.data.data.statusByGoodRate;
          this.statusByBadRate = res.data.data.statusByBadRate;
          this.totalStatus = res.data.data.totalStatus;
          // 根据卫生情况总数进行降序排序
          this.allClassStatus.sort((a, b) => {
            return b.total - a.total;
          });
        }
      });
    },
    initEcharts() {
      // 基于准备好的dom，初始化echarts实例
      // echart1 - 总体卫生情况
      var echart1 = echarts.init(document.getElementsByClassName("echart1")[0]);
      // 绘制图表
      echart1.setOption({
        legend: {},
        tooltip: {},
        dataset: {
          dimensions: [
            "class_name",
            { name: "total", displayName: "总数" },
            { name: "good", displayName: "优" },
            { name: "normal", displayName: "良" },
            { name: "bad", displayName: "差" },
            { name: "no_checked", displayName: "未检查" },
          ],
          source: this.allClassStatus,
        },
        xAxis: { type: "category" },
        yAxis: {},
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: [
          { type: "bar", color: "#546fc6" },
          { type: "bar", color: "#91cd76" },
          { type: "bar", color: "#fac958" },
          { type: "bar", color: "#ef6667" },
          { type: "bar", color: "gray" },
        ],
      });
      // echart2 - 优率排行
      var echart2 = echarts.init(document.getElementsByClassName("echart2")[0]);
      let goodRateNames = [];
      let goodRates = [];
      this.statusByGoodRate.forEach((item) => {
        goodRates.push(item.good_rate);
        goodRateNames.push(item.class_name);
      });
      // 绘制图表
      echart2.setOption({
        xAxis: {
          type: "category",
          data: goodRateNames,
          axisLabel: { interval: 0, width: 70 },
        },
        yAxis: {
          type: "value",
          max: 100,
        },
        series: [
          {
            data: goodRates,
            type: "bar",
            showBackground: true,
            backgroundStyle: {
              color: "rgba(180, 180, 180, 0.2)",
            },
            color: "#91cc75",
          },
        ],
      });
      // echart3 - 总体优良差占比
      console.log("this.totalStatus", this.totalStatus);
      var echart3 = echarts.init(document.getElementsByClassName("echart3")[0]);
      // 绘制图表
      echart3.setOption({
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "5%",
          left: "center",
        },
        series: [
          {
            name: "总体优良差占比",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "40",
                fontWeight: "bold",
                formatter: `{b} {d}%`,
              },
            },
            labelLine: {
              show: false,
            },
            // label: {
            // normal: { show: true, position: "center", },
            // },
            color: ["#91cd76", "#fac958", "#ef6667", "#808080"],
            data: [
              { value: this.totalStatus.total_good, name: "优 " },
              { value: this.totalStatus.total_normal, name: "良 " },
              { value: this.totalStatus.total_bad, name: "差 " },
              { value: this.totalStatus.total_no_checked, name: "未检查 " },
            ],
          },
        ],
      });
      // echart4 - 差率排行
      var echart4 = echarts.init(document.getElementsByClassName("echart4")[0]);
      let badRates = [];
      let badRateNames = [];
      this.statusByBadRate.forEach((item) => {
        badRates.push(item.bad_rate);
        badRateNames.push(item.class_name);
      });
      // 绘制图表
      echart4.setOption({
        xAxis: {
          type: "category",
          data: badRateNames,
          axisLabel: { interval: 0, width: 70 },
        },
        yAxis: {
          type: "value",
          max: 100,
        },
        series: [
          {
            data: badRates,
            type: "bar",
            showBackground: true,
            backgroundStyle: {
              color: "rgba(180, 180, 180, 0.2)",
            },
            color: "#ee6666",
          },
        ],
      });
      // echart5 - 负责人考勤情况
      var echart5 = echarts.init(document.getElementsByClassName("echart5")[0]);
      // 绘制图表
      echart5.setOption({
        legend: {},
        tooltip: {},
        dataset: {
          dimensions: [
            "principal_name",
            { name: "total_status", displayName: "总数" },
            { name: "checked_status", displayName: "已检查" },
            { name: "no_checked_status", displayName: "未检查" },
          ],
          source: this.principalStatus,
        },
        xAxis: { type: "category" },
        yAxis: {},
        series: [
          { type: "bar", color: "#546fc6" },
          { type: "bar", color: "#91cd76" },
          { type: "bar", color: "gray" },
        ],
      });
      // 页面长度宽度改变时echarts自适应
      // window.onresize = echartsAtaption;
      document.addEventListener("onresize", echartsAtaption);
      // echarts自适应
      function echartsAtaption() {
        echartArr.forEach((item) => {
          // echart的dom对象
          let echartElem = document.querySelector(item.cssName);
          // 父对象
          let parentElem = echartElem.parentElement;
          let width = parentElem.offsetWidth;
          let height = parentElem.offsetHeight;
          // 改变宽高
          item.echartObj.resize({ width, height });
        });
      }
      // 要自适应的echart对象数组
      let echartArr = [
        { echartObj: echart1, cssName: ".echart1" },
        { echartObj: echart2, cssName: ".echart2" },
        { echartObj: echart3, cssName: ".echart3" },
        { echartObj: echart4, cssName: ".echart4" },
        { echartObj: echart5, cssName: ".echart5" },
      ];

      // 初始时echarts自适应
      echartsAtaption();
    },
  },
};
</script>

<style scoped>
.count {
  width: 100%;
  height: 100%;
  color: #111;
  position: relative;
  transition: 0.7s cubic-bezier(0, 0, 0.34, 0.99);
  /* overflow: auto; */
}
.count .title {
  font-size: 28px;
  font-weight: 500;
  line-height: 30px;
  padding-left: 17px;
  box-sizing: border-box;
  margin-bottom: 28px;
  margin-top: 10px;
  position: relative;
  position: relative;
}
.count .title::after {
  content: "";
  display: block;
  width: 6px;
  height: 22px;
  background-color: #2e81e1;
  position: absolute;
  top: 6px;
  left: 0px;
}
.view1 {
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.card {
  border-radius: 4px;
  border: 1px solid #ebeef5;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.view1 .card {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.view1 .card .card_title {
  text-align: center;
  line-height: 40px;
  font-size: 25px;
}
.view1 .card .wrapper {
  height: 100%;
  margin-top: 10px;
}

.view2 {
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.view2 .row1 {
  height: 50%;
  margin-bottom: 25px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.view2 .row1 .col1 {
  height: 100%;
  width: 33.3333%;
  margin-right: 25px;
}
.view2 .row1 .col1 .card {
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}
.view2 .row1 .card .card_title {
  line-height: 30px;
  font-size: 18px;
  padding-left: 5px;
}
.view2 .row1 .col2 {
  height: 100%;
  width: 33.3333%;
  margin-right: 25px;
}
.view2 .row1 .col2 .card {
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}
.view2 .row1 .col3 {
  height: 100%;
  width: 33.333%;
}
.view2 .row1 .col3 .card {
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}
.view2 .row2 {
  height: 50%;
}
.view2 .row2 .card {
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}
.view2 .row2 .card .card_title {
  line-height: 30px;
  font-size: 22px;
  text-align: center;
}
.view2 .wrapper {
  height: 100%;
}
</style>