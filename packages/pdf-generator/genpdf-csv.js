import handlebars from 'handlebars';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import { resolve } from 'path';
import csvParser from 'csv-parser';
function generateSectionsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const sections = [];
        let currentSection = null;
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                if (currentSection === null) {
                    currentSection = {
                        items: [],
                    };
                    sections.push(currentSection);
                }
                currentSection.items.push({
                    item: row.item,
                    description: row.description,
                    quantity: row.quantity,
                    price: row.price,
                });
            })
            .on('end', () => {
                resolve(sections);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

export async function compileTemplate(data, templateName) {
  const templateHtml = fs.readFileSync(`./templates/${templateName}`, 'utf8');
  const template = handlebars.compile(templateHtml);
  return template(data);
}

export async function createPDF(data, pdfPath) {
  const html = await compileTemplate(data, 'final.html');

  fs.writeFileSync(`./htmls/${pdfPath.split('/')[2]}.html`, html);

  const options = {
    format: 'A4',
    printBackground: true,
    path: pdfPath,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
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
    headless: true,
    defaultViewport: {
      width: 1024,
      height: 768,
    },
  });

  const page = await browser.newPage();

  const absolutePath = resolve(`./htmls/${pdfPath.split('/')[2]}.html`);
  await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0' });

  await page.pdf(options);

  await browser.close();
}

// Main function to generate a comprehensive PDF
async function main() {
  const csvFilePath = './data/data.csv';
  const pdfPath = './output/comprehensive.pdf';

  try {
    const sections = await generateSectionsFromCSV(csvFilePath);
    const dummyData = {
      title: "Comprehensive Report",
      introduction: "This is a comprehensive report generated dynamically.",
      sections,
      details: "Here are the details of the report.",
      currentDate: new Date().toLocaleDateString('en-US')
    };

    await createPDF(dummyData, pdfPath);
    console.log(`PDF created successfully at ${pdfPath}`);
  } catch (error) {
    console.error(`Error creating PDF: ${error.message}`);
  }
}


(async () => {
  console.time('Execution Time');
  await main();
  console.timeEnd('Execution Time');
})();
