import { ChannelUser, SourceBans, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { SourcebansDto, UserChannelDto } from "./dto";
import { ChannelService } from "../channel/channel.service";
export declare class ChannelUsersService {
    private prisma;
    private channel;
    constructor(prisma: PrismaService, channel: ChannelService);
    joinChannel(dto: UserChannelDto): Promise<{
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
    disconnectClient(userId: number, channelId: number): Promise<void>;
    setUserAdmin(user: ChannelUser): Promise<void>;
    removeUserAdmin(user: ChannelUser): Promise<void>;
    punishUser(userToMute: ChannelUser, dto: SourcebansDto): Promise<void>;
    unmuteUser(user: ChannelUser, adminUsername: string): Promise<void>;
    blockUser(user: User, userIdToBlock: number): Promise<void>;
    unblockUser(user: User, userIdToUnblock: number): Promise<void>;
    isSocketIdInArray(socketIdToCheck: string, arrOfSocketsId: string[]): Promise<boolean>;
    removeSocketIdFromChannelUserId(socketId: string, userId: number, exceptChannelId?: number): Promise<void>;
    getUserPunishments(userId: number, channelId: number): Promise<SourceBans[]>;
    getUserById(userId: number): Promise<User>;
    getChannelUserByIds(userId: number, channelId: number): Promise<{
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
}
