import * as vscode from 'vscode';
import * as fs from 'fs';
//  

function getPrismaModels(prismaSchemaPath: string): string[] {
    try {
        const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
        const modelMatches = schemaContent.match(/model\s+(\w+)\s+\{/g);
        if (modelMatches) {
            return modelMatches.map(match => match.replace(/model\s+|\s+\{/g, ''));
        }
        return [];
    } catch (error) {
        console.error('Error reading Prisma schema:', error);
        return [];
    }

}

function getColumnNamesFromModel(prismaSchemaPath: string, modelName: string): string[] {
    try {
        const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
        const modelRegex = new RegExp(`model\\s+${modelName}\\s+{([^}]+)}`, 's');
        const modelMatch = schemaContent.match(modelRegex);
        if (modelMatch) {
            const fields = modelMatch[1].trim().split('\n');
            return fields.map(field => field.trim().split(/\s+/)[0]);
        }
        return [];
    } catch (error) {
        console.error('Error reading Prisma schema:', error);
        return [];
    }
}

function getSeparatorAndValidateColumns(text: string, prismaSchemaPath: string) {
    const possibleSeparators = [","];
    const lines = text.split(/\r?\n/);
    let detectedSeparator = "";
    let model = "";

    const modelNames = getPrismaModels(prismaSchemaPath);
    if (modelNames.length === 0) {
        console.error('No models found in Prisma schema');
        return detectedSeparator;
    }

    for (const modelName of modelNames) {
        const firstLine = lines[0].trim();
        const columnNames = firstLine.split(possibleSeparators[0]);
        const columnsFound = (() => {
            const expectedColumnNames = getColumnNamesFromModel(prismaSchemaPath, modelName);
            return columnNames.length === expectedColumnNames.length &&
                expectedColumnNames.every((value, index) => columnNames.includes(value));
        })();

        if (columnsFound) {
            model = modelName;
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
    
            const selection = editor.selection;
            // Highlight matching columns in the editor
            const decorations: vscode.DecorationOptions[] = [];
            const textLine = editor.document.lineAt(selection.start.line);
            const text = textLine.text;
            const matchingColumns = getColumnNamesFromModel(prismaSchemaPath, model);
            for (let i = 0; i < matchingColumns.length; i++) {
                const index = text.indexOf(matchingColumns[i]);
                if (index !== -1) {
                    const startPos = textLine.range.start.translate(0, index);
                    const endPos = startPos.translate(0, matchingColumns[i].length);
                    decorations.push({ range: new vscode.Range(startPos, endPos), hoverMessage: `Column name match to model ${model}` });
                }
            }
            editor.setDecorations(matchingColumnsDecorationType, decorations);

            break;
        }
    }

    return model;
}

let matchingColumnsDecorationType: vscode.TextEditorDecorationType;

export async function activate(context: vscode.ExtensionContext) {

  matchingColumnsDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(127, 255, 127, 0.3)',
    border: '1px solid rgba(127, 255, 127, 0.7)'
});

    const disposable = vscode.commands.registerCommand('validator-seeder.validateCsv',async () => {

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.selection;

        if (selection.end.line - selection.start.line >= 500) {
            vscode.window.showInformationMessage('Selection is too large');
            return;
        }

        const lineStartPosition = new vscode.Position(selection.start.line, 0);

        const endLine = editor.document.lineAt(selection.end.line);
        const endLineLength = endLine.text.length;
        const lineEndPosition = new vscode.Position(selection.end.line, endLineLength);

        const selectionRange = new vscode.Range(lineStartPosition, lineEndPosition);

        const text = editor.document.getText(selectionRange);

        // Show file picker dialog to select the Prisma schema file
        const prismaSchemaUri =  await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          openLabel: 'Select Prisma Schema File',
          filters: {
              'Prisma Schema': ['prisma']
          }
        });

        if (!prismaSchemaUri || prismaSchemaUri.length === 0) {
            vscode.window.showErrorMessage('No Prisma schema file selected');
            return;
        }

        const prismaSchemaPath = prismaSchemaUri[0].fsPath;

        const result: string|undefined = getSeparatorAndValidateColumns(text, prismaSchemaPath);

        if (result === '') {
            vscode.window.showInformationMessage('Not matched');
            return;
        }

        vscode.window.showInformationMessage(`Column name match to model ${result}`);

    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
  if (matchingColumnsDecorationType) {
    matchingColumnsDecorationType.dispose();
}
 }
