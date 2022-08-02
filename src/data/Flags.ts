export type FlagKey =
    | 'demimale'
    | 'heterosexual'
    | 'transgender'
    | 'transfeminine'
    | 'lesbian'
    // more to come of course, add more here

export interface Flag {
    /// Name of the identity this flag represents
    name: string,
    
    /// The correct link to use for the redirect to an terminology page on en.pronouns.page.
    /// For example, the flag/identity known as 'demimale' here has a corresponding section
    /// called 'demiboy' under the link https://en.pronouns.page/dictionary/terminology#demiboy.
    ///
    /// Defaults to the flag ID.
    pronounsPageRedirect?: string,

    /// Whether this flag is actually a pride flag.
    /// Flags representing non-queer identities such as heterosexuality are conventionally not
    /// considered as pride flags. We're putting them in the same place as true pride flags
    /// because we use the same routines and mechanisms to draw these flags. Deal with it.
    ///
    /// Defaults to true.
    isPride?: boolean,
}

export const flags: Record<FlagKey, Flag> = {
    demimale: {
        name: "Demi-male",
        pronounsPageRedirect: "demiboy",
    },
    heterosexual: {
        name: "Heterosexual",
        isPride: true,
    },
    transgender: {
        name: "Transgender",
    },
    transfeminine: {
        name: "Transfeminine",
    },
    lesbian: {
        name: "Lesbian",
    }
}