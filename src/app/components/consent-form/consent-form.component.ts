import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import downloadjs from 'downloadjs';
import SignaturePad from 'signature_pad';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-consent-form',
  templateUrl: './consent-form.component.html',
  styleUrls: ['./consent-form.component.scss'],
})
export class ConsentFormComponent implements OnInit {
  @HostListener('window:resize')
  public onResize(): void {
    this.adjustCanvasSize();
  }

  @ViewChild('canvas')
  public canvasRef: ElementRef<HTMLCanvasElement>;

  private signaturePad: SignaturePad;

  public dateToday = new Date();

  public consultant: string;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.consultant = this.route.snapshot.paramMap.get('consultant');
  }

  ngOnInit(): void {
    this.adjustCanvasSize();
  }

  private async getByteArray(): Promise<any> {
    const blob = await this.http
      .get('assets/UE_Consent_Form.pdf', { responseType: 'blob' })
      .toPromise();

    return await new Response(blob).arrayBuffer();
  }

  public adjustCanvasSize(): void {
    setTimeout(() => {
      const canvas = this.canvasRef.nativeElement;

      // Set the canvas dimensions to match its container

      canvas.style.height = '100%';
      // ...then set the internal size to match
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      this.signaturePad = new SignaturePad(this.canvasRef.nativeElement);
      // this.signaturePad.backgroundColor = '#E9ECEF';
    }, 200);
  }
  public async save(): Promise<void> {
    if (this.signaturePad.isEmpty()) {
      alert('Signature is required.');
      return;
    }

    const url = this.signaturePad.toDataURL();
    const byte = await fetch(url).then((b) => b.arrayBuffer());

    const pdf = await this.getByteArray();
    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(pdf);

    const jpgImage = await pdfDoc.embedPng(byte);
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawImage(jpgImage, {
      x: 50,
      y: 245,
      width: 200,
      height: 70,
    });

    firstPage.drawText(this.consultant, {
      x: 80,
      y: 217,
      font: font,
      size: 16,
    });

    firstPage.drawText(this.dateToday.toDateString(), {
      x: 240,
      y: 217,
      font: font,
      size: 16,
    });

    firstPage.drawText(this.dateToday.toDateString(), {
      x: 240,
      y: 270,
      font: font,
      size: 16,
    });

    const pdfBytes = await pdfDoc.save();

    downloadjs(pdfBytes, 'pdf-lib_creation_example.pdf', 'application/pdf');
    alert('Saved!');
  }

  public clear(): void {
    this.signaturePad.clear();
  }
}
