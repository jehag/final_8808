import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Margin } from 'src/app/interfaces/margin';
import { legendColor } from 'd3-svg-legend';
import { QuestionData } from 'src/app/interfaces/question-data';
import { MapDataSetup } from 'src/app/interfaces/map-data-setup';

@Injectable({
  providedIn: 'root'
})
export class VizService {

  constructor() { }

  /**
 * Generates the SVG element g which will contain the graph base.
 *
 * @param {Margin} Margin The margin of the page
 * @param {string} graphClass The name of the class of the graph
 * @returns {*} The d3 Selection for the created g element
 */
  generateG (margin: Margin, graphClass: string) {
    return d3.select(graphClass)
      .select('svg')
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
  }

  /**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 * @param {string} graphId The name of the Id of the graph
 */
  setCanvasSize (width: number, height: number, graphId: string) {
    d3.select(graphId)
      .attr('width', width)
      .attr('height', height)
  }

  /**
 * Appends SVG g elements which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
  appendAxes (g: any) {
    g.append('g')
      .attr('class', 'x axis')
      .style('transform', 'translate(10px, 380px)')
  
    g.append('g')
      .attr('class', 'y axis')
      .style('transform', 'translate(10px, 0px)')
  }

  /**
 * Appends the labels for the x axis
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
  appendGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'x axis-text')
      .attr('font-size', 12)
  }

  /**
 * Places the graph's title.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {string} title The name of the graph
 * @param {number} width The width of the graph
 */
  placeTitle (g: any, title: string, width: number) {
    if(title.length > 60){

      let words: string[] = title.split(' ');
      let i: number = 0;
      let j: number = -75;
      while(i <= words.length - 1){
        let line: string = words[i];
        i++;
        while(line.length < 60 && i <= words.length - 1){
          line = line + ' ' + words[i];
          i++;
        }

        if(words[i] && words[i].match(/[.,:!?]/)){
          line += words[i];
          i++;
        }

        g.append('text')
        .attr('class', 'title')
        .attr('x', 0)
        .attr('y', j)
        .attr('font-size', '20px')
        .attr('text-anchor', 'left')
        .attr('margin-top', '20px')
        .text(line)
        j = j + 20;
      }
    } else {
      g.append('text')
      .attr('class', 'title')
      .attr('x', 0)
      .attr('y', -40)
      .attr('font-size', '20px')
      .attr('text-anchor', 'left')
      .attr('margin-top', '20px')
      .text(title)
    }
  }

  /**
 * Positions the x axis label and y axis label.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
  positionLabels (g: any, width: number, height: number) {
    g.selectAll('.y.axis-text')
      .attr('transform', 'translate( -50 ,' + height / 2 + '), rotate(-90)')
  
    g.selectAll('.x.axis-text')
      .attr('transform', 'translate(' + width / 2 + ',' + (height + 50) + ')')
  }

/**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graph
 */
  drawXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
      .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)
  }

  /**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
  drawYAxis (yScale: any) {
    const maxLineLength = 35;
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any);
    d3.select('.y.axis').selectAll('.tick').select('text').text(function(d: any) {
      if(d.length <= maxLineLength){
        return d;
      } else {
        const splitLabel = d.split(' ');
        let labelStart: string = '';
        let i: number = 0;
        while(splitLabel[i] && labelStart.length + splitLabel[i].length < maxLineLength){
          labelStart += ' ' + splitLabel[i];
          i++;
        }
        return labelStart;
      }
    }).each(function(d: any, i: any, nodes: any) {
      if(d.length > maxLineLength){
        let words: string[] = d.split(' ');
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while(labelStart.length + words[currentWordIndex].length < maxLineLength){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        let j: number = 12;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && line.length + words[currentWordIndex].length < maxLineLength && currentWordIndex <= words.length - 1){
            line = line + ' ' + words[currentWordIndex];
            currentWordIndex++;
          }
          
          if(words[currentWordIndex] && words[currentWordIndex].match(/[.,:!?]/)){
            line += words[currentWordIndex];
            currentWordIndex++;
          }
          d3.select(nodes[i].parentNode)
          .append("text")
          .text(function() {
            return line;
          })
          .attr('fill', 'black')
          .attr('y', j)
          .attr('x', -9)
          .attr('dy', '0.32em')
          j = j + 12;
        }
        const lines: number = (j/12);
        let currentLineHeight: number = -(((lines-1)/2)*12) - 12;
        d3.select(nodes[i].parentNode).selectAll('text').attr('y', function() {
          currentLineHeight += 12;
          return currentLineHeight;
        })
      }
    })
  }

  /**
 * Draws the legend for the phone
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph, used to place the legend
 * @param {*} colorScale The color scale to use
 */
  drawLegend (g: any, width: number, colorScale: any) {
    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width + 30) + ', 200)')
  
    var legendOrdinal = legendColor()
      .shape('path', d3.symbol().type(d3.symbolCircle).size(300)()!)
      .shapePadding(2)
      .scale(colorScale);
    
  
    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
  }

  /**
 * Displays the bars for the phone graph
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} data The data to be displayed
 * @param {*} xScale The scale to use to draw on the x axis
 * @param {*} yScale The scale to use to draw on the y axis
 * @param {*} userChoice The user's choice
 */
  drawBars(g:any, data: QuestionData[], xScale:any, yScale:any, userChoice: string) {
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d: QuestionData) { return yScale(d.label); })
      .attr('x', '10px')
      .style('fill', function (d: QuestionData) { return d.label == userChoice? 'orange': 'green'; })
      .attr("width", function(d: QuestionData) { return xScale(d.value); })
      .attr("height", yScale.bandwidth());
  }

  /**
 * Deletes the graph
 *
 * @param {string} graphId The id of the graph
 */
  deleteGraph(graphId: string){
    const g = d3.select(graphId).selectAll('*').remove();
    g.remove();
  }

  /**
 * Displays the bars for the wall graph
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} data The data to be displayed
 * @param {*} xScale The scale to use to draw on the x axis
 * @param {*} yScale The scale to use to draw on the y axis
 * @param {string[]} colors The colors to be used for the bars
 * @param {string []} groupLabels All the labels of the groups
 */
  drawWallBars(g:any, data: any, xScale:any, yScale:any, colors: string[], groupLabels: string[]){
    let currentGroup = 0;
    var groups = g
      .selectAll("g.bars")
      .data(data)
      .enter().append("g")
      .attr("class", "bars")
      .style("fill", function(d: any, i: any) { return colors[i]; })
      .style("stroke", "#000");
    
    groups.selectAll("rect")
      .data(function(d: any) { return d; })
      .enter()
      .append("rect")
      .attr("x", function(d: any) { return xScale(Math.round(d[0])) + 10; })
      .attr("y", function(d: any) { return yScale(d.data.label); })
      .attr("height", yScale.bandwidth())
      .attr("width", function(d: any) { return xScale(Math.round(d[1])) - xScale(Math.round(d[0]));})
      .each(function(d: any, i: any, nodes: any) {
        if(Math.round(d.data[groupLabels[currentGroup]]) >= 3){
          d3.select(nodes[i].parentNode)
          .append("text")
          .text(function() {
            return Math.round(d.data[groupLabels[currentGroup]]) + "%"
          })
          .attr("x", (xScale(d[0]) + (xScale(d[1]) - xScale(d[0])) / 2) + 10)
          .attr("y", yScale(d.data.label) + yScale.bandwidth() / 2)
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .attr('fill', 'black')
        }
        if(i == data[0].length - 1){
          currentGroup++;
        }
      });

  }

  /**
 * Stacks the data to make a stacked bar chart
 *
 * @param {*} data The street data to be displayed
 * @param {string []} keys All the keys to be stacked
 */
  stackData(data: any[], keys: string[]) {
    return d3.stack().keys(keys)(data);
  }

  /**
 * Draws the map base of Canada. Each province should display a color based it's most popular answer
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} data The Canada data
 * @param {*} path The path associated with the current projection
 * @param {*} colorScale The scale to use to add colors to the map
 * @param {MapDataSetup[]} provinceAnswers The data to be displayed
 */
mapBackground (g:any, data: any, path: any, colorScale: any, provinceAnswers: MapDataSetup[]) {
    g.append('g')
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', function(d: any){ 
      const province = provinceAnswers.find((province) => {
        return province.province == d.properties.name;
      })
      return colorScale(province!.answer)})
    .style('stroke', 'black')
  }

  /**
 * Sets up the projection to be used.
 *
 * @returns {*} The projection to use to trace the map elements
 */
  getProjection (data: any, width: number, height:number) {
    return d3.geoAzimuthalEquidistant()
      .fitSize([width, height], data)
      .rotate([90, 0])
      .translate([(width/2) - 290, height + height/2 + 50])
  }
  
  /**
 * Sets up the path to be used.
 *
 * @param {*} projection The projection used to trace the map elements
 * @returns {*} The path to use to trace the map elements
 */
  getPath (projection: d3.GeoProjection) {
    return d3.geoPath()
      .projection(projection)
  }

  /**
 * Draws the map legend.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph, used to place the legend
 * @param {*} colorScale The color scale to use
 */
  drawMapLegend (g:any, width: number, colorScale: any) {
    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width - 100) + ', 40)')
      .append('text')
      .text('Légende')
      .attr('x', 20)
      .attr('y', -20)
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
  
    var legendOrdinal = (legendColor() as any)
      .shape('path', d3.symbol().type(d3.symbolCircle).size(300)()!)
      .shapePadding(2)
      .scale(colorScale)

    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
      .selectAll('.swatch')
      .style('stroke', '#000');

    let offset = 0;
    g.selectAll('.legendOrdinal')
      .selectAll('.label')
      .text(function(d: any, i: any, nodes: any){
        const transform: string = d3.select(nodes[i].parentNode).attr('transform');
        const parsedY: string = transform.split(',')[1].substring(0, transform.split(',')[1].length - 2);
        const maxLineLength: number = 35;
        if(parsedY != ' '){
          d3.select(nodes[i].parentNode)
          .attr('transform', 'translate( 0 , '+ (parseInt(parsedY) + offset)+')')
        }
        if(d.length < maxLineLength){
          return d;
        }
        let words: string[] = d.split(' ');
        for(let i = 0; i < words.length;i++){
          if(words[i] == ''){
            words.splice(i,1);
          }
        }
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while(labelStart.length + words[currentWordIndex].length < maxLineLength){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        
        let substringOffset: number = 12;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && line.length + words[currentWordIndex].length < maxLineLength){
            line = line + ' ' + words[currentWordIndex];
            currentWordIndex++;
          }
          
          if(words[currentWordIndex] && (words[currentWordIndex].match(/[.,:!?]/))){
            line += words[currentWordIndex];
            currentWordIndex++;
          }
          d3.select(nodes[i].parentNode)
            .append("text")
            .text(function() {
              return line;
            })
            .attr('y', substringOffset)
            .attr('x', 20)
            .attr('dy', '0.64em')
          offset += 16;
          substringOffset += 16;
        }
        return labelStart;
      })
      .each(function(d:any, i:any, nodes:any) {
        d3.select(nodes[i].parentNode)
            .attr('dy', '-0.32em')
      })

    
  }

  /**
 * Draws the legend for the wall
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph, used to place the legend
 * @param {*} colorScale The color scale to use
 * @param {string} title The legend's title
 */
  drawWallLegend (g: any, width: number, colorScale: any, title: string) {
    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width - 20) + ', ' + 50 +')')
      .append('text')
      .text(title)
      .attr('x',  -10)
      .attr('y', -20)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
  
    var legendOrdinal = (legendColor() as any)
      .shape('path', d3.symbol().type(d3.symbolSquare).size(200)()!)
      .scale(colorScale)
    
    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
  }


}
