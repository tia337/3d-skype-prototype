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

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.less']
})
export class VideoCallComponent implements OnInit {
  yourID = '';
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
              ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      data: [''],
    });
    const options = {
      architecture: ARCHITECTURE,
      multiplier: MILTIPLIER,
      outputStride: OUTPUT_STRIDE,
      quantBytes: QUANT_BYTES
    } as ModelConfig;

    console.log('-=-=-=-=-=-=-=-', this.accountService.accountValue);
    this.socket = socket('http://localhost:8888/api', {
      path: '/api',
      query: { id: this.accountService.accountValue},
    });

    // this.socket.on('test', (data) => {
    //   console.log('=-=-=--', data)
    // });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(async (stream: MediaStream) => {
        this.stream = stream;
        this.userVideo.nativeElement.srcObject = stream;
        await this.userVideo.nativeElement.play();
      })
      .then(() => {
        bodyPix.load(options)
          .then(net => this.perform(net))
          .catch(err => console.log(util.inspect(err, {depth: 12})));
      });

    this.socket.on('yourID', (id) => {
      this.yourID = id;
    });
    this.socket.on('allUsers', (users) => {
      this.users = users;
    });
    this.socket.on('hey', (data) => {
      this.receivingCall = true;
      this.caller = data.from;
      this.callerSignal = data.signal;
    });
  }

  // convenience getter for easy access to form fields
  // tslint:disable-next-line:typedef
  get f() { return this.form.controls; }

  // tslint:disable-next-line:typedef
  onSubmit() {
    console.log('----')
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });

    peer.on('signal', (data) => {
      this.socket.emit('CallUser', {
        userToCall: this.f.data.value,
        signalData: data,
        from: this.yourID,
      });
    });

    peer.on('stream', (stream) => {
      this.partnerVideo.nativeElement.srcObject = stream;
    });

    this.socket.on('callAccepted', (signal) => {
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
        const canvas: any = document.getElementById('canvas1');
        canvas.height = 640;
        canvas.width = 480;
        bodyPix.drawMask(
          canvas as any, video as any, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
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

  // tslint:disable-next-line:typedef
  callPeer(id= 1) {
    console.log('id-------', id)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });

    peer.on('signal', (data) => {
      this.yourPeer = JSON.stringify(data);
      this.socket.emit('CallUser', {
        userToCall: id,
        signalData: data,
        from: this.yourID,
      });
    });

    peer.on('stream', (stream) => {
      this.partnerVideo.nativeElement.srcObject = stream;
    });

    this.socket.on('callAccepted', (signal) => {
      this.callAccepted = true;
      peer.signal(signal);
    });
  }

  // tslint:disable-next-line:typedef
  acceptCall() {
    this.callAccepted = true;
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.stream,
    });
    peer.on('signal', data => {
      this.socket.emit('acceptCall', { signal: data, to: this.caller });
    });

    peer.on('stream', async stream => {


      const options = {
        architecture: ARCHITECTURE,
        multiplier: MILTIPLIER,
        outputStride: OUTPUT_STRIDE,
        quantBytes: QUANT_BYTES
      } as ModelConfig;

      this.partnerVideo.nativeElement.srcObject = stream;
      console.log('-=-=-=-==++++++++++++++')
      await bodyPix.load(options)
        .then(net => this.performPartnerVideo(net))
        .catch(err => console.log(util.inspect(err, {depth: 12})));
    });

    peer.signal(this.callerSignal);
  }

}
