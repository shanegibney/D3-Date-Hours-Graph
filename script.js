main();

function main() {
  var svg = d3.select("svg"),
    margin = {
      top: 20,
      right: 60,
      bottom: 60,
      left: 40
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  d3.json("data.json", function(data) {
    var parseTime = d3.timeParse("%Y-%m-%d %H:%M");
    var parseDay = d3.timeParse("%e %b %Y");
    var formatDay = d3.timeFormat("%e %b %Y");
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.end = parseTime(d.end);
        d.duration = ((d.end - d.date) / (60 * 1000) / 60); // session duration in minutes
        d.starttime = d.date.getHours();
        d.endtime = d.end.getHours();
        // d.day = d3.timeDay(d.date);
        d.daily = formatDay(d.date);
        d.day = parseDay(d.daily);
        // console.log("d.day = " + d.day);

        // var formatMonth = d3.timeFormat("%B"),
        // formatDay = d3.timeFormat("%A"),
        // date = new Date(2014, 4, 1); // Thu May 01 2014 00:00:00 GMT-0700 (PDT)
        // %e %b
        // formatMonth(date); // "May"
        // formatDay(date); // "Thursday"

        return d;
      },
      function(error, data) {
        if (error) throw error;
      });

    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) {
        return d.day; //need to round to day
      }))
      .range([0, width]);

    var y = d3.scaleLinear()
      .domain([0, 24])
      .range([height, 0]);

    var group = svg.append("g");

    group.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .style("fill", "blue")
      .attr("class", "bar")
      .attr("transform", "translate(80,0)")
      .attr("x", function(d) {
        return x(d.day);
      })
      .attr("y", function(d) {
        return y(d.endtime);
      })
      .attr("width", 20)
      .attr("height", function(d) {
        return height - y(d.duration);
      })

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(80," + (height + 2) + ")")
      .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%e %b %Y")))
      // axis.ticks(d3.timeMinute.every(15));
      // .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-35)");

    svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(80,0)")
      .call(d3.axisLeft(y).ticks(24))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("duration (hours)");
  });
}