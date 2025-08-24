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
term in the Zig type system. Nor are "interfaces"[^interfaces].

[^interfaces]: Unlike Go's interfaces, Rust's traits, or Haskell's typeclasses,
a "Zig interface" is not defined within the type system as a first-class feature.
Instead, it's much more like C++20's concepts in that *any* type can
"implement" an interface, provided that it offers the correct functions and
fields (or more generally speaking, *declarations*) with the correct types
and signatures. Any user of said interfaces, meanwhile, just has to assume
the input type has the right function it needs, accepts the arguments it
gives, and returns the results that it wants.

In the case of Ghostty, we make heavy use of I/O abstractions to implement
our custom config format. Every custom type we need to (de-)serialize to
and from the config format needs to implement certain methods, like `parseCLI`
and `formatEntry`, which parses a type from a CLI flag and formats a field
into a key-value entry in the config respectively.

A somewhat complex example can be found in the `formatEntries` method in our
`Binding.Set.Value` type, which represents a single segment in a sequence of
keys that comprise a keybind. It is somewhat special since it uses recursion
and a temporary stack to store common prefixes between keybinds, which is
implemented through a rewindable writer. The signature used to look like this
in 0.14:

```zig
pub fn formatEntries(
    self: Value,
    buffer_writer: anytype,
    formatter: anytype,
) !void { ... }
```

Notice that the types of both `buffer_stream` and `formatter` is *`anytype`* --
unlike in dynamically typed languages like TypeScript or Python where the "any
type" is a regular type that any value could coerce into, in Zig `anytype` isn't
really a type at all, but rather a way to make the function generic without
adding any explicit type parameters. When a function with `anytype` is called,
the compiler generates a *copy* of it (*monomorphizes* it) with the correct type
in place, and *then* resolves the symbols used within the function body and
determine if they make sense.

And because `anytype` does not specify *any* requirements and expectations for
the caller at the type system level, when you write I/O-heavy code you're left
*completely blind* with no autocompletion or typechecking **at all**.
ZLS, for instance, only sees that the `buffer_writer` variable can be, well,
*whatever* type the caller gives it, and has no idea that `write`, `writeAll`,
etc. are even methods that necessarily *exist*. As such, it can neither accept
nor reject generic code written in this manner, which is *pretty* terrible when
it comes to the developer experience.
If anything is even slightly different, you often get an obtuse type mismatch
error in a completely different part of the codebase, similar to a catastrophic
[SFINAE] failure that any C++ programmer would be intimately familiar with
(albeit much smaller in scope and with arguably much better error messages).

[SFINAE]: https://en.wikipedia.org/wiki/Substitution_failure_is_not_an_error

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

Any user-defined type that needs to hold writers also become considerably more
complex: the `formatter` argument, for example, is actually always an
`EntryFormatter` instance, but since it has to also be generic over all writers,
it has to be explicitly parametrized over the writer type, which is also very
hard to write out explicitly in the type system. In a sense, `anytype` readers
and writers **infect** other types with their over-generic nature, and
proliferates `anytype`s *everywhere* within the codebase, destroying tooling
efficacy and compiler efficiency all across.

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

Now, all writers contain `std.Io.Writer` objects, all readers contain
`std.Io.Reader` objects, and the generic methods are defined on the `Reader`
and `Writer` objects themselves. Generic code that just wants to read or write
without caring much about the actual implementor could just accept pointers
to these objects, and polymorphic behavior no longer depends on callee-side
monomorphization.

Auto-completion works because both `Writer` and `Reader` **explicitly communicate**
their interface through the type system, and so the language server could warn you
when you're using a method incorrectly before you hit compile. The compiler and
standard library no longer need to rely on the **implication** that generic I/O
code has to work for all implementors, and can save time by reusing the same
function for multiple implementations. User code that needs to manage `Readers`
and `Writers` no longer need to be parametrized by the exact underlying types
either.

There's no more **ambiguity** in how reading or writing can fail, as there's 
only one error type for each interface: `std.Io.Writer.Error` or
`std.Io.Reader.Error`. You may ask how we can do this when the actual underlying
error types are so different across implementations. Simple -- just store the
actual error inside the implementation (e.g. `std.fs.File.Writer`) itself.
Then, when the generic code encounters a read/write failure (`error.ReadFailed`
or `error.WriteFailed`), the error could be bubbled up to the caller, which
can then access the real error, stored safely inside a field.

Doesn't this look much better?

```zig
pub fn formatEntries(
    self: Value,
    buffer_writer: *std.Io.Writer,
    formatter: *EntryFormatter,
) std.Io.Writer.Error!void { ... }
```

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

What makes this change leave a bitter taste in my mouth, however, is that Zig 0.15
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

One of the earliest occasions in which the eventual design of Writergate had
been revealed was in Zig founder Andrew Kelley's talk at
[Systems Distributed '25](https://systemsdistributed.com), titled
["Don't Forget To Flush"](https://www.youtube.com/watch?v=f30PceqQWko).
In hindsight, it really is quite an apt title, given that forgetting to flush
turned out to be one of the most devastating mistakes that Writergate will
absolutely *not* be able to protect you from.

How bad are the consequences of forgetting to flush? How about... breaking
[***all*** apps that use the HTTP client](https://github.com/ziglang/zig/pull/24926),
so that when you try to send any POST request the program just [hangs](https://github.com/ziglang/zig/issues/25002)?

Yeah. Not good.

You might be wondering then: why can't we just use a `defer` to call `flush`
unconditionally when a scope exits, like what we already do with memory allocation?

```zig
const foo = alloc.create(T);
defer alloc.destroy(foo);
// =>
var writer: std.Io.Writer = ...;
defer writer.flush();
```

Sadly, this doesn't work, since `defer` and `errdefer` statements mustn't
return any errors. You *could* try discarding the error like `defer writer.flush
catch {}`, but I would argue that for some writers (e.g. files) there could
definitely potentially be important errors that shouldn't be silently ignored,
like insufficient permissions or out of disk space.

Unfortunately, there isn't really a good solution to this other than to just
always remind yourself that you should always flush your writers. For somewhat
"special" implementations of `Writer` like `Writer.fixed` or `Writer.Allocating`
flushing defaults to a no-op anyways, so it should generally always be safe to
flush just in case. In an ideal world perhaps `defer` should also be able to
return errors, but I'm not even going to attempt to imagine how the control
flow would even look like with `errdefer`s allowed.

Even though the Zig Zen says we should "reduce the amount one must remember",
perhaps in this case the best solution is to always remind yourself:
**"don't forget to flush!"**

# III. The Bad

## Dependency inferno

Getting a sufficiently large community to do *anything* is hard, let alone
pushing massive, wide-ranging breaking changes into the ecosystem. And this
time, pretty much *any* moderately complex project is going to run into
serious roadblocks, not only because of Writergate proper and the `ArrayList`
changes but also because of build system changes that essentially stop you
from even going into actual compilation until you can fix not just your build
script, but the build scripts of *all* libraries your project depends on.

Probably the most irritating change I've seen thus far is when dependencies
rely on a deprecated way to create executable steps (`addExecutable`, `addTest`,
etc.). Previously, you were allowed to directly specify a source file in the
options to these methods, which was very convenient for tests especially since
you don't have to explicitly create an additional module just for those tests --
in practice however, that turned out to be not that useful, especially since
modules have a much wider range of build- and link-time options that are simply
not exposed in `Step.Compile` steps, and that you're given control over whether
to expose the module to downstream consumers by choosing between `addModule`
(public) and `createModule` (private).

```zig
// Before:
const exe = b.addExecutable(.{
  .name = "foobar",
  .root_source_file = b.path("src/main.zig"),
  .target = target,
  .optimize = optimize,
});

// After:
const exe = b.addExecutable(.{
  .name = "foobar",
  .root_module = b.createModule(.{
    .root_source_file = b.path("src/main.zig"),
    .target = target,
    .optimize = optimize,
  }),
});
```

Though I personally agree with the change and the previous way was too
:sparkles: magical :sparkles: for my tastes (which also led to a lot of
people not understanding what the difference between a module and an executable
is), *my god*, I had to manually patch ***so*** many dependencies that it's
not even funny. Often times I would have to make a PR to upstream which is
solely to patch the build system so that at least it tries to compile.

While it's true that the previous way had already been deprecated back in 0.14
and that library authors *should* have already migrated to this new pattern,
but without any concrete warning messages, it's very easy to overlook problems
like these until you're forced to address them -- that is, when your code stops
compiling altogether. This is one of the cases where I *really* wish that Zig
outputs warnings (not errors!) when a certain feature has been deprecated.
That way, library authors and users would have time to prepare for a migration
instead of being caught with their pants completely down to the ankles when the
deprecated symbols are removed by the next Zig version.

Additionally, there will *always* be some dependencies that will just never be
officially updated to compile on newer Zig versions: in Ghostty, for example,
we still rely on an old, unmaintained library called [`ziglyph`] to handle all
things Unicode -- grapheme clustering, grapheme breaking, determining
codepoint widths, etc. It had already been abandoned by its author since the
0.13 release cycle, and while it was not impacted badly during the 0.14
migration (if I recall correctly, the only thing we had to do was to update
the build script as well), it was hit *hard* during the 0.15 migration and I
had to remove large parts of the library just to keep it usable for our
purposes.

[`ziglyph`]: https://codeberg.org/dude_the_builder/ziglyph

I get that the appeal of Zig as a zerover language is that these massive changes
are *allowed* to happen and are overall expected to happen constantly -- what
I've heard from people who were much more involved with Zig in its early history
is that the language was so unstable that the codebase could need major updates
every month or so. Though with the existence of mature, beloved and widely-used
software like Ghostty, Bun, TigerBeetle, River and more, I wonder maybe it's
time to also offer ways of *automated* migrations so that people like me don't
have to be stuck manually porting multi-thousand-line codebases and chasing
after dependency updates every few months in an almost Sisyphean effort to keep
up with current best practices.

I'm *not* saying that Zig should stop innovating -- far from it -- but after
experiencing how smooth automated fixes and guided edition updates can be when
bumping the minimum version requirements for my Rust projects, I feel like Zig
can benefit from that genre of tools much more greatly than an already stable
language like Rust. It probably won't even have to be integrated into the Zig
compiler itself, but rather an ancillary tool like ZLS. Maybe I'll try writing
one one day when I'm truly fed up with manual migrations.

## Way Impatient, Probably (W.I.P.)

News flash: **Writergate is unfinished.** Notably, vast swaths of the standard
library have not been ported to use the new I/O interfaces, which means that
internally they still rely on backwards compatibility APIs like
`GenericReader.adaptToNewApi` in order to function. Other parts of Writergate,
that being async-agnostic I/O and alternative executors/runtimes are also just
pure conjecture at the moment.

In some other cases, functionality has been outright ***removed*** because
it was incompatible with the new API and has to be rebuilt from the ground up.
One notable victim of this is the `std.compress` APIs -- Zig 0.15's standard
library *intentionally* does not offer any way for programs to compress data
in any format or container, because the whole module had to be rewritten
to make use of the new features of Writergate, like seeking, peeking, tossing,
etc. This is really inconvenient for Ghostty as we have to generate compressed
Unicode tables (and some other pieces of data), which for the time being
has to be pre-generated or generated via other programs.

The whole quality assurance process for the release was also alarmingly
lackluster. Besides breaking every single app that uses HTTP and/or compression,
the whole *reason* why the first 0.15 release we got was 0.15.1 and **not**
0.15.0 as you would expect, was because they had only discovered a critical
regression *after* tagging 0.15.0 where HTTPS [completely stopped functioning
on Windows](https://github.com/ziglang/zig/issues/24911), meaning that
you couldn't even run commands like `zig fetch` without getting a ton of
`TlsInitializationFailed` errors. 

I simply could not **fathom** just exactly how that flew under the radar of
every *single* CI task or manual testing the team should've done prior to the
launch of a major language version. Perhaps this is yet another a case of
we-only-use-Unix-itis, but this is certainly a turn of events that is very
disappointing for a language that powers several pieces of beloved,
highly-important, production-quality software. Combined with various other bugs
and deficiencies, it's very likely that we would be seeing a 0.15.2 release
really soon -- something that hasn't ever happened before in Zig's version history.

Being somewhat out of the loop from Zig development, I'm not *really* sure
why things are left as-is: this whole release felt very *rushed*. Writergate
is a fundamentally ambitious project and I think leaving it half-baked is a
big mistake that only leaves people unwilling to upgrade from 0.14; while
getting the entire standard library ported to and tested with Writergate would
be a very significant, if not ***the*** focus if I were to do things differently.

Of course, all of this would be a lot more understandable were there any external
factors that forced a major Zig release this early (compared to the gap between
0.13 and 0.14 anyways), but there isn't any as far as I am aware of. Then, I
can only say that releasing a major version for the sole purpose that people can
play with an incomplete Writergate is not the brightest idea ever.

# IV. The Nasty

## One does not simply `write`

Say you're interested in porting your existing code to use Writergate, and
you happen to have a custom writer that implemented the old `std.io.Writer`
interface. Surely it's not going to be hard to port it to the new interface...
right?

***...Right???***

I'll have to be honest and say that implementing the new `std.Io.Writer`
interface nearly drove me insane. I feel like I had ascended into a higher
state of existence by the sheer amount of five-dimensional hyperbuffer with
time travel nonsense that it physically enlarged my brain and caused it to
herniate into my cranium.

What I wanted to do is simple -- implement an adapter that escapes certain
characters that are commonly used in shell injection attacks like `"`, `$`,
etc., and then escape them by prepending them with a backslash (`\`).
Creatively named `ShellEscapeWriter`, its original implementation was
*extremely* straightforward: we store the underlying writer in the struct,
and for the `write` implementation we just loop over each character,
determine if we need to escape it, then perform a write on the underlying
writer that may or may not include the backslash.

```zig
fn write(self: *ShellEscapeWriter(T), data: []const u8) error{Error}!usize {
    var count: usize = 0;
    for (data) |byte| {
        const buf = switch (byte) {
            '\\',
            '"',
            '\'',
            '$',
            // etc.
            => &[_]u8{ '\\', byte },
            else => &[_]u8{byte},
        };
        self.child_writer.writeAll(buf) catch return error.Error;
        count += 1;
    }
    return count;
}
```

I'm not going to sugarcoat this -- with the new API, pretty much **none
of this works**. It's too cute, too innocent to fit in with the new,
performance-oriented direction Writergate is heading into. To illustrate
what I mean, let's look at the replacement for `write` in the new API,
now named `drain`:

```zig
fn drain(w: *Writer, data: []const []const u8, splat: usize) Error!usize
```

First of all.. why is `data` a slice of bytes now? What does `splat` mean?
What the heck is any of this??

Okay, let's slow down a bit and read the docs:

> Sends bytes to the logical sink. A write will only be sent here if it
> could not fit into `buffer`, or during a `flush` operation.
>
> `buffer[0..end]` is consumed first, followed by each slice of `data` in
> order. Elements of `data` may alias each other but may not alias
> `buffer`.
>
> This function modifies `Writer.end` and `Writer.buffer` in an
> implementation-defined manner.
>
> `data.len` must be nonzero.
>
> The last element of `data` is repeated as necessary so that it is
> written `splat` number of times, which may be zero.
>
> This function may not be called if the data to be written could have
> been stored in `buffer` instead, including when the amount of data to
> be written is zero and the buffer capacity is zero.
>
> Number of bytes consumed from `data` is returned, excluding bytes from
> `buffer`.
>
> Number of bytes returned may be zero, which does not indicate stream
> end. A subsequent call may return nonzero, or signal end of stream via
> `error.WriteFailed`.

That... sure is a lot than just "do something with these bytes, return the
amount of written bytes" like the old API. If you're familiar with the
`readv` and `writev` syscalls in POSIX or `WSASend` and `WSARecv` APIs
on Windows, you might find this API design quite familiar -- more specifically
it resembles a generalized form of [Vectored I/O] (aka scatter/gather I/O),
which is characterized by its ability to read or write data to and from
multiple buffers at the same time.

[Vectored I/O]: https://en.wikipedia.org/wiki/Vectored_I/O

After spending a few days talking in the Zig Discord and helping others also
try to wrap *their* brains around this API design, we collectively came to the
conclusion that, like it or not, **this is not how humans usually
conceptualize I/O implementations**. For most normies like me, when you
implement a Writer, you just have to write code for something accepts some bytes
and uses it to do something else; conversely for the Reader, which also just
needs to fetch some bytes through some means. This is, by a very wide margin,
how the ***vast majority*** of programming languages model user-defined
Reader and Writer types (cf. Go, Rust, C++, Haskell, Java, etc.) and what
people are really used to.

The more complex API also means that there are a lot of helper functions
like `writeSplatHeader` that had to exist so that people can perform very basic
tasks like filling up the write buffer before operating on the entire buffer
or talking to operating system APIs, while they're explicitly handed the
entire buffer to begin with in the pre-Writergate API. This just increases
more churn for Reader/Writer implementors and overall makes the code *far less*
intuitive than it should be. I ended up just writing a mapper function and then
blindly iterated over each slice and each byte, resulting in a very naïve
solution that probably ran even *worse* than the pre-Writergate version.

I personally would've much more favored the approach taken by Rust's
`std::io::Write` trait: there, you are required to implement `write`, but
you can also optionally implement `write_vectored`, which has a very similar
signature to Writergate's `drain` sans the `splat` parameter[^splat]. Then,
there's also a nightly-only function you can implement named `is_write_vectored`:
if true, that means that the caller should use the `write_vectored` API to
achieve higher performance than what is possible with the plain `write`;
otherwise, the caller should just use `write` since `write_vectored` wouldn't
be any faster.

[^splat]: I'll be blunt and say that I don't at all understand why the `splat`
parameter is even here. If I recall correctly, both POSIX's `writev` and
Windows's `WSASend` APIs only take lists of data without any `splat`-ish
parameter to be found. Maybe there's some specialized API in some strange
architecture or operating system that makes writing certain bytes repeatedly
more efficient? If you know anything about this, please let me know...!

```rust
pub trait Write {
    // Required methods
    pub fn write(&mut self, buf: &[u8]) -> std::io::Result<usize>;

    // Provided methods
    pub fn write_vectored(&mut self, bufs: &[IoSlice<'_>]) -> std::io::Result<usize>;

    pub fn is_write_vectored(&self) -> bool;
}
```

In my opinion, this is the perfect balance of simplicity and performance.
File writers for instance can use `write_vectored` to implement efficient
file writing using `writev` and the like, while adapters or custom writers
can just use the regular `write` method. No need to consider all the mental
gymnastics in understanding what the function signature even means. Perhaps
it would be better if you can optionally implement a "simplified" write method
in the vtable that the `drain` implementation would just call for you, but
at this point I'm not exactly getting my hopes up.

## How do you *learn* about any of this???

It's one of Zig's old problems: the docs *suck*. Granted, the new docs are
actually (surprisingly even) better than the old ones, which are extremely
barren, but the complexity of Writergate makes me believe that it could do
with a **lot** more written guidance. Heck, one of the reasons why I wrote
this post to begin with is that I want it to act as a (very rambly)
pseudo-guide to the post-Writergate world so that people don't have to go
dumpster-diving into Zig's source code like I did.

# V. Conclusion

# Footnotes
