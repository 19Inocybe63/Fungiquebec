var searchHandler = {
    index: undefined, // Should be set by the caller
    allResults: undefined, // Should be set by the caller
    showResults: undefined, // Should be set by the caller
    hideAllResults: undefined, // Should be set by the caller
    showAllResults: undefined, // Should be set by the caller
    facetsContainer: undefined, // jQuery object

    query: "",
    facets: [],
    initialize: function(query) {
        if (query) {
            this.query = query;
        }
        // for (var i = 0; i < this.facets.length; ++i) {
        //     this.createFacet(i, this.facets[i]);
        // }

        this.search();
    },
    createFacet: function(index, facet) {
        var _this = this;
        var facetElement = $("<div>").addClass("facet");
        facetElement.append($("<div>").addClass("facetName").text(facet.label));
        facetElement.append($("<a>")
                    .addClass("facetSelectedValue")
                    .attr("href", "#")
                    .data("index", index)
                    .on("click", function(e) {
                        _this.onFacetSelectedValueClicked(e, _this);
                    }));
        facetElement.append($("<div>")
                    .addClass("facetValues"));

        this.facetsContainer.append(facetElement);
        this.facets[index].element = $($('.facet')[index]);
    },
    onFacetSelectedValueClicked: function(e, _this) {
        var facetSelectedValueElement = $(e.target);
        facetSelectedValueElement.text("");

        var index = facetSelectedValueElement.data("index");
        _this.facets[index].selectedValue = undefined;
        _this.search();

        var facetElement = _this.facets[index].element;
        var facetValuesElement = facetElement.find('.facetValues');
        facetValuesElement.show();
    },
    // shouldSearch: function () {
    //     var hasQuery = !!this.query;
    //     if (hasQuery) {
    //         return true;
    //     }

    //     for (var i = 0; i < this.facets.length; ++i) {
    //         if (this.facets[i].selectedValue) {
    //             return true;
    //         }
    //     }

    //     return false;
    // },
    search: function () {
        this.hideAllResults();

        var queries = [];

        queries.push({
            query: this.query
        });

        for (var i = 0; i < this.facets.length; ++i) {
            var facet = this.facets[i];

            if (!facet.selectedValue) {
                continue;
            }

            var fieldsToSearchFor = {};
            fieldsToSearchFor[facet.field] = { boost: 1 };
            queries.push({
                query: facet.selectedValue,
                userConfig: {
                    fields: fieldsToSearchFor
                }
            });
        }

        var searchResults = this.index.multiSearch(queries);
        this.showResults(searchResults);
        this.updateFacetsFromSearchResults(searchResults);
    },
    updateFacetsFromAllResults: function() {
        var _this = this;

        for (var i = 0; i < this.facets.length; ++i) {
            var facet = this.facets[i];

            if (facet.selectedValue) {
                // Do not touch facets with selection
                continue;
            }

            // Clear the DOM
            var facetElement = facet.element;
            var facetValuesElement = facetElement.find('.facetValues');
            // var facetValueElements = facetValuesElement.find('.facetValue');
            // for (var e = 0; e < facetValueElements.length; ++e) {
            //     facetValuesElement.children.remove(facetValueElements[i]);
            // }
            facetValuesElement.html("");

            // Find all the values for this facet
            var field = facet.field;
            var facetValues = [];

            for (var r = 0; r < this.allResults.length; ++r) {
                var fieldValue = this.allResults[r][field];
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

                // Add the values to the DOM
                for (var v = 0; v < facetValuesOccurrences.length; ++v) {
                    facetValuesElement.append($("<a>")
                                      .addClass("facetValue")
                                      .attr("href", "#")
                                      .data("index", i)
                                      .text(facetValuesOccurrences[v].value + " (" + facetValuesOccurrences[v].count + ")")
                                      .on("click", function(e) {
                                          _this.onFacetValueClicked(e, _this);
                                      }));
                }

                // Ensure the facet is displayed
                facetElement.show();
            } else {
                facetElement.hide();
            }
        }
    },
    updateFacetsFromSearchResults: function(results) {
        var _this = this;

        for (var i = 0; i < this.facets.length; ++i) {
            var facet = this.facets[i];

            if (facet.selectedValue) {
                // Do not touch facets with selection
                continue;
            }

            // Clear the DOM
            var facetElement = facet.element;
            var facetValuesElement = facetElement.find('.facetValues');
            // var facetValueElements = facetValuesElement.find('.facetValue');
            // for (var e = 0; e < facetValueElements.length; ++e) {
            //     facetValuesElement.children.remove(facetValueElements[i]);
            // }
            facetValuesElement.html("");

            // Find all the values for this facet
            var field = facet.field;
            var facetValues = [];

            for (var r = 0; r < results.length; ++r) {
                var fieldValue = this.allResults[results[r].ref][field];
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

                // Add the values to the DOM
                for (var v = 0; v < facetValuesOccurrences.length; ++v) {
                    facetValuesElement.append($("<a>")
                                      .addClass("facetValue")
                                      .attr("href", "#")
                                      .data("index", i)
                                      .text(facetValuesOccurrences[v].value + " (" + facetValuesOccurrences[v].count + ")")
                                      .on("click", function(e) {
                                          _this.onFacetValueClicked(e, _this);
                                      }));
                }

                // Ensure the facet is displayed
                facetElement.show();
            } else {
                facetElement.hide();
            }
        }
    },
    onFacetValueClicked: function(e, _this) {
        var facetValueElement = $(e.target);
        var value = facetValueElement.text();
        var indexToTrim = value.indexOf('(') - 1;
        value = value.substr(0, indexToTrim);

        var index = facetValueElement.data("index");
        _this.facets[index].selectedValue = value;

        var facetElement = _this.facets[index].element;
        var facetValuesElement = facetElement.find('.facetValues');
        facetValuesElement.hide();
        var facetSelectedValueElement = facetElement.find('.facetSelectedValue');
        facetSelectedValueElement.text(value);

        _this.search();
    }
};