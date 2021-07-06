import React from 'react';
import { connect } from 'react-redux';

class Blank extends React.Component {
  render() {
    <form action="http://lindat.mff.cuni.cz/services/aligner/align" enctype="multipart/form-data" method="post">
      <textarea name="transcript" placeholder="přepis"></textarea>
      <br />
      <input type="file" name="audio" />
      <br />
      <input type="submit" />
    </form>

  }
};
