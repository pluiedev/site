export type PronounKey =
    | 'he'
    | 'they'
    | 'she'
    | 'it'
    | 'xe'
    | 'fae'
    | 'any'
    // more to come of course, add more here

export interface Pronoun {
    isolated: string,
    combined: string,
}

export const pronouns: Record<PronounKey, Pronoun> = {
    he: {
        isolated: "he/him",
        combined: "he",
    },
    they: {
        isolated: "they/them",
        combined: "they",
    },
    she: {
        isolated: "she/her",
        combined: "she",
    },
    it: {
        isolated: "it/its",
        combined: "it",
    },
    xe: {
        isolated: "xe/xem",
        combined: "xe"
    },
    fae: {
        isolated: "fae/faer",
        combined: "fae"
    },
    any: {
        isolated: "any pronouns",
        combined: "any",
    },
}