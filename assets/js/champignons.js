---
---
var indexChampignons = elasticlunr(function () {
    this.use(elasticlunr.fr);
    this.saveDocument(false);
    this.setRef('id');
    this.addField('nom');

    {% for champ in site.champs-details %}{% if champ.search != "exclure" %}
    this.addField('{{ champ.name | replace: "-", "_" }}');
    {% endif %}{% endfor %}

    {% for champ in site.champs-collections %}{% if champ.search != "exclure" %}
        {% if champ.champs %}
            {% for sousChamp in champ.champs %}
                {% if sousChamp.search != "exclure" %}
this.addField('{{ champ.name | replace: "-", "_" }}_{{ sousChamp.name | replace: "-", "_" }}');
                {% endif %}
            {% endfor %}
        {% else %}
this.addField('{{ champ.name | replace: "-", "_" }}');
        {% endif %}
    {% endif %}{% endfor %}

    {% for champ in site.champs-description %}{% if champ.search != "exclure" and champ.name != "cristaux apicaux" %}
    this.addField('{{ champ.name | replace: "-", "_" }}');
    {% endif %}{% endfor %}
});

var facetsChampignons = {
    {% for champ in site.champs-details %}
        {% if champ.search == "facet" %}
    '{{ champ.name | replace: "-", "_" }}': {
        selectedValue: undefined
    },
        {% endif %}
    {% endfor %}
};


{% assign champignonsTries = (site.champignons | sort: 'nom') %}

var champignons = [
    {% for champignon in champignonsTries %}  {
        id: {{ forloop.index }},
        nom: "{{ champignon.nom }}",
        nom_francais: "{{ champignon.details.nom-francais }}",
        url: "{{ champignon.url | prepend: site.baseurl }}",
        {% for champ in site.champs-details %}{% if champ.search != "exclure" and champignon.details[champ.name] %}
        {{ champ.name | replace: "-", "_" }}: "{{ champignon.details[champ.name] | replace: '"', ' ' }}",
        {% endif %}{% endfor %}

        {% for champ in site.champs-collections %}{% if champ.search != "exclure" %}
            {% if champ.champs %}
                {% for sousChamp in champ.champs %}{% if sousChamp.search != "exclure" %}
                    {% capture valeurSousChamp %}{% for element in champignon.collections %}{% if element[champ.name] %}{% if element[champ.name][sousChamp.name] %}{{ element[champ.name][sousChamp.name] }} {% endif %}{% endif %}{% endfor %}{% endcapture %}
                    {% if valeurSousChamp %}
        {{ champ.name | replace: "-", "_" }}_{{ sousChamp.name | replace: "-", "_" }}: "{{ valeurSousChamp | replace: '"', ' ' }}",
                    {% endif %}
                {% endif %}{% endfor %}
            {% else %}
                {% capture valeurChamp %}{% for element in champignon.collections %}{% if element[champ.name] %}{{ element[champ.name] }} {% endif %}{% endfor %}{% endcapture %}
                {% if valeurChamp %}
        {{ champ.name | replace: "-", "_" }}: "{{ valeurChamp | replace: '"', ' ' }}",
                {% endif %}
            {% endif %}
        {% endif %}{% endfor %}

        {% for champ in site.champs-description %}{% if champ.search != "exclure" and champ.name != "cristaux apicaux" and champignon.description[champ.name] %}
            {% assign champSplit = champignon.description[champ.name] | strip | newline_to_br | split: "<br />" %}
            {% capture valeurChamp %}{% for ligne in champSplit %}{{ ligne | strip | replace: '"', ' ' }} {% endfor %}{% endcapture %}
        {{ champ.name | replace: "-", "_" }}: "{{ valeurChamp }}",
        {% endif %}{% endfor %}
    },
    {% endfor %}
];

for (var i = 0; i < champignons.length; ++i) {
    indexChampignons.addDoc(champignons[i]);
}