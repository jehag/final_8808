import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { ExcelQuestions } from '../interfaces/excel-questions';

@Injectable({
  providedIn: 'root'
})
export class PreprocessService {

  excelData:any[];
  excelQuestions: any[];
  processedExcelQuestions: ExcelQuestions[];

  constructor(private http: HttpClient) {
    this.excelData = [];
    this.excelQuestions = [];
    this.processedExcelQuestions = [];
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
        this.processQuestions()
      });
  }

  processQuestions(): void {
    for(let i = 0; i < this.excelQuestions.length; i++){
      if(!this.excelQuestions[i]["__EMPTY"] && !this.excelQuestions[i]["__EMPTY_1"]){
        let excelQuestion: ExcelQuestions = {
          "symbol": "",
          "question": "",
          "choices": [] 
        };

        excelQuestion.symbol = this.excelQuestions[i]["Livre de codes"];
        let j = i + 2;
        excelQuestion.question = this.excelQuestions[j]["__EMPTY_1"].split(":")[1];
        j++;

        if(this.excelQuestions[j]){
          while(this.excelQuestions[j]["__EMPTY"] || this.excelQuestions[j]["__EMPTY_1"]){
            excelQuestion.choices.push([this.excelQuestions[j]["__EMPTY"], this.excelQuestions[j]["__EMPTY_1"]]);
            j++;
          }
        }

        this.processedExcelQuestions.push(excelQuestion);

        i = j-1;
      }
    }
  }
}
