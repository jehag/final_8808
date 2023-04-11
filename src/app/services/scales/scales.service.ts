import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { QuestionData } from 'src/app/interfaces/question-data';

@Injectable({
  providedIn: 'root'
})
export class ScalesService {

  constructor() { }

  /**
 * Defines the log scale used to position the center of the circles in X.
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
  setXScale (width: number) {
    return d3.scaleLinear().domain([0, 100]).range([0, width]);
  }

  setYScale (height: number, data: QuestionData[]) {
    return d3.scaleBand().domain(data.map(function(d) { return d.label; })).range([0, height]).padding(0.4);
  }

  setWallYScale(height: number, data: string[]){
    return d3.scaleBand().domain(data).range([0, height]).padding(0.4);
  }

  setColorScale (data: QuestionData[], userChoice: string) {
    // const colorScale = d3.scaleOrdinal(d3.schemeSet1)
    const labels = Object.values(data.map(d => d.label));
    const colorScale = d3.scaleOrdinal(["Moi", "Autres"], ['orange, green'])
    return colorScale;
  }
}
