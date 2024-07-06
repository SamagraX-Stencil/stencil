import handlebars from 'handlebars';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import { resolve } from 'path';

// Function to read and parse JSON data from a file
function readJsonFile(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

// Import the data from the JSON file
const dummyData = readJsonFile('./data/data.json');
// Add current date dynamically
dummyData.currentDate = new Date().toLocaleDateString('en-US');

export function compileTemplate(data, templateName) {
  const templateHtml = fs.readFileSync(`./templates/${templateName}`, 'utf8');

  const template = handlebars.compile(templateHtml);
  return template(data);
}

export function compileHBS(data, template) {
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(data);
}
export async function createPDF(data, pdfPath) {
 
  const html = compileTemplate(data, 'final.html');

  fs.writeFileSync(`./htmls/${pdfPath.split('/')[2]}.html`, html);

  const options = {
    format: 'A4',
    printBackground: true,
    path: pdfPath,
    displayHeaderFooter: true,
    headerTemplate: '<div style="width: 100%; text-align: center; font-size: 20px; padding: 10px 0;">Samagra-X/Stencil/PDFGenFun</div>',
    footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 10px; padding: 10px 0;">
        Generated on: ${data.currentDate}
      </div>`,
    margin: {
      top: '40px',
      bottom: '60px',
      left: '20px',
      right: '20px',
    },
  };

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: 'new',
    defaultViewport: {
      width: 1024,
      height: 768,
    },
  });

  const page = await browser.newPage();

  await page.goto(
    `file:///home/shiv/Desktop/2024/stencil/stencil-cli/test/htmls/${pdfPath.split('/')[2]
    }.html`,
    { waitUntil: 'networkidle0' },
  );
  // 
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  await page.pdf(options);

  await browser.close();
}

// export async function createPDFFromTemplate(data, template, pdfPath) {
//   // const templateHtml = fs.readFileSync('./templates/final.html', 'utf8');
//   // console.log('templateHtml', templateHtml);
//   // const template = handlebars.compile(templateHtml);
//   const compiledTemplate = handlebars.compile(template);
//   const html = compiledTemplate(data);

//   fs.writeFileSync(`./htmls/${pdfPath.split('/')[2]}.html`, html);
//   const absolutePath = resolve(`./htmls/${pdfPath.split('/')[2]}.html`);
//   const options = {
//     height: 900 / 0.75,
//     width: 600 / 0.75,
//     scale: 1 / 0.75,
//     landscape: true,
//     displayHeaderFooter: false,
//     printBackground: true,
//     path: pdfPath,
//   };

//   const browser = await puppeteer.launch({
//     args: ['--no-sandbox'],
//     headless: 'new',
//     defaultViewport: {
//       width: 1024,
//       height: 768,
//     },
//   });

//   const page = await browser.newPage();
//   await page.goto(
//     // `file:///home/techsavvyash/sweatAndBlood/samagra/C4GT/c4gt-bff/htmls/${pdfPath.split('/')[2]
//     // }.html`,
//     `file://${absolutePath}`,
//     { waitUntil: 'networkidle0' },
//   );

//   await page.evaluate(() => {
//     window.scrollBy(0, window.innerHeight);
//   });
//   await page.pdf(options);

//   await browser.close();
// }

async function main() {
    // const dummyData = {
    //   title: "Hello, World!",
    //   content: "This is a dummy PDF created using Handlebars and Puppeteer"
    // };
  
    const pdfPath = './output/dummy.pdf';
  
    try {
      await createPDF(dummyData, pdfPath);
      console.log(`PDF created successfully at ${pdfPath}`);
    } catch (error) {
      console.error(`Error creating PDF: ${error.message}`);
    }
  }
  
  // Ensure necessary directories exist
  if (!fs.existsSync('./htmls')) {
    fs.mkdirSync('./htmls');
  }
  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
  }
  
  // Run the main function
  (async () => {
    console.time('Execution Time');
    await main();
    console.timeEnd('Execution Time');
  })();