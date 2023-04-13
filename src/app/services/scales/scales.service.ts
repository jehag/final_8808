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

  setColorScale (domain: string[], range: string[]) {
    return d3.scaleOrdinal(domain, range);
  }

  setMapColorScale(choices: string[]){
    // const increment:number = Math.floor(256/(choices.length + 1));
    // let opacities: number[] = [];
    // for(let i = 0; i < choices.length; i++){
    //   opacities.push((i+1)*increment);
    // }
    // const color: string = '#0000ff';
    // let colors: string[] = [];
    // for(let i = 0; i < choices.length; i++){
    //   let hex = opacities[i].toString(16)
    //   if(hex.length == 1){
    //     hex = '0' + hex;
    //   }
    //   colors.push(color + hex);
    // }
    return d3.scaleOrdinal(choices, d3.schemeCategory10)
  }
}
