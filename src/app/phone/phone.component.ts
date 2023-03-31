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
  isThemeQuestion: boolean = false;
  themeQuestionsList: string[] = [];
  selectedSubQuestion: string = "";
  user: any = null;

  constructor(private preprocessService: PreprocessService) {}

  ngOnInit(): void {
  }

  get questions(){
    return this.preprocessService.questionsList;
  }

  findUserData(man: boolean) {
    this.characterChosen = true;
    this.user = this.preprocessService.getUserData(man);
  }

  getQuestionData(){
    const symbol = this.preprocessService.getFormattedSymbolWithQuestion(this.selectedQuestion);
    if(symbol.includes('r')){
      this.themeQuestionsList = this.preprocessService.getThemeQuestions(symbol);
      this.isThemeQuestion = true;
    } else if (symbol.includes('n')) {
      let questionData: QuestionData[] = this.preprocessService.getNoToQuestionData(symbol.substring(0, symbol.indexOf('n')));
      console.log(questionData);
    } else {
      this.isThemeQuestion = false;
      let questionData: QuestionData[] = this.preprocessService.getQuestionData(this.selectedQuestion);
    }
  }

  getSubQuestionData() {
    let questionData: QuestionData[] = this.preprocessService.getQuestionData(this.preprocessService.getSubQuestionRealName(this.selectedQuestion, this.selectedSubQuestion));
  }

}
