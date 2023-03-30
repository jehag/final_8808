import { Component, OnInit } from '@angular/core';
import { QuestionData } from '../interfaces/question-data';
import { PreprocessService } from './../services/preprocess.service';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.css']
})
export class PhoneComponent implements OnInit {

  selectedQuestion: string = "";
  characterChosen: boolean = false;
  user: any = null;

  constructor(private preprocessService: PreprocessService) {}

  ngOnInit(): void {
  }

  get questions(){
    return this.preprocessService.questionsList;
  }

  findUserData(man: boolean) {
    console.log('allo')
    this.characterChosen = true;
    this.user = this.preprocessService.getUserData(man);
  }

  createGraph(){
    let questionData: QuestionData[] = this.preprocessService.getQuestionData(this.selectedQuestion);
  }

}
