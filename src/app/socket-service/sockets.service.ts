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

  constructor(private readonly alertService: AlertService,
              private confirmationDialogService: ConfirmationDialogService,
              private router: Router,) {
    this.socket = socket('http://localhost:8888/api', {
      path: '/api',
      query: { id: JSON.parse(localStorage.getItem('user')).id},
    });

    this.socket.on('userCall', (data) => {
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to ... ?')
        .then((confirmed) => {
          console.log('User confirmed:', confirmed)
          this.router.navigateByUrl('/video', { state: {
              call: false,
              receivingCall: true,
              from: data.from,
              // callerSignal: data.signal,
            }});
        })
        // tslint:disable-next-line:max-line-length
        .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    });
    // this.socket.on('callAccepted', (signal) => {
    //   this.callAccepted = true;
    //   this.videoCallComponent.signalPeer(signal);
    // });
  }


}




// import {Injectable} from "@angular/core";
// import socket from 'socket.io-client';
// import {AlertService} from "@app/_services";
// import {ConfirmationDialogService} from "@app/confir-dialog-component/confirm-dialog.service";
// import {Router} from "@angular/router";
// import {VideoCallComponent} from "@app/video-call/video-call.component";
//
// @Injectable({ providedIn: 'root' })
// export class SocketsService  {
//   socket;
//   receivingCall;
//   caller;
//   callerSignal;
//   callAccepted = false;
//
//   constructor(private readonly alertService: AlertService,
//               private confirmationDialogService: ConfirmationDialogService,
//               private router: Router,
//               private videoCallComponent: VideoCallComponent) {
//     this.socket = socket('http://localhost:8888/api', {
//       path: '/api',
//       query: { id: JSON.parse(localStorage.getItem('user')).id},
//     });
//
//     this.socket.on('hey', (data) => {
//       this.receivingCall = true;
//       this.caller = data.from;
//       this.callerSignal = data.signal;
//       this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to ... ?')
//         .then((confirmed) => {
//           console.log('User confirmed:', confirmed)
//           this.router.navigateByUrl('/video', { state: {
//             call: false,
//             receivingCall: true,
//             caller: data.from,
//             callerSignal: data.signal,
//           }});
//         })
//         // tslint:disable-next-line:max-line-length
//         .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
//     });
//     // this.socket.on('callAccepted', (signal) => {
//     //   this.callAccepted = true;
//     //   this.videoCallComponent.signalPeer(signal);
//     // });
//   }
//
//   // tslint:disable-next-line:typedef
//   emitCallUser(userToCallId, data) {
//     this.socket.emit('CallUser', {
//       userToCall: userToCallId,
//       signalData: data,
//       from: JSON.parse(localStorage.getItem('user')).id,
//     });
//   }
// }
