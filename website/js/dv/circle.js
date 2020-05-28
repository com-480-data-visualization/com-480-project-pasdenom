(function() {
  packages = {

    // Lazily construct the package hierarchy from class names.
    root: function(casting) {
      var node_set = new Set()
      var map = {};
      map["root"] = {name : "root", children: []}

      function groupBy(list, keyGetter) {
          const map = new Map();
          list.forEach((item) => {
               const key = keyGetter(item);
               const collection = map.get(key);
               if (!collection) {
                   map.set(key, [item]);
               } else {
                   collection.push(item);
               }
          });
          return map;
      }

      added_elmt = new Set()

      casting.forEach((director, i) => {
        if (director.type == "cast"){
          if (!added_elmt.has(director.key)){
            added_elmt.add(director.key)
            node_set.add({"name" : director.director_name, "key" : director.key})
          }


          director.cast.forEach((actor, i) => {
            if (!added_elmt.has(actor.key)){
              node_set.add({"name" : actor.actor_name, "key" : actor.key})
              added_elmt.add(actor.key)
            }

          });
        }
      });

      node_set = Array.from(node_set).sort((n1,n2) => n1.name > n2.name)

      grouped_node = groupBy(node_set, node => node.name.charAt(0))

      grouped_node.forEach((nodes, letter) => {
        letter_node = {name : letter, key : -1, children : [], parent : map["root"]}
        map["root"].children.push(letter_node)
        nodes.forEach((n, i) => {
          new_node = {name : n.name, key : n.key, parent : letter_node}
          letter_node.children.push(new_node)
        });
      });

      return map["root"]

    },

    // Return a list of imports for the given array of nodes.
    imports: function(casting, cluster) {
      imports = [];

      map = {}
      cluster.forEach((item, i) => {
        if(item.depth == 2){
          map[item.key] = item
        }
      });

      casting.forEach((director, i) => {
        if (director.type == "cast"){
          director.cast.forEach((actor, i) => {
            imports.push({type : "", source: map[director.key], target: map[actor.key]});
          });
        }else if(director.type == "a2a"){
          imports.push({type : "sublink", source: map[director.source], target: map[director.target]});
        }

      });

      return imports
    }

  };
})();

//------------------------------------------------------------

$(document).ready(function() {
  var w = 1100,
      h = 1000,
      rx = w / 2,
      ry = h / 2,
      m0,
      rotate = 0;

  var splines = [];

  var cluster = d3.layout.cluster()
      .size([360, ry - 120])
      .sort(function(a, b) { return d3.ascending(a.key, b.key); });

  var bundle = d3.layout.bundle();

  var line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.85)
      .radius(function(d) { return d.y; })
      .angle(function(d) { return d.x / 180 * Math.PI; });

  // Chrome 15 bug: <http://code.google.com/p/chromium/issues/detail?id=98951>
  var div = d3.select("#working_who_viz").insert("div", "h2")
      .style("top", "-80px")
      .style("left", "-160px")
      .style("width", w + "px")
      .style("height", h + "px")
      .style("display", "block")
      .style("margin", "auto")
      .style("-webkit-backface-visibility", "hidden");

  var svgCircle = div.append("svg:svg")
      .attr("width", w)
      .attr("height", w)
    .append("svg:g")
      .attr("transform", "translate(" + rx + "," + ry + ")");

  svgCircle.append("svg:path")
      .attr("class", "arc")
      .attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
      .on("mousedown", mousedown);

  d3.json("./data/casting.json", function(casting) {

    var nodes = cluster.nodes(packages.root(casting))
    var links = packages.imports(casting, nodes)
    var splines = bundle(links);




    var path = svgCircle.selectAll("path.link")
        .data(links)
      .enter().append("svg:path")
        .attr("class", function(d) { return "link " + d.type + " source-" + d.source.key + " target-" + d.target.key; })
        .attr("d", function(d, i) { return line(splines[i]); });


    svgCircle.selectAll("g.node")
        .data(nodes.filter(function(n) { return !n.children; }))
      .enter().append("svg:g")
        .attr("class", "node")
        .attr("id", function(d) { return "node-" + d.key; })
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
      .append("svg:text")
        .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
        .text(function(d) { return d.name; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    d3.select("input[type=range]").on("change", function() {
      line.tension(this.value / 100);
      path.attr("d", function(d, i) { return line(splines[i]); });
    });
  });

  d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);

  function mouse(e) {
    return [e.pageX - rx, e.pageY - ry];
  }

  function mousedown() {
    m0 = mouse(d3.event);
    d3.event.preventDefault();
  }

  function mousemove() {
    if (m0) {
      var m1 = mouse(d3.event),
          dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
      div.style("-webkit-transform", "translateY(" + (ry - rx) + "px)rotateZ(" + dm + "deg)translateY(" + (rx - ry) + "px)");
    }
  }

  function mouseup() {
    if (m0) {
      var m1 = mouse(d3.event),
          dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

      rotate += dm;
      if (rotate > 360) rotate -= 360;
      else if (rotate < 0) rotate += 360;
      m0 = null;

      div.style("-webkit-transform", null);

      svg
          .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
        .selectAll("g.node text")
          .attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
          .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
          .attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
    }
  }

  function mouseover(d) {
    svgCircle.selectAll("path.link.target-" + d.key)
        .classed("target", true)
        .each(updateNodes("source", true));

    svgCircle.selectAll("path.link.source-" + d.key)
        .classed("source", true)
        .each(updateNodes("target", true));
  }

  function mouseout(d) {
    svgCircle.selectAll("path.link.source-" + d.key)
        .classed("source", false)
        .each(updateNodes("target", false));

    svgCircle.selectAll("path.link.target-" + d.key)
        .classed("target", false)
        .each(updateNodes("source", false));
  }

  function updateNodes(name, value) {
    return function(d) {
      if (value) this.parentNode.appendChild(this);
      svgCircle.select("#node-" + d[name].key).classed(name, value);
    };
  }

  function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

});
