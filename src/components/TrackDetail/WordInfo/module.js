export function save_word(word) {
  return dispatch => {
    dispatch({
      type: 'accepted_save_word',
      ...word
    });
  };
}
