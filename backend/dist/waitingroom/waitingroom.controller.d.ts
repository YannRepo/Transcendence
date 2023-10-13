import { WaitingRoomDto } from './dto/waitingroom.dto';
import { WaitingRoomService } from './waitingroom.service';
export declare class WaitingRoomController {
    private usersService;
    constructor(usersService: WaitingRoomService);
    create(createUserDto: WaitingRoomDto): Promise<void>;
}
