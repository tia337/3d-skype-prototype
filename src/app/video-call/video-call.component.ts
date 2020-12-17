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
    script.src = 'http://yourjavascript.com/25112200338/script.js';
    script.onload = () => {
      console.log('script loaded');
    };
    this.renderer.appendChild(this.elementRef.nativeElement, script);
  }

}
