import {
  expect
} from 'chai';
import {
  readFileSync
} from 'fs';
import {
  env
} from 'process';
import nock from 'nock';

import {
  getWord,
  ETYM_URL,
  NOT_FOUND_ERROR,
  INTERNAL_ERROR,
  FAULTY_EXPECTATION,
} from '../src/etym-api';

describe('Etym API', () => {
  const word = 'book';

  describe('getWord', () => {
    it('should return an array of result words', () => {
      // Mock a request with a cached copy of the results
      // const exampleResponse = readFileSync('test/book.html').toString();
      // nock(ETYM_URL + word)
      //   // I had trouble getting nock to register the requests and respond appropriately.
      //   // .get('') was a solution, per https://github.com/nock/nock/issues/543#issuecomment-224039762
      //   .get('')
      //   .reply(200, exampleResponse);

      return getWord(word).then(result => {
        expect(result.length).to.be.greaterThan(1);
        expect(result[0].word).to.contain('book (n.)');
      });
    });

    it('should return 404 response if the word is not found', () => {
      const nonWord = 'qrasfdtasdasdf';
      nock(ETYM_URL + nonWord)
        .get('')
        .reply(404, 'Not home, go away.');

      return getWord(nonWord)
        .then(e => {
          expect(e).to.be.eq(NOT_FOUND_ERROR);
        });
    });

    it('should fail if any expectations about the response are violated', () => {
      if (env.NOCK_OFF) return;
      nock(ETYM_URL + word)
        .get('')
        .reply(200,
          `<div class="word--">
        <h1>Fixed that typo in the class name</h1>
        <div class="word__definition">foo</div>
        </div>`);

      return getWord(word)
        .then(e => {
          expect(e).to.be.eq(FAULTY_EXPECTATION);
        });
    });

    it('should fail if the service is unavailable', () => {
      nock(ETYM_URL + word)
        .get('')
        .reply(503, 'Not home, go away.');

      return getWord(word)
        .then(e => {
          expect(e).to.be.eq(INTERNAL_ERROR);
        });
    });
  });
});