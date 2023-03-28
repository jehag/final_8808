import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'biodome-project';
  dashboardPage = true;

  constructor(private router:Router){}

  goToPhone() {
    this.router.navigate(['/phone']);
    this.dashboardPage = false;
  }
    
  goToWall() {
    this.router.navigate(['/wall']);
    this.dashboardPage = false;
  }

  goToDashboard() {
    this.router.navigate(['']);
    this.dashboardPage = true;
  }
}


