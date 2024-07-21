import { z } from 'zod';
import { X2jOptions } from 'fast-xml-parser';

interface ParserOptions {
    length?: number | string | ((item: any) => number);
    assert?: number | string | ((item: number | string) => boolean);
    lengthInBytes?: number | string | ((item: any) => number);
    type?: string | Parser;
    formatter?: (item: any) => any;
    encoding?: string;
    readUntil?: 'eof' | ((item: any, buffer: Buffer) => boolean);
    greedy?: boolean;
    choices?: {
        [key: number]: string | Parser;
    };
    defaultChoice?: string | Parser;
    zeroTerminated?: boolean;
    clone?: boolean;
    stripNull?: boolean;
    key?: string;
    tag?: string | ((item: any) => number);
    offset?: number | string | ((item: any) => number);
    wrapper?: (buffer: Buffer) => Buffer;
}
type Types = PrimitiveTypes | ComplexTypes;
type ComplexTypes = 'bit' | 'string' | 'buffer' | 'array' | 'choice' | 'nest' | 'seek' | 'pointer' | 'saveOffset' | 'wrapper' | '';
type Endianness = 'be' | 'le';
type PrimitiveTypes = 'uint8' | 'uint16le' | 'uint16be' | 'uint32le' | 'uint32be' | 'uint64le' | 'uint64be' | 'int8' | 'int16le' | 'int16be' | 'int32le' | 'int32be' | 'int64le' | 'int64be' | 'floatle' | 'floatbe' | 'doublele' | 'doublebe';
declare class Parser {
    varName: string;
    type: Types;
    options: ParserOptions;
    next?: Parser;
    head?: Parser;
    compiled?: Function;
    endian: Endianness;
    constructorFn?: Function;
    alias?: string;
    useContextVariables: boolean;
    constructor();
    static start(): Parser;
    private primitiveGenerateN;
    private primitiveN;
    private useThisEndian;
    uint8(varName: string, options?: ParserOptions): this;
    uint16(varName: string, options?: ParserOptions): this;
    uint16le(varName: string, options?: ParserOptions): this;
    uint16be(varName: string, options?: ParserOptions): this;
    uint32(varName: string, options?: ParserOptions): this;
    uint32le(varName: string, options?: ParserOptions): this;
    uint32be(varName: string, options?: ParserOptions): this;
    int8(varName: string, options?: ParserOptions): this;
    int16(varName: string, options?: ParserOptions): this;
    int16le(varName: string, options?: ParserOptions): this;
    int16be(varName: string, options?: ParserOptions): this;
    int32(varName: string, options?: ParserOptions): this;
    int32le(varName: string, options?: ParserOptions): this;
    int32be(varName: string, options?: ParserOptions): this;
    private bigIntVersionCheck;
    int64(varName: string, options?: ParserOptions): this;
    int64be(varName: string, options?: ParserOptions): this;
    int64le(varName: string, options?: ParserOptions): this;
    uint64(varName: string, options?: ParserOptions): this;
    uint64be(varName: string, options?: ParserOptions): this;
    uint64le(varName: string, options?: ParserOptions): this;
    floatle(varName: string, options?: ParserOptions): this;
    floatbe(varName: string, options?: ParserOptions): this;
    doublele(varName: string, options?: ParserOptions): this;
    doublebe(varName: string, options?: ParserOptions): this;
    private bitN;
    bit1(varName: string, options?: ParserOptions): this;
    bit2(varName: string, options?: ParserOptions): this;
    bit3(varName: string, options?: ParserOptions): this;
    bit4(varName: string, options?: ParserOptions): this;
    bit5(varName: string, options?: ParserOptions): this;
    bit6(varName: string, options?: ParserOptions): this;
    bit7(varName: string, options?: ParserOptions): this;
    bit8(varName: string, options?: ParserOptions): this;
    bit9(varName: string, options?: ParserOptions): this;
    bit10(varName: string, options?: ParserOptions): this;
    bit11(varName: string, options?: ParserOptions): this;
    bit12(varName: string, options?: ParserOptions): this;
    bit13(varName: string, options?: ParserOptions): this;
    bit14(varName: string, options?: ParserOptions): this;
    bit15(varName: string, options?: ParserOptions): this;
    bit16(varName: string, options?: ParserOptions): this;
    bit17(varName: string, options?: ParserOptions): this;
    bit18(varName: string, options?: ParserOptions): this;
    bit19(varName: string, options?: ParserOptions): this;
    bit20(varName: string, options?: ParserOptions): this;
    bit21(varName: string, options?: ParserOptions): this;
    bit22(varName: string, options?: ParserOptions): this;
    bit23(varName: string, options?: ParserOptions): this;
    bit24(varName: string, options?: ParserOptions): this;
    bit25(varName: string, options?: ParserOptions): this;
    bit26(varName: string, options?: ParserOptions): this;
    bit27(varName: string, options?: ParserOptions): this;
    bit28(varName: string, options?: ParserOptions): this;
    bit29(varName: string, options?: ParserOptions): this;
    bit30(varName: string, options?: ParserOptions): this;
    bit31(varName: string, options?: ParserOptions): this;
    bit32(varName: string, options?: ParserOptions): this;
    namely(alias: string): this;
    skip(length: ParserOptions['length'], options?: ParserOptions): this;
    seek(relOffset: ParserOptions['length'], options?: ParserOptions): this;
    string(varName: string, options: ParserOptions): this;
    buffer(varName: string, options: ParserOptions): this;
    wrapped(varName: string | ParserOptions, options?: ParserOptions): this;
    array(varName: string, options: ParserOptions): this;
    choice(varName: string | ParserOptions, options?: ParserOptions): this;
    nest(varName: string | ParserOptions, options?: ParserOptions): this;
    pointer(varName: string, options: ParserOptions): this;
    saveOffset(varName: string, options?: ParserOptions): this;
    endianness(endianness: 'little' | 'big'): this;
    endianess(endianess: 'little' | 'big'): this;
    useContextVars(useContextVariables?: boolean): this;
    create(constructorFn: Function): this;
    private getContext;
    getCode(): string;
    private addRawCode;
    private addAliasedCode;
    private resolveReferences;
    compile(): void;
    sizeOf(): number;
    parse(buffer: Buffer | Uint8Array): any;
    private setNextParser;
    private generate;
    private generateAssert;
    private generateNext;
    private nextNotBit;
    private generateBit;
    private generateSeek;
    private generateString;
    private generateBuffer;
    private generateArray;
    private generateChoiceCase;
    private generateChoice;
    private generateNest;
    private generateWrapper;
    private generateFormatter;
    private generatePointer;
    private generateSaveOffset;
}

declare const file$2: Parser;

declare const schema$2: z.ZodObject<{
    options: z.ZodObject<{
        defaultUserPic: z.ZodOptional<z.ZodString>;
        userName: z.ZodString;
        fullName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        userName: string;
        defaultUserPic?: string | undefined;
    }, {
        fullName: string;
        userName: string;
        defaultUserPic?: string | undefined;
    }>;
    moods: z.ZodEffects<z.ZodArray<z.ZodCatch<z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        parentId: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        parentId?: number | undefined;
    }, {
        id: number;
        name: string;
        parentId?: number | undefined;
    }>>>, "many">, {
        id: number;
        name: string;
        parentId?: number | undefined;
    }[], unknown[]>;
    users: z.ZodEffects<z.ZodArray<z.ZodCatch<z.ZodOptional<z.ZodObject<{
        id: z.ZodDefault<z.ZodNumber>;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
    }, {
        name: string;
        id?: number | undefined;
    }>>>, "many">, {
        id: number;
        name: string;
    }[], unknown[]>;
    events: z.ZodEffects<z.ZodArray<z.ZodCatch<z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        date: z.ZodDate;
        security: z.ZodOptional<z.ZodString>;
        audience: z.ZodOptional<z.ZodNumber>;
        subject: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
        mood: z.ZodOptional<z.ZodString>;
        moodId: z.ZodOptional<z.ZodNumber>;
        music: z.ZodOptional<z.ZodString>;
        isPreformatted: z.ZodOptional<z.ZodBoolean>;
        noComments: z.ZodOptional<z.ZodBoolean>;
        userPicKeyword: z.ZodOptional<z.ZodString>;
        isBackdated: z.ZodOptional<z.ZodBoolean>;
        noEmail: z.ZodOptional<z.ZodBoolean>;
        revision: z.ZodOptional<z.ZodNumber>;
        commentAlter: z.ZodOptional<z.ZodNumber>;
        syndicationId: z.ZodOptional<z.ZodString>;
        syndicationUrl: z.ZodOptional<z.ZodString>;
        lastModified: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        date: Date;
        security?: string | undefined;
        audience?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
        mood?: string | undefined;
        moodId?: number | undefined;
        music?: string | undefined;
        isPreformatted?: boolean | undefined;
        noComments?: boolean | undefined;
        userPicKeyword?: string | undefined;
        isBackdated?: boolean | undefined;
        noEmail?: boolean | undefined;
        revision?: number | undefined;
        commentAlter?: number | undefined;
        syndicationId?: string | undefined;
        syndicationUrl?: string | undefined;
        lastModified?: Date | undefined;
    }, {
        id: number;
        date: Date;
        security?: string | undefined;
        audience?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
        mood?: string | undefined;
        moodId?: number | undefined;
        music?: string | undefined;
        isPreformatted?: boolean | undefined;
        noComments?: boolean | undefined;
        userPicKeyword?: string | undefined;
        isBackdated?: boolean | undefined;
        noEmail?: boolean | undefined;
        revision?: number | undefined;
        commentAlter?: number | undefined;
        syndicationId?: string | undefined;
        syndicationUrl?: string | undefined;
        lastModified?: Date | undefined;
    }>>>, "many">, {
        id: number;
        date: Date;
        security?: string | undefined;
        audience?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
        mood?: string | undefined;
        moodId?: number | undefined;
        music?: string | undefined;
        isPreformatted?: boolean | undefined;
        noComments?: boolean | undefined;
        userPicKeyword?: string | undefined;
        isBackdated?: boolean | undefined;
        noEmail?: boolean | undefined;
        revision?: number | undefined;
        commentAlter?: number | undefined;
        syndicationId?: string | undefined;
        syndicationUrl?: string | undefined;
        lastModified?: Date | undefined;
    }[], unknown[]>;
    comments: z.ZodEffects<z.ZodArray<z.ZodCatch<z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        userId: z.ZodDefault<z.ZodNumber>;
        userName: z.ZodOptional<z.ZodString>;
        eventId: z.ZodNumber;
        parentId: z.ZodOptional<z.ZodNumber>;
        body: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        date: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: number;
        date: Date;
        userId: number;
        eventId: number;
        userName?: string | undefined;
        parentId?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
    }, {
        id: number;
        date: Date;
        eventId: number;
        userName?: string | undefined;
        parentId?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
        userId?: number | undefined;
    }>>>, "many">, {
        id: number;
        date: Date;
        userId: number;
        eventId: number;
        userName?: string | undefined;
        parentId?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
    }[], unknown[]>;
}, "strip", z.ZodTypeAny, {
    options: {
        fullName: string;
        userName: string;
        defaultUserPic?: string | undefined;
    };
    moods: {
        id: number;
        name: string;
        parentId?: number | undefined;
    }[];
    users: {
        id: number;
        name: string;
    }[];
    events: {
        id: number;
        date: Date;
        security?: string | undefined;
        audience?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
        mood?: string | undefined;
        moodId?: number | undefined;
        music?: string | undefined;
        isPreformatted?: boolean | undefined;
        noComments?: boolean | undefined;
        userPicKeyword?: string | undefined;
        isBackdated?: boolean | undefined;
        noEmail?: boolean | undefined;
        revision?: number | undefined;
        commentAlter?: number | undefined;
        syndicationId?: string | undefined;
        syndicationUrl?: string | undefined;
        lastModified?: Date | undefined;
    }[];
    comments: {
        id: number;
        date: Date;
        userId: number;
        eventId: number;
        userName?: string | undefined;
        parentId?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
    }[];
}, {
    options: {
        fullName: string;
        userName: string;
        defaultUserPic?: string | undefined;
    };
    moods: unknown[];
    users: unknown[];
    events: unknown[];
    comments: unknown[];
}>;
type LjArchive = z.infer<typeof schema$2>;

declare function parse$2(input: Buffer): {
    options: {
        fullName: string;
        userName: string;
        defaultUserPic?: string | undefined;
    };
    moods: {
        id: number;
        name: string;
        parentId?: number | undefined;
    }[];
    users: {
        id: number;
        name: string;
    }[];
    events: {
        id: number;
        date: Date;
        security?: string | undefined;
        audience?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
        mood?: string | undefined;
        moodId?: number | undefined;
        music?: string | undefined;
        isPreformatted?: boolean | undefined;
        noComments?: boolean | undefined;
        userPicKeyword?: string | undefined;
        isBackdated?: boolean | undefined;
        noEmail?: boolean | undefined;
        revision?: number | undefined;
        commentAlter?: number | undefined;
        syndicationId?: string | undefined;
        syndicationUrl?: string | undefined;
        lastModified?: Date | undefined;
    }[];
    comments: {
        id: number;
        date: Date;
        userId: number;
        eventId: number;
        userName?: string | undefined;
        parentId?: number | undefined;
        subject?: string | undefined;
        body?: string | undefined;
    }[];
};

type index$2_LjArchive = LjArchive;
declare namespace index$2 {
  export { type index$2_LjArchive as LjArchive, file$2 as file, parse$2 as parse, schema$2 as schema };
}

declare const file$1: {
    parse: (input: string | Buffer, options?: X2jOptions) => any;
};
declare const schema$1: z.ZodObject<{
    livejournal: z.ZodObject<{
        entry: z.ZodEffects<z.ZodUnion<[z.ZodObject<{
            itemid: z.ZodNumber;
            eventtime: z.ZodEffects<z.ZodString, Date, string>;
            subject: z.ZodOptional<z.ZodString>;
            event: z.ZodOptional<z.ZodString>;
            current_mood: z.ZodOptional<z.ZodString>;
            current_music: z.ZodOptional<z.ZodString>;
            comment: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodObject<{
                itemid: z.ZodNumber;
                parentId: z.ZodOptional<z.ZodNumber>;
                event: z.ZodOptional<z.ZodString>;
                eventtime: z.ZodEffects<z.ZodString, Date, string>;
                author: z.ZodObject<{
                    name: z.ZodString;
                    email: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    email?: string | undefined;
                }, {
                    name: string;
                    email?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }, {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }>, z.ZodArray<z.ZodObject<{
                itemid: z.ZodNumber;
                parentId: z.ZodOptional<z.ZodNumber>;
                event: z.ZodOptional<z.ZodString>;
                eventtime: z.ZodEffects<z.ZodString, Date, string>;
                author: z.ZodObject<{
                    name: z.ZodString;
                    email: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    email?: string | undefined;
                }, {
                    name: string;
                    email?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }, {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }>, "many">]>, (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[], {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]>>;
        }, "strip", z.ZodTypeAny, {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }, {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        }>, z.ZodArray<z.ZodObject<{
            itemid: z.ZodNumber;
            eventtime: z.ZodEffects<z.ZodString, Date, string>;
            subject: z.ZodOptional<z.ZodString>;
            event: z.ZodOptional<z.ZodString>;
            current_mood: z.ZodOptional<z.ZodString>;
            current_music: z.ZodOptional<z.ZodString>;
            comment: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodObject<{
                itemid: z.ZodNumber;
                parentId: z.ZodOptional<z.ZodNumber>;
                event: z.ZodOptional<z.ZodString>;
                eventtime: z.ZodEffects<z.ZodString, Date, string>;
                author: z.ZodObject<{
                    name: z.ZodString;
                    email: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    email?: string | undefined;
                }, {
                    name: string;
                    email?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }, {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }>, z.ZodArray<z.ZodObject<{
                itemid: z.ZodNumber;
                parentId: z.ZodOptional<z.ZodNumber>;
                event: z.ZodOptional<z.ZodString>;
                eventtime: z.ZodEffects<z.ZodString, Date, string>;
                author: z.ZodObject<{
                    name: z.ZodString;
                    email: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    email?: string | undefined;
                }, {
                    name: string;
                    email?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }, {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }>, "many">]>, (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[], {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]>>;
        }, "strip", z.ZodTypeAny, {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }, {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        }>, "many">]>, (({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[]) & any[]) | ({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[])[], {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        } | {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        }[]>;
    }, "strip", z.ZodTypeAny, {
        entry: (({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[]) & any[]) | ({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[])[];
    }, {
        entry: {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        } | {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    livejournal: {
        entry: (({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[]) & any[]) | ({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[])[];
    };
}, {
    livejournal: {
        entry: {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        } | {
            itemid: number;
            eventtime: string;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: string;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[] | undefined;
        }[];
    };
}>;

declare function parse$1(input: Buffer): {
    livejournal: {
        entry: (({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[]) & any[]) | ({
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        } | {
            itemid: number;
            eventtime: Date;
            subject?: string | undefined;
            event?: string | undefined;
            current_mood?: string | undefined;
            current_music?: string | undefined;
            comment?: (({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[]) & any[]) | ({
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            } | {
                itemid: number;
                eventtime: Date;
                author: {
                    name: string;
                    email?: string | undefined;
                };
                parentId?: number | undefined;
                event?: string | undefined;
            }[])[] | undefined;
        }[])[];
    };
};

declare namespace index$1 {
  export { file$1 as file, parse$1 as parse, schema$1 as schema };
}

declare const timestamp: Parser;
declare const file: Parser;

declare const schema: z.ZodObject<{
    id: z.ZodNumber;
    date: z.ZodDate;
    userName: z.ZodOptional<z.ZodString>;
    fullName: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    mood: z.ZodOptional<z.ZodString>;
    music: z.ZodOptional<z.ZodString>;
    userPic: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    date: Date;
    fullName?: string | undefined;
    userName?: string | undefined;
    subject?: string | undefined;
    body?: string | undefined;
    mood?: string | undefined;
    music?: string | undefined;
    userPic?: string | undefined;
}, {
    id: number;
    date: Date;
    fullName?: string | undefined;
    userName?: string | undefined;
    subject?: string | undefined;
    body?: string | undefined;
    mood?: string | undefined;
    music?: string | undefined;
    userPic?: string | undefined;
}>;

declare function parse(input: Buffer): {
    id: number;
    date: Date;
    fullName?: string | undefined;
    userName?: string | undefined;
    subject?: string | undefined;
    body?: string | undefined;
    mood?: string | undefined;
    music?: string | undefined;
    userPic?: string | undefined;
};

declare const index_file: typeof file;
declare const index_parse: typeof parse;
declare const index_schema: typeof schema;
declare const index_timestamp: typeof timestamp;
declare namespace index {
  export { index_file as file, index_parse as parse, index_schema as schema, index_timestamp as timestamp };
}

/**
 * Livejournal and its forked derivatives (most notably dreamwidth)
 * supported a handful of custom tags.
 *
 * In particular, a number of variations on the lj-cut tag are supported;
 * while this interperetation of tag behavior doesn't make a lot of sense
 * according to the HTML spec, it is an attempt to faithfully reproduce
 * the way the `<lj-cut>` tag actually behaved on the service. Such is life.
 *
 * @see {@link https://github.com/apparentlymart/livejournal/blob/master/t/cleaner-ljtags.t | Livejournal's old codebase} for details.
 *
 * pre <lj-cut> hidden
 * pre <lj-cut text="text"> hidden
 *
 * pre <lj-cut /> hidden
 * pre <lj-cut text="text" /> hidden
 *
 * pre <lj-cut></lj-cut> hidden
 * pre <lj-cut text="text"></lj-cut> hidden
 *
 * pre <lj-cut>hidden</lj-cut> post
 * pre <lj-cut text="text">hidden</lj-cut> post
 */
type CutResults = {
    /**
     * Event markup appearing before the lj-cut tag. If no cut tag is used, only this value will be populated.
     */
    preCut?: string;
    /**
     * The custom cut text entered by the event's author.
     */
    cutText?: string;
    /**
     * The event content hidden by the `lj-cut` tag. In most cases, this will be  the remainder of the event but there may be additional un-hidden text after the cut.
     */
    hiddenText?: string;
    /**
     * Any event markup appearing after the `<lj-cut>` tag is closed.
     */
    postCut?: string;
};
/**
 * Given a markup string, searches for various permutations of the `<lj-cut>`
 * tag and returns an object with preCut, cutText, hiddenText, and postCut
 * properties. These can be assembled into a fresh markup string (say, wrapping
 * the hidden text in a collapsing box or using an `<a>` tag to link to the
 * full page for a post).
 */
declare function parseCutTag(markup: string, trim?: boolean): CutResults;

/**
 * Given a markup string, returns a key/value collection of markup fragments
 * and the associated usernames; these can be used for quick search and replace
 * operations.
 */
declare function parseUserTags(html: string): {
    [k: string]: string;
};

export { type CutResults, index$2 as lja, parseCutTag, parseUserTags, index as slj, index$1 as xml };
