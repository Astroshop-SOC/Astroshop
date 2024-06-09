import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService, RoleDTO, UserDTO } from '../api-authorization/authentication.service';
import { DatePipe, NgFor, NgForOf } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, NgFor, NgForOf, DatePipe],
  providers: [DatePipe]
})

export class ContactPageComponent implements OnInit {
  public problemsData: ProblemsDTO[] = [];
  currentDate: number = 0;

  authService = inject(AuthenticationService);
  user: UserDTO;
  role: RoleDTO;
  roleName: string = '';

  imageUrls: string[] = [
    "https://www.iconpacks.net/icons/2/free-check-icon-3278-thumb.png",
    "https://www.freeiconspng.com/uploads/x-png-22.png"
  ];

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private datePipe: DatePipe) { }

  contactForm = new FormGroup({
    nameSurname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, this.emailValidator]),
    problem: new FormControl('', Validators.required),
  });

  onSubmit() {
    if (this.contactForm.valid) {
      let nameSurnameBE = this.contactForm.value.nameSurname ?? '';
      let emailBE = this.contactForm.value.email ?? '';
      let problemBE = this.contactForm.value.problem ?? '';

      let problemDateBE = this.datePipe.transform(new Date(), 'MMM d, yyyy, h:mm a');

      this.createProblem(nameSurnameBE, emailBE, problemBE, problemDateBE).subscribe();;
    }
  }
  changeStatus(problemId: number){
    this.changeProblemStatus(problemId).subscribe();
  }

  emailValidator(control: any) {
    const email = control.value;
    if (email && email.indexOf('@') === -1 && email.indexOf('.') === -1) {
      return { invalidEmail: true };
    }
    return null;
  }

  createProblem(nameSurnameBE: string, emailBE: string, problemBE: string, problemDateBE: string) {
    const url = `${this.baseUrl}contact/create`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { NameSurname: nameSurnameBE, Email: emailBE, Problem: problemBE, ProblemDate: problemDateBE }, { headers });
  }
  changeProblemStatus(problemId: number){
    const url = `${this.baseUrl}contact/changeProblemStatus/${problemId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { ProblemId: problemId}, { headers });
  }
  getProblems(){
    return this.http.get<ProblemsDTO[]>(this.baseUrl + 'contact');
  }

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.authService.getRole(this.user.id).subscribe(result => {
              this.role = result;
              if(this.role != null){
                  this.roleName = this.role.name;
              }
          })
      })
   }

   this.getProblems().subscribe(result => {
    this.problemsData = result;
    console.table(this.problemsData);
   })
 } 
}
export interface ProblemsDTO {
  problemId: number;
  nameSurname: string;
  email: string;
  problem: string;
  problemDate: string;
  problemStatus: string;
}

