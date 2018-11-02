# Train ticket parser

Parses HTML train orders from SNCF and outputs their summary in json

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

To run this project, you will just need:

- NodeJS (this was coded with version 10 but should likely work with 8 as well)
- NPM

### Installing

Simply run `npm install` once

```
user@machine$ npm install
```
And you're good to go.

### Running the program

Just running `npm start` will read the "test.html" file in the current folder and output it in a "test-result.json" file, *overwriting it without notice*.

Two optional parameters are available for this program:

- `-f <fileName>`: path to the HTML file being parsed
- `-o <fileName>`: path to the JSON output file

## Built With

* [NodeJS](https://nodejs.org)
* [Cheerio](https://github.com/cheeriojs/cheerio) for HTML parsing
* [Minimist](https://github.com/substack/minimist) to handle options

## Author

* **Sylvain BIGONNEAU** - *Initial work* - [SylvainBigonneau](https://github.com/SylvainBigonneau)
