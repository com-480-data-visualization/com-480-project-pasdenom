let selectGenre = "Comedy"

//udate the dropdown menu and triggers the change of the svg element
$(function () {
    $("#actor_dropdown li a").click(function () {
        $("#actor_button").text($(this).text());
        $("#actor_button").val($(this).text());
        selectGenre = $(this).text();
        actor_race_ticker.stop();
        choose_actor_race();
    });
});

//triggers the initial drawing of the svg
$(function () { choose_actor_race(); });

let actor_race_ticker;
let draw_actor_race;

choose_actor_race = function () {

    let viz = document.getElementById("actors_race_viz");
    if(viz.hasChildNodes()){
        viz.removeChild(viz.firstChild);
    }

    var actortickDuration = 500;

    var svgRaceActors = d35.select("#actors_race_viz").append("svg")
    .attr("width", 1100)
    .attr("height", 600)
    .style("display", "block")
    .style("margin", "auto");

    d35.csv('./data/career_race_' + selectGenre + '.csv').then(function (data) {
        //if (error) throw error;
        var top_n = 6;
        let year = 1910;
        height = 600

        actortickDuration = 500;

        let subTitle = svgRaceActors.append("text")
            .attr("class", "subTitle")
            .attr("y", 25)
            .html("Number of movies in last 10 years");

        let caption = svgRaceActors.append('text')
            .attr('class', 'caption')
            .attr('x', width)
            .attr('y', height - 5)
            .style('text-anchor', 'end')
            .html('Source: Interbrand');

        const marginRace = {
            top: 50,
            right: 0,
            bottom: 5,
            left: 0
        };
        let barPadding = (height - (marginRace.bottom + marginRace.top)) / (top_n * 5);
        data.forEach(d => {
            d.value = +d.value,
                d.lastValue = +d.lastValue,
                d.value = isNaN(d.value) ? 0 : d.value,
                d.year = +d.year,
                d.colour = d35.hsl(Math.random() * 360, 0.75, 0.75)
        });


        let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
            .sort((a, b) => b.value - a.value)
            .slice(0, top_n);

        yearSlice.forEach((d, i) => d.rank = i);


        let x = d35.scaleLinear()
            .domain([0, d35.max(yearSlice, d => d.value)])
            .range([marginRace.left, width - marginRace.right - 65]);

        let y = d35.scaleLinear()
            .domain([top_n, 0])
            .range([height - marginRace.bottom, marginRace.top]);

        let xAxis = d35.axisTop()
            .scale(x)
            .ticks(width > 500 ? 5 : 2)
            .tickSize(-(height - marginRace.top - marginRace.bottom))
            .tickFormat(d => d35.format(',')(d));

        svgRaceActors.append('g')
            .attr('class', 'axis xAxis')
            .attr('transform', `translate(0, ${marginRace.top})`)
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);

        svgRaceActors.selectAll('rect.bar')
            .data(yearSlice, d => d.name)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', x(0) + 1)
            .attr('width', d => x(d.value) - x(0) - 1)
            .attr('y', d => y(d.rank) + 5)
            .attr('height', y(1) - y(0) - barPadding)
            .style('fill', d => d.colour);

        svgRaceActors.selectAll('text.label')
            .data(yearSlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.value) - 8)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
            .style('text-anchor', 'end')
            .html(d => d.name);

        svgRaceActors.selectAll('text.valueLabel')
            .data(yearSlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', d => x(d.value) + 5)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
            .text(d => d35.format(',.0f')(d.lastValue));

        let yearText = svgRaceActors.append('text')
            .attr('class', 'yearText')
            .attr('x', width - marginRace.right)
            .attr('y', height - 25)
            .style('text-anchor', 'end')
            .html(~~year)
            .call(halo, 10);

        draw_actor_race = function () {

            yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
                .sort((a, b) => b.value - a.value)
                .slice(0, top_n);

            yearSlice.forEach((d, i) => d.rank = i);


            x.domain([0, d35.max(yearSlice, d => d.value)]);

            svgRaceActors.select('.xAxis')
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .call(xAxis);

            let bars = svgRaceActors.selectAll('.bar').data(yearSlice, d => d.name);

            bars
                .enter()
                .append('rect')
                .attr('class', d => `bar ${d.name.replace(/\s/g, '_')}`)
                .attr('x', x(0) + 1)
                .attr('width', d => x(d.value) - x(0) - 1)
                .attr('y', d => y(top_n + 1) + 5)
                .attr('height', y(1) - y(0) - barPadding)
                .style('fill', d => d.colour)
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('y', d => y(d.rank) + 5);

            bars
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('width', d => x(d.value) - x(0) - 1)
                .attr('y', d => y(d.rank) + 5);

            bars
                .exit()
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('width', d => x(d.value) - x(0) - 1)
                .attr('y', d => y(top_n + 1) + 5)
                .remove();

            let labels = svgRaceActors.selectAll('.label')
                .data(yearSlice, d => d.name);

            labels
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', d => x(d.value) - 8)
                .attr('y', d => y(top_n + 1) + 5 + ((y(1) - y(0)) / 2))
                .style('text-anchor', 'end')
                .html(d => d.name)
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);


            labels
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('x', d => x(d.value) - 8)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);

            labels
                .exit()
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('x', d => x(d.value) - 8)
                .attr('y', d => y(top_n + 1) + 5)
                .remove();



            let valueLabels = svgRaceActors.selectAll('.valueLabel').data(yearSlice, d => d.name);

            valueLabels
                .enter()
                .append('text')
                .attr('class', 'valueLabel')
                .attr('x', d => x(d.value) + 5)
                .attr('y', d => y(top_n + 1) + 5)
                .text(d => d35.format(',.0f')(d.lastValue))
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);

            valueLabels
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('x', d => x(d.value) + 5)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
                .tween("text", function (d) {
                    let i = d35.interpolateRound(d.lastValue, d.value);
                    return function (t) {
                        this.textContent = d35.format(',')(i(t));
                    };
                });


            valueLabels
                .exit()
                .transition()
                .duration(actortickDuration)
                .ease(d35.easeLinear)
                .attr('x', d => x(d.value) + 5)
                .attr('y', d => y(top_n + 1) + 5)
                .remove();

            yearText.html(~~year);

            if (year >= 2018) actor_race_ticker.stop();
            year += 1
            //year = d35.format('.1f')((+year) + 0.1);
        };

/*let*/ actor_race_ticker = d35.interval(e => draw_actor_race(), actortickDuration);

    });
}
