import {Component, OnInit} from '@angular/core';

import {AccountService, AlertService} from '@app/_services';
import {FormBuilder, FormGroup} from "@angular/forms";
import {SocketsService} from "@app/socket-service/sockets.service";
import {Router} from "@angular/router";
import {Location} from "@angular/common";

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit{
    form: FormGroup;
    account = this.accountService.accountValue;

    constructor(private accountService: AccountService,
                private formBuilder: FormBuilder,
                private router: Router,
                private alertService: AlertService,
                private location: Location,
                ) {
      this.form = this.formBuilder.group({
        data: [''],
      });
      // this.alertService.info('alllleeesadsad as dadasdasdasd')
    }

    get f() { return this.form.controls; }

    onSubmit() {
      // console.log(this.f.data.value)


    }

  ngOnInit(): void {
    const data: any = this.location.getState();
    console.log('-------', data);
    if (data.ended) {
      this.alertService.info('alllleeesadsad as dadasdasdasd');
    }
  }

}
