import {Injectable} from "@angular/core";
import socket from 'socket.io-client';
import {AlertService} from "@app/_services";
import {ConfirmationDialogService} from "@app/confir-dialog-component/confirm-dialog.service";
import {Router} from "@angular/router";

@Injectable({ providedIn: 'root' })
export class SocketsService  {
  socket;
  receivingCall;
  caller;
  callerSignal;
  callAccepted = false;
  peer;

  constructor(private readonly alertService: AlertService,
              private confirmationDialogService: ConfirmationDialogService,
              private router: Router) {
    if (localStorage.getItem('user')) {
      this.login();
    }
  }

  // tslint:disable-next-line:typedef
  login() {
    this.socket = socket('http://192.168.31.149:8888/api', {
      path: '/api',
      query: { id: JSON.parse(localStorage.getItem('user')).id},
    });

    this.socket.on('userCall', (data) => {
      this.confirmationDialogService.confirm('Incoming call', `${data.email}`)
        .then((confirmed) => {
          console.log('User confirmed:', confirmed)
          if (confirmed) {
            this.router.navigateByUrl('/video', {
              state: {
                call: false,
                receivingCall: true,
                from: data.from,
              },
            });
          } else {
            this.socket.emit('CallEnd', {
              to: data.from,
              from: JSON.parse(localStorage.getItem('user')).id,
            });
          }
        })
        // tslint:disable-next-line:max-line-length
        .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    });

  }


}

