import { Controller, Req, Post } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
   constructor(private imageService: ImageService) { }
  
    @Post('/upload')
    async upload(@Req() req): Promise<string> {
        const { image } = req.body;
        
        return this.imageService.insert(image);
    }

    @Post('/remove')
    async remove(@Req() req) {
        const { cid } = req.body;
        
        await this.imageService.remove(cid);
    }
}