import path from 'path';
import makeRelativePath from './makeRelativePath';
import isPluralForm from './isPluralForm';

import {

  compose as cx,
  concat as cat,
  join,
  reduce,
  last,
  takeLast,
  map,
  head,
  split,
  range,
  replace

} from 'ramda';

const root = process.env.PWD;
const config = require(path.join(root, 'gettext.config.js'));

export const buildMsgstr = map((num) => `msgstr[${num}] ""\n`)
export const buildMsgstrs = (num) => cx(join(''), buildMsgstr)(range(0, num))
export const getNumPlurals = cx(parseInt, last, head, split(';'))

export const formatMessageBlock = (accum, translation) => {
  const path = makeRelativePath(translation.path);

  const translationBlock = cat(
    `#: ${path} ${translation.loc.line}:${translation.loc.column}\n`,
    cat(cat('msgid "',
    replace(/\"/g, '\\"', `${translation.text}`)),
    '"')
  )

  if (isPluralForm(translation.text)){
    const msgstrs = cx(
      buildMsgstrs,
      getNumPlurals
    )(config.header['Plural-Forms'])

    return cx(
      cat(accum),
      cat(translationBlock),
      cat('\n'),
      cat(msgstrs),
    )('\n');
  }

  return cx(
    cat(accum),
    cat(translationBlock),
    cat('\n'),
    cat('msgstr ""\n'),
  )('\n');
}

export default reduce(formatMessageBlock, '')
