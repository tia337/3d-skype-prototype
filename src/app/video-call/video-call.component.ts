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
import {AccountService, AlertService} from "@app/_services";
import { Location } from '@angular/common';
import {SocketsService} from "@app/socket-service/sockets.service";
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.less']
})
export class VideoCallComponent implements OnInit, AfterViewInit, OnDestroy {
  yourID = JSON.parse(localStorage.getItem('user')).id;
  peer;
  users = {};
  stream;
  receivingCall = false;
  caller = '';
  callerSignal;
  callAccepted = false;
  form: FormGroup;
  @ViewChild('userVideo', { static: true }) userVideo: any;
  // @ViewChild('canvas', { static: true }) canvas: any;
  @ViewChild('partnerVideo', { static: true }) partnerVideo: ElementRef<HTMLVideoElement>;
  socket;

  constructor(private formBuilder: FormBuilder,
              private accountService: AccountService,
              private location: Location,
              private readonly socketsService: SocketsService,
              private readonly elementRef: ElementRef,
              private renderer: Renderer2,
              private router: Router,
              private alertService: AlertService,
  ) {
  }

  ngOnDestroy() {
    if (this.partnerVideo && this.partnerVideo.nativeElement && this.partnerVideo.nativeElement.srcObject) {
      this.partnerVideo.nativeElement.pause();
      (this.partnerVideo.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    if (this.userVideo && this.userVideo.nativeElement && this.userVideo.nativeElement.srcObject) {
      this.userVideo.nativeElement.pause();
      (this.userVideo.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    this.socketsService.socket.emit('CallEnd', {
      to: this.caller,
      from: JSON.parse(localStorage.getItem('user')).id,
    });
    if (this.peer) {
    }
    this.partnerVideo.nativeElement.srcObject = null;
    document.location.reload();
  }

  ngAfterViewInit(): void {
    this.addScript();
  }

  addScript() {
    const script = this.renderer.createElement('script');
    script.src = 'https://test-illya-test.s3.eu-central-1.amazonaws.com/test.js';
    script.onload = () => {
      console.log('script loaded');
    };
    this.renderer.appendChild(this.elementRef.nativeElement, script);
  }

  async ngOnInit() {
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
        this.notifySecondUser(entryData.to, entryData.email);
      } else if (entryData.call === false) {
        this.callToUser(entryData.from);
      }
    });

    this.socketsService.socket.on('hey', (data) => {
      console.log('-===============######')
      this.receivingCall = true;
      this.caller = data.from;
      this.callerSignal = data.signal;
      this.acceptCall(data.from);
    });

    this.socketsService.socket.on('cancelCall', () => {
      console.log('---- cancelCall');
      if (this.partnerVideo && this.partnerVideo.nativeElement && this.partnerVideo.nativeElement.srcObject) {
        this.partnerVideo.nativeElement.pause();
        (this.partnerVideo.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (this.userVideo && this.userVideo.nativeElement && this.userVideo.nativeElement.srcObject) {
        this.userVideo.nativeElement.pause();
        (this.userVideo.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }

      this.userVideo.nativeElement.srcObject = null;
      this.partnerVideo.nativeElement.srcObject = null;
      document.location.reload();

      this.router.navigateByUrl('/', {
        state: {
          ended: true,
        }
      });
      // await this.timeout(2000);
    });

    this.socketsService.socket.on('callAccepted', (signal) => {
      console.log('{{{][]]]]]-callAccepted')
      this.callAccepted = true;
      this.peer.signal(signal);
    });

  }

  async timeout(time: number) {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  notifySecondUser(userToCallId: string, email: string) {
    console.log('-=-999', userToCallId)
    this.socketsService.socket.emit('UserCallRequest', {
      to: userToCallId,
      email,
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
      iceTransportPolicy: 'relay',
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
      console.log('---emited---');
      this.socketsService.socket.emit('CallUser', {
        userToCall: userToCallId,
        signalData: data,
        from: JSON.parse(localStorage.getItem('user')).id,
      });
    });

    this.caller = userToCallId;

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
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });

    peer.on('signal', (data) => {
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
  onStop() {
    this.receivingCall = false;
    this.callAccepted = false;
    this.partnerVideo.nativeElement.pause();
    this.socketsService.socket.emit('CallEnd', {
      to: this.caller,
      from: JSON.parse(localStorage.getItem('user')).id,
    });

    if (this.partnerVideo && this.partnerVideo.nativeElement && this.partnerVideo.nativeElement.srcObject) {
      this.partnerVideo.nativeElement.pause();
      (this.partnerVideo.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    if (this.userVideo && this.userVideo.nativeElement && this.userVideo.nativeElement.srcObject) {
      this.userVideo.nativeElement.pause();
      (this.userVideo.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }

    this.partnerVideo.nativeElement.srcObject = null;
    document.location.reload();

    this.router.navigateByUrl('/', { state: {
        call: true,
      }});
  }

}

