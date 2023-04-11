import { Component, OnInit } from '@angular/core';
import { PreprocessService } from '../services/preprocess/preprocess.service';
import { VizService } from '../services/viz/viz.service';
import { ScalesService } from '../services/scales/scales.service';
import { CheckboxChoices } from '../interfaces/checkbox-choices';
import { ExcelQuestions } from '../interfaces/excel-questions';
import { QuestionData } from '../interfaces/question-data';
import { Margin } from '../interfaces/margin';
import { QuestionDataHelper } from '../interfaces/question-data-helper';
import { GenderDataSetup } from '../interfaces/gender-data-setup';
import { AgeDataSetup } from '../interfaces/age-data-setup';

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

  graphType: GraphType = GraphType.Age;
  currentQuestion: number = 0;
  questionsList: ExcelQuestions[] = [];
  checkBoxChoices: CheckboxChoices = {
    myGender: false,
    myProvince: false,
    myAge: false,
    myScolarity: false,
    myLanguage: false,
    myMoney: false,
    myCivilState: false,
  }
  margin: Margin = {
    top: 75,
    right: 200,
    bottom: 100,
    left: 150
  }
  svgSize = {
    width: 1000,
    height: 600
  }

  constructor(private preprocessService: PreprocessService, 
    private vizService: VizService,
    private scalesService: ScalesService) { }

  ngOnInit(): void {
    this.questionsList = this.preprocessService.getWallQuestions();
    this.createGraph();
  }

  changeGraph(){
    this.vizService.deleteGraph('#wall-chart');
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
      this.createAgeGraph();
    } else {
      //this.createMapGraph();
    }
  }

  createGenderGraph() {
    const genderData: GenderDataSetup[] = this.getGenderData();
    const groups: string[] = ['men', 'women'];
    const dataset = this.vizService.stackData(genderData, groups);
    let labels: string[] = [];
    for(let choice of dataset[0]){
      labels.push(choice.data.label as any);
    }
    const colors = ['#92D050', '#9DC3E6'];
    const legendItems = ['Hommes', 'Femmes'];

    this.buildGraph(labels, colors, legendItems, dataset, groups);
  }

  getGenderData(): GenderDataSetup[] {
    this.checkBoxChoices.myGender = true;
    let questionDataList: QuestionDataHelper[] = this.getQuestionData('sexe', 2);
    this.checkBoxChoices.myGender = false;

    let data: GenderDataSetup[] = [];
    for(let i = 0; i < questionDataList[0].questionData.length; i++){
      const totalSum = questionDataList.reduce((total, current) => total + current.sumOfValues, 0);
      data.push({
        label: questionDataList[0].questionData[i].label,
        men: (questionDataList[0].questionData[i].value * questionDataList[0].sumOfValues) / totalSum,
        women: (questionDataList[1].questionData[i].value * questionDataList[1].sumOfValues) / totalSum,
      });
    }
    return data;
  }

  createAgeGraph(){
    const ageData: AgeDataSetup[] = this.getAgeData();
    const groups: string[] = ['firstBracket', 'secondBracket', 'thirdBracket', 'fourthBracket', 'fifthBracket', 'sixthBracket'];
    const dataset = this.vizService.stackData(ageData, groups);
    console.log(dataset)
    let labels: string[] = [];
    for(let choice of dataset[0]){
      labels.push(choice.data.label as any);
    }
    const colors = ['#39aac6', '#E7E6E6', '#FFC000', '#92D050', '#00B0F0', '#ff9999'];
    const legendItems = ["18 et moins", "18-24", "25-39", "40-54", "55-64", "65 et plus"];

    this.buildGraph(labels, colors, legendItems, dataset, groups)
  }

  getAgeData(): AgeDataSetup[] {
    this.checkBoxChoices.myAge = true;
    let questionDataList: QuestionDataHelper[] = this.getQuestionData('age', 6);
    this.checkBoxChoices.myAge = false;
    let data: AgeDataSetup[] = [];
    for(let i = 0; i < questionDataList[0].questionData.length; i++){
      const totalSum = questionDataList.reduce((total, current) => total + current.sumOfValues, 0);
      data.push({
        label: questionDataList[0].questionData[i].label,
        firstBracket: (questionDataList[0].questionData[i].value * questionDataList[0].sumOfValues) / totalSum,
        secondBracket: (questionDataList[1].questionData[i].value * questionDataList[1].sumOfValues) / totalSum,
        thirdBracket: (questionDataList[2].questionData[i].value * questionDataList[2].sumOfValues) / totalSum,
        fourthBracket: (questionDataList[3].questionData[i].value * questionDataList[3].sumOfValues) / totalSum,
        fifthBracket: (questionDataList[4].questionData[i].value * questionDataList[4].sumOfValues) / totalSum,
        sixthBracket: (questionDataList[5].questionData[i].value * questionDataList[5].sumOfValues) / totalSum
      });
    }
    return data;
  }

  getQuestionData(symbol: string, maxNumber: number) : QuestionDataHelper[] {
    let user: any = {
      [symbol]: 0
    };
    let questionDataList: QuestionDataHelper[] = [];
    for(let i = 1; i <= maxNumber; i++){
      user[symbol] = i;
      if(this.questionsList[this.currentQuestion].symbol.includes('n')){
        let symbolStart = this.questionsList[this.currentQuestion].symbol.substring(0,this.questionsList[this.currentQuestion].symbol.indexOf('n'));
        questionDataList.push(this.preprocessService.getNoToQuestionData(symbolStart, user, this.checkBoxChoices))
      } else {
        let questionName: string = '';
        
        if(this.questionsList[this.currentQuestion].symbol.includes('r')){
          let questionSplit: string[] = this.questionsList[this.currentQuestion].question.split(' : ');
          let questionEnding: string = questionSplit[questionSplit.length - 1].trim();
          for(let choice of this.questionsList[this.currentQuestion].choices.values()){
            if(choice.includes(questionEnding)){
              questionName = choice;
            }
          }
        } else {
          questionName = this.questionsList[this.currentQuestion].question;
        }
        questionDataList.push(this.preprocessService.getQuestionData(questionName, user, this.checkBoxChoices))
      }
    }
    return questionDataList;
  }

  buildGraph(labels: string[], colors: string[], legendItems: string[], dataset: any, groupLabels: string[]){
    let graphSize = {
      width: this.svgSize.width - this.margin.right - this.margin.left,
      height: this.svgSize.height - this.margin.bottom - this.margin.top
    }

    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#wall-chart');

    const g = this.vizService.generateG(this.margin, '.wall-graph');
    this.vizService.appendAxes(g);
    this.vizService.appendGraphLabels(g);
    this.vizService.placeTitle(g, this.questionsList[this.currentQuestion].question, graphSize.width);
    this.vizService.positionLabels(g, graphSize.width, graphSize.height);

    const xScale = this.scalesService.setXScale(graphSize.width);
    const yScale = this.scalesService.setWallYScale(graphSize.height, labels);
    this.vizService.drawXAxis(xScale, graphSize.height);
    this.vizService.drawYAxis(yScale);
    this.vizService.drawLegend(g, graphSize.width, legendItems, colors);
    this.vizService.drawGenderBars(g, dataset, xScale, yScale, colors, groupLabels);
  }



}
