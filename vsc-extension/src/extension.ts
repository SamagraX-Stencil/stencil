import * as vscode from 'vscode';
import * as fs from 'fs';
//  

let prismaSchemaPath: string | undefined;

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
    let unexpectedColumns: string[] = [];

    const modelNames = getPrismaModels(prismaSchemaPath);
    if (modelNames.length === 0) {
        console.error('No models found in Prisma schema');
        return { model: "", unmatchedColumns: [] };
    }

    for (const modelName of modelNames) {
        const firstLine = lines[0].trim();
        const columnNames = firstLine.split(possibleSeparators[0]);
        const expectedColumnNames = getColumnNamesFromModel(prismaSchemaPath, modelName);

        if (columnNames.length === expectedColumnNames.length &&
            expectedColumnNames.every((value, index) => columnNames.includes(value))) {
            model = modelName;
        } else {
            unexpectedColumns = columnNames.filter(column => !expectedColumnNames.includes(column));
        }

        if (model !== "" || unexpectedColumns.length > 0) {
            break;
        }
    }

    return { model,  unexpectedColumns};
}

let decorationType: vscode.TextEditorDecorationType;

export async function activate(context: vscode.ExtensionContext) {
    const disposableSetPrismaSchemaPath = vscode.commands.registerCommand('validator-seeder.setPrismaSchemaPath', async () => {
        const prismaSchemaPath = await vscode.window.showInputBox({
            prompt: "Enter the path to your Prisma schema file"
        });
        if (prismaSchemaPath) {
            vscode.workspace.getConfiguration().update('validator-seeder.prismaSchemaPath', prismaSchemaPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Prisma schema path has been set');
        }
    });

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
        // const prismaSchemaPath = "E:\\opensource\\stencil\\vsc-extension\\prisma\\schema.prisma"; // Specify the path to your Prisma schema file
        prismaSchemaPath = vscode.workspace.getConfiguration().get('validator-seeder.prismaSchemaPath');
        if (!prismaSchemaPath) {
            vscode.window.showInformationMessage('Prisma schema path is not configured');
            return;
        }

        const { model, unexpectedColumns } = getSeparatorAndValidateColumns(text, prismaSchemaPath);


     decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'red',
            color: 'white'
        });

        if (unexpectedColumns && unexpectedColumns.length > 0) {
            const decorations: vscode.DecorationOptions[] = [];
            unexpectedColumns.forEach(column => {
                const columnIndex = text.indexOf(column);
                if (columnIndex !== -1) {
                    const startPos = editor.document.positionAt(columnIndex);
                    const endPos = editor.document.positionAt(columnIndex + column.length);
                    const range = new vscode.Range(startPos, endPos);
                    decorations.push({ range, hoverMessage: 'Unexpected column' });
                }
            });
            editor.setDecorations(decorationType, decorations);
            vscode.window.showInformationMessage(`Highlighted unexpected columns in red`);
        } else if (model === '') {
            editor.setDecorations(decorationType, []);
            vscode.window.showInformationMessage('Not matched');
        } else {
            editor.setDecorations(decorationType, []);
            vscode.window.showInformationMessage(`Column name match to model ${model}`);
        }
        
    });

    context.subscriptions.push(disposable,disposableSetPrismaSchemaPath);
}

export function deactivate() { 
    if (decorationType) {
        decorationType.dispose();
    }
}
