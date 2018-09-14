/** @jsx createElement */
/* eslint-disable no-unused-vars */
import { createElement } from 'elliptical';
import { Command, String } from 'lacona-phrases';
/* eslint-enable no-unused-vars */
import { fromPromise } from 'rxjs/observable/fromPromise';

import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/debounceTime';
import { getWord } from './etym-api';
import { openURL } from 'lacona-api';

// eslint-disable-next-line no-unused-vars
const EtymologySource = {

  fetch({ props }) {
    return fromPromise(getWord(props.word)).startWith([]);
  },
  clear: true
};

function hasDefinition(input, observe) {
  // return true;
  const data = observe(<EtymologySource word={input} />);
  return !data.error && !!data.length;
}

export const LookupEtymology = {
  extends: [Command],
  execute(result) {
    openURL({ url: `https://www.etymonline.com/search?q=${result.item}` });
  },
  preview(result, { observe }) {
    const data = observe(<EtymologySource word={result.item} />);
    if (data.error) {
      return {
        type: 'html',
        value: `<h1>${data.error}</h1><p>${data.errorBody}</p>`
      };
    }
    if (data && data.length) {
      return {
        type: 'html',
        value: data.map(({ word, etymology }) => word + etymology + '<br/>')
          .join('<hr/>'),
      };
    }
  },
  describe({ observe }) {
    return (
      <sequence>
        <list items={['etymology ', 'look up etymology of ']} />
        <String label='word or phrase' id='item' consumeAll filter={input => hasDefinition(input, observe)} />
      </sequence>
    );
  }
};

export const extensions = [LookupEtymology];
