import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { ErrorData } from "src/common/exception/error-data";
import { StringUtil } from "src/util/string.util";
import { FileManagerError, UploadType } from "./file-manager.constant";
const multer = require("multer");
export class UploadHelper {
    static readonly UPLOAD_DIR = "";

    static getPath(filename: string) {
        return filename;
    }

    static documentUpload: MulterOptions = {
        storage: multer.diskStorage({
            destination: UploadHelper.UPLOAD_DIR,
            filename: (req: Express.Request, file: Express.Multer.File, cb) => {
                const safeName = StringUtil.normalizeFileName(file.originalname);
                const filename = `${file.fieldname}-${Date.now()}-${safeName}`;
                cb(null, `${UploadType.DOCUMENT}_${filename}`);
            },
        }),
    };
}
