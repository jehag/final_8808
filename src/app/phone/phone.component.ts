import { Component, OnInit } from '@angular/core';
import { QuestionData } from '../interfaces/question-data';
import { PreprocessService } from './../services/preprocess/preprocess.service';
import { CheckboxChoices } from '../interfaces/checkbox-choices';
import { Margin } from '../interfaces/margin';
import { VizService } from '../services/viz/viz.service';
import { ScalesService } from '../services/scales/scales.service';

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
  isShowingGraph: boolean = false;
  checkboxChoices: CheckboxChoices = {
    myGender: true,
    myProvince: true,
    myAge: true,
    myScolarity: true,
    myLanguage: true,
    myMoney: true,
    myCivilState: true
  }

  constructor(private preprocessService: PreprocessService, 
    private vizService: VizService,
    private scalesService: ScalesService
  ) {}

  ngOnInit(): void {
  }

  get questions(){
    return this.preprocessService.questionsList;
  }

  checkBoxChanged(){
    if(this.isShowingGraph){
      if(this.isThemeQuestion){
        this.getSubQuestionData();
      } else{
        this.getQuestionData();
      }
    }
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
      this.isThemeQuestion = false;
      let questionData: QuestionData[] = this.preprocessService.getNoToQuestionData(symbol.substring(0, symbol.indexOf('n')), this.user, this.checkboxChoices);
      let processedSymbol = this.preprocessService.getProcessedSymbolWithFormattedQuestion(this.selectedQuestion);
      this.createGraph(questionData, this.selectedQuestion, processedSymbol);
    } else {
      this.isThemeQuestion = false;
      let questionData: QuestionData[] = this.preprocessService.getQuestionData(this.selectedQuestion, this.user, this.checkboxChoices);
      let processedSymbol = this.preprocessService.getProcessedSymbolWithFormattedQuestion(this.selectedQuestion);
      this.createGraph(questionData, this.selectedQuestion, processedSymbol);
    }
  }

  getSubQuestionData() {
    let subQuestionName: string = this.preprocessService.getSubQuestionRealName(this.selectedQuestion, this.selectedSubQuestion);
    let questionData: QuestionData[] = this.preprocessService.getQuestionData(subQuestionName, this.user, this.checkboxChoices);
    this.createGraph(questionData, subQuestionName, this.preprocessService.getProcessedSymbolWithSubQuestionName(subQuestionName));
  }

  createGraph(questionData: QuestionData[], questionName: string, symbol: string){
    this.isShowingGraph = true;
    this.vizService.deleteGraph();
    const margin: Margin = {
      top: 75,
      right: 200,
      bottom: 100,
      left: 80
    }

    let svgSize = {
      width: 1000,
      height: 600
    }

    let graphSize = {
      width: svgSize.width - margin.right - margin.left,
      height: svgSize.height - margin.bottom - margin.top
    }

    this.vizService.setCanvasSize(svgSize.width, svgSize.height);

    const g = this.vizService.generateG(margin);
    this.vizService.appendAxes(g);
    this.vizService.appendGraphLabels(g);
    this.vizService.placeTitle(g, questionName, graphSize.width);
    this.vizService.positionLabels(g, graphSize.width, graphSize.height);

    const choice = this.preprocessService.getChoiceFromData(symbol, this.user[symbol])

    const xScale = this.scalesService.setXScale(graphSize.width);
    const yScale = this.scalesService.setYScale(graphSize.height, questionData);
    this.vizService.drawXAxis(xScale, graphSize.height);
    this.vizService.drawYAxis(yScale);
    this.vizService.drawLegend(g, graphSize.width);
    this.vizService.drawBars(g, questionData, xScale, yScale, choice);
  }

}
