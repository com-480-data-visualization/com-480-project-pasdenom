var marginSankey = {top: 1, right: 1, bottom: 6, left: 1},
    widthSankey = 1200 - marginSankey.left - marginSankey.right,
    heightSankey = 1000 - marginSankey.top - marginSankey.bottom;

var formatNumber = d35.format(",.0f"),
    format = function(d) { return formatNumber(d) + " movies"; },
    //color = d35.scale.category20();
    color = d35.scaleOrdinal(d35.schemeCategory10);

function addSankey(overlapSources,overlapTargets,parent) {
  var svgSankey = d35.select("#"+parent).append("svg")
      .attr("width", widthSankey + marginSankey.left + marginSankey.right)
      .attr("height", heightSankey + marginSankey.top + marginSankey.bottom)
      .style("display", "block")
      .style("margin", "auto")
    .append("g")
      .attr("transform", "translate(" + marginSankey.left + "," + marginSankey.top + ")");

  var sankey = d35.sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .size([widthSankey, heightSankey])
      .overlapLinksAtSources(overlapSources)
      .overlapLinksAtTargets(overlapTargets);

  var path = sankey.link();

  d35.json("./data/skankey.json").then(function(datas) {

    sankey
        .nodes(datas.nodes)
        .links(datas.links)
        .layout(32);

    var link = svgSankey.append("g").selectAll(".link")
        .data(datas.links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    link.append("title")
        .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

    var node = svgSankey.append("g").selectAll(".node")
        .data(datas.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      //.call(d35.behavior.drag()
        .call(d35.drag()
        //.origin(function(d) { return d; })
        .on("start", function() { this.parentNode.appendChild(this); })
        .on("drag", dragmove));

    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { return d35.rgb(d.color).darker(2); })
      .append("title")
        .text(function(d) { return d.name + "\n" + format(d.value); });

    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
      .filter(function(d) { return d.x < widthSankey / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    function dragmove(d) {
      d35.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(heightSankey - d.dy, d35.event.y))) + ")");
      sankey.relayout();
      link.attr("d", path);
    }
  });
}

addSankey(false,false,"sankey");
