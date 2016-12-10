---
---
var indexChampignons = elasticlunr(function () {
    this.use(elasticlunr.fr);
    this.setRef('id');
    this.addField('nom');

    {% for champ in site.champs-details %}
        {% if champ.format == "table" %}
            {% for colonne in champ.table %}
                {% if colonne.search != "exclure" %}
    this.addField('{{ colonne.name | replace: "-", "_" }}');
                {% endif %}
            {% endfor %}
        {% else %}
            {% if champ.search != "exclure" %}
    this.addField('{{ champ.name | replace: "-", "_" }}');
            {% endif %}
        {% endif %}
    {% endfor %}

    {% for champ in site.champs-description %}
        {% if champ.search != "exclure" %}
    this.addField('{{ champ.name | replace: "-", "_" }}');
        {% endif %}
    {% endfor %}
});

var facetsChampignons = [
    {% for champ in site.champs-details %}
        {% if champ.search == "facet" %}
    {
        label: '{{ champ.label }}',
        field: '{{ champ.name | replace: "-", "_" }}',
        selectedValue: undefined
    },
        {% endif %}
    {% endfor %}
];


{% assign champignonsTries = (site.champignons | sort: 'nom') %}

var champignons = [
    {% for champignon in champignonsTries %}  {
        id: {{ forloop.index }},
        nom: "{{ champignon.nom }}",

        {% for champ in site.champs-details %}
            {% if champ.search != "exclure" and champignon.details[champ.name] %}
                {% if champ.format == "table" %}
                    {% for colonne in champ.table %}
                        {% if colonne.search != "exclure" %}
                            {% capture valeurColonne %}{% for element in champignon.details[champ.name] %}{% if element[colonne.name] %}{{ element[colonne.name] }} {% endif %}{% endfor %}{% endcapture %}
                            {% if valeurColonne %}
        {{ colonne.name | replace: "-", "_" }}: "{{ valeurColonne| replace: '"', ' ' }}",
                            {% endif %}
                        {% endif %}
                    {% endfor %}
                {% else %}
        {{ champ.name | replace: "-", "_" }}: "{{ champignon.details[champ.name]| replace: '"', ' ' }}",
                {% endif %}
            {% endif %}
        {% endfor %}

        {% for champ in site.champs-description %}
            {% if champ.search != "exclure" and champignon.description[champ.name] %}
                {% assign champSplit = champignon.description[champ.name] | strip | newline_to_br | split: "<br />" %}
                {% capture valeurChamp %}{% for ligne in champSplit %}{{ ligne | strip | replace: '"', ' ' }} {% endfor %}{% endcapture %}
        {{ champ.name | replace: "-", "_" }}: "{{ valeurChamp }}",
            {% endif %}
        {% endfor %}
    },
    {% endfor %}
];

for (var i = 0; i < champignons.length; ++i) {
    indexChampignons.addDoc(champignons[i]);
}