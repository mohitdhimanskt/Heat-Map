
const projectName = 'heat-map';
localStorage.setItem('example_project', 'Heat Map');

var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";


var colorbrewer = {
  RdYlBu: {
    3: ["#fc8d59", "#ffffbf", "#91bfdb"],
    4: ["#d7191c", "#fdae61", "#abd9e9", "#2c7bb6"],
    5: ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
    6: ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"],
    7: ["#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb", "#4575b4"],
    8: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
    9: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
    10: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
    11: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"] },

  RdBu: {
    3: ["#ef8a62", "#f7f7f7", "#67a9cf"],
    4: ["#ca0020", "#f4a582", "#92c5de", "#0571b0"],
    5: ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
    6: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
    7: ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
    8: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
    9: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
    10: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"],
    11: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"] } };




d3.json(url, callback);

function callback(error, data) {
  console.log("data: ", data);

  if (!error) {
    data.monthlyVariance.forEach(function (val) {
      val.month -= 1;
    });
    var section = d3.select("body").
    append("section");

 
    var heading = section.append("heading");
    heading.append("h1").
    attr('id', 'title').
    text("Monthly Global Land-Surface Temperature");
    heading.append("h3").
    attr('id', 'description').
    html(data.monthlyVariance[0].year + " - " + data.monthlyVariance[data.monthlyVariance.length - 1].year + ": base temperature " + data.baseTemperature + "&#8451;");

    var fontSize = 16;
    var width = 5 * Math.ceil(data.monthlyVariance.length / 12); //1500;
    var height = 33 * 12; //400;
    var padding = { left: 9 * fontSize, right: 9 * fontSize, top: 1 * fontSize, bottom: 8 * fontSize };
    var tip = d3.tip().
    attr("class", "d3-tip").
    attr("id", "tooltip").
    html(function (d) {
      return d;
    }).
    direction("n").
    offset([-10, 0]);

    var svg = section.append("svg").
    attr({
      width: width + padding.left + padding.right,
      height: height + padding.top + padding.bottom })
      call(tip);

        
      var yScale = d3.scale.ordinal().
      domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) //months
      .rangeRoundBands([0, height], 0, 0);
      var yAxis = d3.svg.axis().
      scale(yScale).
      tickValues(yScale.domain()).
      tickFormat(function (month) {
        var date = new Date(0);
        date.setUTCMonth(month);
        return d3.time.format.utc("%B")(date);
      }).
      orient("left").
      tickSize(10, 1);

      svg.append("g").
      classed("y-axis", true).
      attr("id", "y-axis").
      attr("transform", "translate(" + padding.left + "," + padding.top + ")").
      call(yAxis).
      append("text").
      text("Months").
      style("text-anchor", "middle").
      attr("transform", "translate(" + -7 * fontSize + "," + height / 2 + ")" + "rotate(-90)");

        //xaxis

    //ordinal scale
    var xScale = d3.scale.ordinal().
    domain(data.monthlyVariance.map(function (val) {return val.year;})).
    rangeRoundBands([0, width], 0, 0);
    var xAxis = d3.svg.axis().
    scale(xScale).
    tickValues(xScale.domain().filter(function (year) {
      //set ticks to years divisible by 10
      return year % 10 === 0;
    })).
    tickFormat(function (year) {
      var date = new Date(0);
      date.setUTCFullYear(year);
      return d3.time.format.utc("%Y")(date);
    }).
    orient("bottom").
    tickSize(10, 1);

    svg.append("g").
    classed("x-axis", true).
    attr("id", "x-axis").
    attr("transform", "translate(" + padding.left + "," + (height + padding.top) + ")").
    call(xAxis).
    append("text").
    text("Years").
    style("text-anchor", "middle").
    attr("transform", "translate(" + width / 2 + "," + 3 * fontSize + ")");
 
  
    var legendColors = colorbrewer.RdYlBu[11].reverse();
    var legendWidth = 400;
    var legendHeight = 300 / legendColors.length;

    var variance = data.monthlyVariance.map(function (val) {
      return val.variance;
    });
    var minTemp = data.baseTemperature + Math.min.apply(null, variance);
    var maxTemp = data.baseTemperature + Math.max.apply(null, variance);
    }

}
   