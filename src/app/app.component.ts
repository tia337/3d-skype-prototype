import { Component } from '@angular/core';

import { AccountService } from './_services';
import { Account } from './_models';
import {ModelConfig} from "@tensorflow-models/body-pix/dist/body_pix_model";
import {SocketsService} from "@app/socket-service/sockets.service";

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    account: Account;

    constructor(
      private accountService: AccountService,
      private socketsService: SocketsService) {
      this.accountService.account.subscribe(x => this.account = x);
    }


    logout(): void {
      this.accountService.logout();
    }

}
