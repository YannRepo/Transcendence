import { ChannelType } from "@prisma/client";
export declare class ChannelDto {
    name: string;
    description: string;
    password: string;
    type: ChannelType;
    userId: number;
}
