import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, HostListener, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../api-authorization/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent {
  verificationStatus: string = '';
  showVerificationContainer: boolean = true;

  isLoading: boolean = false;

  tokenStatus: string = '';
  newToken: string = '';

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private route: ActivatedRoute, private router: Router, private authService: AuthenticationService){}

  verifyEmail(token: string): Observable<any>{
    const url = `${this.baseUrl}user/verify`;
    const params = new HttpParams().set('token', token);
    return this.http.get(url, { params });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    if(token){
      this.isLoading = true;
      this.showVerificationContainer = false;
      this.verifyEmail(token).subscribe((response) => {
        this.isLoading = false;
        setTimeout(() => {
          this.authService.storeUserCredentials(response.token, response.username);
          this.router.navigate(['/dashboard']);
        }, 5000);
      }, (error) => {
        this.isLoading = false;
        if(error.status = 'invalid'){
          this.tokenStatus = error.status;
          console.log(this.tokenStatus);
        }
      });
    }
  }
}
