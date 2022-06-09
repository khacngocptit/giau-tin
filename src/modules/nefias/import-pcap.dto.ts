import { ApiProperty } from "@nestjs/swagger";
import { Allow } from "class-validator";

export class ImportPcapDto {
    @ApiProperty({type: "string", format: "binary"})
    @Allow()
    file: string;
    
}