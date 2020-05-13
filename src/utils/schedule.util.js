const parser = require('cron-parser');
function scheduleList(schedule, load_date, callback) {
  let fromDate = new Date(load_date);
  fromDate.setHours(0, 0, 0, 0);
  let toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate() + 1);
  let timeslots = [];
  const options = {
    currentDate: fromDate,
    endDate: toDate,
    iterator: true
  };
  try {
    var interval = parser.parseExpression(schedule, options);
    while (true) {
      try {
        let obj = interval.next();
        let timeslot = obj.value.toDate();
        timeslots.push(timeslot);
      } catch (e) {
        break;
      }
    }
  } catch (err) {
    console.log('Error: ' + err.message);
  }
  return timeslots;
}

module.exports = scheduleList;