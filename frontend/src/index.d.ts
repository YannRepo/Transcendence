type User = null | {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  username: string;
  isLogged: boolean;
  inChat: boolean;
  inGame: boolean;
  gamesWon: number;
  gamesLost: number;
  score: number;
  userSecret?: string;
  firstLogin: boolean;
  avatar: Avatar;
  avatarId: string | null;
  IstwoFactorAuth: boolean;
  IsSigninWith42: boolean;
  hash?: string;
  hashedRt?: string;
  blockedIds: number[];
  messages: ChannelMessage[];
  channelUsers: ChannelUser[];
  achievementChat: boolean;
  achievementPong: boolean;
  achievementAvatar: boolean;
};

type Avatar = null | {
  id: string;
  filename: string;
  data: string;
  userId: string;
  url42: string;
  user: User;
};

type Channel = {
  id: string;
  name: string;
  description: string;
  password: string;
  type: "PRIVATE" | "PUBLIC" | "PROTECTED" | "CONVERSATION";
  createdAt: string;
  updatedAt: string;
  messages: ChannelMessage[];
  channelUsers: ChannelUser[];
};

type ChannelUser = {
  id: string;
  userId: string;
  user: User;
  channelId: number;
  channel: Channel;
  role: "NORMAL" | "ADMIN" | "OWNER";
  socketId: string;
};

type ChannelMessage = {
  id: string;
  createdAt: string;
  channelId: string;
  channel: Channel;
  fromUserId: string;
  fromUser: User;
  message: string;
};

type Sourcebans = {
  id: number;
  userId: number;
  channelId: number;
  adminUsername: string;
  type: string;
  createdAt: string;
  expireAt: string;
  duration: number;
  reason: string;
};

type GameHistory = {
  id: number;
  date: string;
  idPlayer1: number;
  idPlayer2: number;
  scorePlayer1: number;
  scorePlayer2: number;
  idWinner: number;
};
