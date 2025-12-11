import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  standalone: false,
  selector: 'app-signature-question',
  templateUrl: './signature-question.component.html',
  styleUrls: ['./signature-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatureQuestionComponent implements AfterViewInit, OnDestroy {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  hasSignature = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Set up event listeners
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));

    // Touch support
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    canvas.addEventListener('touchend', this.stopDrawing.bind(this));
  }

  ngOnDestroy(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.removeEventListener('mousedown', this.startDrawing.bind(this));
      canvas.removeEventListener('mousemove', this.draw.bind(this));
      canvas.removeEventListener('mouseup', this.stopDrawing.bind(this));
      canvas.removeEventListener('mouseleave', this.stopDrawing.bind(this));
      canvas.removeEventListener(
        'touchstart',
        this.handleTouchStart.bind(this)
      );
      canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      canvas.removeEventListener('touchend', this.stopDrawing.bind(this));
    }
  }

  private getCanvasCoords(e: MouseEvent | Touch): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private startDrawing(e: MouseEvent): void {
    this.isDrawing = true;
    const coords = this.getCanvasCoords(e);
    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  private draw(e: MouseEvent): void {
    if (!this.isDrawing) return;
    const coords = this.getCanvasCoords(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastX = coords.x;
    this.lastY = coords.y;
    this.hasSignature = true;
  }

  private stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveSignature();
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    const coords = this.getCanvasCoords(touch);
    this.isDrawing = true;
    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.isDrawing) return;
    const touch = e.touches[0];
    const coords = this.getCanvasCoords(touch);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastX = coords.x;
    this.lastY = coords.y;
    this.hasSignature = true;
  }

  private saveSignature(): void {
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    const control = this.form.get(this.question.id);
    if (control) {
      control.setValue(dataUrl);
      control.markAsTouched();
    }
    this.cdr.markForCheck();
  }

  clear(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasSignature = false;
    const control = this.form.get(this.question.id);
    if (control) {
      control.setValue(null);
    }
    this.cdr.markForCheck();
  }
}
