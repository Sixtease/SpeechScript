/* global window */

import fetch_jsonp from 'fetch-jsonp';
import query_string from 'query-string';
import { API_BASE } from '../../../constants';
import { audio_sample_rate } from '../../../store/audio';

export const frame_to_time = frame => frame / audio_sample_rate;
export const time_to_frame = time => time * audio_sample_rate;

export function reflect_time_in_hash(time) {
  const old_hash = window.location.hash;
  const new_hash = '#ts=' + time;
  if (new_hash !== old_hash) {
    window.location.replace(new_hash);
  }
}

export function fetch_subs(stem, dispatch) {
  const url = API_BASE + '/static/subs/' + stem + '.sub.js';
  fetch_jsonp(url, {
    timeout: 300000,
    jsonpCallback: 'jsonp_subtitles',
    jsonpCallbackFunction: 'jsonp_subtitles',
  })
    .then(res => res.json())
    .then(sub_data => {
      // calculate_word_positions(sub_data.data);
      dispatch({
        type: 'set_subs',
        subs: sub_data.data,
      });
    });
}

export const apply_hash = (hash, dispatch) => {
  const bare_hash = hash.replace(/^#/, '');
  let query = query_string.parse(bare_hash);
  const requested_time = query.ts;
  if (requested_time) {
    dispatch({
      type: 'force_current_time',
      current_time: requested_time,
    });
  }
};

/*
function calculate_word_positions(subs, start_index = 0, start_position = 0) {
    var pos = start_position;
    subs.forEach((word, i) => {
        word.index = start_index + i;
        word.position = pos;
        pos += word.occurrence.length + 1;
    });
    return subs;
}

function get_word_position(word, subs) {
    if (!word || !subs || subs.length === 0) {
        return null;
    }
    let i = word.index || 0;
    while (subs[i].timestamp < word.timestamp) {
        i++;
    }
    while (subs[i].timestamp > word.timestamp) {
        i--;
    }
    if (    subs[i].timestamp  === word.timestamp
        &&  subs[i].occurrence === word.occurrence
    ) {
        return subs[i].position;
    }
    else {
        return null;
    }
}
*/
