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
      d.commence = parseTime(d.start);
      d.conclude = parseTime(d.end);
      if (d.commence.getDay() != d.conclude.getDay()) {
        // a check here in case they are more than a day apart
        midnight = d.commence.getFullYear() + "-" + d.commence.getMonth() + "-" + d.commence.getDay() + " 24:00";
        morning = d.conclude.getFullYear() + "-" + d.conclude.getMonth() + "-" + d.conclude.getDay() + " 00:00";
        data.push({
          "start": d.start,
          "end": midnight
        }, {
          "start": morning,
          "end": d.end
        })
      }
    });
    console.log(JSON.stringify(data, null, 2));

    data.forEach(function(d) {
        d.start = parseTime(d.start);
        d.end = parseTime(d.end);
        d.duration = ((d.end - d.start) / (60 * 1000) / 60); // session duration in hours
        d.starttime = d.start.getHours();
        d.endtime = d.end.getHours();
        d.daily = formatDay(d.start);
        d.day = parseDay(d.daily);

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
        return x(d.day) + 10;
      })
      .attr("y", function(d) {
        //if ((d.endtime + d.duration) > 24) {
        console.log("oh no:")
        console.log("d.starttime: " + d.starttime); //2
        console.log("y(d.starttime): " + y(d.starttime)); //293.3333
        console.log("d.endtime: " + d.endtime); //18
        console.log("y(d.endtime): " + y(d.endtime)); //80
        console.log("d.duration: " + d.duration); //16
        console.log("y(d.duration): " + y(d.duration)); //106.6666
        console.log("height: " + height); //320
        console.log("y(16): " + y(16)); //106.6666
        console.log("y(24): " + y(24)); //0
        console.log("y(0): " + y(0)); //320
        console.log("height - y(d.duration): " + (height - y(d.duration))); //320-106.666=213.333
        //  }
        return y(d.endtime);
      })
      .attr("width", 20)
      .attr("height", function(d) {
        return height - y(d.duration);
        // return y(d.starttime);
      })

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(100," + (height + 2) + ")")
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