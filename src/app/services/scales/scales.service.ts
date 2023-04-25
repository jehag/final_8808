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
 * @param {string[]} data The data to be used
 * @returns {*} The band scale in Y
 */
  setYScale (height: number, data: string[]) {
    return d3.scaleBand().domain(data).range([0, height]).padding(0.4);
  }

/**
 * Defines the scale used to color the bars
 *
 * @param {number} domain The domain of the scale
 * @param {string[]} range The range of the scale
 * @returns {*} The ordinal color scale
 */
  setColorScale (domain: string[], range: string[]) {
    return d3.scaleOrdinal(domain, range);
  }

  /**
 * Defines the scale used to color the map
 *
 * @param {number} domain The domain of the scale
 * @returns {*} The ordinal color scale
 */
  setMapColorScale(domain: string[], isGradientQuestion: boolean){
    if(isGradientQuestion){
      let range: string[] = [];
      let opacity: number = 1;
      const opacityOffset = 1/domain.length;
      for(let choice of domain){
        range.push('rgba(0, 154, 0, ' + opacity +')');
        opacity -= opacityOffset;
      }
      return d3.scaleOrdinal().domain(domain).range(range.map((color, i) => i == domain.length - 1 ? 'white' : color));
    }
    return d3.scaleOrdinal().domain(domain).range(["#FF4136", "#FF851B", "#FFDC00", "#2ECC40", "#0074D9", "#B10DC9", "#FF007F", "#A0522D", "#AAAAAA", "#39CCCC", "#FF6EB4", "#8E44AD", "#85144b", "#3D9970", "#001f3f"].map((color, i) => i == domain.length - 1 ? 'white' : color));
  }
}
