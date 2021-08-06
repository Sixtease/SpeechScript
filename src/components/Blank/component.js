import React from 'react';
import { textgrid_to_subs } from '../../lib/AlignmentFormats';

class Blank extends React.Component {
  form_el = null;
  audio_filename = null;
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      can_submit: false,
    };
  }
  render() {
    const { can_submit, loading } = this.state;
    return (
      <form encType="multipart/form-data" onSubmit={(evt) => this.handleSubmit(evt)} ref={(el) => (this.form_el = el)}>
        <textarea name="transcript" placeholder="přepis"></textarea>
        <br />
        <input type="file" name="audio" onChange={(evt) => this.handleFileSelect(evt)} />
        <br />
        <input type="submit" disabled={!can_submit} />
        { loading && 'chvilinku...' }
      </form>
    );
  }
  handleFileSelect(evt) {
    const { set_encoded_audio } = this.props;
    const audio_file = this.form_el.audio.files[0];
    if (!audio_file) {
      return;
    }
    this.audio_filename = audio_file.name;
    this.setState({...this.state, can_submit: false});
    audio_file.arrayBuffer().then((encoded_audio) => {
      set_encoded_audio(encoded_audio);
      this.setState({...this.state, can_submit: true});
    });
  }
  handleSubmit(evt) {
    evt.preventDefault();
    this.setState({...this.state, loading: true});
    const form_data = new FormData(this.form_el);
    const occurrences = this.form_el.transcript.value.split(/\s+/);
    fetch('http://lindat.mff.cuni.cz/services/aligner/align', {
      method: 'POST',
      body: form_data,
    })
      .then((response) => response.text())
      .then((result) => {
        const stem = (this.audio_filename || new Date().getTime().toString()).replace(/\.[^.]*$/, '');
        const subs = textgrid_to_subs(result, 0, stem, occurrences);
        this.to_track_detail(subs);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        this.setState({...this.state, loading: false});
      });
  }
  to_track_detail(subs) {
    const { history, set_subs } = this.props;
    set_subs(subs.data);
    history.push(`/zaznam/${subs.filestem}`);
  }
}

export default Blank;
