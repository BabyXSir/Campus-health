<template>
  <div class="date-info" :style="styleObj">
    <div class="date-info__left">{{ time }}</div>
    <div class="date-info__right">
      <div>{{ date }}</div>
      <div>{{ day }}</div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
export default {
  props: {
    styleObj: {
      required: false,
      type: Object,
    },
  },
  data() {
    return {
      time: "",
      date: "",
      day: "",
      timeInterval: null,
    };
  },
  created() {
    const momentNow = moment();
    this.date = momentNow.format("YYYY-MM-DD");
    const dayNameMapping = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    this.day = dayNameMapping[momentNow.format("e")];
    this.updateTime();
  },
  methods: {
    updateTime() {
      const _this = this;
      this.timeInterval = setInterval(function () {
        _this.time = moment().format("HH:mm");
      }, 1000);
    },
  },
};
</script>
<style lang="less" scoped>
.date-info {
  height: 100%;
  font-weight: 200;
  float: right;
  padding-right: 25px;
  & > * {
    display: inline-block;
    vertical-align: middle;
  }
  .date-info__left {
    font-size: 50px;
    margin-right: 5px;
  }
  .date-info__right {
    font-size: 15px;
    line-height: 1.5em;
  }
}
</style>