
let sorting = 'time'
//udate the dropdown menu and triggers the change of the svg element
$(function () {
  $("#span_dropdown li a").click(function () {
    $("#span_button").text($(this).text());
    $("#span_button").val($(this).text());
    sorting = $(this).text();
    draw_span();
  });
});

//triggers the initial drawing of the svg
$(function () { draw_span(); });


draw_span = function () {

  //hepler functions to create the tooltip element
  getTooltipContent = function (d) {
    return `<b>${d.actor}</b>
  <br/>
  <b style="color:${d.color.darker()}">${d.genre}</b>
  <br/>
  ${parseInt(d.start)} - ${parseInt(d.end)}
  `
  };
  createTooltip = function (el) {
    el
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("top", 0)
      .style("opacity", 0)
      .style("background", "white")
      .style("border-radius", "5px")
      .style("box-shadow", "0 0 10px rgba(0,0,0,.25)")
      .style("padding", "10px")
      .style("line-height", "1.3")
      .style("font", "11px sans-serif")
  };


  getRect = function (d) {
    const el = d35.select(this);
    const sx = x(d.start);
    const w = x(d.end) - x(d.start);
    const isLabelRight = (sx > width / 2 ? sx + w < width : sx - w > 0);

    el.style("cursor", "pointer")

    el
      .append("rect")
      .attr("x", sx)
      .attr("height", y.bandwidth())
      .attr("width", w)
      .attr("fill", d.color);

    el
      .append("text")
      .text(d.actor)
      .attr("x", isLabelRight ? sx - 5 : sx + w + 5)
      .attr("y", 2.5)
      .attr("fill", "black")
      .style("text-anchor", isLabelRight ? "end" : "start")
      .style("dominant-baseline", "hanging")
      .style("font", "11px sans-serif");
  };

  csv = d35.csv("./data/span.csv").then(function (data) {

    height = 1000
    data.map(d => {
      return {
        ...d,
        start: +d.start,
        end: +d.end
      }
    }).sort((a, b) => parseInt(a.start) - parseInt(b.start));

    const margin = ({ top: 50, right: 30, bottom: 30, left: 30 });
    y = d35.scaleBand()
      .domain(d35.range(data.length))
      .range([0, height - margin.bottom - margin.top])
      .padding(0.2)

    x = d35.scaleLinear()
      .domain([d35.min(data, d => parseInt(d.start)), d35.max(data, d => parseInt(d.end))])
      .range([0, width - margin.left - margin.right])


    let genres = d35.nest().key(d => d.genre).entries(data).map(d => d.key)

    let dataByGenre = d35.nest().key(d => d.genre).entries(data);
    dataByGenre.forEach(s => s.values.sort((a, b) => parseInt(a.start) - parseInt(b.start)));
    console.log(dataByGenre);

    let axisBottom = d35.axisBottom(x)
      .tickPadding(2)

    let axisTop = d35.axisTop(x)
      .tickPadding(2)

    color = d35.scaleOrdinal(d35.schemeSet2).domain(genres)

    let filteredData;

    if (sorting !== "Time") {
      filteredData = [].concat.apply([], dataByGenre.map(d => d.values));
    } else {
      filteredData = data.sort((a, b) => parseInt(a.start) - parseInt(b.start));
    }

    filteredData.forEach(d => d.color = d35.color(color(d.genre)))

    let parent = document.getElementById('span_viz');

    if (!parent.hasChildNodes()) {
      var svg = d35.select("#span_viz").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "auto");

      const g = svg.append("g").attr("transform", (d, i) => `translate(${margin.left} ${margin.top})`);

      const groups = g
        .selectAll("g")
        .data(filteredData)
        .enter()
        .append("g")
        .attr("class", "civ")


      const tooltip = d35.select(document.createElement("div")).call(createTooltip);

      const line = svg.append("line").attr("y1", margin.top - 10).attr("y2", height - margin.bottom).attr("stroke", "rgba(0,0,0,0.2)").style("pointer-events", "none");

      groups.attr("transform", (d, i) => `translate(0 ${y(i)})`)

      groups
        .each(getRect)
        .on("mouseover", function (d) {
          d35.select(this).select("rect").attr("fill", d.color.darker())

          tooltip
            .style("opacity", 1)
            .html(getTooltipContent(d))
        })
        .on("mouseleave", function (d) {
          d35.select(this).select("rect").attr("fill", d.color)
          tooltip.style("opacity", 0)
        })


      svg
        .append("g")
        .attr("transform", (d, i) => `translate(${margin.left} ${margin.top - 10})`)
        .call(axisTop)

      svg
        .append("g")
        .attr("transform", (d, i) => `translate(${margin.left} ${height - margin.bottom})`)
        .call(axisBottom)



      svg.on("mousemove", function (d) {

        let [x, _] = d35.mouse(this);
        y = d35.event.pageY;
        line.attr("transform", `translate(${x} 0)`);
        y -= 120;
        if (x > width / 2) x -= 100;
        tooltip
          .style("left", x + "px")
          .style("top", y + "px")
      })

      parent.appendChild(svg.node());
      parent.appendChild(tooltip.node());
      parent.groups = groups;

    } else {


      const civs = d35.selectAll(".civ")

      civs.data(filteredData, d => d.actor)
        .transition()
        // .delay((d,i)=>i*10)
        .ease(d35.easeCubic)
        .attr("transform", (d, i) => `translate(0 ${y(i)})`)

    }

  });
}
