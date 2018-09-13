var request = require('request-promise-native');
var cheerio = require('cheerio');
import {
  use,
  expect
} from 'chai';

// chai cheerio has the same usage as https://www.npmjs.com/package/chai-jquery
use(require('chai-cheerio'));

// Note we use the /word endpoint to bring up an individual word.
export const ETYM_URL = 'https://www.etymonline.com/word/';
export const ENTRY_SELECTOR = '[class^="word--"]';
export const WORD_TITLE_SELECTOR = 'h1';
// Please don't tell Douglas his developer spelled words wrong in the code. That could be crushing...
export const ETYMOLOGY_SELECTOR = '[class^="word__defination--"] p';

function extract(body) {
  const $ = cheerio.load(body)
  const wordNodes = $(ENTRY_SELECTOR);

  // To guard against the real possibility of the API changing from underneath us,
  // we assert our expectations about the returned HTML.
  expect(wordNodes.length).to.be.greaterThan(0);
  expect(wordNodes).to.have.descendants(WORD_TITLE_SELECTOR);
  expect(wordNodes).to.have.descendants(ETYMOLOGY_SELECTOR);

  return wordNodes.map((i, el) => {
    return {
      word: $(el).find(WORD_TITLE_SELECTOR).toString(),
      etymology: $(el).find(ETYMOLOGY_SELECTOR).toString(),
    };
  });
}

/**
 * Retrieves the etymology of a word from EtymOnline by downloading its page and extracting the etymology from the html.
 * @param {string} word The word to be retrieved.
 * @returns {Promise}
 */
export function getWord(word) {

  var options = {
    uri: ETYM_URL + word,
    // extract is used as the callback fn.
    transform: extract,
    // Etymonline returns 404 when it can't find the word. This option ensures transform is only called on 200 response.
    transform2xxOnly: true,
  };

  return request(options);
}