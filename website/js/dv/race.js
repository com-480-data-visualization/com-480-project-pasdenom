// Feel free to change or delete any of the code you see in this editor!
var svgRace = d35.select("#race_genres_viz").append("svg")
  .attr("width", 960)
  .attr("height", 600);



var tickDuration = 500;

var top_n = 12;
var height = 600;
var width = 960;

const marginRace = {
  top: 80,
  right: 0,
  bottom: 5,
  left: 0
};

let barPadding = (height-(marginRace.bottom+marginRace.top))/(top_n*5);

/*let title = svgRace.append('text')
 .attr('class', 'title')
 .attr('y', 24)
 .html('18 years of Interbrand’s Top Global Brands');*/

let subTitle = svgRace.append("text")
 .attr("class", "subTitle")
 .attr("y", 55)
 .html("Number of movies");

let caption = svgRace.append('text')
 .attr('class', 'caption')
 .attr('x', width)
 .attr('y', height-5)
 .style('text-anchor', 'end')
 .html('Source: Interbrand');

 let year = 1884;
 let ticker;
 let main_function;

//d35.csv('brand_values.csv').then(function(data) {
d35.csv('./data/race_data.csv').then(function(data) {
//if (error) throw error;

   data.forEach(d => {
    d.value = +d.value,
    d.lastValue = +d.lastValue,
    d.value = isNaN(d.value) ? 0 : d.value,
    d.year = +d.year,
    d.colour = d35.hsl(Math.random()*360,0.75,0.75)
  });


 let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
  .sort((a,b) => b.value - a.value)
  .slice(0, top_n);

  yearSlice.forEach((d,i) => d.rank = i);


 let x = d35.scaleLinear()
    .domain([0, d35.max(yearSlice, d => d.value)])
    .range([marginRace.left, width-marginRace.right-65]);

 let y = d35.scaleLinear()
    .domain([top_n, 0])
    .range([height-marginRace.bottom, marginRace.top]);

 let xAxis = d35.axisTop()
    .scale(x)
    .ticks(width > 500 ? 5:2)
    .tickSize(-(height-marginRace.top-marginRace.bottom))
    .tickFormat(d => d35.format(',')(d));

 svgRace.append('g')
   .attr('class', 'axis xAxis')
   .attr('transform', `translate(0, ${marginRace.top})`)
   .call(xAxis)
   .selectAll('.tick line')
   .classed('origin', d => d == 0);

 svgRace.selectAll('rect.bar')
    .data(yearSlice, d => d.name)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', x(0)+1)
    .attr('width', d => x(d.value)-x(0)-1)
    .attr('y', d => y(d.rank)+5)
    .attr('height', y(1)-y(0)-barPadding)
    .style('fill', d => d.colour);

 svgRace.selectAll('text.label')
    .data(yearSlice, d => d.name)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.value)-8)
    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
    .style('text-anchor', 'end')
    .html(d => d.name);

svgRace.selectAll('text.valueLabel')
  .data(yearSlice, d => d.name)
  .enter()
  .append('text')
  .attr('class', 'valueLabel')
  .attr('x', d => x(d.value)+5)
  .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
  .text(d => d35.format(',.0f')(d.lastValue));

let yearText = svgRace.append('text')
  .attr('class', 'yearText')
  .attr('x', width-marginRace.right)
  .attr('y', height-25)
  .style('text-anchor', 'end')
  .html(~~year)
  .call(halo, 10);


  main_function = function(){

    yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
      .sort((a,b) => b.value - a.value)
      .slice(0,top_n);

    yearSlice.forEach((d,i) => d.rank = i);

    //console.log('IntervalYear: ', yearSlice);

    x.domain([0, d35.max(yearSlice, d => d.value)]);

    svgRace.select('.xAxis')
      .transition()
      .duration(tickDuration)
      .ease(d35.easeLinear)
      .call(xAxis);

     let bars = svgRace.selectAll('.bar').data(yearSlice, d => d.name);

     bars
      .enter()
      .append('rect')
      .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
      .attr('x', x(0)+1)
      .attr( 'width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(top_n+1)+5)
      .attr('height', y(1)-y(0)-barPadding)
      .style('fill', d => d.colour)
      .transition()
        .duration(tickDuration)
        .ease(d35.easeLinear)
        .attr('y', d => y(d.rank)+5);

     bars
      .transition()
        .duration(tickDuration)
        .ease(d35.easeLinear)
        .attr('width', d => x(d.value)-x(0)-1)
        .attr('y', d => y(d.rank)+5);

     bars
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d35.easeLinear)
        .attr('width', d => x(d.value)-x(0)-1)
        .attr('y', d => y(top_n+1)+5)
        .remove();

     let labels = svgRace.selectAll('.label')
        .data(yearSlice, d => d.name);

     labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.value)-8)
      .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
      .style('text-anchor', 'end')
      .html(d => d.name)
      .transition()
        .duration(tickDuration)
        .ease(d35.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);


     labels
        .transition()
        .duration(tickDuration)
          .ease(d35.easeLinear)
          .attr('x', d => x(d.value)-8)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

     labels
        .exit()
        .transition()
          .duration(tickDuration)
          .ease(d35.easeLinear)
          .attr('x', d => x(d.value)-8)
          .attr('y', d => y(top_n+1)+5)
          .remove();



     let valueLabels = svgRace.selectAll('.valueLabel').data(yearSlice, d => d.name);

     valueLabels
        .enter()
        .append('text')
        .attr('class', 'valueLabel')
        .attr('x', d => x(d.value)+5)
        .attr('y', d => y(top_n+1)+5)
        .text(d => d35.format(',.0f')(d.lastValue))
        .transition()
          .duration(tickDuration)
          .ease(d35.easeLinear)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

     valueLabels
        .transition()
          .duration(tickDuration)
          .ease(d35.easeLinear)
          .attr('x', d => x(d.value)+5)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
          .tween("text", function(d) {
             let i = d35.interpolateRound(d.lastValue, d.value);
             return function(t) {
               this.textContent = d35.format(',')(i(t));
            };
          });


    valueLabels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d35.easeLinear)
        .attr('x', d => x(d.value)+5)
        .attr('y', d => y(top_n+1)+5)
        .remove();

    yearText.html(~~year);

   if(year == 2019) ticker.stop();
   year += 1
   //year = d35.format('.1f')((+year) + 0.1);
  }

/*let*/ ticker = d35.interval(e => main_function(),tickDuration);

});

const halo = function(text, strokeWidth) {
text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
.style('fill', '#ffffff')
 .style( 'stroke','#ffffff')
 .style('stroke-width', strokeWidth)
 .style('stroke-linejoin', 'round')
 .style('opacity', 1);

}

d35.select('#restart_race').on('click',function(d,i){
    ticker.stop();
    year = 1884;
    ticker = d35.interval(e => main_function(),tickDuration);
  });
