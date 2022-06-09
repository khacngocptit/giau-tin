import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { ResponseDto } from "src/common/dto/response/response.dto";
import { UploadHelper } from "../file-manager/common/upload-helper";
import { ImportPcapDto } from "./import-pcap.dto";
import { NefiasService } from "./nefias.service";

@Controller("nefias")
@ApiTags("Nefias")
export class NefiasController {
    constructor(
        private readonly nefiasSerivce: NefiasService,
    ) { }

    @Post()
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("file", UploadHelper.documentUpload))
    @ApiBody({ type: ImportPcapDto })
    async nefias(@UploadedFile() file: Express.Multer.File) {
        const data = await this.nefiasSerivce.nefias(file);
        return ResponseDto.create(data);
    }

}
