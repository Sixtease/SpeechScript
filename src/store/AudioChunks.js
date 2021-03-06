import { /* AUDIO_BASE, */ SAMPLE_RATE } from '../constants';
// import { format } from './audio';

const AHEAD_SIZE = 60;

let last_floor_index = 0;

export default class AudioChunks {
  constructor(stem, ea, duration) {
    this.stem = stem;
    this.single_chunk_ea = ea;
    this.single_chunk_length = duration;
    this.ensured_for_min = -1;
    this.ensured_for_max = -2;
    this.load();
  }

  load() {
    const me = this;
    me.chunks = [{
      duration: me.single_chunk_length,
      from: 0,
      to: me.single_chunk_length,
      ea: me.single_chunk_ea,
    }];
    me.chunks_promise = Promise.resolve(me.chunks);
  }

  get_floor_chunk(pos) {
    const me = this;
    let floor_chunk;
    let floor_index;
    const start = me.chunks[last_floor_index].from < pos ? last_floor_index : 0;
    for (let i = start; i < me.chunks.length; i++) {
      const chunk = me.chunks[i];
      if (chunk.from <= pos) {
        floor_chunk = chunk;
        floor_index = i;
      } else {
        break;
      }
    }
    if (!floor_chunk) {
      throw new Error(
        'could not find floor chunk for stem ' + me.stem + ', position ' + pos
      );
    }
    last_floor_index = floor_index;
    return { floor_index, floor_chunk };
  }

  get_chunk_promise(chunk) {
    const me = this;
    if (chunk.promise) {
      return chunk.promise;
    } else {
      return me.load_chunk(chunk);
    }
  }

  load_chunk(chunk) {
    const me = this;
    chunk.promise = new Promise((resolve, reject) => {
      me.get_chunk_ea_promise(chunk).then(encoded_audio => {
        new AudioContext({ sampleRate: SAMPLE_RATE }).decodeAudioData(
          encoded_audio,
          decoded_buffer => {
            chunk.buffer = decoded_buffer;
            resolve(decoded_buffer);
          }
        );
      });
    });
    return chunk.promise;
  }

  get_chunk_ea_promise(chunk) {
    // ea = encoded audio
    const me = this;
    if (chunk.ea_promise) {
      return chunk.ea_promise;
    } else {
      return me.load_chunk_ea(chunk);
    }
  }

  load_chunk_ea(chunk) {
    return Promise.resolve(chunk.ea);
    /*
    const me = this;
    chunk.url =
      AUDIO_BASE + ['splits', me.stem, format.suffix, chunk.basename].join('/');
    chunk.ea_promise = new Promise((resolve, reject) => {
      fetch(chunk.url)
        .then(res => {
          res
            .arrayBuffer()
            .then(encoded_audio => {
              // chunk.encoded_audio = encoded_audio;
              resolve(encoded_audio);
            })
            .catch(reject);
        })
        .catch(reject);
    });
    return chunk.ea_promise;
    */
  }

  get_ahead_window(pos, requested) {
    const me = this;
    if (!{ promise: true, buffer: true, audio_source: true }[requested]) {
      throw new Error('unexpected ahead window attribute ' + requested);
    }
    const { floor_chunk, floor_index } = me.get_floor_chunk(pos);
    if (!floor_chunk[requested]) {
      return [];
    }
    let ceil_index;
    for (let i = floor_index; me.chunks[i] && me.chunks[i][requested]; i++) {
      ceil_index = i;
    }
    return me.chunks.slice(floor_index, ceil_index + 1);
  }

  ensure_ahead_window(pos, len = AHEAD_SIZE) {
    const me = this;
    if (pos >= me.ensured_for_min && pos <= me.ensured_for_max) {
      return [];
    }
    /*
        const ahead_window = me.get_ahead_window(pos, 'promise');
        if (ahead_window.len >= len) {
            return;
        }
        */
    const { floor_index, floor_chunk } = me.get_floor_chunk(pos);

    let i = floor_index;
    let c = floor_chunk;
    const target_pos = pos + len;
    let reached_pos = -2;
    const newly_loaded_chunks = [];
    while (reached_pos < target_pos && i < me.chunks.length) {
      if (!c.promise) {
        me.get_chunk_promise(c);
        newly_loaded_chunks.push(c);
      }
      reached_pos = c.to;
      i++;
      c = me.chunks[i];
    }

    me.ensured_for_min = floor_chunk.from;
    me.ensured_for_max = reached_pos - len;
    return newly_loaded_chunks;
  }

  get_window_chunks(from, to) {
    const me = this;
    const { floor_index, floor_chunk } = me.get_floor_chunk(from);

    let i = floor_index;
    let c = floor_chunk;
    let reached_pos = -2;
    const rv = [];
    while (reached_pos < to && i < me.chunks.length) {
      me.get_chunk_promise(c);
      rv.push(c);
      reached_pos = c.to;
      i++;
      c = me.chunks[i];
    }

    return rv;
  }
}
