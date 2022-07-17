---
layout: default
title: Hello
---

<link rel="stylesheet" href="/styles/index.css">

# Hello 👋

We are the Dichotomy System, a small, [parogenic][parogenic] [plural system][plural] residing in
a male body in his late teens.
We consist of two members: <span class="leo">Leo</span> and <span class="leah">Leah</span>.
We are currently based in China, identify as ethnically Chinese, and speak both English and (Standard)
Chinese.

Click on our avatars for more info.

{% for member in site.data.about %} 
<div class="member-about">
    {% capture avatar %}
        <div class="avatar">
            <a href="{% link folks/{{ member.id }}.md %}">
                <img
                    src="assets/avatars/{{ member.id }}.png"
                    height="{{ member.avatar-size }}"
                    class="pfp"
                    title="{{ member.name }}"
                    alt="{{ member.name }}'s avatar"
                />
            </a>
            {% include pride-flags.html member=member.id %}
        </div>
    {% endcapture %}
    {% capture content %}
        {% include about/{{ member.id }}.md %}
    {% endcapture %}


    {% case member.avatar-placement %}
    {% when "left" %}
        {{ avatar }}
        <div>{{ content | markdownify }}</div>
    {% when "right" %}
        <div>{{ content | markdownify }}</div>
        {{ avatar }}
    {% else %}
        <p style="color:red">
            <strong>
                Error: `avatar-placement` unspecified for member {{ member.id }}.
            </strong>
        </p>
    {% endcase %}
</div>
{% endfor %}

## Contacting us

You can find us on any of these platforms:

- Discord as `leocth#3409`, where we regularly chat with people, singlets and systems alike;
- We also have a [Discord server][discord] you can join to hang out with us;
- GitHub as [`leocth`][github],where <span class="leo">Leo</span> uploads most of his code;
- [YouTube][youtube] and [Bilibili][bilibili] as `leocth`, where we occasionally release videos;
- <span class="leo">Leo</span> has his pronouns and stuff listed on [`pronouns.page`][pronouns];
- We also have a [Twitter account][tw*tter] that nobody uses—it's just there.

[parogenic]: https://pluralpedia.org/w/Parogenic
[plural]: https://morethanone.info

[discord]: https://discord.gg/NeNfePzCx8
[github]: https://github.com/leocth
[youtube]: https://www.youtube.com/channel/UCfVDQlFd1pGiNfjFdG-Gamw
[bilibili]: https://space.bilibili.com/401096522
[pronouns]: https://pronouns.page/@leocth31
[tw*tter]: https://twitter.com/leocth31