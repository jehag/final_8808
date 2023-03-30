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
  formattedQuestionsList: [] = [];

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
          excelQuestion.question += this.excelQuestions[j]["__EMPTY_1"].split(":")[k];
        }
        if(this.isEnvironmentalQuestion(excelQuestion.symbol)){
          this.questionsList.push(excelQuestion.question);
        }

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
    let firstLetters:string = symbol[0] + symbol[1];
    for(let i = 2; i < 10; i++){
      let correctLetters: string = 'Q' + i;
      if(firstLetters == correctLetters){
        return true;
      }
    }
    return false;
  }

  formatQuestionsList(){}

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
