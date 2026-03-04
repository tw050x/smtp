import { resolve } from "node:path";
import { Options, compileFile } from "pug";

const compileFileOptions: Options = {
  basedir: resolve(__dirname, './template'),
}

// Paths to document template files
const connectionsDocumentTemplatePath = resolve(__dirname, './template/document/connections.pug');
const connectionsByUuidDocumentTemplatePath = resolve(__dirname, './template/document/connection-by-uuid.pug');
const dashboardDocumentTemplatePath = resolve(__dirname, './template/document/dashboard.pug');
const forbiddenDocumentTemplatePath = resolve(__dirname, './template/document/forbidden.pug');
const notFoundDocumentTemplatePath = resolve(__dirname, './template/document/not-found.pug');
const unrecoverableDocumentTemplatePath = resolve(__dirname, './template/document/unrecoverable.pug');

// Paths to partials template files
const connectionsTablePartialTemplatePath = resolve(__dirname, './template/partial/table/connections.pug');
const overviewTablePartialTemplatePath = resolve(__dirname, './template/partial/table/overview.pug');

// Compiled document template files
export const connectionsDocumentTemplate = compileFile(connectionsDocumentTemplatePath, compileFileOptions);
export const connectionsByUuidDocumentTemplate = compileFile(connectionsByUuidDocumentTemplatePath, compileFileOptions);
export const dashboardDocumentTemplate = compileFile(dashboardDocumentTemplatePath, compileFileOptions);
export const forbiddenDocumentTemplate = compileFile(forbiddenDocumentTemplatePath, compileFileOptions);
export const notFoundDocumentTemplate = compileFile(notFoundDocumentTemplatePath, compileFileOptions);
export const unrecoverableDocumentTemplate = compileFile(unrecoverableDocumentTemplatePath, compileFileOptions);

//
export const connectionsTablePartialTemplate = compileFile(connectionsTablePartialTemplatePath, compileFileOptions);
export const overviewTablePartialTemplate = compileFile(overviewTablePartialTemplatePath, compileFileOptions);
