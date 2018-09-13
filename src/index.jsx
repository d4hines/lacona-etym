/** @jsx createElement */
import { createElement } from 'elliptical'
import { Command } from 'lacona-phrases'
import { fromPromise } from 'rxjs/observable/fromPromise';
import 'rxjs/add/operator/startWith';
import { getWord } from './etym-api';

const EtymologySource = {
  fetch ({props}) {
    return fromPromise(getWord(props.word)).startWith([]);
  },
  clear: true
}

function hasDefinition(input, observe) {
  const data = observe(<EtymologySource word={input} />)
  return !!data.length
}

export const LookupEtymology = {
  extends: [Command],
  execute (result) {
    openURL({url: `https://www.etymonline.com/search?q=${result.item}`})
  },
  preview (result, {observe}) {
    const data = observe(<EtymologySource word={result.item} />)
    if (data.length) {
      const allHTML = _.map(data, 'html').join('<hr />')
      return {type: 'html', value: allHTML}
    }
  },
  describe ({observe}) {
    return (
      <sequence>
        <list items={['etymology ', 'look up etymology of']} />
        <String label='word or phrase' id='item' consumeAll filter={input => hasDefinition(input, observe)} />
      </sequence>
    )
  }
}

export const extensions = [LookupEtymology]
