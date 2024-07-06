import handlebars from 'handlebars';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import csvParser from 'csv-parser';
import { resolve } from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Function to read CSV and return student names
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const students = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (row.name) {
          students.push(row.name);
        }
      })
      .on('end', () => {
        resolve(students);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Function to compile Handlebars template
function compileTemplate(data, templateName) {
  const templateHtml = fs.readFileSync(`./templates/${templateName}`, 'utf8');
  const template = handlebars.compile(templateHtml);
  return template(data);
}

// Function to create PDF for a student
async function createPDF(browser, data, pdfPath) {
  const html = compileTemplate(data, 'certificate.html');
  
  const htmlFilePath = `./htmls/${pdfPath.split('/')[2]}.html`;
  await writeFile(htmlFilePath, html);

  const options = {
    format: 'A4',
    printBackground: true,
    path: pdfPath,
  };

  const page = await browser.newPage();

  const absolutePath = resolve(htmlFilePath);
  await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0' });

  await page.pdf(options);
  await page.close();
}

// Main function to generate certificates
async function generateCertificates() {
  const csvFilePath = './data/names.csv';
  const students = await readCSV(csvFilePath);

  // Debugging line to check the read students
  // if (!students || students.length === 0) {
  //   console.error('No students found in the CSV file.');
  //   return;
  // }
  // console.log('Students:', students); 
  
  if (!fs.existsSync('./htmls')) {
    await mkdir('./htmls');
  }
  if (!fs.existsSync('./certificates')) {
    await mkdir('./certificates');
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true,
  });

  const pdfPromises = students.map(student => {
    const data = { name: student, issue_date: new Date().toLocaleDateString() };
    const pdfPath = `./certificates/${student.replace(/\s+/g, '_')}.pdf`;
    return createPDF(browser, data, pdfPath);
  });

  await Promise.all(pdfPromises);
  await browser.close();
}

// IIFE to run the main function and measure execution time
(async () => {
  console.time('Execution Time');
  await generateCertificates();
  console.timeEnd('Execution Time');
})();
