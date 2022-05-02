export class Participant {

  containerElement: HTMLElement;
  videoElement: HTMLVideoElement;
  connection: RTCPeerConnection;

  constructor(
    readonly userId: string,
  ) {
    this.createHtmlView();
  }

  createHtmlView(): void {
    const container = document.createElement('div');

    container.id = String(this.userId);
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.position = 'relative';


    const span = document.createElement('span');
    const video = document.createElement('video');

    video.id = 'video-' + this.userId;
    video.autoplay = true;
    video.controls = false;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'fill';

    span.style.position = 'absolute';
    span.style.top = '0px';
    span.style.left = '0px';
    span.style.zIndex = '2';
    span.textContent = String(this.userId);
    span.style.textAlign = 'center';
    span.style.padding = '2px';
    span.style.backgroundColor = 'black';
    span.style.color = 'white';
    span.style.opacity = '0.3'; /* Прозрачность слоя */

    container.appendChild(span);
    container.appendChild(video);

    this.containerElement = container;
    this.videoElement = video;
  }


  dispose(): void {
    // todo
    this.containerElement.remove();
    // this.connection.dispose();
  }

}
