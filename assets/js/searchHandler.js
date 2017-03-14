var searchHandler = {
    index: undefined, // Should be set by the caller
    allResults: undefined, // Should be set by the caller
    showResults: undefined, // Should be set by the caller
    hideAllResults: undefined, // Should be set by the caller
    facets: undefined, // Should be set by the caller
    filters: undefined, // Should be set by the caller

    query: "",
    initialize: function(query) {
        if (query) {
            this.query = query;
        }

        this.search();
    },
    search: function () {
        this.hideAllResults();

        var queries = [];

        var terms = this.query.split(" ");
        for (var i = 0; i < terms.length; ++i) {
            queries.push({
                query: terms[i]
            });
        }

        for (var facetField in this.facets) {
            var facet = this.facets[facetField];

            if (!facet.selectedValue) {
                continue;
            }

            var fieldsToSearchFor = {};
            fieldsToSearchFor[facetField] = { boost: 1 };
            queries.push({
                query: facet.selectedValue,
                userConfig: {
                    fields: fieldsToSearchFor,
                    bool: "AND"
                }
            });
        }

        for (var field in this.filters) {
            var value = this.filters[field];

            if (!value) {
                continue;
            }

            var fieldsToSearchFor = {};
            fieldsToSearchFor[field] = { boost: 1 };
            queries.push({
                query: value,
                userConfig: {
                    fields: fieldsToSearchFor,
                    bool: "AND"
                }
            });
        }

        var searchResults = this.index.multiSearch(queries);
        var facetResults = this.updateFacetsFromSearchResults(searchResults);
        this.showResults(searchResults, facetResults);
    },
    updateFacetsFromSearchResults: function(results) {
        var _this = this;
        var facetResults = [];

        for (var field in this.facets) {
            var facet = this.facets[field];
            var facetResult = {
                field: field
            };

            // Find all the values for this facet
            var facetValues = {};

            for (var r = 0; r < results.length; ++r) {
                var fieldValue = this.allResults[(results[r].ref * 1) - 1][field];
                if (!fieldValue) {
                    continue;
                }
                if (facetValues[fieldValue]) {
                    facetValues[fieldValue] += 1;
                } else {
                    facetValues[fieldValue] = 1;
                }
            }

            var uniqueValues = Object.keys(facetValues);
            if (uniqueValues.length > 0) {
                uniqueValues = uniqueValues.sort(function(a, b) {
                    return a.localeCompare(b);
                });

                var facetValuesOccurrences = uniqueValues.map(function (uniqueValue, index) {
                    return {
                        value: uniqueValue,
                        count: facetValues[uniqueValue]
                    };
                });

                facetResult.results = facetValuesOccurrences;
            } else {
                facetResult.results = [];
            }

            facetResults.push(facetResult);
        }

        return facetResults;
    }
};