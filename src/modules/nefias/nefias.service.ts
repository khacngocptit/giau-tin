import { BadRequestException, Injectable } from "@nestjs/common";
import { Express } from "express";
import { UploadHelper } from "../file-manager/common/upload-helper";
const { execSync } = require("child_process");
import * as moment from "moment";

@Injectable()
export class NefiasService {
    async nefias(file: Express.Multer.File) {
        const path = UploadHelper.getPath(file.filename);
        try {
            const filecsv = `filecsv_${+moment()}.csv`;
            await execSync(`./pcapng2csv.sh ${path} ${filecsv}`);
            const flow = await execSync(`./nefias_master.sh --slave-hostconfig=slaves.cfg --slave-script=scripts/kappa_TCP_seqmod_message_ordering_pattern.sh --traffic-source=${filecsv}`);
            console.log(flow);
            return null;
        } catch (error) {
            throw new BadRequestException(error);
        }

    }
}
