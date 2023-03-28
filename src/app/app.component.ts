import { Component, OnInit } from '@angular/core';
import { PreprocessService } from './services/preprocess.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'biodome-project';
  user: string;

  constructor(private preprocessService: PreprocessService){
    this.user = "yo"
  }

  async ngOnInit(){
    this.preprocessService.readExcelFile()
  }
    
  findManData() {
    console.log("man")
  }

  findWomanData() {
    console.log("Woman")
  }
}


