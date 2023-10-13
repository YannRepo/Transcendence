import { ChannelService } from './channel.service';
import { ChannelDto } from './dto';
import { Channel, ChannelType } from '@prisma/client';
import { ChannelUsersService } from '../users/channelusers.service';
export declare class ChannelController {
    private channelService;
    private channelUser;
    constructor(channelService: ChannelService, channelUser: ChannelUsersService);
    createChannel(dto: ChannelDto): Promise<Channel>;
    getChannels(): Promise<Channel[]>;
    getConversations(fromUserId: number): Promise<Channel[]>;
    getChannelById(id: number): Promise<{
        id: number;
        name: string;
        description: string;
        password: string;
        type: import(".prisma/client").$Enums.ChannelType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getChannelByName(name: string): Promise<{
        id: number;
        name: string;
        description: string;
        password: string;
        type: import(".prisma/client").$Enums.ChannelType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setChannelName(id: number, name: string): Promise<{
        error: string;
    }> | {
        error: string;
    };
    setChannelDescription(id: number, description: string): Promise<{
        error: string;
    }> | {
        error: string;
    };
    setChannelPassword(id: number, password: string): Promise<void> | {
        error: string;
    };
    setChannelType(id: number, type: ChannelType): Promise<void> | {
        error: string;
    };
    deleteChannelById(id: number): Promise<void>;
    getUsersFromChannel(channelId: number): Promise<({
        user: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            username: string;
            isLogged: boolean;
            inChat: boolean;
            inGame: boolean;
            gamesWon: number;
            gamesLost: number;
            score: number;
            userSecret: string;
            firstLogin: boolean;
            avatarId: number;
            IstwoFactorAuth: boolean;
            IsSigninWith42: boolean;
            hash: string;
            hashedRt: string;
            blockedIds: number[];
            achievementChat: boolean;
            achievementPong: boolean;
            achievementAvatar: boolean;
        };
    } & {
        id: number;
        userId: number;
        channelId: number;
        role: import(".prisma/client").$Enums.ChannelUserRole;
        socketIds: string[];
    })[]>;
    getUserFromChannelById(userId: number, channelId: number): Promise<{
        user: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            username: string;
            isLogged: boolean;
            inChat: boolean;
            inGame: boolean;
            gamesWon: number;
            gamesLost: number;
            score: number;
            userSecret: string;
            firstLogin: boolean;
            avatarId: number;
            IstwoFactorAuth: boolean;
            IsSigninWith42: boolean;
            hash: string;
            hashedRt: string;
            blockedIds: number[];
            achievementChat: boolean;
            achievementPong: boolean;
            achievementAvatar: boolean;
        };
    } & {
        id: number;
        userId: number;
        channelId: number;
        role: import(".prisma/client").$Enums.ChannelUserRole;
        socketIds: string[];
    }>;
    getUserPunishment(userId: number, channelId: number): Promise<{
        id: number;
        userId: number;
        channelId: number;
        adminUsername: string;
        type: string;
        createdAt: Date;
        expireAt: Date;
        duration: number;
        reason: string;
    }[]>;
}
