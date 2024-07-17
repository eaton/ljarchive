export type Options = {
  ServerURL: string;
  DefaultPicURL: string;
  CommunityPicUrl?: string;
  FullName: string;
  UserName: string;
  HPassword: string;
  LastSync: Date;
  GetComments?: boolean;
  UseJournal?: string;
};

export type Mood = {
  ID: number;
  Name: string;
  Parent?: number;
};

export type UserPic = {
  Keyword: string;
  URL: string;
};

export type User = {
  ID: number;
  User: string;
};

export type Event = {
  ID: number;
  Date: Date;
  Security?: string;
  AllowMask?: number;
  Subject?: string;
  Body?: string;
  Poster?: string;
  Anum?: number;
  CurrentMoodId?: number;
  CurrentMusic?: string;
  Preformatted?: boolean;
  PictureKeyword?: string;
  Backdated?: boolean;
  NoEmail?: boolean;
  Unknown8Bit?: boolean;
  ScreenedComments?: boolean;
  NumberOfRevisions?: number;
  CommentAlter?: number;
  SyndicationUrl?: string;
  SyndicationId?: string;
  LastRevision?: Date;
  TagList: string;
};

export type Comment = {
  ID: number;
  PosterID: number;
  PosterUserName: string;
  State: string;
  JItemID: number;
  ParentID: number;
  Body: string;
  Subject?: string;
  Date: Date;
};
