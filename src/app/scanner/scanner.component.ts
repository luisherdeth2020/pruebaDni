import { Component, OnInit, ViewChild, ElementRef,Renderer2 } from '@angular/core';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
})
export class ScannerComponent implements OnInit {
  @ViewChild('video', { static: true }) video!: ElementRef;
  @ViewChild('capturedImage', { static: true }) capturedImage!: ElementRef;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  captureBox = { x:10, y: 10, width: 200, height: 80 };
  resizing = false;
  resizeHandleSize = 10;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.startVideo();
    this.video.nativeElement.addEventListener('loadedmetadata', this.resizeCanvas.bind(this));
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    this.lockScreenOrientation();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }

  lockScreenOrientation() {
    // Comprobar si el navegador es compatible con la función de bloqueo de orientación de pantalla
    if (screen.orientation && (screen.orientation as any).lock) {
      (screen.orientation as any).lock('landscape'); // Puedes cambiar 'landscape' por 'portrait' si lo prefieres
    }
  }
  startResizing(event: TouchEvent) {
    const touch = event.touches[0];
    const mouseX =
      touch.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    const mouseY =
      touch.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

    // Verificar si el cursor está sobre el borde del cuadro de selección
    const isRightEdge =
      mouseX >
        this.captureBox.x + this.captureBox.width - this.resizeHandleSize &&
      mouseX < this.captureBox.x + this.captureBox.width &&
      mouseY > this.captureBox.y &&
      mouseY < this.captureBox.y + this.captureBox.height;

    const isBottomEdge =
      mouseY >
        this.captureBox.y + this.captureBox.height - this.resizeHandleSize &&
      mouseY < this.captureBox.y + this.captureBox.height &&
      mouseX > this.captureBox.x &&
      mouseX < this.captureBox.x + this.captureBox.width;

    if (isRightEdge || isBottomEdge) {
      this.resizing = true;
    }
  }

  resize(event: TouchEvent) {
    if (!this.resizing) return;
    event.preventDefault();

    const touch = event.touches[0];
    const mouseX = touch.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    const mouseY = touch.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

    // Calcular el cambio en el tamaño en ambas direcciones
    const newWidth = mouseX - this.captureBox.x;
    const newHeight = mouseY - this.captureBox.y;

    // Actualizar el tamaño del cuadro de selección
    this.captureBox.width = Math.max(newWidth, this.resizeHandleSize);

    // Calcular la relación de aspecto del video
    const videoWidth = this.video.nativeElement.videoWidth;
    const videoHeight = this.video.nativeElement.videoHeight;
    const videoAspectRatio = videoWidth / videoHeight;

    // Calcular el nuevo alto del cuadro de selección para mantener la relación de aspecto
    this.captureBox.height = this.captureBox.width / videoAspectRatio;

    // Ajustar la posición del cuadro de selección para mantenerlo dentro del canvas
    if (this.captureBox.x + this.captureBox.width > this.canvas.nativeElement.width) {
      this.captureBox.x = this.canvas.nativeElement.width - this.captureBox.width;
    }
    if (this.captureBox.y + this.captureBox.height > this.canvas.nativeElement.height) {
      this.captureBox.y = this.canvas.nativeElement.height - this.captureBox.height;
    }

    // Volver a dibujar el cuadro de selección
    this.drawCaptureBox();
  }




  stopResizing() {
    // this.resizing = false;
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    this.resizeCanvas();
    // this.startVideo();
  }

  resizeCanvas() {
    const videoElement: HTMLVideoElement = this.video.nativeElement;
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    const oldCanvasWidth = this.canvas.nativeElement.width;
    const oldCanvasHeight = this.canvas.nativeElement.height;

    this.canvas.nativeElement.width = videoWidth;
    this.canvas.nativeElement.height = videoHeight;

    // Ajustar las coordenadas del cuadro de selección en relación con el cambio de tamaño del canvas
    this.captureBox.x = (this.captureBox.x / oldCanvasWidth) * videoWidth;
    this.captureBox.y = (this.captureBox.y / oldCanvasHeight) * videoHeight;
    this.captureBox.width = (this.captureBox.width / oldCanvasWidth) * videoWidth;
    this.captureBox.height = (this.captureBox.height / oldCanvasHeight) * videoHeight;


    this.drawCaptureBox();
  }


  async startVideo() {
    if (navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        const videoElement: HTMLVideoElement = this.video.nativeElement;
        videoElement.srcObject = stream;
      } catch (error) {
        console.error('Error accessing the camera', error);
      }
    }
  }

  drawCaptureBox() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = '#FF0000';
      ctx.strokeRect(
        this.captureBox.x,
        this.captureBox.y,
        this.captureBox.width,
        this.captureBox.height
      );

      console.log('x--', this.captureBox.x);
      console.log('y--', this.captureBox.y);
      console.log('width---', this.captureBox.width);
      console.log('height---', this.captureBox.height);

      // Dibujar el asa de redimensionamiento
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(
        this.captureBox.x + this.captureBox.width - this.resizeHandleSize,
        this.captureBox.y + this.captureBox.height - this.resizeHandleSize,
        this.resizeHandleSize,
        this.resizeHandleSize
      );
    }
  }

  captureImage() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    const capturedCanvas = document.createElement('canvas');
    const capturedCtx = capturedCanvas.getContext('2d');

    if (ctx && capturedCtx) {
      // Obtener las dimensiones reales del video original
      const videoWidth = this.video.nativeElement.videoWidth;
      const videoHeight = this.video.nativeElement.videoHeight;

      // Calcular las proporciones entre el cuadro de selección y las dimensiones reales del video
      const widthRatio = videoWidth / this.canvas.nativeElement.width;
      const heightRatio = videoHeight / this.canvas.nativeElement.height;

      // Calcular la posición y el tamaño del cuadro de captura en relación con el video original
      const captureBoxX = this.captureBox.x * widthRatio;
      const captureBoxY = this.captureBox.y * heightRatio;
      const captureBoxWidth = this.captureBox.width * widthRatio;
      const captureBoxHeight = this.captureBox.height * heightRatio;

      // Configurar el tamaño del lienzo capturado para que coincida con las dimensiones del cuadro de captura
      capturedCanvas.width = captureBoxWidth;
      capturedCanvas.height = captureBoxHeight;

      // Dibujar el cuadro de captura en el lienzo capturado, ajustando las proporciones del video original
      capturedCtx.drawImage(
        this.video.nativeElement,
        captureBoxX,
        captureBoxY,
        captureBoxWidth,
        captureBoxHeight,
        0,
        0,
        captureBoxWidth,
        captureBoxHeight
      );

      // Obtener la URL de la imagen del lienzo capturado en base64
      const imageDataUrl = capturedCanvas.toDataURL('image/png');
      console.log('Image data URL:', imageDataUrl);

      // Mostrar la imagen capturada en el elemento img
      this.capturedImage.nativeElement.src = imageDataUrl;
      this.capturedImage.nativeElement.style.display = 'block';
      this.capturedImage.nativeElement.style.position = 'absolute';
    } else {
      console.error('Contexto de canvas no disponible.');
    }
  }



  startMoving(event: MouseEvent) {
    event.preventDefault();
    const mouseX =
      event.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    const mouseY =
      event.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

    if (
      mouseX > this.captureBox.x &&
      mouseX < this.captureBox.x + this.captureBox.width &&
      mouseY > this.captureBox.y &&
      mouseY < this.captureBox.y + this.captureBox.height
    ) {
      this.resizing = false;
      this.canvas.nativeElement.addEventListener(
        'mousemove',
        this.move.bind(this)
      );
    }
  }

  move(event: MouseEvent) {
    const mouseX =
      event.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    const mouseY =
      event.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

    const offsetX = mouseX - this.captureBox.width / 2;
    const offsetY = mouseY - this.captureBox.height / 2;

    this.captureBox.x = offsetX;
    this.captureBox.y = offsetY;

    this.drawCaptureBox();
  }
  stopMoving() {
    this.canvas.nativeElement.removeEventListener(
      'mousemove',
      this.move.bind(this)
    );
  }

  startTouchMoving(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const touchX = touch.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    const touchY = touch.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

    // Verificar si el toque está dentro del cuadro de selección
    const isInsideBox =
      touchX > this.captureBox.x &&
      touchX < this.captureBox.x + this.captureBox.width &&
      touchY > this.captureBox.y &&
      touchY < this.captureBox.y + this.captureBox.height;

    // Verificar si el toque está en el borde del cuadro de selección para redimensionar
    const isRightEdge =
      touchX > this.captureBox.x + this.captureBox.width - this.resizeHandleSize &&
      touchX < this.captureBox.x + this.captureBox.width &&
      touchY > this.captureBox.y &&
      touchY < this.captureBox.y + this.captureBox.height;

    const isBottomEdge =
      touchY > this.captureBox.y + this.captureBox.height - this.resizeHandleSize &&
      touchY < this.captureBox.y + this.captureBox.height &&
      touchX > this.captureBox.x &&
      touchX < this.captureBox.x + this.captureBox.width;

    if (isInsideBox && !isRightEdge && !isBottomEdge) {
      // Si el toque está dentro del cuadro pero no en el borde, activamos el modo de movimiento
      this.resizing = false;
      this.canvas.nativeElement.addEventListener('touchmove', this.touchMove.bind(this));
    } else if ((isRightEdge || isBottomEdge) && !this.resizing) {
      // Si el toque está en el borde y no estamos ya redimensionando, activamos el modo de redimensionamiento
      this.resizing = true;
      this.canvas.nativeElement.addEventListener('touchmove', this.touchMove.bind(this));
    }
  }



touchMove(event: TouchEvent) {
  const touch = event.touches[0];
  const touchX = touch.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
  const touchY = touch.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

  if (!this.resizing) {
    // Modo de movimiento del cuadro
    const offsetX = touchX - this.captureBox.width / 2;
    const offsetY = touchY - this.captureBox.height / 2;

    this.captureBox.x = offsetX;
    this.captureBox.y = offsetY;

    this.drawCaptureBox();
  } else {
    // Modo de redimensionamiento
    const newWidth = touchX - this.captureBox.x;
    const newHeight = touchY - this.captureBox.y;

    this.captureBox.width = Math.max(newWidth, this.resizeHandleSize);
    this.captureBox.height = Math.max(newHeight, this.resizeHandleSize);

    this.drawCaptureBox();
  }
}

stopTouchMoving() {
  this.canvas.nativeElement.removeEventListener('touchmove', this.touchMove.bind(this));
}

copyImageUrlToClipboard() {
    const imageUrl = this.capturedImage.nativeElement.src;
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl).then(() => {
        console.log('URL de la imagen copiada al portapapeles:', imageUrl);
        alert('URL de la imagen copiada al portapapeles.');
      }).catch(error => {
        console.error('Error al copiar la URL de la imagen:', error);
        alert('Error al copiar la URL de la imagen.');
      });
    } else {
      console.warn('No hay URL de imagen para copiar.');
      alert('No hay URL de imagen para copiar.');
    }
  }
}
