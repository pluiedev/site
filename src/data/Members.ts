import { PronounKey } from "./Pronouns"
import { FlagKey } from "./Flags"

export type MemberKey = 
    | 'leo'
    | 'leah'

export type AvatarPlacement = 'left' | 'right'

export interface Member {
    name: string
    pronunciations: string[],
    pronouns: PronounKey[],
    flags: FlagKey[],
    avatarPlacement: AvatarPlacement
    avatarSize: number
}

export const members: Record<MemberKey, Member> = {
    leo: {
        name: 'Leo',
        pronunciations: ['ˈliːoʊ'],
        pronouns: ['he', 'she'],
        flags: ['demimale', 'heterosexual'],
        avatarPlacement: 'left',
        avatarSize: 150,
    },
    leah: {
        name: 'Leah',
        pronunciations: ['ˈliː', 'ˈliːə'],
        pronouns: ['she', 'fae'],
        flags: ['transgender', 'transfeminine', 'lesbian'],
        avatarPlacement: 'right',
        avatarSize: 450,
    }
}