export function set_encoded_audio(encoded_audio) {
  return {
    type: 'set_encoded_audio',
    encoded_audio,
  };
}

export function set_subs(subs) {
  return {
    type: 'set_subs',
    subs,
  };
}
