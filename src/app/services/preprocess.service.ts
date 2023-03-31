import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { ExcelQuestions } from '../interfaces/excel-questions';
import { QuestionData } from '../interfaces/question-data';

@Injectable({
  providedIn: 'root'
})
export class PreprocessService {

  excelData:any[] = [];
  excelQuestions: any[] = [];
  processedExcelQuestions: ExcelQuestions[] = [];
  questionsList: string[] = [];
  formattedQuestions: ExcelQuestions[] = [];

  constructor(private http: HttpClient) {
  }

  async readExcelData(): Promise<void> {
    this.http.get('assets/data/excelPageDonnees.xlsx', {responseType: 'arraybuffer'})
      .subscribe(response => {
        const data: any = new Uint8Array(response);
        const workbook: XLSX.WorkBook = XLSX.read(data, {type: 'array'});
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {raw: true});
        this.excelData = excelData;
      });
  }

  async readExcelQuestions(): Promise<void> {
    this.http.get('assets/data/excelPageQuestions.xlsx', {responseType: 'arraybuffer'})
      .subscribe(response => {
        const data: any = new Uint8Array(response);
        const workbook: XLSX.WorkBook = XLSX.read(data, {type: 'array'});
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {raw: true});
        this.excelQuestions = excelData;
        this.processQuestions();
        this.formatQuestions();
        console.log(this.formattedQuestions);
      });
  }

  processQuestions(): void {
    for(let i = 0; i < this.excelQuestions.length; i++){
      if(!this.excelQuestions[i]["__EMPTY"] && !this.excelQuestions[i]["__EMPTY_1"]){
        let excelQuestion: ExcelQuestions = {
          "symbol": "",
          "question": "",
          "choices": new Map() 
        };

        excelQuestion.symbol = this.excelQuestions[i]["Livre de codes"];

        let j = i + 2;
        let splitQuestion = this.excelQuestions[j]["__EMPTY_1"].split(":");
        for(let k = 1; k < splitQuestion.length; k++){
          excelQuestion.question += splitQuestion[k];
          if(k < splitQuestion.length - 1){
            excelQuestion.question += " : "
          }
        }
        excelQuestion.question = excelQuestion.question.substring(1);

        j++;

        if(this.excelQuestions[j]){
          while(this.excelQuestions[j]["__EMPTY"] || this.excelQuestions[j]["__EMPTY_1"]){
            excelQuestion.choices.set(parseInt(this.excelQuestions[j]["__EMPTY"]), this.excelQuestions[j]["__EMPTY_1"]);
            j++;
          }
        }

        this.processedExcelQuestions.push(excelQuestion);

        i = j-1;
      }
    }
  }

  isEnvironmentalQuestion(symbol:string): boolean{
    for(let i = 2; i <= 18; i++){
      let correctLetters: string = 'Q' + i;
      if(symbol.includes(correctLetters)){
        return true;
      }
    }
    return false;
  }

  formatQuestions(){
    for(let i = 0; i < this.processedExcelQuestions.length; i++){
      let excelQuestion: ExcelQuestions = {
        "symbol": "",
        "question": "",
        "choices": new Map() 
      };

      if(this.isEnvironmentalQuestion(this.processedExcelQuestions[i].symbol)){
        if(this.isNoToQuestion(this.processedExcelQuestions[i])){
          let pair = this.fixNoToQuestions(i);
          excelQuestion = pair[0];
          i = pair[1];
        } else if(this.processedExcelQuestions[i].symbol.includes('r')) {
          let pair = this.fixSameThemeQuestions(i);
          excelQuestion = pair[0];
          i = pair[1];
        } else {
          excelQuestion = this.processedExcelQuestions[i];
        }
        this.formattedQuestions.push(excelQuestion);
        this.questionsList.push(excelQuestion.question);
      }
    }
  }

  isNoToQuestion(question: ExcelQuestions): boolean {
    if(question.choices.get(0) && question.choices.get(0)?.includes('NO TO')){
      return true;
    }
    return false;
  }

  fixNoToQuestions(i: number) : [ExcelQuestions, number] {
    let excelQuestion: ExcelQuestions = {
      "symbol": "",
      "question": "",
      "choices": new Map() 
    };
    let splitQuestion = this.processedExcelQuestions[i].question.split('-');
    for(let k = 1; k < splitQuestion.length; k++){
      excelQuestion.question += splitQuestion[k];
      if(k < splitQuestion.length - 1){
        excelQuestion.question += "-"
      }
    }
    excelQuestion.question = excelQuestion.question.substring(1);
    
    let symbolStart = this.processedExcelQuestions[i].symbol.substring(0, this.processedExcelQuestions[i].symbol.indexOf('r'));
    excelQuestion.symbol = this.processedExcelQuestions[i].symbol.replace('r','n');
    
    let j = 0;
    while(this.processedExcelQuestions[i] && this.processedExcelQuestions[i].symbol.includes(symbolStart)){
      for(let choice of this.processedExcelQuestions[i].choices.entries()){
        if(choice[0] != 0){
          excelQuestion.choices.set(j, choice[1]);
        }
      }
      j++;
      i++;
    }

    return [excelQuestion, i-1];
  }

  fixSameThemeQuestions(i: number) : [ExcelQuestions, number] {
    let excelQuestion: ExcelQuestions = {
      "symbol": "",
      "question": "",
      "choices": new Map() 
    };
    let splitQuestion = this.processedExcelQuestions[i].question.split('-');
    for(let k = 1; k < splitQuestion.length; k++){
      excelQuestion.question += splitQuestion[k];
      if(k < splitQuestion.length - 1){
        excelQuestion.question += "-"
      }
    }
    excelQuestion.question = excelQuestion.question.substring(1);
    
    let symbolStart = this.processedExcelQuestions[i].symbol.substring(0, this.processedExcelQuestions[i].symbol.indexOf('r'));
    excelQuestion.symbol = this.processedExcelQuestions[i].symbol;

    let j = 0;
    while(this.processedExcelQuestions[i] && this.processedExcelQuestions[i].symbol.includes(symbolStart)){
      excelQuestion.choices.set(j, this.processedExcelQuestions[i].question);
      i++;
      j++;
    }

    return [excelQuestion, i-1];
  }

  getUserData(man:boolean){
    let data;
    if(man){
      data = this.excelData.find((row) => {
        return row.record == 100;
      });
    } else {
      data = this.excelData.find((row) => {
        return row.record == 69;
      });
    }
    return data;
  }

  getQuestionData(questionName:string) : QuestionData[] {
    let data:QuestionData[] = [];

    const question = this.processedExcelQuestions.find((question) => {
      return question.question == questionName
    });

    let labelData: Map<number,number> = this.getLabelData(question!);

    let sumOfValues: number = 0;
    for(let value of labelData.values()){
      sumOfValues += value;
    }

    for(let entry of labelData.entries()){
      let questionData:QuestionData = {
        "label": "",
        "value": 0
      };
      questionData.label = question!.choices.get(entry[0])!;
      questionData.value = (entry[1] / sumOfValues) * 100;
      data.push(questionData);
    }


    return data;
  }

  getLabelData(question: ExcelQuestions): Map<number,number> {
    let labelData: Map<number,number> = new Map<number, number>();
    if(question){
      const symbol = question.symbol;
      this.excelData.forEach((row) => {
        if(row[symbol]){
          //add les crochets ici
          if(labelData.has(row[symbol])){
            let currentValue = labelData.get(row[symbol])!;
            labelData.set(row[symbol], currentValue + 1);
          } else{
            labelData.set(row[symbol], 1);
          }
        }
      })
    }
    return labelData;
  } 

  getFormattedSymbolWithQuestion(questionName: string): string{
    const question = this.formattedQuestions.find((question) => {
      return question.question == questionName
    });
    if(question){
      return question.symbol;
    } 
    return 'unknown question';
  }

  getThemeQuestions(symbol: string): string[] {
    let themeQuestions: string[] = [];
    this.processedExcelQuestions.forEach((question) => {
      if(this.isEnvironmentalQuestion(question.symbol) && question.symbol.includes('r') && !this.isNoToQuestion(question)){
        let symbolStart = question.symbol.substring(0, question.symbol.indexOf('r'));
        if(symbol.includes(symbolStart)){
          themeQuestions.push(question.question);
        }
      }
    })
    for(let i = 0; i < themeQuestions.length; i++){
      themeQuestions[i] = themeQuestions[i].split(' - ')[0];
    }
    return themeQuestions;
  }

  getNoToQuestionData(symbolStart: string): QuestionData[] {
    let questions: ExcelQuestions[] = [];
    this.processedExcelQuestions.forEach((question) => {
      if(this.isEnvironmentalQuestion(question.symbol) && question.symbol.includes(symbolStart)){
        questions.push(question);
      }
    })

    let questionDataList:QuestionData[] = [];
    let sumOfValues = 0;
    questions.forEach((question) => {
      let labelData: Map<number, number> = this.getLabelData(question);
      for(let data of labelData.values()){
        sumOfValues += data;
        questionDataList.push({
          "label": question.question.split(' - ')[0],
          "value": data
        })
      }
    })

    for(let i = 0; i < questionDataList.length; i++){
      questionDataList[i].value = (questionDataList[i].value / sumOfValues) * 100;
    }

    return questionDataList;
  }

  getSubQuestionRealName(selectedQuestion:string, subQuestion: string): string {
    const question = this.formattedQuestions.find((question) => {
      return question.question == selectedQuestion;
    })
    if(question){
      for (let value of question.choices.values()) {
        if(value.split(' - ')[0] == subQuestion){
          return value;
        }
      }
      return 'could not find subQuestion';
    }
    return 'could not find question';
  }
}
