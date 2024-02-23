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
            break;
        }
    }

    return model;
}

export async function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand('validator-seeder.validateCsv', () => {

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
        const prismaSchemaPath = "add-file-location"; // Specify the path to your Prisma schema file

        const result: string = getSeparatorAndValidateColumns(text, prismaSchemaPath);

        if (result === '') {
            vscode.window.showInformationMessage('Not matched');
            return;
        }

        vscode.window.showInformationMessage(`Column name match to model ${result}`);

    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
