import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import socket from 'socket.io-client';
import Peer from 'simple-peer';
import { isPlatformBrowser } from '@angular/common';
import * as tfjs from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
import {
  ARCHITECTURE, BACKGROUND_COLOR, DRAW_FLIP_HORIZONTAL, FOREGROUND_COLOR,
  INTERNAL_RESOLUTION, MASK_BLUR_AMOUNT,
  MILTIPLIER, OPACITY,
  OUTPUT_STRIDE,
  QUANT_BYTES, SCORE_THRESHOLD_ID,
  SEGM_FLIP_HORIZONTAL, SEGMENTATION_THRESHOLD
} from './options';
import {ModelConfig, PersonInferenceConfig} from '@tensorflow-models/body-pix/dist/body_pix_model';
import * as util from 'util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MustMatch} from '@app/_helpers';
import {first} from 'rxjs/operators';
import * as process from 'process';
import {AccountService} from "@app/_services";
import { Location } from '@angular/common';
import {SocketsService} from "@app/socket-service/sockets.service";

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.less']
})
export class VideoCallComponent implements OnInit {
  yourID = JSON.parse(localStorage.getItem('user')).id;
  peer;
  yourPeer = '';
  users = {};
  stream;
  receivingCall = false;
  caller = '';
  callerSignal;
  callAccepted = false;
  form: FormGroup;
  @ViewChild('userVideo', { static: true }) userVideo: any;
  @ViewChild('canvas', { static: true }) canvas: any;
  @ViewChild('partnerVideo', { static: true }) partnerVideo: ElementRef<HTMLVideoElement>;
  socket;

  constructor(private formBuilder: FormBuilder,
              private accountService: AccountService,
              private location: Location,
              private readonly socketsService: SocketsService,
  ) {
    console.log('===-constructor', this.peer)
  }

  ngOnInit(): void {
    console.log('===-ngOnInit', this.peer)
    const entryData: any = this.location.getState();
    this.form = this.formBuilder.group({
      data: [''],
    });
    const options = {
      architecture: ARCHITECTURE,
      multiplier: MILTIPLIER,
      outputStride: OUTPUT_STRIDE,
      quantBytes: QUANT_BYTES
    } as ModelConfig;

    // this.socketsService.socket = socket('http://0.0.0.0:8888/api', {
    //   path: '/api',
    //   query: { id: JSON.parse(localStorage.getItem('user')).id},
    // });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(async (stream: MediaStream) => {
        this.stream = stream;
        this.userVideo.nativeElement.srcObject = stream;
        await this.userVideo.nativeElement.play();
      }).then(async () => {
        console.log('[][]{{[]', entryData)
      if (entryData.call) {
        console.log('notifyy', entryData.to)
        this.notifySecondUser(entryData.to);
        // this.callToUser(entryData.to);
      } else if (entryData.call === false) {
        this.callToUser(entryData.from);
        // this.acceptCall();
        // console.log(';;;;;_))(*')
        // this.notifySecondUser(entryData.to);
        // this.callToUser(entryData.to);
        // console.log('--====', entryData)
        // this.receivingCall = true;
        // this.caller = entryData.caller;
        // this.callerSignal = JSON.parse(JSON.stringify(entryData.callerSignal));

      }
    });

    this.socketsService.socket.on('hey', (data) => {
      console.log('-===============######')
      this.receivingCall = true;
      this.caller = data.from;
      this.callerSignal = data.signal;
      this.acceptCall(data.from);
    });

    this.socketsService.socket.on('callAccepted', (signal) => {
      console.log('{{{][]]]]]-callAccepted')
      this.callAccepted = true;
      this.peer.signal(signal);
    });

  }

  notifySecondUser(userToCallId: string) {
    console.log('-=-999', userToCallId)
    this.socketsService.socket.emit('UserCallRequest', {
      to: userToCallId,
      from: JSON.parse(localStorage.getItem('user')).id,
    });
  }

  // tslint:disable-next-line:typedef
  callPeer(id= '6172c741-172b-4762-8c9b-af78323b643c') {
  }

  // tslint:disable-next-line:typedef
  acceptCall(to: string) {
    this.callAccepted = true;
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.stream,
    });
    this.peer = peer;

    peer.on('signal', data => {
      console.log('==----=====???????', to)
      this.socketsService.socket.emit('AcceptCall', { signal: data, to: to});
    });

    peer.on('stream', async stream => {
      const options = {
        architecture: ARCHITECTURE,
        multiplier: MILTIPLIER,
        outputStride: OUTPUT_STRIDE,
        quantBytes: QUANT_BYTES
      } as ModelConfig;

      this.partnerVideo.nativeElement.srcObject = stream;
      await bodyPix.load(options)
        .then(net => this.performPartnerVideo(net))
        .catch(err => console.log(util.inspect(err, {depth: 12})));
      this.partnerVideo.nativeElement.srcObject = stream;
    });

    peer.signal(this.callerSignal);
  }

  callToUser(userToCallId: string) {
    console.log('--------+==++_)(*&*()_ CallUser', userToCallId);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });
    this.peer = peer;

    peer.on('signal', (data) => {
      console.log('---emited---')
      this.yourPeer = JSON.stringify(data);
      this.socketsService.socket.emit('CallUser', {
        userToCall: userToCallId,
        signalData: data,
        from: JSON.parse(localStorage.getItem('user')).id,
      });
    });

    peer.on('stream', async (stream) => {
      const options = {
        architecture: ARCHITECTURE,
        multiplier: MILTIPLIER,
        outputStride: OUTPUT_STRIDE,
        quantBytes: QUANT_BYTES
      } as ModelConfig;

      this.partnerVideo.nativeElement.srcObject = stream;
      await bodyPix.load(options)
        .then(net => this.performPartnerVideo(net))
        .catch(err => console.log(util.inspect(err, {depth: 12})));
      this.partnerVideo.nativeElement.srcObject = stream;
    });

    this.socketsService.socket.on('callAccepted', (signal) => {
      console.log('{{{][]]]]]-callAccepted')
      this.callAccepted = true;
      peer.signal(signal);
    });
  }

  // convenience getter for easy access to form fields
  // tslint:disable-next-line:typedef
  get f() { return this.form.controls; }

  // tslint:disable-next-line:typedef
  onSubmit() {
    // console.log(this.f.data.value)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });

    peer.on('signal', (data) => {
      this.yourPeer = JSON.stringify(data);
      this.socketsService.socket.emit('CallUser', {
        userToCall: this.f.data.value,
        signalData: data,
        from: this.yourID,
      });
    });

    peer.on('stream', async (stream) => {
      const options = {
        architecture: ARCHITECTURE,
        multiplier: MILTIPLIER,
        outputStride: OUTPUT_STRIDE,
        quantBytes: QUANT_BYTES
      } as ModelConfig;

      this.partnerVideo.nativeElement.srcObject = stream;
      await bodyPix.load(options)
        .then(net => this.performPartnerVideo(net))
        .catch(err => console.log(util.inspect(err, {depth: 12})));
      this.partnerVideo.nativeElement.srcObject = stream;
    });

    this.socketsService.socket.on('callAccepted', (signal) => {
      this.callAccepted = true;
      peer.signal(signal);
    });
  }

  // tslint:disable-next-line:typedef
  async perform(net) {
    const segmentationProperties = {
      flipHorizontal: SEGM_FLIP_HORIZONTAL,
      internalResolution: INTERNAL_RESOLUTION,
      segmentationThreshold: SEGMENTATION_THRESHOLD,
      scoreThreshold: SCORE_THRESHOLD_ID
    } as PersonInferenceConfig;
    await this.userVideo.nativeElement.load();
    const video = document.getElementById('video');
    video.addEventListener('loadeddata', async (event) => {
      while (true) {
        const segmentation = await net.segmentPerson(video, segmentationProperties);
        const backgroundDarkeningMask = bodyPix.toMask(
          segmentation, FOREGROUND_COLOR, BACKGROUND_COLOR);

        const opacity = 1;
        const maskBlurAmount = 0;
        const flipHorizontal = true;
        const canvases = document.getElementsByName('video-canvas');
        // @ts-ignore
        for (const canv of canvases) {
          canv.height = 640;
          canv.width = 480;
          bodyPix.drawMask(
            canv as any, video as any, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
        }
      }
    });
  }

  // tslint:disable-next-line:typedef
  async performPartnerVideo(net) {
    const segmentationProperties = {
      flipHorizontal: SEGM_FLIP_HORIZONTAL,
      internalResolution: INTERNAL_RESOLUTION,
      segmentationThreshold: SEGMENTATION_THRESHOLD,
      scoreThreshold: SCORE_THRESHOLD_ID
    } as PersonInferenceConfig;
    await this.userVideo.nativeElement.load();
    const video = document.getElementById('partnerVideo');
    video.addEventListener('loadeddata', async (event) => {
      while (true) {
        const segmentation = await net.segmentPerson(video, segmentationProperties);

        const backgroundDarkeningMask = bodyPix.toMask(
          segmentation, FOREGROUND_COLOR, BACKGROUND_COLOR);

        const opacity = 1;
        const maskBlurAmount = 0;
        const flipHorizontal = true;
        const canvases = document.getElementsByName('video-canvas');
        // @ts-ignore
        for (const canv of canvases) {
          canv.height = 640;
          canv.width = 480;
          bodyPix.drawMask(
            canv as any, video as any, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
        }
        // const canvas: any = document.getElementById('canvas1');
        // canvas.height = 640;
        // canvas.width = 480;
        // await bodyPix.drawMask(
        //   canvas as any, video as any, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
      }
    });
  }

  // tslint:disable-next-line:typedef
  onStop() {
    this.receivingCall = false;
    this.callAccepted = false;
    this.partnerVideo.nativeElement.pause();
    (this.partnerVideo.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
    this.partnerVideo.nativeElement.srcObject = null;
  }

}















// import {
//   Component,
//   ElementRef,
//   ViewChild,
//   OnInit,
// } from '@angular/core';
// import socket from 'socket.io-client';
// import Peer from 'simple-peer';
// import { isPlatformBrowser } from '@angular/common';
// import * as tfjs from '@tensorflow/tfjs';
// import * as bodyPix from '@tensorflow-models/body-pix';
// import {
//   ARCHITECTURE, BACKGROUND_COLOR, DRAW_FLIP_HORIZONTAL, FOREGROUND_COLOR,
//   INTERNAL_RESOLUTION, MASK_BLUR_AMOUNT,
//   MILTIPLIER, OPACITY,
//   OUTPUT_STRIDE,
//   QUANT_BYTES, SCORE_THRESHOLD_ID,
//   SEGM_FLIP_HORIZONTAL, SEGMENTATION_THRESHOLD
// } from './options';
// import {ModelConfig, PersonInferenceConfig} from '@tensorflow-models/body-pix/dist/body_pix_model';
// import * as util from 'util';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import {AccountService} from '@app/_services';
// import {ActivatedRoute, Router} from '@angular/router';
// import { Location } from '@angular/common';
// import {ConfirmationDialogService} from "@app/confir-dialog-component/confirm-dialog.service";
//
// @Component({
//   selector: 'app-video-call',
//   templateUrl: './video-call.component.html',
//   styleUrls: ['./video-call.component.less']
// })
// export class VideoCallComponent implements OnInit {
//   yourID = JSON.parse(localStorage.getItem('user')).id;
//   yourPeer = '';
//   users = {};
//   stream;
//   receivingCall = false;
//   caller = '';
//   callerSignal;
//   callAccepted = false;
//   form: FormGroup;
//   @ViewChild('userVideo', { static: true }) userVideo: any;
//   @ViewChild('canvas', { static: true }) canvas: any;
//   @ViewChild('partnerVideo', { static: true }) partnerVideo: ElementRef<HTMLVideoElement>;
//   socket;
//   sub;
//   peer;
//
//   constructor(private formBuilder: FormBuilder,
//               private accountService: AccountService,
//               private location: Location,
//               private confirmationDialogService: ConfirmationDialogService,
//   ) {
//   }
//
//   test( ) {
//     console.log('--=--"""""""""""""LL"LLKJH---')
//   }
//
//   async ngOnInit() {
//     const entryData: any = this.location.getState();
//     console.log('---------', entryData)
//     this.form = this.formBuilder.group({
//       data: [''],
//     });
//
//     this.socketsService.socket = socket('http://0.0.0.0:8888/api', {
//       path: '/api',
//       query: { id: JSON.parse(localStorage.getItem('user')).id},
//     });
//
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then(async (stream: MediaStream) => {
//         this.stream = stream;
//         this.userVideo.nativeElement.srcObject = stream;
//         await this.userVideo.nativeElement.play();
//       }).then(async () => {
//         console.log('[][]{{[]', entryData)
//       if (entryData.call) {
//         this.callToUser(entryData.to);
//       } else if (entryData.call === false) {
//         console.log('--====', entryData)
//         this.receivingCall = true;
//         this.caller = entryData.caller;
//         this.callerSignal = JSON.parse(JSON.stringify(entryData.callerSignal));
//         console.log('==-before')
//         await this.timeout(3000);
//         console.log('==-afte')
//         this.acceptCall(entryData.caller, entryData.callerSignal);
//       }
//     });
//     // this.socketsService.socket.on('yourID', (id) => {
//     //   this.yourID = id;
//     // });
//     // this.socketsService.socket.on('allUsers', (users) => {
//     //   this.users = users;
//     // });
//
//
//     // this.socketsService.socket.on('hey', (data) => {
//     //   this.receivingCall = true;
//     //   this.caller = data.from;
//     //   this.callerSignal = data.signal;
//     // });
//
//   }
//
//   async timeout (ms: number) {
//     return await new Promise((resolve, reject) => {
//       setTimeout(() => {
//         resolve();
//       }, ms);
//     });
//   };
//
//   get f() { return this.form.controls; }
//
//   callToUser(userToCallId: string) {
//     this.peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream: this.stream,
//     });
//
//     this.peer.on('signal', (data) => {
//       this.yourPeer = JSON.stringify(data);
//       this.socketsService.socket.emit('CallUser', {
//         userToCall: userToCallId,
//         signalData: data,
//         from: JSON.parse(localStorage.getItem('user')).id,
//       });
//     });
//
//     this.peer.on('stream', async (stream) => {
//       const options = {
//         architecture: ARCHITECTURE,
//         multiplier: MILTIPLIER,
//         outputStride: OUTPUT_STRIDE,
//         quantBytes: QUANT_BYTES
//       } as ModelConfig;
//
//       this.partnerVideo.nativeElement.srcObject = stream;
//       await bodyPix.load(options)
//         .then(net => this.performPartnerVideo(net))
//         .catch(err => console.log(util.inspect(err, {depth: 12})));
//       this.partnerVideo.nativeElement.srcObject = stream;
//     });
//
//     // this.socketsService.socket.on('callAccepted', (signal) => {
//     //   console.log('{{{][]]]]]-callAccepted')
//     //   this.callAccepted = true;
//     //   peer.signal(signal);
//     // });
//   }
//
//   signalPeer(signal) {
//     console.log('{{{][]]]]]-callAccepted')
//     this.callAccepted = true;
//     console.log('????', this.peer)
//     this.peer.signal(signal);
//   }
//
//   onSubmit() {
//     // console.log(this.f.data.value)
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream: this.stream,
//     });
//
//     peer.on('signal', (data) => {
//       this.yourPeer = JSON.stringify(data);
//       this.socketsService.socket.emit('CallUser', {
//         userToCall: this.f.data.value,
//         signalData: data,
//         from: this.yourID,
//       });
//     });
//
//     peer.on('stream', async (stream) => {
//       const options = {
//         architecture: ARCHITECTURE,
//         multiplier: MILTIPLIER,
//         outputStride: OUTPUT_STRIDE,
//         quantBytes: QUANT_BYTES
//       } as ModelConfig;
//
//       this.partnerVideo.nativeElement.srcObject = stream;
//       await bodyPix.load(options)
//         .then(net => this.performPartnerVideo(net))
//         .catch(err => console.log(util.inspect(err, {depth: 12})));
//       this.partnerVideo.nativeElement.srcObject = stream;
//     });
//
//     this.socketsService.socket.on('callAccepted', (signal) => {
//       console.log('{{{][]]]]]-callAccepted')
//       this.callAccepted = true;
//       peer.signal(signal);
//     });
//   }
//
//
//   // tslint:disable-next-line:typedef
//   onStop() {
//     this.receivingCall = false;
//     this.callAccepted = false;
//     this.partnerVideo.nativeElement.pause();
//     (this.partnerVideo.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
//     this.partnerVideo.nativeElement.srcObject = null;
//   }
//
//   // tslint:disable-next-line:typedef
//   acceptCall(caller: string, callerSignal: any) {
//     console.log('-=======&&&&^^^', this.stream)
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream: this.stream,
//     });
//
//     peer.on('signal', data => {
//       console.log('---AcceptCall---')
//       this.socketsService.socket.emit('AcceptCall', { signal: data, to: this.caller });
//     });
//
//     peer.on('stream', async stream => {
//       const options = {
//         architecture: ARCHITECTURE,
//         multiplier: MILTIPLIER,
//         outputStride: OUTPUT_STRIDE,
//         quantBytes: QUANT_BYTES
//       } as ModelConfig;
//
//       this.partnerVideo.nativeElement.srcObject = stream;
//       await bodyPix.load(options)
//         .then(net => this.performPartnerVideo(net))
//         .catch(err => console.log(util.inspect(err, {depth: 12})));
//       this.partnerVideo.nativeElement.srcObject = stream;
//     });
//     console.log('-=-=-=======================', this.callerSignal)
//
//     peer.signal(this.callerSignal);
//   }
//
//
//
//
//   // tslint:disable-next-line:typedef
//   callPeer(id= '6172c741-172b-4762-8c9b-af78323b643c') {
//   }
//
//   async perform(net) {
//     const segmentationProperties = {
//       flipHorizontal: SEGM_FLIP_HORIZONTAL,
//       internalResolution: INTERNAL_RESOLUTION,
//       segmentationThreshold: SEGMENTATION_THRESHOLD,
//       scoreThreshold: SCORE_THRESHOLD_ID
//     } as PersonInferenceConfig;
//     await this.userVideo.nativeElement.load();
//     const video = document.getElementById('video');
//     video.addEventListener('loadeddata', async (event) => {
//       while (true) {
//         const segmentation = await net.segmentPerson(video, segmentationProperties);
//         const backgroundDarkeningMask = bodyPix.toMask(
//           segmentation, FOREGROUND_COLOR, BACKGROUND_COLOR);
//
//         const opacity = 1;
//         const maskBlurAmount = 0;
//         const flipHorizontal = true;
//         const canvases = document.getElementsByName('video-canvas');
//         // @ts-ignore
//         for (const canv of canvases) {
//           canv.height = 640;
//           canv.width = 480;
//           bodyPix.drawMask(
//             canv as any, video as any, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
//         }
//       }
//     });
//   }
//
//   // tslint:disable-next-line:typedef
//   async performPartnerVideo(net) {
//     const segmentationProperties = {
//       flipHorizontal: SEGM_FLIP_HORIZONTAL,
//       internalResolution: INTERNAL_RESOLUTION,
//       segmentationThreshold: SEGMENTATION_THRESHOLD,
//       scoreThreshold: SCORE_THRESHOLD_ID
//     } as PersonInferenceConfig;
//     await this.userVideo.nativeElement.load();
//     const video = document.getElementById('partnerVideo');
//     video.addEventListener('loadeddata', async (event) => {
//       while (true) {
//         const segmentation = await net.segmentPerson(video, segmentationProperties);
//
//         const backgroundDarkeningMask = bodyPix.toMask(
//           segmentation, FOREGROUND_COLOR, BACKGROUND_COLOR);
//
//         const opacity = 1;
//         const maskBlurAmount = 0;
//         const flipHorizontal = true;
//         const canvases = document.getElementsByName('video-canvas');
//         // @ts-ignore
//         for (const canv of canvases) {
//           canv.height = 640;
//           canv.width = 480;
//           bodyPix.drawMask(
//             canv as any, video as any, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
//         }
//         // const canvas: any = document.getElementById('canvas1');
//         // canvas.height = 640;
//         // canvas.width = 480;
//         // await bodyPix.drawMask(
//         //   canvas as any, video as any, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
//       }
//     });
//   }
//
// }
