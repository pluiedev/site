---
title: "Lessons from Writergate"
description: "Or: how I learned to stopped worrying and love `std.Io.Writer.Allocating`"

section: Essays
tags:
  - post
  - zig
  - writergate
---

# 0.

# I. The Good

## Less :sparkles: *Magic* :sparkles:

Dealing with I/O in Zig prior to Writergate was a *truly **magical***
experience -- not in a good way, though. The *first and foremost* axiom
in the Zen of Zig[^zen] is to "communicate intent precisely"; however, the
old I/O interfaces often failed quite spectacularly in this regard: the
interfaces themselves were **poorly communicated** through language mechanisms,
relied on **implications** rather than explicit rules, and there was always
**ambiguity** in how they're used and how they interact with other pieces of code.

[^zen]: You can access it at any time by running `zig zen`. It's like the
Zen of Python, but more utilitarian... I guess.

Functions that had to deal with I/O were constantly beset by one problem:
there was no way to know for certain what *type* the reader/writer actually
belongs to. Sure, you would *expect* that a writer should implement the
`std.io.Writer` interface -- after all, that's what it meant for the value
to be a "writer" in the first place -- but "implement" is not a well-defined
term in the Zig type system. Nor are "interfaces".

Unlike Go's interfaces, Rust's traits, or Haskell's typeclasses, a "Zig
interface" is not defined within the type system as a first-class feature.
Instead, it's much more like C++20's concepts in that *any* type can
"implement" an interface, provided that it offers the correct functions and
fields (or more generally speaking, *declarations*) with the correct types
and signatures. Any user of said interfaces, meanwhile, just has to assume
the input type has the right function it needs, accepts the arguments it
gives, and returns the results that it wants.

For instance, say you have a type that encodes a RGB color, and you would like
to display it as a hex color (like `#d23773`) when you print it to standard
output. In Zig 0.14, you would have to write something like this:

```zig
pub const Color = struct {
    r: u8,
    g: u8,
    b: u8,

    pub fn format(
        self: Color,
        comptime fmt: []const u8,
        opts: std.fmt.FormatOptions,
        writer: anytype,
    ) !void {
        try writer.print("#{x:>2}{x:>2}{x:>2}", .{ self.r, self.g, self.b });
    }
}
```

Notice that the type of `writer` is *`anytype`* -- unlike in dynamically typed
languages like TypeScript or Python where the "any type" is a regular type that
is the superclass of all other types, in Zig `anytype` isn't really a type at
all, but rather a way to make the function generic without adding any explicit
type parameters. When a function with `anytype` is called, the compiler generates
a *copy* of it (*monomorphizes* it) with the correct type in place, and *then*
resolves the symbols used within the function body and determine if they make sense.

In our example, it could be a `std.fs.File.Writer` when you're trying to write
the color into a file; a `std.net.Stream.Writer` when you're sending the color
through a TCP socket; or even a `std.tar.writer.Writer` when you're writing
into a tarball, etc. These are all separate, *discrete* types that, per this
function, only has to implement the correct `print` function in order for
the color formatter to work -- if anything is even slightly different, you get
an obtuse type mismatch error in a completely different part of the codebase,
similar to a catastrophic [SFINAE] failure that any C++ programmer would be
intimately familiar with (albeit much smaller in scope and with arguably much
better error messages).

[SFINAE]: https://en.wikipedia.org/wiki/Substitution_failure_is_not_an_error

Not knowing the writer type also means that any auto-completion tool or language
server is going to have absolutely no idea what methods are legal to call on
the value. ZLS, for instance, only sees that the `writer` variable can be,
well, *whatever* type the caller gives it, and has no idea that `write`, 
`writeAll`, etc. are even methods that necessarily *exist*. As such, it can
neither accept nor reject generic code written in this manner, which is
*pretty* terrible when it comes to the developer experience.

Of course, not knowing the writer type also means that your function also has
no idea what **errors** said writer could produce. After all, `std.fs.File.Writer`
could fail because e.g. you ran out of disk space (`error.NoSpaceLeft`), while
`std.tar.writer.Writer` could fail when the file name is too long
(`error.NameTooLong`).
This makes error handling *exceedingly* complicated, meaning that people often
just fall back to Zig's "implicit error set" feature where all possible errors
are just inferred based on context and never written out explicitly, which is
bad when you want to be in full control and know all the different modes of
failure your program could have.

What's worse, is that the interface itself is also quite *bloated*. Beyond the
basic `read` or `write`, there's also specialized methods like `writeByte`,
`writeByteNTimes`, `writeInt`, `writeStruct`, `writeStructEndian`, etc., which
are all implemented in terms of the basic method. But since users might make
use of any of these methods and it's infeasible to reimplement all of them
one-by-one for *every* writer implementation, *helper APIs* like
`std.io.GenericWriter` and `std.io.AnyWriter` (yes, there are two, and they
are different!) also need to exist to provide a shim over the core `read` or
`write` operation, so that at least interface implementors only has one method
to implement[^errors]. All told, it's a very messy state of affairs.

[^errors]: At the cost that the generic APIs either have to use questionable
language mechanics like `anyerror` or `@errorCast` to handle generic error types
correctly, further destroying any hope of having precise control over error values.
Heck, there even is a [compiler bug](https://github.com/ziglang/zig/issues/20177)
that prevents error stack traces from propagating across `@errorCast`s. Yikes!

**After Writergate, none of this is an issue anymore.**

Now, all writers are `std.Io.Writer` objects, and all readers are `std.Io.Reader`
objects. Users who want to write to a writer could just take a pointer to one.
Users who want to read from a reader could just take a pointer to one.

Auto-completion works because both `Writer` and `Reader` **explicitly communicate**
their interface through the type system, and so the language server could warn you
when you're using a method incorrectly before you hit compile. The compiler and
standard library no longer need to rely on the **implication** that generic I/O code
has to work for all implementors, and can save time by reusing the same function
for multiple implementations.

There's no more **ambiguity** in how reading or writing can fail, as there's 
only one error type for each interface: `std.Io.Writer.Error` or
`std.Io.Reader.Error`. You may ask how we can do this when the actual underlying
error types are so different across implementations. Simple -- just store the
actual error inside the implementation (e.g. `std.fs.File.Writer`) itself.
Then, when the generic code encounters a read/write failure (`error.ReadFailed`
or `error.WriteFailed`), the error could be bubbled up to the caller, which
can then access the real error, stored safely inside a field.

Even ordinary user code looks much cleaner now:

```zig
pub const Color = struct {
    // ...
    pub fn format(
        self: Color,
        writer: *std.Io.Writer,
    ) std.Io.Writer.Error!void {
        try writer.print("#{x:>2}{x:>2}{x:>2}", .{ self.r, self.g, self.b });
    }
};

// On the caller side:
const color: Color = .{ ... };
var file_writer: std.fs.File.Writer = ...;
const writer: *std.Io.Writer = &file_writer.interface;

writer.print("{f}", .{color}) catch |err| switch (file_writer.err.?) {
    error.NoSpaceLeft => std.log.err("download more disk space please", .{}),
    else => std.log.err("something else happened", .{}),
};
```

As a side note, you might also notice that the `format` function lost a few
arguments. This is also part of Writergate, although I don't consider it part
of the *core* change per se; more on that later.

## There's *truly* only one obvious way to do things, now

While I was doing research for this post, I came across [this thread on
Ziggit](https://ziggit.dev/t/formatting-printing-one-obvious-way-to-do-things/11444)
which really demonstrated how utterly confusing the old I/O interfaces were
to newcomers.

## Tedium reveals optimizations

TODO: encouraging code cleanups/refactors, `std.Io.Writer.Allocating` my
beloved, tedious patterns like stdout/stderr gets cleaned up and grouped
together

# II. The Meh

## `ArrayList` is dead; long live `ArrayList`

I felt quite mixed about the decision to deprecate the "managed" `ArrayList`
type in an effort to make everyone use the "unmanaged" version. What's the
difference, you may ask? Simple.

**The managed `ArrayList` is an unmanaged `ArrayList`, plus an allocator.**
That's it.

The only difference in how they're used is that when you use an unmanaged
`ArrayList`, you *always* have to provide an allocator when calling methods
that might require allocating, deallocating or reallocating memory, such as
`initCapacity`, `deinit`, `append`, and so on. Contrarily, when you use a
*managed* `ArrayList` you don't have to, since it can just use its builtin
allocator.

While it was thought that the latter was far more convenient, in production
code it's actually often preferable to use *unmanaged* `ArrayList`s instead,
especially if you have multiple `ArrayList`s stored the same data structure,
and sharing the same allocator. Using multiple managed `ArrayList`s would
mean that you're storing multiple copies of the same allocator -- not
space-efficient!

```zig
// Contains two allocators :(
pub const Bad = struct {
    foos: std.ArrayList(u8),
    bars: std.ArrayList(u8),
};

// Contains just one :)
pub const Good = struct {
    alloc: std.mem.Allocator,
    foos: std.ArrayListUnmanaged(u8),
    bars: std.ArrayListUnmanaged(u8),
};
```

Managed `ArrayList`s also have the disadvantage that they cannot be easily
initialized by default since creating one requires passing in an allocator.
Unmanaged ones can be initialized in a blank state without one, by using the
`empty` constant:

```zig
pub const DefaultInit = struct {
    yay: std.ArrayListUnmanaged(Foo) = .empty,
    // nope: std.ArrayList(Foo) = ???,
}
```

Also, by explicitly using an allocator whenever memory (de-)allocation occurs,
it also opens up opportunities for a data structure to be managed by an external
allocator (much like unmanaged `ArrayList`s themselves), and that it's extremely
easy to distinguish a function requires memory allocation from one that does not.
One of the core Zig tenets is to avoid implicit control flows -- this certainly
is a good decision in that direction.

What makes this change leave a sour taste in my mouth, however, is that Zig 0.15
also decided to *rename* the unmanaged variant from `ArrayListUnmanaged` to...
just `ArrayList`. This, as you can imagine, broke a ***lot*** of code that
used `ArrayList` to mean the *managed* variant.

**Literally every single use case of `ArrayList` had to be manually changed to
add or remove allocators where necessary.** And in a multi-thousand-line codebase
like Ghostty, it's *extremely* tedious to perform without some kind of automated
assistance. I've never really been a fan of making LLMs touch any of my code --
I seriously considered making this the only exception, since it was *that* tedious.

It's not even like the "good" kind of tedium I detailed above with the reader/writer
rewrites, since those actually forced you to rethink about things that were *too*
convenient and restructure your program to be more performant -- here, the only
things I gained are *maybe* that control flows that need to allocate are slightly
more obvious, and *occasionally* I have to think about where to place allocators
in complex data structures.

Some may argue that I could just `s/std.ArrayList/std.array_list.Managed/` my way
out of the problem, but I would argue that that's just kicking the can down the
road, as managed variants are -- again -- deprecated, which means they might be
gone by the time 0.16 comes out. Then you have to port everything over to use
unmanaged `ArrayList`s anyways, as there are quite literally no alternatives
remaining by then.

I would have loved this change a *lot* more, if for the 0.15 release cycle
they kept `std.ArrayList` as a deprecated alias for `std.array_list.Managed`
(or really `std.array_list.AlignedManaged`), renamed `std.ArrayListUnmanaged`
to `std.array_list.Aligned`, and then went ahead with the switchover for 0.16.
That way I think the transition could have gone far more smoothly and wouldn't
suddenly cause *massive breakage* for... well, *any* moderately complex program
that has to use lists.

## The foot-arquebuses

TODO: ***Don't forget to flush!!!!*** :)

# III. The Ugly

## Dependency inferno

Getting a sufficiently large community to do *anything* is hard, let alone
pushing massive, wide-ranging breaking changes into the ecosystem.

## Way Impatient, Probably (W.I.P.)

**Writergate is unfinished.** Notably, vast swaths of the standard library
have not been ported to use the new I/O interfaces, which means that internally
they still rely on backwards compatibility APIs like `GenericReader.adaptToNewApi`
in order to function. Other parts of Writergate, that being async-agnostic I/O
and alternative executors/runtimes are also just conjecture at the moment.

In some other cases, functionality has been outright ***removed*** because
it was incompatible with the new API and has to be rebuilt from the ground up.
One notable victim of this is the `std.compress` APIs -- Zig 0.15's standard
library *intentionally* does not offer any way for programs to compress data
in any format or container, because the whole module had to be rewritten
to make use of the new features of Writergate, like seeking, peeking, tossing,
etc. This is really inconvenient for Ghostty as we have to generate compressed
Unicode tables (and some other pieces of data), which for the time being
has to be pre-generated or generated via other programs.

Being somewhat out of the loop from Zig development, I'm not *really* sure
why things are left as-is: Writergate is a fundamentally ambitious project
and I think leaving it half-baked is a big mistake that only leaves people
unwilling to upgrade from 0.14. This would be a lot more understandable
were there any external factors that forced a major Zig release this early
(compared to the gap between 0.13 and 0.14 anyways), but releasing a major
version for the sole purpose that people can play with an incomplete
Writergate is not the brightest idea ever.

# IV. The Bad

## One does not simply write `Writer`s

TODO: `drain` is *way* too complex -- while designing for vectorized I/O
is great, it's unnecessary burden for people trying to write simple
implementations. cf. Rust `read` vs. `read_vectored` (the latter is
an optional enhancement)

## How do you *learn* about any of this???

It's one of Zig's old problems: the docs *suck*. Granted, the new docs are
actually (surprisingly even) better than the old ones, which are extremely
barren, but the complexity of Writergate makes me believe that it could do
with a **lot** more written guidance. Heck, one of the reasons why I wrote
this post to begin with is that I want it to act as a (very rambly)
pseudo-guide to the post-Writergate world so that people don't have to go
dumpster-diving into Zig's source code like I did.

# V. Conclusion
