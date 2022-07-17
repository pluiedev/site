{% capture output %}

{% assign pronouns = site.data.members[include.member].pronouns %}
{% assign num-of-pronouns = pronouns | size %}

{% if num-of-pronouns > 1 %}
{% assign pronouns-formatted = '' | split: '' %}

{% for pronoun in pronouns %}
{% capture formatted %}<span class="pronoun {{ pronoun }}">{{
    site.data.pronouns[pronoun].combined | default: pronoun
    }}</span>{% endcapture %}

{% assign pronouns-formatted = pronouns-formatted | push: formatted %}
{% endfor %}

{{ pronouns-formatted | join: "/" }}
{% elsif num-of-pronouns == 1 %}
{% assign pronoun = pronouns | first %}

<span class="pronoun {{ pronoun }}">
    {{ site.data.pronouns[pronoun].isolated }}
</span>
{% endif %}

{% endcapture %}

{{ output | strip }}