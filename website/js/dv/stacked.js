
    // set the dimensions and margins of the graph
    var margin = {top: 60, right: 0, bottom: 50, left: 0},
        width = 1100 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // append the svgStacked object to the body of the page
    var svgStacked = d35.select("#stacked_genres_viz")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("display", "block")
        .style("margin", "auto")
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    //d35.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv", function(data) {
    //d35.csv("http://127.0.0.1:3000/data/data_area_stacked.csv").then(function(data) {
    d35.csv("./data/data_area_stacked.csv").then(function(data) {
    //d35.csv("data_area_stacked_5years.csv", function(data) {


      //////////
      // GENERAL //
      //////////

      // List of groups = header of the csv files
      var keys = data.columns.slice(1)

      // color palette
      var color = d35.scaleOrdinal()
        .domain(keys)
        .range(d35.schemeSet2);

      //stack the data?
      var stackedData = d35.stack()
        .keys(keys)
        (data)



      //////////
      // AXIS //
      //////////

      // Add X axis
      var x = d35.scaleLinear()
        .domain(d35.extent(data, function(d) { return d.year; }))
        .range([ 0, width ]);
      var xAxis = svgStacked.append("g")
        //.attr("transform", "translate(0," + height + ")")
        .attr("transform", "translate(0," + height + ")")
        .call(d35.axisBottom(x).ticks(5))

      // Add X axis label:
      svgStacked.append("text")
          .attr("text-anchor", "end")
          .attr("x", width)
          .attr("y", height+40 )
          .text("Time (year)");

      // Add Y axis label:
      svgStacked.append("text")
          .attr("text-anchor", "end")
          .attr("x", 0)
          .attr("y", -20 )
          .text("Number of movies per genre")
          .attr("text-anchor", "start")

      // Add Y axis
      var y = d35.scaleLinear()
        .domain([0, 4000])
        .range([ height, 0 ]);
      svgStacked.append("g")
        .call(d35.axisLeft(y).ticks(5))



      //////////
      // BRUSHING AND CHART //
      //////////

      // Add a clipPath: everything out of this area won't be drawn.
      var clip = svgStacked.append("defs").append("svgStacked:clipPath")
          .attr("id", "clip")
          .append("svgStacked:rect")
          .attr("width", width )
          .attr("height", height )
          .attr("x", 0)
          .attr("y", 0);

      // Add brushing
      var brush = d35.brushX()                 // Add the brush feature using the d35.brush function
          .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
          .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

      // Create the scatter variable: where both the circles and the brush take place
      var areaChart = svgStacked.append('g')
        .attr("clip-path", "url(#clip)")

      // Area generator
      var area = d35.area()
        .x(function(d) { return x(d.data.year); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

      // Show the areas
      areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
          .attr("class", function(d) { return "myArea " + d.key })
          .style("fill", function(d) { return color(d.key); })
          .attr("d", area)

      // Add the brushing
      areaChart
        .append("g")
          .attr("class", "brush")
          .call(brush);

      var idleTimeout
      function idled() { idleTimeout = null; }

      // A function that update the chart for given boundaries
      function updateChart() {

        extent = d35.event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          x.domain(d35.extent(data, function(d) { return d.year; }))
        }else{
          x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
          areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d35.axisBottom(x).ticks(5))
        areaChart
          .selectAll("path")
          .transition().duration(1000)
          .attr("d", area)
        }



        //////////
        // HIGHLIGHT GROUP //
        //////////

        // What to do when one group is hovered
        var highlight = function(d){
          // reduce opacity of all groups
          d35.selectAll(".myArea").style("opacity", .1)
          // expect the one that is hovered
          d35.select("."+d).style("opacity", 1)
        }

        // And when it is not hovered anymore
        var noHighlight = function(d){
          d35.selectAll(".myArea").style("opacity", 1)
        }



        //////////
        // LEGEND //
        //////////

        // Add one dot in the legend for each name.
        var size = 20
        svgStacked.selectAll("myrect")
          .data(keys)
          .enter()
          .append("rect")
            .attr("x", 0)
            .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d){ return color(d)})
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        // Add one dot in the legend for each name.
        svgStacked.selectAll("mylabels")
          .data(keys)
          .enter()
          .append("text")
            .attr("x", 0 + size*1.2)
            .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

    })
