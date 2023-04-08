import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Margin } from 'src/app/interfaces/margin';
import { legendColor } from 'd3-svg-legend';
import { QuestionData } from 'src/app/interfaces/question-data';

@Injectable({
  providedIn: 'root'
})
export class VizService {

  constructor() { }
  generateG (margin: Margin) {
    return d3.select('.graph')
      .select('svg')
      .append('g')
      .attr('id', 'graph-g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
  }

  setCanvasSize (width: number, height: number) {
    d3.select('#bar-chart')
      .attr('width', width)
      .attr('height', height)
  }

  appendAxes (g: any) {
    g.append('g')
      .attr('class', 'x axis')
  
    g.append('g')
      .attr('class', 'y axis')
  }

  appendGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'x axis-text')
      .attr('font-size', 12)
  }

  placeTitle (g: any, title: string, width: number) {
    if(title.length > 60){

      let words: string[] = title.split(' ');
      let i: number = 0;
      let j: number = -55;
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
        .attr('x', width/2)
        .attr('y', j)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .text(line)
        j = j + 20;
      }
    } else {
      g.append('text')
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', -20)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text(title)
    }
  }

  positionLabels (g: any, width: number, height: number) {
    g.selectAll('.y.axis-text')
      .attr('transform', 'translate( -50 ,' + height / 2 + '), rotate(-90)')
  
    g.selectAll('.x.axis-text')
      .attr('transform', 'translate(' + width / 2 + ',' + (height + 50) + ')')
  }

  drawXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
      .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)
  }

  drawYAxis (yScale: any) {
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any)
  }

  drawLegend (g: any, width: number) {
    const colorScale = d3.scaleOrdinal()
      .domain(['Votre réponse'])
      .range(['orange']);

    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width + 20) + ', 200)')
  
    var legendOrdinal = legendColor()
      .shape('path', d3.symbol().type(d3.symbolCircle).size(300)()!)
      .shapePadding(2)
      .scale(colorScale);
    
  
    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
  }

  drawBars(g:any, data: QuestionData[], xScale:any, yScale:any, userChoice: string) {
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d: QuestionData) { return yScale(d.label); })
      .style('fill', function (d: QuestionData) { return d.label == userChoice? 'orange': 'green'; })
      .attr("width", function(d: QuestionData) { return xScale(d.value); })
      .attr("height", yScale.bandwidth());
  }

  deleteGraph(){
    const g = d3.select('#bar-chart').selectAll('*').remove();
    g.remove();
  }
}
