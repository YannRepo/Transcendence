import { PrismaService } from 'src/prisma/prisma.service';
import { Channel, ChannelType, User } from '@prisma/client';
import { ChannelDto } from './dto';
import { AuthService } from 'src/auth/auth.service';
export declare class ChannelService {
    private prisma;
    private auth;
    constructor(prisma: PrismaService, auth: AuthService);
    createChannel(dto: ChannelDto, withUser?: User): Promise<Channel>;
    getChannels(): Promise<Channel[]>;
    getUserConversations(fromUserId: number): Promise<({
        channelUsers: ({
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
        })[];
    } & {
        id: number;
        name: string;
        description: string;
        password: string;
        type: import(".prisma/client").$Enums.ChannelType;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getChannelById(id: number): Promise<Channel>;
    getChannelByName(name: string): Promise<Channel>;
    setChannelName(id: number, name: string): Promise<{
        error: string;
    }>;
    setChannelDescription(id: number, description: string): Promise<{
        error: string;
    }>;
    setChannelPassword(channelId: number, password: string): Promise<void>;
    setChannelType(id: number, channType: ChannelType): Promise<void>;
    deleteChannelById(id: number): Promise<void>;
}
