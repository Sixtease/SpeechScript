const ACTION_HANDLERS = {
  set_encoded_audio: (state, action) => ({
    ...state,
    encoded_audio: action.encoded_audio,
  }),
};

export const initial_state = {
  encoded_audio: null,
};

export default function reducer(state = initial_state, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
