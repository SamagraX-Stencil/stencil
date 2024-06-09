"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
var fs = require("fs");
var path = require("path");
var fastify = require("fastify");
var common_1 = require("@nestjs/common");
var minio_1 = require("minio");
var file_upload_interface_1 = require("../interfaces/file-upload.interface");
var FileUploadService = /** @class */ (function () {
    function FileUploadService() {
        var _a, _b, _c;
        this.useSSL = false;
        this.logger = new common_1.Logger('FileUploadService');
        this.useMinio = ((_a = process.env.STORAGE_MODE) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'minio';
        this.useSSL = !process.env.STORAGE_USE_SSL
            ? false
            : ((_b = process.env.STORAGE_USE_SSL) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) === 'true';
        switch ((_c = process.env.STORAGE_MODE) === null || _c === void 0 ? void 0 : _c.toLowerCase()) {
            case file_upload_interface_1.STORAGE_MODE.MINIO:
                this.storage = new minio_1.Client({
                    endPoint: process.env.STORAGE_ENDPOINT,
                    port: parseInt(process.env.STORAGE_PORT),
                    useSSL: this.useSSL,
                    accessKey: process.env.STORAGE_ACCESS_KEY,
                    secretKey: process.env.STORAGE_SECRET_KEY,
                });
                break;
            default:
                this.fastifyInstance = fastify();
        }
    }
    FileUploadService.prototype.uploadToMinio = function (filename, file) {
        return __awaiter(this, void 0, void 0, function () {
            var metaData;
            var _this = this;
            return __generator(this, function (_a) {
                metaData = {
                    'Content-Type': file.mimetype,
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.storage.putObject(process.env.MINIO_BUCKETNAME, filename, file.buffer, metaData, function (err) {
                            if (err) {
                                console.log('err: ', err);
                                reject(err);
                            }
                            resolve("".concat(this.useSSL ? 'https' : 'http', "://").concat(process.env.STORAGE_ENDPOINT, ":").concat(process.env.STORAGE_PORT, "/").concat(process.env.MINIO_BUCKETNAME, "/").concat(filename));
                        });
                    })];
            });
        });
    };
    FileUploadService.prototype.saveLocalFile = function (destination, filename, file) {
        return __awaiter(this, void 0, void 0, function () {
            var uploadsDir, localFilePath;
            return __generator(this, function (_a) {
                uploadsDir = path.join(process.cwd(), destination);
                localFilePath = path.join(uploadsDir, filename);
                if (!fs.existsSync(uploadsDir)) {
                    try {
                        // Create the directory
                        fs.mkdirSync(uploadsDir, { recursive: true });
                        this.logger.log("Directory created at ".concat(uploadsDir));
                    }
                    catch (err) {
                        this.logger.error("Error creating directory: ".concat(err.message));
                    }
                }
                else {
                    this.logger.log("Directory already exists at ".concat(uploadsDir));
                }
                fs.writeFileSync(localFilePath, file.buffer);
                return [2 /*return*/, destination];
            });
        });
    };
    FileUploadService.prototype.upload = function (file, destination, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        _a = (_b = process.env.STORAGE_MODE) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                        switch (_a) {
                            case file_upload_interface_1.STORAGE_MODE.MINIO: return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 3];
                    case 1:
                        this.logger.log('using minio');
                        return [4 /*yield*/, this.uploadToMinio(filename, file)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3:
                        this.logger.log('writing to storage');
                        return [4 /*yield*/, this.saveLocalFile(destination, filename, file)];
                    case 4: return [2 /*return*/, _c.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        this.logger.error("Error uploading file: ".concat(error_1));
                        throw new common_1.InternalServerErrorException('File upload failed');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    FileUploadService.prototype.download = function (destination) {
        return __awaiter(this, void 0, void 0, function () {
            var fileStream, localFilePath, fileStream, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.useMinio) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.storage.getObject(process.env.STORAGE_CONTAINER_NAME, destination)];
                    case 1:
                        fileStream = _a.sent();
                        return [2 /*return*/, fileStream];
                    case 2:
                        localFilePath = path.join(process.cwd(), 'uploads', destination);
                        if (fs.existsSync(localFilePath)) {
                            fileStream = fs.createReadStream(localFilePath);
                            return [2 /*return*/, fileStream];
                        }
                        else {
                            this.logger.error("Error downloading file: File does not exist");
                            return [2 /*return*/, null];
                        }
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.logger.error("Error downloading file: ".concat(error_2.message));
                        throw new common_1.InternalServerErrorException('File download failed');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return FileUploadService;
}());
exports.FileUploadService = FileUploadService;
