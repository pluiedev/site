---
title: "Don't Give Them the Time of Day"
description: "How Nix can defend against the encroachment of external influence of politics"

section: Misc
tags:
  - post
  - nix
  - politics
---

Recently, there's been more news on the techbro side of Twitter, that apparently
David Heinemeier Hansson (commonly known as DHH)’s Omarchy "distro"[^omarchy] is
seeking to adopt Nix for declarative system management, as an alternative (or in
parallel) to Arch, which they currently use.

[^omarchy]: If you count a bunch of shoddy personal dotfiles with a concerted
marketing campaign a "distro", that is.

As someone who hasn't been a fan of DHH since the last couple years, I know
exactly what his modus operandi is: his expertise is in generating hype in the
tech-equivalent of the Twitter Manosphere, and not in making sound technical
decisions. In this case, if his goal is to base a distro on Nix without making
people spend the time learning how Nix works, I fear that he will be in for a
very rude awakening.

He is nonetheless very influential, well-funded and well-connected, and it is
completely natural for his opponents to feel intimidated, and for his proponents,
vindicated. This is already quite evident by the outbreak of hysteria coming
largely from the political left in the Nix Community[^comm] who rightfully
criticize him for his increasingly [reactionary][dhh-london] and [appalling ideas][dhh-romani]
regarding ethnicity and immigration, which are [extreme even within his cultural context][dhh-way-worse].
Many fear that Nix will face an onslaught of right-wing fanatics that oppose
our [Code of Conduct][nix-coc] on respect and inclusivity.
**We must resist this fear.**

[^comm]: I use "Nix Community" as a collective noun for every single user
interested in Nix in some way, shape or form. See my response to ["Who are
'The Nix Community', and why?"](https://github.com/NixOS/SC-election-2025/issues/436#issuecomment-3351433040)
from the Steering Committee election last year.

[dhh-london]: https://world.hey.com/dhh/as-i-remember-london-e7d38e64
[dhh-romani]: https://world.hey.com/dhh/wolves-sheep-and-gypsies-ba44af6a
[dhh-way-worse]: https://jakelazaroff.com/words/dhh-is-way-worse-than-i-thought/
[nix-coc]: https://github.com/NixOS/nix-constitutional-assembly/blob/main/CODE_OF_CONDUCT.md

On the other hand, figures who have long been exiled from the Nix Community
are beginning to crawl out of the shadows again. Like Jon Ringer, who stood
with Anduril in their use of Nix in American military and surveillance software,
was suspended from GitHub due to [refusing to debate the issue in good faith][jr-suspension],
kept polarizing the community over said suspension and got [permabanned][jr-permaban],
and even tried to commit ban evasion by making PRs to Nix under extremely
[obvious alt accounts][jr-ban-evasion] as if we're all imperceptive imbeciles.

Or Sridhar "srid" Ratnakumar, who got [banned][srid-nixos-mod] for insisting
that [queer identities aren't real and are only a malformed political ideology][srid-gender]
and that [systemic racism is only a figment of your imagination][srid-crt].
They rally around DHH's move while parasitizing on his popularity in the
Tech Bro Ecosphere™, in order to regain legitimacy for themselves.
**We must not allow them to do so.**

[jr-suspension]: https://discourse.nixos.org/t/why-was-jon-ringer-banned-from-github/44114/24
[jr-permaban]: https://discourse.nixos.org/t/constitutional-assembly-statement-on-jon-ringer/47393
[jr-ban-evasion]: https://github.com/NixOS/nix/pull/15421
[srid-nixos-mod]: https://web.archive.org/web/20251119042006/https://srid.ca/nixos-mod
[srid-gender]: https://web.archive.org/web/20251215200618/https://srid.ca/gender
[srid-crt]: https://web.archive.org/web/20251210150615/https://srid.ca/crt

The one thing to understand is that, regardless of your political leanings
and ideology, these people are *hypocrites*. They are the boys who constantly
call wolf. They decry others (usually either moderators for Jon, or "woke
elements" for srid) of drama, while creating drama surrounding their own
inability to stop creating drama due to the incessant need to promote their own
rightfully oft-criticized ideology and values.

The only way to stop this loop, however, is not through strongly-worded
rebuttals on Twitter, emotionally exhausting polemic essays, or endless
fruitless debates on the NixOS Discourse or other such spaces.
**This only pours more fuel to the flame** as they have more "proof" of them
being the actual victims and thereby lending themselves more legitimacy.

There's this old saying on the Ye Olde Internet that people in 2026 seem to have
completely forgotten: **Don't. Feed. The Troll.** In the backdrop of political
and communal discourse driven more and more by social media and political
splintering and polarization, attention has become a key strategic resource.
Your attention directly affects who is more likely to be seen by other people,
and it's not always guaranteed that you will win against your opponents.

Against particularly influential opponents like DHH, in fact, you're far more
likely to lose, because they have had decades of experience in public relations
and playing to the expectations of the crowd at large. Twitter and other forms
of mass social media have, through a twisted form of memetic natural selection,
already designated people like DHH or Lunduke with the most potent ability to
direct the masses in their will.

The smartest way to win is, therefore, **to not play their game at all**.
Some might criticize this as being inactive, passive, counterproductive or
even lazy. Eagerness is exactly how we fall in their trap. It's what boosts
the algorithms into drawing more people into the "controversy" and agreeing
with people like Jon Ringer that "Nix needs less drama", all the while
disobeying the political establishment, targeting vulnerable minorities, and
sowing more chaos and discord in their wake. These are all intentional memetic
tactics that many of us still unfortunately are unable to comprehend, let alone
counteract.

Some might also naïvely suggest that we should preemptively ban these figures
from using Nix. This is worse than simply engaging in pointless debates
online, as it not only asserts the veracity of e.g. srid's claims of Nix
having gone "woke"[^woke] and persecuting users for political beliefs,
and is also blatantly against the terms of Free and Open-Source Software.
Nix is licensed under LGPL 2, and Nixpkgs under MIT. There is nothing we can
do to physically and legally limit them from using our software pursuant to
the terms of these licenses, and to attempt doing so would mean political
and technological suicide for the entire project.

Let us not forget that there is still a significant amount of Nix users
disinterested in the drama who might side with Jon Ringer or srid or DHH,
should this situation balloon outward any further. Our goal is not to
alienate them either by "rooting out subversive elements" or however you want
to call it: that will only help in accelerating the atrophy of the Nix Community
and trapping Nix within a perceived ideological bubble, and force its users
looking elsewhere for greener pastures. Nix's strength has never been in
sheer purity, but in scale, flexibility, and a plurality of diverse use cases
and value propositions.

Instead, we need to win our narrative back, through persuasion and careful,
rational analysis of the past and present. We need to convince that we removed
these people for very good reasons—because they're people who *refuse* to
collaborate with and have respect towards other people **due to their own malignant
beliefs**. We need to subvert *their* legitimacy and talking points and stop them
from subverting our own, and stop them from turning our own user base (and voter
base for the 2026 Steering Committee Election) against ourselves.

[^woke]: I use "woke" in quotes in this case because I refuse to ~~give
legitimacy to a term explicitly made up by~~[^erratum] allow alt-right and far-right groups
to villainize human respect for all people. Also I can assure you, many people
in the Nix Community simultaneously think that Nix is actually not "woke"
enough. Fun, huh?

[^erratum]: **ERRATUM**: Thanks to @nosferatu and @waffle8946 on the NixOS
Discourse for correcting me in that "woke" was originally used by Black
Americans to mean being aware of racism and social injustice within American
society. Wiktionary cites this original sense from the 1930s, with the
derogatory, accusatory sense from the 2020s. I'd like to therefore sincerely
apologize for this grave error. If anything, this only makes the extent to
which right-wing "woke deniers" have successfully co-opted and twisted the
word and obscured its origin even more alarming and disgusting.

So don't give them the time of day. They're not worthy of our attention.
Build our defenses through solid, reliable, inscrutinizable work that is
excellent because it is inherently and functionally excellent. Nix is a
wonderful piece of software and my own life as well as many others' will
not be the same without it, so let's not allow these external pundits to
ruin it by flipping the script on who's the villain here. 

Stay calm. Remain where we are. Keep on keeping on.
