import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.less']
})
export class VideoCallComponent implements OnInit, AfterViewInit {

  constructor(
    private readonly elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.addScript();
  }

  addScript() {
    const script = this.renderer.createElement('script');
    script.src = 'https://raw.githubusercontent.com/tia337/3d-skype-prototype/master/src/app/find-participant/script.js';
    script.onload = () => {
      console.log('script loaded');
    };
    this.renderer.appendChild(this.elementRef.nativeElement, script);
  }

}
