import { Controller, Req, Post } from '@nestjs/common';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
   constructor(private metadataService: MetadataService) { }

   @Post('/upload')
    async upload(@Req() req): Promise<string> {
        const { metadata } = req.body;
        
        return this.metadataService.insert(metadata);
    }

    @Post('/remove')
    async remove(@Req() req) {
        const { cid } = req.body;
        
        await this.metadataService.remove(cid);
    }
}