import React from 'react';
import { textgrid_to_subs } from '../../lib/AlignmentFormats';

class Blank extends React.Component {
  form_el = null;
  render() {
    return (
      <form encType="multipart/form-data" onSubmit={(evt) => this.handleSubmit(evt)} ref={(el) => (this.form_el = el)}>
        <textarea name="transcript" placeholder="přepis"></textarea>
        <br />
        <input type="file" name="audio" />
        <br />
        <input type="submit" />
      </form>
    );
  }
  handleSubmit(evt) {
    evt.preventDefault();
    const form_data = new FormData(this.form_el);
    const occurrences = this.form_el.transcript.value.split(/\s+/);
    fetch('http://lindat.mff.cuni.cz/services/aligner/submit_audio', {
      method: 'POST',
      body: form_data,
    })
      .then((response) => response.json())
      .then((result) => {
        const subs = textgrid_to_subs(result.aligned, 0, result.session, occurrences)
        console.log('Success:', subs);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

export default Blank;
