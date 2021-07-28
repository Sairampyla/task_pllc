import { Component, Input, OnInit,Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Shared/auth.service';
import {RestApiService} from '../../Shared/rest-api-service';
import { SocialAuthService, GoogleLoginProvider,FacebookLoginProvider, SocialUser } from 'angularx-social-login';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


//import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  pwdForm:boolean = false;
  mainForm:boolean = true;
  forgotPwdform: FormGroup;
  forsubmitted:boolean = false;
  errormsg:boolean = false;
  successmsg:boolean = false;
  isfieldTextType: boolean;
  data:any=[];
  @Input() loginUserData = {email:"",password:""};

  @Input() isGooglePic:boolean = true;

  googleUser: SocialUser;
  fbUser:SocialUser;
  isLoggedin: boolean = null;

 // @Input() set isGooglePic(isGooglePic: boolean)

  

 // @Output() informParent = new EventEmitter();

  
  constructor(private route:Router,private _servc:AuthService,
    private auth:RestApiService, private socialAuthService: SocialAuthService,
      private fb: FormBuilder) { }

  ngOnInit(): void {
    this.forgotPwdform = this.fb.group({
      foremail: [''],
      
    // }, {
    //   validator: ConfirmedValidator('newpwd', 'cnfrmpwd')
    });

    // this.socialAuthService.authState.subscribe((user) => {
    //   this.socialUser = user;
    //   this.isLoggedin = (user != null);
    // });

    this.socialAuthService.authState.subscribe((guser:any)=>{
         
      this.googleUser = guser;
    })
    this.socialAuthService.authState.subscribe((fbuser:any)=>{
         
      this.fbUser = fbuser;
    })
  }

  loginData(){
     this._servc.loginUser(this.loginUserData).subscribe( res =>{
       localStorage.setItem('token',res.token)
       console.log(res,"response");
       localStorage.setItem("username",res.fetchedUser.name)
       localStorage.setItem("email",res.fetchedUser.email)
      localStorage.setItem("id",res.fetchedUser._id)

       this.route.navigate(['/user-list',{ state: { hello: 'world' } }])
     },
     err => window.alert("invalid credentials")
     
     )
    // console.log('login success');
    // this.route.navigate(['/user-list'])
  }

  // onGoto(){
  //   this.route.navigate(['/user-create'])
  // }
  
  // Switching method 
toggleFieldTextType() {
  this.isfieldTextType = !this.isfieldTextType
}
  ResetPwd(){
  this.pwdForm = true;
  this.mainForm = false;

  }
  onCancel(){
    this.pwdForm = false;
    this.mainForm = true;
    this.successmsg = false;
    this.errormsg = false;
    this.forgotPwdform.reset();
  }
  onSendEmail(){
    const val = this.forgotPwdform.value
    console.log(val,"value email");
    
    const data = {
      "email": val.foremail
    }


    if(this.forgotPwdform.valid){
      this.auth.getEmaillink(data).subscribe((res:any)=>{
          console.log(res,"response occured...");
          this.data = res;
          if(res.status == 200){
            this.successmsg = true;
          }else if(res.status == 401){
             this.errormsg = true;
          }
            
            // setTimeout(() => {
            //   this.successmsg = false;
            // }, 3000);
          // setTimeout(() => {
          //    this.mainForm = true;
          //  this.pwdForm = false;
          // }, 1000);
      })
    }else{
      console.log("error occured..!");
      
    }
  }

  onGmaillogin(){
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((x:any)=>{

      
      this.auth.googleLogin({name:x.name,
        googleId:x.id,files:x.photoUrl}).subscribe((res:any)=>{
        //  this.isGooglePic = false;
          console.log(res,"response");
          if(res['success']){
            localStorage.setItem('token',res['token'])
            this.route.navigate(['/user-list'])
          }else{
            alert("login not occured");
          }
        })
    })
   
        
  }

  onFblogin(){
  this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((y:any)=>{
   // console.log(fbuser,"fb user");
    this.auth.facebookLogin({name:y.name,
    fbId:y.id,files:y.photoUrl}).subscribe((res:any)=>{
      console.log(res,"response");
      if(res['success']){
        localStorage.setItem('token',res['token'])
        this.route.navigate(['/user-list'])
      }else{
        alert("login not occured");
      }
    })
  })
 
  }

}
