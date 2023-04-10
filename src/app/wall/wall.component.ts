import { Component, OnInit } from '@angular/core';
import { PreprocessService } from '../services/preprocess/preprocess.service';
import { VizService } from '../services/viz/viz.service';
import { ScalesService } from '../services/scales/scales.service';

enum GraphType {
  Gender = 0,
  Age = 1,
  Map = 2
}
@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.css']
})
export class WallComponent implements OnInit {

  graphType: GraphType = GraphType.Gender;
  currentQuestion: number = 0;

  constructor(private preprocessService: PreprocessService, 
    private vizService: VizService,
    private scalesService: ScalesService) { }

  ngOnInit(): void {
    this.createGraph();
  }

  changeGraph(){
    // delete graph
    if(this.graphType == GraphType.Gender){
      this.graphType = GraphType.Age;
    } else if (this.graphType == GraphType.Age) {
      this.graphType = GraphType.Map;
    } else {
      if(this.currentQuestion == 16){
        this.currentQuestion = 0;
      } else {
        this.currentQuestion++;
      }
      this.graphType = GraphType.Gender;
    }
    this.createGraph();
  }

  createGraph() {
    if(this.graphType == GraphType.Gender){
      this.createGenderGraph();
    } else if (this.graphType == GraphType.Age) {
      //this.createAgeGraph();
    } else {
      //this.createMapGraph();
    }
  }

  createGenderGraph() {
    
  }



}
