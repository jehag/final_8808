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
        if(this.processedExcelQuestions[i].choices.get(0) && this.processedExcelQuestions[i].choices.get(0)?.includes('NO TO')){
          let pair = this.fixNoToQuestions(i);
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
    excelQuestion.symbol = symbolStart;
    
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

    return [excelQuestion, i];
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

    let labelData: Map<number,number> = new Map();

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
}
