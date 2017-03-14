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
            var facetValues = [];

            for (var r = 0; r < results.length; ++r) {
                var fieldValue = this.allResults[(results[r].ref * 1) - 1][field];
                if (!fieldValue) {
                    continue;
                }
                facetValues.push(fieldValue);
            }

            if (facetValues.length > 0) {
                // Sort the values and compute their occurences
                var uniqueValues = Array.from(facetValues);
                var numberOfUniqueValues = 0;
                while (numberOfUniqueValues != uniqueValues.length) {
                    numberOfUniqueValues = uniqueValues.length;
                    $.unique(uniqueValues);
                }
                uniqueValues.sort();

                var facetValuesOccurrences = uniqueValues.map(function (uniqueValue, index) {
                    return {
                        value: uniqueValue,
                        count: facetValues.filter(function(value) {
                            return value == uniqueValue;
                        }).length
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