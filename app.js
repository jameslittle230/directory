var app = new Vue({
  el: "#app",
  data: {
    first: "",
    last: "",
    answer: "",
    message: "Search for someone..."
  },
  watch: {
    // whenever question changes, this function will run
    first: function(newQuestion, oldQuestion) {
      this.message = "Searching...";
      this.debouncedGetAnswer();
    },

    last: function(newQuestion, oldQuestion) {
      this.message = "Searching...";
      this.debouncedGetAnswer();
    }
  },
  created: function() {
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500);
  },
  methods: {
    getAnswer: function() {
      var vm = this;
      if (vm.first == "" && vm.last == "") {
        vm.answer = [];
        vm.message = "Search for someone...";
        return;
      }

      axios
        .get("https://webapi.bowdoin.edu/webapi/directory/search", {
          params: {
            first: vm.first,
            last: vm.last,
            dept: ""
          }
        })
        .then(function(response) {
          vm.answer = response.data;
          if (vm.answer.length == 0) {
            vm.message = "No results found.";
          } else {
            vm.message = vm.answer.length + " results found.";
          }
        })
        .catch(function(error) {
          vm.answer = "Error! Could not reach the API. " + error;
        });
    },

    camelCaseToWords: function(str) {
      return str
        .match(/^[a-z]+|[A-Z][a-z]*/g)
        .map(function(x) {
          return x[0].toUpperCase() + x.substr(1).toLowerCase();
        })
        .join(" ");
    }
  }
});
