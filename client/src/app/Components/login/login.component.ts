import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Shared/auth.service';
//import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Input() loginUserData = {email:"",password:""}
  
  constructor(private route:Router,private _servc:AuthService) { }

  ngOnInit(): void {
  }
  loginData(){
     this._servc.loginUser(this.loginUserData).subscribe( res =>{
       localStorage.setItem('token',res.token)

       this.route.navigate(['/user-list'])
     },
     err => window.alert(err+"invalid credentials")
     
     )
    // console.log('login success');
    // this.route.navigate(['/user-list'])
  }
  onGoto(){
    this.route.navigate(['/user-create'])
  }

}
