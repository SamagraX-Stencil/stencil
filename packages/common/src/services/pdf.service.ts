import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import puppeteer, { Browser, PDFOptions, PaperFormat } from 'puppeteer';
import * as csvParser from 'csv-parser';
import { resolve, extname } from 'path';
import { promisify } from 'util';
import { Readable } from 'stream';
import { MultipartFile } from '../interfaces/file-upload.interface';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

interface Data {
  name: string;
  issue_date: string;
}

@Injectable()
export class PdfService {
  private readCSV(file: MultipartFile): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const entries: string[] = [];
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null); 

      bufferStream
        .pipe(csvParser())
        .on('data', (row) => {
          if (row.name) {
            entries.push(row.name);
          }
        })
        .on('end', () => {
          resolve(entries);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async compileTemplate(data: Data, templateContent: string, templatePath: string): Promise<string> {
    const ext = extname(templatePath).toLowerCase();
    let html = '';

    switch (ext) {
      case '.hbs' || '.html':
        const template = handlebars.compile(templateContent);
        html = template(data);
        break;

      default:
        throw new Error('Unsupported template format');
    }

    return html;
  }

  private async createPDF(browser: Browser, data: Data, pdfPath: string, templateContent: string, templatePath: string): Promise<void> {
    const html = await this.compileTemplate(data, templateContent, templatePath);
    
    const htmlFilePath = `./htmls/${pdfPath.split('/')[2]}.html`;
    await writeFile(htmlFilePath, html);

    const options: PDFOptions = {
      format: 'A4' as PaperFormat,
      printBackground: true,
      path: pdfPath,
    };

    const page = await browser.newPage();
    const absolutePath = resolve(htmlFilePath);
    await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0' });

    await page.pdf(options);
    await page.close();
  }

  async generateCertificates(csvFile: MultipartFile, templateFile: MultipartFile, outputPath?: string): Promise<void> {
    const entries = await this.readCSV(csvFile);

    if (!entries || entries.length === 0) {
      console.error('No data found in the CSV file.');
      return;
    }

    const templateContent = templateFile.buffer.toString();
    const templatePath = templateFile.originalname;

    const htmlDir = './htmls';
    const pdfDir = outputPath || './certificates';

    if (!fs.existsSync(htmlDir)) {
      await mkdir(htmlDir);
    }
    if (!fs.existsSync(pdfDir)) {
      await mkdir(pdfDir);
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
    });

    const pdfPromises = entries.map(entry => {
      const data: Data = { name: entry, issue_date: new Date().toLocaleDateString() };
      const pdfPath = `${pdfDir}/${entry.replace(/\s+/g, '_')}.pdf`;
      return this.createPDF(browser, data, pdfPath, templateContent, templatePath);
    });

    await Promise.all(pdfPromises);
    await browser.close();
  }
}
