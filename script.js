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
  var color = ["#2C93E8", "#838690", "#F56C4E", "#A60F2B", "#648C85", "#B3F2C9", "#528C18", "#C3F25C"];

  d3.json("data.json", function(data) {
    var parseTime = d3.timeParse("%Y-%m-%d %H:%M");
    var parseDay = d3.timeParse("%e %b %Y");
    var formatDay = d3.timeFormat("%e %b %Y");
    data.forEach(function(d) {
      commence = parseTime(d.start);
      conclude = parseTime(d.end);
      if (commence.getDay() != conclude.getDay()) {
        // a check here in case they are more than a day apart
        // 2016-11-04 12:00

        midnight = commence.getFullYear() + "-" + commence.getMonth() + "-" + commence.getDay() + " 24:00";
        console.log("midnight is " + midnight);
        d.end = midnight;
        morning = conclude.getFullYear() + "-" + conclude.getMonth() + "-" + conclude.getDay() + " 00:00";
        console.log("morning is " + morning);
        data.push({
          "start": morning,
          "end": d.end
        })
        //we need to remove current object
        //what element in the array is it, read the 'i'
        //use slice to remove that element data.slice(i,1) or soemthing like that
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

    document.getElementById("json").innerHTML = "<h5>data.json</h5>" + "<pre>" + JSON.stringify(data, null, 2) + "</pre>";

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
        // console.log("oh no:")
        // console.log("d.starttime: " + d.starttime); //2
        // console.log("y(d.starttime): " + y(d.starttime)); //293.3333
        // console.log("d.endtime: " + d.endtime); //18
        // console.log("y(d.endtime): " + y(d.endtime)); //80
        // console.log("d.duration: " + d.duration); //16
        // console.log("y(d.duration): " + y(d.duration)); //106.6666
        // console.log("height: " + height); //320
        // console.log("y(16): " + y(16)); //106.6666
        // console.log("y(24): " + y(24)); //0
        // console.log("y(0): " + y(0)); //320
        // console.log("height - y(d.duration): " + (height - y(d.duration))); //320-106.666=213.333
        //  }
        return y(d.endtime);
      })
      .attr("width", 20)
      .attr("height", function(d) {
        return height - y(d.duration);
        // return y(d.starttime);
      })
      .style("fill", function(d, i) {
        return color[i];
      });

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