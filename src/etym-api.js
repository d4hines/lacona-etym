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
export const WORD_TITLE_SELECTOR = '[class*="word__name--"]';
// Please don't tell Douglas his developer spelled words wrong in the code. That could be crushing...
export const ETYMOLOGY_SELECTOR = '[class^="word__defination--"] div';

export const INTERNAL_ERROR = {
  error: 'EtymOnline experienced an internal issue',
  errorBody: 'Perhaps the service is down.'
};

export const NOT_FOUND_ERROR = {
  error: `Word not found on EtymOnline"`,
  errorBody: 'Perhaps there\'s a typo, or the word hasn\'t been indexed yet.'
};

export const FAULTY_EXPECTATION = {
  error: 'EtymOnline returned an unexpected response',
  errorBody: 'Perhaps the API has changed. Please file an issue at https://github.com/d4hines/lacona-etym'
};

function extract(body) {
  const $ = cheerio.load(body)
  const wordNodes = $(ENTRY_SELECTOR);

  // To guard against the real possibility of the API changing from underneath us,
  // we assert our expectations about the returned HTML.
  try {
    expect(wordNodes.length).to.be.greaterThan(0);
    expect(wordNodes).to.have.descendants(WORD_TITLE_SELECTOR);
    expect(wordNodes).to.have.descendants(ETYMOLOGY_SELECTOR);
  } catch (error) {
    return FAULTY_EXPECTATION;
  }
  let results = wordNodes.map((i, el) => {
    const etymNode = $(el).find(ETYMOLOGY_SELECTOR);
    // Remove the <ins> tag that messes up rendering
    $(etymNode).find('ins').each(function (i, el) {
      $(this).remove();
    });

    return {
      word: $(el).find(WORD_TITLE_SELECTOR).toString(),
      etymology: etymNode.toString(),
    };
  }).toArray();
  debugger;
  return results;
}

/**
 * Retrieves the etymology of a word from EtymOnline by downloading its page and extracting the etymology from the html.
 * In the case of a 404 (word not found), 5XX (internal EtymOnline error) or parsing error, returns an object of the
 * following structure: {error: [Main message as string], errorBody: [details as string]}
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

  return request(options).catch(error => {
    switch (true) {
      case error.statusCode === 404:
        return NOT_FOUND_ERROR;
      case error.statusCode >= 500:
        return INTERNAL_ERROR;
      default:
        break;
    }
  });
}