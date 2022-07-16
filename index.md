---
layout: default
title: Hello
---

<style>
    .flex-paragraph {
        display: flex;
        align-items: center;
    }

    .avatar {
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: 15px;
    }

    .avatar>* {
        margin: 5px;
    }

    .pfp {
        transition: all ease-in-out 0.2s;
    }

    .pfp:hover {
        scale: 110%;
    }
</style>

# Hello 👋

We are the Dichotomy System, a small, [parogenic](https://pluralpedia.org/w/Parogenic)
[plural system](https://morethanone.info) residing in a male body in his late teens.
We consist of two members:
<span class="leo">Leo</span>
and <span class="leah">Leah</span>.
We are currently based in China, identify as ethnically Chinese, and speak both English and (Standard)
Chinese.

Click on our avatars for more info.

{% for member in site.data.members %} 
<div class="flex-paragraph">
    {% capture avatar %}
        <div class="avatar">
            <a href="./{{ member.id }}.html">
                <img
                    src="assets/avatars/{{ member.id }}.png"
                    height="{{ member.pfp-size }}"
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

<h2>Contacting us</h2>
<p>
    You can find us on any of these platforms:
<ul>
    <li>
        Discord as <code>leocth#3409</code>, where we regularly chat with people,
        singlets and systems alike;
    </li>
    <li>
        We also have a <a href="https://discord.gg/NeNfePzCx8">Discord server</a> you can
        join to hang out with us;
    </li>
    <li>
        GitHub as <a href="https://github.com/leocth"><code>leocth</code></a>,
        where <span class="leo">Leo</span> uploads most of his code;
    </li>
    <li>
        <a href="https://www.youtube.com/channel/UCfVDQlFd1pGiNfjFdG-Gamw">YouTube</a> and
        <a href="https://space.bilibili.com/401096522">Bilibili</a> as <code>leocth</code>,
        where we occasionally release videos;
    </li>
    <li>
        <span class="leo">Leo</span> has his pronouns and stuff listed on
        <a href="https://pronouns.page/@leocth31"><code>pronouns.page</code></a>;
    </li>
    <li>
        We also have a <a href="https://twitter.com/leocth31">Twitter account</a> that nobody uses—it's just
        there.
    </li>
</ul>
</p> 