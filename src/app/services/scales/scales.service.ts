import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { QuestionData } from 'src/app/interfaces/question-data';

@Injectable({
  providedIn: 'root'
})
export class ScalesService {

  constructor() { }

  /**
 * Defines the scale used to position the bars
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
  setXScale (width: number) {
    return d3.scaleLinear().domain([0, 100]).range([0, width]);
  }

/**
 * Defines the scale used to position the bars
 *
 * @param {number} height The height of the graph
 * @param {object} data The data to be used
 * @returns {*} The band scale in Y
 */
  setYScale (height: number, data: QuestionData[]) {
    return d3.scaleBand().domain(data.map(function(d) { return d.label; })).range([0, height]).padding(0.4);
  }

  /**
 * Defines the scale used to position the bars on the wall
 *
 * @param {number} height The height of the graph
 * @param {object} data The data to be used
 * @returns {*} The band scale in Y
 */
  setWallYScale(height: number, data: string[]){
    return d3.scaleBand().domain(data).range([0, height]).padding(0.4);
  }

  setColorScale (domain: string[], range: string[]) {
    return d3.scaleOrdinal(domain, range);
  }

  setMapColorScale(choices: string[]){
    return d3.scaleOrdinal().domain(choices).range(["#FF4136", "#FF851B", "#FFDC00", "#2ECC40", "#0074D9", "#B10DC9", "#FF007F", "#A0522D", "#AAAAAA", "#39CCCC", "#FF6EB4", "#8E44AD", "#85144b", "#3D9970", "#001f3f"].map((color, i) => i == choices.length - 1 ? 'white' : color));
  }
}
