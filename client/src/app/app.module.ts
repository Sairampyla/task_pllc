import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS} from  '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Components/login/login.component';
import { UserCreateComponent } from './Components/user-create/user-create.component';
import { UserListComponent } from './Components/user-list/user-list.component';
import { UserEditComponent } from './Components/user-edit/user-edit.component';
import { AuthService } from './Shared/auth.service';
import { TokenInterceptor } from './Shared/httpinterceptors/token-interceptor';
import { AuthenticationGuard } from './authentication.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserCreateComponent,
    UserListComponent,
    UserEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [AuthService,AuthenticationGuard,{provide:HTTP_INTERCEPTORS,useClass:TokenInterceptor,multi:true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
