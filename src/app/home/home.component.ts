import {Component, OnInit} from '@angular/core';

import { AccountService } from '@app/_services';
import {FormBuilder, FormGroup} from "@angular/forms";
import {SocketsService} from "@app/socket-service/sockets.service";
import {Router} from "@angular/router";

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    form: FormGroup;
    account = this.accountService.accountValue;

    constructor(private accountService: AccountService,
                private formBuilder: FormBuilder,
                private router: Router) {
      this.form = this.formBuilder.group({
        data: [''],
      });
    }

    get f() { return this.form.controls; }

    onSubmit() {
      // console.log(this.f.data.value)


    }

}
