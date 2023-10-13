import { Controller, Post, Body } from '@nestjs/common';
import { WaitingRoomDto } from './dto/waitingroom.dto';
import { WaitingRoomService } from './waitingroom.service';

@Controller('waitingroom')
export class WaitingRoomController {
  constructor(private usersService: WaitingRoomService) {}

  @Post()
  async create(@Body() createUserDto: WaitingRoomDto) {
    return this.usersService.createGame(createUserDto);
  }
}
