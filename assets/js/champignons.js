---
---
{% assign champignonsTries = (site.champignons | sort: 'nom') %}
var champignons = [
{% for champignon in champignonsTries %}  {
    id: {{ forloop.index }},
    nom: "{{ champignon.nom }}"
  },
{% endfor %}
];