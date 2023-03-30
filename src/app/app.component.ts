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

  constructor(private preprocessService: PreprocessService){
  }

  async ngOnInit(){
    await this.preprocessService.readExcelData();
    await this.preprocessService.readExcelQuestions()
  }
}


