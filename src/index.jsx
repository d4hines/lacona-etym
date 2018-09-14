/** @jsx createElement */
import { createElement } from 'elliptical'
import { Command, String } from 'lacona-phrases'
import { fromPromise } from 'rxjs/observable/fromPromise';
import { empty } from 'rxjs/observable/empty';
import { from } from 'rxjs/observable/from';

import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/debounceTime';
import { getWord } from './etym-api';
import { openURL } from 'lacona-api';

const EtymologySource = {
  fetch({ props }) {
    //   return from([[
    //     { word: '<h1>foo (n.)</h1>', etymology: '<p>from latin, foosballus</p>' },
    //     { word: '<h1>foo (v.)</h1>', etymology: '<p>fro latin, foosballare</p>' }
    //   ]]);
    // return from([{error: 'Some error', errorBody: 'Some Error Body'}])
    // const words = props.word.trim().split(/\W/);
    // if (words.length != 1) {
    // return empty();
    // }
    return fromPromise(getWord(props.word)).startWith([]);
  },
  clear: true
}

function hasDefinition(input, observe) {
  return true;
  const data = observe(<EtymologySource word={input} />)
  return !data.error && !!data.length
}

export const LookupEtymology = {
  extends: [Command],
  execute(result) {
    openURL({ url: `https://www.etymonline.com/search?q=${result.item}` })
  },
  preview(result, { observe }) {
    const data = observe(<EtymologySource word={result.item} />);
    if (data.error) {
      return {
        type: 'html',
        value: `<h1>${data.error}</h1><p>${data.errorBody}</p>`
      }
    }
    if (data && data.length) {
      console.log(data);
      return {
        type: 'html',
        value: data.map(({ word, etymology }) => word + etymology + '<br/>')
          .join('<hr/>'),
      }
    }
  },
  describe({ observe }) {
    return (
      <sequence>
        <list items={['etymology ', 'look up etymology of ']} />
        <String label='word or phrase' id='item' consumeAll filter={input => hasDefinition(input, observe)} />
      </sequence>
    )
  }
}

export const extensions = [LookupEtymology]
